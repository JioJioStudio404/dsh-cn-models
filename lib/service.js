/**
 * The `cnModels` Remote namespace: key and model management for the browser
 * half (the vendor tabs and the Models-page cards).
 *
 * It goes through the DSH Remote gateway rather than a raw `webServer` route
 * (web routes carry no authentication). The status carries each key in full
 * (shown in the vendor tabs, at the user's request) and masked; logs and
 * error messages never carry one.
 *
 * @module dsh-cn-models/service
 */
import * as defaultFs from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { ENDPOINTS, VENDORS, VENDOR_IDS, displayNameOf, endpointById, endpointForBaseUrl, normalizeVendor, openaiBaseUrl, vendorOfKeyShape } from "./endpoints.js";
import { asString, cnError, CODES, isRecord, redact } from "./errors.js";
import { maskKey } from "./keys.js";
import { dshHome } from "./paths.js";
import { authenticated, checkKey, detectEndpoint, fundsKind, validityKind } from "./probe.js";

/** The property Typert's `remoteMethods()` reads (a plain string in dsh-typert-protocol). */
const REMOTE_METHOD_DESCRIPTOR = "@deepseek-ai/dsh-typert-protocol/remote-methods";

/** Remote methods, in manifest order. */
export const REMOTE_METHODS = [
  "status",
  "checkKeys",
  "addKeys",
  "importDshKeys",
  "updateKey",
  "removeKey",
  "switchKey",
  "reorderKeys",
  "refreshModels",
  "updateSettings",
  "exportKeys",
];

/** How `checkKeys` may check: see probe.js. */
const CHECK_MODES = ["auto", "validity", "funds"];

/** At most this many keys in one paste. */
const MAX_KEYS_PER_ADD = 50;
/** Keys of one paste are detected and checked this many at a time. */
const ADD_CONCURRENCY = 4;

/** Map with bounded concurrency, results in input order. */
async function mapLimited(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      out[index] = await fn(items[index], index);
    }
  }));
  return out;
}

const tabOf = (vendorId) => VENDORS.find((vendor) => vendor.id === vendorId)?.tab ?? vendorId;

/**
 * Keys in pasted text. Accepted lines: a bare key; `vendor:key` (the vendor
 * word is a hint: deepseek, kimi, glm/zai/zhipu, minimax, qwen/dashscope/
 * aliyun, mimo/xiaomi, qianfan/baidu — `BAIDU_QIANFAN_KEY=…` too); and
 * `baseUrl: https://…` (or a JSON-ish `"baseUrl": "…"`) giving the key above
 * it a base URL.
 * @returns `[{ key, vendor?, baseUrl? }]`.
 */
export function parseKeyText(text) {
  const out = [];
  for (const raw of String(text ?? "").split(/\r?\n/)) {
    const line = raw.trim().replace(/^[,;]+|[,;]+$/g, "");
    if (!line || line.startsWith("#")) continue;
    const base = /^"?(?:base_?url|endpoint|url)"?\s*[:=]\s*"?([^"\s]+)"?/i.exec(line);
    if (base) {
      if (out.length) out.at(-1).baseUrl = base[1];
      continue;
    }
    const pair = /^([A-Za-z一-龥][\w.一-龥-]*)\s*[:=：]\s*(\S+)$/.exec(line);
    if (pair && normalizeVendor(pair[1]) && !/^https?$/i.test(pair[1])) {
      out.push({ key: pair[2].replace(/^["']|["']$/g, ""), vendor: normalizeVendor(pair[1]) });
      continue;
    }
    for (const token of line.split(/[\s,;]+/)) {
      // A key behind a word of the user's own (`work:sk-…`) is still a key.
      const value = token.replace(/^[^\s:=：]*[:=：](?=["']?(?:sk|tp|ttp)-|["']?[0-9a-f]{32}\.|["']?bce-v3\/)/, "").replace(/^["']|["']$/g, "");
      if (/^(?:sk|tp|ttp)-[A-Za-z0-9._~+/=-]{16,}$/.test(value) || /^[0-9a-f]{32}\.[A-Za-z0-9]{8,}$/.test(value) || /^bce-v3\/[A-Za-z0-9-]+\/[A-Za-z0-9]{16,}$/.test(value)) out.push({ key: value });
    }
  }
  return out;
}

/** Where exports go: the user's Downloads folder when it exists, else `$DSH_HOME/exports`. */
async function defaultExportDir(fs) {
  const downloads = join(homedir(), "Downloads");
  try {
    if ((await fs.stat(downloads)).isDirectory()) return downloads;
  } catch {
    /* no Downloads folder */
  }
  return join(dshHome(), "exports");
}

/** The endpoint list the add dialog offers (no secrets). */
function endpointView(endpoint) {
  return {
    id: endpoint.id,
    vendor: endpoint.vendor,
    name: endpoint.name,
    displayName: displayNameOf(endpoint),
    region: endpoint.region,
    plan: endpoint.plan,
    host: new URL(endpoint.baseUrl).host,
    terms: endpoint.terms ?? null,
    // Whether validity can be read for free (else a one-token request on import or ✓).
    freeCheck: validityKind(endpoint) !== "chat",
    showsBalance: endpoint.check.kind === "balance",
    showsQuota: ["kimi-code", "minimax", "glm-plan"].includes(endpoint.check.kind),
  };
}

/**
 * Build the service object.
 * @param {object} deps - `{ keys, catalog, adapter, checker, credentials, onRoutesChanged, onModelsChanged, log, lastSwitches, fetchImpl }`.
 * @returns the service value to `ctx.provide`.
 */
export function createCnModelsService({ keys, catalog, adapter, checker, credentials = () => undefined, onRoutesChanged = () => {}, onModelsChanged = () => {}, log = () => {}, lastSwitches = () => ({}), fetchImpl = fetch, fs = defaultFs, exportDir = defaultExportDir, now = () => Date.now() }) {
  /** The whole public state. */
  async function status() {
    const summary = await keys.summary();
    const used = [...new Set(summary.keys.map((key) => key.endpoint))];
    const models = {};
    for (const id of used) {
      const options = await catalog.options(id);
      models[id] = {
        options: options.map((entry) => ({
          id: entry.id,
          name: entry.name,
          image: entry.image === true,
          reasoning: Boolean(entry.reasoning),
          context: entry.context ?? null,
          enabled: entry.enabled,
          recommended: entry.recommended === true,
          retiring: entry.retiring ?? null,
          newer: entry.newer === true,
          unusable: entry.unusable ?? null,
        })),
        fetchedAt: await catalog.fetchedAt(id),
        live: endpointById(id).liveModels,
      };
    }
    return {
      ...summary,
      vendors: VENDORS.map(({ id, name, tab }) => ({ id, name, tab })),
      endpoints: ENDPOINTS.map(endpointView),
      active: summary.endpoints,
      models,
      // The last automatic switch of each vendor (each tab shows its own).
      lastSwitches: lastSwitches(),
    };
  }

  /** Add one key (already detected or chosen), check it, and report a result line. */
  async function addOne({ key, endpoint, baseUrl, label, source, result }) {
    const custom = baseUrl && baseUrl !== endpoint.baseUrl ? baseUrl : undefined;
    const { record, created } = await keys.add({ endpoint: endpoint.id, key, label, baseUrl: custom, source });
    const check = result ?? (await checkKey(record, { mode: "full", deep: true, fetchImpl }));
    if (!check.unchanged) await keys.patch(record.id, Object.fromEntries(Object.entries(check).filter(([name]) => !["unchanged", "authenticated", "wrongEndpoint"].includes(name))));
    const after = (await keys.summary()).keys.find((item) => item.id === record.id);
    return { ok: true, created, id: record.id, key, masked: after.masked, planLabel: after.planLabel, endpoint: endpoint.id, endpointName: displayNameOf(endpoint), status: after.status, statusMessage: after.statusMessage, balance: after.balance, quota: after.quota };
  }

  /**
   * Add pasted keys. A vendor tab adds only that vendor's keys (`vendor`):
   * detection then tries that vendor's endpoints only, and a key that is
   * plainly another vendor's — by its prefix, its `vendor:` word, or its base
   * URL — is pointed at the right tab instead of being probed in vain. With an
   * explicit endpoint every key goes there. A key no endpoint accepts is not
   * added. Keys are detected and checked a few at a time.
   */
  async function addKeys(request, signal) {
    const items = parseKeyText(request.text).slice(0, MAX_KEYS_PER_ADD);
    if (items.length === 0) throw cnError(CODES.badRequest, "没有在粘贴的内容里找到 API Key");
    const scope = asString(request.vendor);
    if (scope && !VENDOR_IDS.includes(scope)) throw cnError(CODES.badRequest, `unknown vendor "${scope}"`);
    const forced = asString(request.endpoint) && request.endpoint !== "auto" ? endpointById(request.endpoint) : undefined;
    if (asString(request.endpoint) && request.endpoint !== "auto" && !forced) throw cnError(CODES.badRequest, `unknown endpoint "${request.endpoint}"`);
    if (forced && scope && forced.vendor !== scope) throw cnError(CODES.badRequest, `endpoint "${forced.id}" is not ${tabOf(scope)}'s`);
    const requestBase = asString(request.baseUrl) ? openaiBaseUrl(request.baseUrl) : undefined;
    if (asString(request.baseUrl) && !requestBase) throw cnError(CODES.badRequest, "自定义地址不是有效的 http(s) URL");
    const results = await mapLimited(items, ADD_CONCURRENCY, async (item) => {
      const masked = maskKey(item.key);
      const key = item.key;
      try {
        const base = requestBase ?? (item.baseUrl ? openaiBaseUrl(item.baseUrl) : undefined);
        const byBase = base ? endpointForBaseUrl(base)?.endpoint : undefined;
        if (scope) {
          const other = [item.vendor, vendorOfKeyShape(item.key), byBase?.vendor].find((vendor) => vendor && vendor !== scope);
          if (other) return { ok: false, key, masked, kind: "wrong-vendor", vendor: other, error: `这是 ${tabOf(other)} 的 Key，请在 ${tabOf(other)} 标签导入` };
        }
        let endpoint = forced ?? byBase;
        let result;
        if (!endpoint) {
          const found = await detectEndpoint(item.key, scope ?? item.vendor, { fetchImpl, signal });
          if (!found.endpoint) return { ok: false, key, masked, kind: found.result?.status === "invalid" ? "invalid-key" : "unknown", error: found.result?.statusMessage ?? "无法识别这个 Key 属于哪个接入点", tried: found.tried };
          endpoint = found.endpoint;
          result = base ? undefined : found.result;
        }
        if (!result) {
          result = await checkKey({ endpoint: endpoint.id, key: item.key, baseUrl: base }, { mode: "full", deep: true, fetchImpl, signal });
          if (!authenticated(result) && result.status !== "error" && !result.unchanged) {
            return { ok: false, key, masked, endpoint: endpoint.id, endpointName: displayNameOf(endpoint), kind: result.status === "invalid" ? "invalid-key" : result.status, error: result.statusMessage ?? "Key 无效" };
          }
        }
        return await addOne({ key: item.key, endpoint, baseUrl: base, label: request.label, source: request.source ?? "pasted", result });
      } catch (error) {
        return { ok: false, key, masked, error: redact(error?.message ?? error) };
      }
    });
    const added = results.filter((result) => result.ok);
    if (added.length) {
      onRoutesChanged();
      for (const endpointId of new Set(added.map((result) => result.endpoint))) {
        if (await catalog.stale(endpointId)) await adapter.refreshModels(endpointId, { signal }).catch(() => undefined);
      }
      onModelsChanged();
    }
    return { ...(await status()), added: results };
  }

  const handlers = {
    status,

    /**
     * Re-check keys: the named ones, else one vendor's (`vendor`), else all.
     * `mode`: `validity` (does the vendor accept the key), `funds` (balance or
     * plan windows), or `auto` (funds where the vendor offers them, else the
     * free validity check). `deep`: a one-token request may validate keys
     * nothing free can.
     */
    async checkKeys(request, signal) {
      const mode = CHECK_MODES.includes(request?.mode) ? request.mode : "auto";
      const all = await keys.keys();
      const scoped = asString(request?.vendor) ? all.filter((record) => endpointById(record.endpoint)?.vendor === request.vendor) : all;
      const named = Array.isArray(request?.keyIds) && request.keyIds.length ? all.filter((record) => request.keyIds.includes(record.id)) : scoped;
      // A funds refresh skips keys the vendor shows no funds for.
      const ids = named.filter((record) => mode !== "funds" || fundsKind(record)).map((record) => record.id);
      const results = [];
      // A few at a time: each check is one or two requests.
      const queue = [...ids];
      await Promise.all(Array.from({ length: Math.min(4, queue.length) }, async () => {
        while (queue.length) results.push(await checker.check(queue.shift(), { mode, deep: request?.deep === true, signal }));
      }));
      return { ...(await status()), checked: results };
    },

    addKeys,

    /** Add the keys DSH itself already stores (its credential references for one vendor, or all). */
    async importDshKeys(request, signal) {
      const service = credentials();
      if (!service || typeof service.resolve !== "function") throw cnError(CODES.missing, "DSH 的凭据服务不可用");
      const lines = [];
      const found = [];
      for (const vendor of VENDORS) {
        if (asString(request.vendor) && vendor.id !== request.vendor) continue;
        for (const ref of vendor.dshRefs) {
          let value;
          try {
            value = (await service.resolve(ref))?.value;
          } catch {
            value = undefined;
          }
          if (asString(value)) {
            lines.push(`${vendor.id}:${value.trim()}`);
            found.push(ref);
          }
        }
      }
      if (lines.length === 0) return { ...(await status()), added: [], refs: [] };
      const out = await addKeys({ text: lines.join("\n"), source: "dsh", ...(asString(request.vendor) ? { vendor: request.vendor } : {}) }, signal);
      return { ...out, refs: found };
    },

    async updateKey(request) {
      const record = await keys.get(request.keyId);
      if (!record) throw cnError(CODES.badRequest, "unknown key");
      let baseUrl;
      if (request.baseUrl !== undefined) {
        baseUrl = request.baseUrl === null || request.baseUrl === "" ? null : openaiBaseUrl(request.baseUrl);
        if (request.baseUrl && !baseUrl) throw cnError(CODES.badRequest, "自定义地址不是有效的 http(s) URL");
      }
      await keys.update(record.id, { ...(request.label !== undefined ? { label: request.label } : {}), ...(baseUrl !== undefined ? { baseUrl } : {}) });
      if (baseUrl !== undefined) await checker.check(record.id, { mode: "full", deep: true });
      return status();
    },

    async removeKey(request) {
      if (!(await keys.remove(request.keyId))) throw cnError(CODES.badRequest, "unknown key");
      await catalog.prune(await keys.endpointIds());
      onRoutesChanged();
      return status();
    },

    async switchKey(request) {
      if (!(await keys.setActive(request.keyId))) throw cnError(CODES.badRequest, "unknown key");
      return status();
    },

    async reorderKeys(request) {
      await keys.reorder(request.endpoint, request.keyIds);
      return status();
    },

    async refreshModels(request, signal) {
      const outcome = await adapter.refreshModels(request.endpoint, { signal });
      return { ...(await status()), modelsRefreshed: outcome };
    },

    /**
     * Switching settings (one vendor's with `vendor`), which vendor tabs are
     * hidden, or one endpoint's selected models.
     */
    async updateSettings(request) {
      if (asString(request.vendor) && !VENDOR_IDS.includes(request.vendor)) throw cnError(CODES.badRequest, `unknown vendor "${request.vendor}"`);
      if (typeof request.autoSwitch === "boolean" || typeof request.rotateOnRateLimit === "boolean") {
        await keys.setSettings({ vendor: asString(request.vendor), autoSwitch: request.autoSwitch, rotateOnRateLimit: request.rotateOnRateLimit });
      }
      if (Array.isArray(request.hiddenVendors)) {
        const hidden = [...new Set(request.hiddenVendors.filter((id) => VENDOR_IDS.includes(id)))];
        if (hidden.length >= VENDOR_IDS.length) throw cnError(CODES.badRequest, "至少保留一个厂商标签");
        await keys.setSettings({ hiddenVendors: hidden });
        // A hidden vendor's models leave the model picker too (its keys stay).
        onRoutesChanged();
      }
      if (asString(request.endpoint) && (request.enabledModelIds === null || Array.isArray(request.enabledModelIds))) {
        await catalog.setEnabled(request.endpoint, request.enabledModelIds);
        onModelsChanged();
      }
      return status();
    },

    /**
     * Write one vendor's keys to a text file, one `Vendor: key` line each (the
     * add dialog reads it back). The file goes to the Downloads folder (else
     * `$DSH_HOME/exports`), mode 0600.
     * @returns `{ path, count, vendor }`.
     */
    async exportKeys(request) {
      const vendor = asString(request.vendor);
      if (!vendor || !VENDOR_IDS.includes(vendor)) throw cnError(CODES.badRequest, `unknown vendor "${request.vendor}"`);
      const own = (await keys.keys()).filter((record) => endpointById(record.endpoint)?.vendor === vendor);
      if (own.length === 0) throw cnError(CODES.badRequest, `${tabOf(vendor)} 还没有 Key`);
      const text = `${own.map((record) => `${tabOf(vendor)}: ${record.key}`).join("\n")}\n`;
      const date = new Date(now());
      const pad = (value) => String(value).padStart(2, "0");
      const name = `dsh-cn-models-${vendor}-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}.txt`;
      const dir = await exportDir(fs);
      await fs.mkdir(dir, { recursive: true });
      const path = join(dir, name);
      await fs.writeFile(path, text, { encoding: "utf8", mode: 0o600 });
      log("info", `exported ${own.length} ${vendor} key(s) to ${path}`);
      return { path, count: own.length, vendor };
    },
  };

  // SRC discovery reads the methods from the PROTOTYPE and derives wire
  // parameters from each signature: plain identifiers, `signal` last.
  const prototype = {};
  Object.defineProperty(prototype, REMOTE_METHOD_DESCRIPTOR, {
    configurable: true,
    value: Object.freeze({
      version: 1,
      methods: Object.freeze(REMOTE_METHODS.map((method) => Object.freeze({ method, invocation: Object.freeze({ kind: "direct" }) }))),
    }),
  });
  const wrap = (method) => async function remote(request, signal) {
    try {
      return await handlers[method](isRecord(request) ? request : {}, signal);
    } catch (error) {
      log("warn", `${method} failed: ${redact(error?.message ?? error)}`);
      const failure = new Error(redact(error?.message ?? error));
      failure.isDSHRemoteError = true;
      failure.code = `cn-models/${String(error?.code ?? "error").toLowerCase()}`;
      failure.details = {};
      throw failure;
    }
  };
  for (const method of REMOTE_METHODS) {
    Object.defineProperty(prototype, method, { value: wrap(method), writable: true, configurable: true });
  }
  const service = Object.create(prototype);
  Object.defineProperty(service, "typertRemote", {
    configurable: false,
    enumerable: false,
    writable: false,
    value: { service, serviceKey: "cnModelsKeys", namespace: "cnModels" },
  });
  return service;
}
