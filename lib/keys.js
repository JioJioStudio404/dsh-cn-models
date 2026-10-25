/**
 * The key store.
 *
 * One file, `$DSH_HOME/storages/cn-models-keys.json` (mode 0600), holds every
 * API key with its endpoint, label, last known state (valid, balance, plan
 * quota, why and until when it is held back), and local usage counts; plus
 * which key each endpoint uses now and the switching settings. The same design
 * as dsh-antigravity-local's account store: writes are serialized within the
 * process and land atomically (sibling `.new` + rename), and a file changed by
 * another process is re-read on its next use.
 *
 * {@link summarizeKey} carries the key itself (the user asked to see keys in
 * full in the vendor tabs; the page gets it over the authenticated Remote
 * gateway) plus a masked form for compact places. Logs and error messages
 * still redact every key shape.
 *
 * @module dsh-cn-models/keys
 */
import { createHash } from "node:crypto";
import * as defaultFs from "node:fs/promises";
import { dirname } from "node:path";
import { VENDOR_IDS, endpointById } from "./endpoints.js";
import { asString, isRecord, safeJson } from "./errors.js";
import { keysPath } from "./paths.js";

const VERSION = 1;

/**
 * Rename a finished temp file over the store. Windows refuses a rename onto a
 * file another writer or reader holds this instant (EPERM / EACCES / EBUSY);
 * that clears within milliseconds, so retry briefly. A final failure removes
 * the temp file and surfaces.
 */
export async function replaceFile(fs, from, to) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      await fs.rename(from, to);
      return;
    } catch (error) {
      if (!["EPERM", "EACCES", "EBUSY"].includes(error?.code) || attempt >= 8) {
        try {
          await fs.rm?.(from, { force: true });
        } catch {
          /* best effort */
        }
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 10 * (attempt + 1)));
    }
  }
}

/** States a key can be in. `unknown`: not checked yet. */
export const STATUSES = Object.freeze(["unknown", "ok", "invalid", "expired", "no-balance", "plan-quota", "error"]);
/** Dead until the user changes or re-tests it. */
const DEAD = new Set(["invalid", "expired"]);

/** A stable key id from its endpoint and value. */
export function keyIdOf(endpoint, key) {
  return `key_${createHash("sha256").update(`${endpoint}\n${key}`).digest("hex").slice(0, 12)}`;
}

/** `sk-cp-…GUH4`: a key's type prefix and last four characters. */
export function maskKey(key) {
  const value = String(key ?? "");
  if (value.length <= 10) return "•".repeat(Math.max(4, value.length));
  const prefix = /^(sk-(?:kimi|cp|sp|api)-|ttp-|tp-|sk-|bce-v3\/)/.exec(value)?.[1] ?? value.slice(0, 3);
  return `${prefix}…${value.slice(-4)}`;
}

/**
 * The models a key may not serve now, while the key serves others: Qianfan
 * refuses an overdue account one model at a time (the models a free quota or
 * resource package covers still answer). `{ [modelId]: { until, reason, message } }`.
 */
function activeModelHolds(record, now) {
  const holds = isRecord(record?.modelHolds) ? record.modelHolds : {};
  return Object.entries(holds).filter(([, hold]) => isRecord(hold) && typeof hold.until === "number" && hold.until > now);
}

/**
 * The plan a key belongs to when its endpoint does not say (MiniMax serves
 * pay-as-you-go `sk-api-` and M Plan `sk-cp-` keys on the same endpoints).
 */
export function planLabelOf(record) {
  const endpoint = endpointById(record?.endpoint);
  if (endpoint?.plan) return endpoint.plan;
  return String(record?.key ?? "").startsWith("sk-cp-") ? "M Plan" : null;
}

/** What a key's funds column shows: "balance", "quota", or null when the vendor offers nothing. */
function fundsOf(record, endpoint) {
  switch (endpoint?.check?.kind) {
    case "balance": return "balance";
    case "kimi-code":
    case "glm-plan": return "quota";
    case "minimax": return isPlanKey(record) && endpoint.check.plan ? "quota" : null;
    default: return null;
  }
}

/** Whether a key is a plan key (by endpoint or prefix): its quota is a window, not a balance. */
export function isPlanKey(record) {
  const endpoint = endpointById(record?.endpoint);
  return Boolean(endpoint?.plan) || /^(sk-cp-|sk-sp-|t?tp-|sk-kimi-)/.test(String(record?.key ?? ""));
}

const pad = (value) => String(value).padStart(2, "0");
/** Local calendar day and month, for usage buckets. */
export const dayOf = (ms) => { const date = new Date(ms); return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; };
export const monthOf = (ms) => dayOf(ms).slice(0, 7);

const emptyBucket = () => ({ requests: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });
const emptyState = () => ({ version: VERSION, autoSwitch: true, rotateOnRateLimit: false, vendors: {}, hiddenVendors: [], endpoints: {}, keys: [] });

/** One vendor's switching settings (unset ones follow the store-wide defaults). */
export function vendorSettings(state, vendor) {
  const own = isRecord(state?.vendors?.[vendor]) ? state.vendors[vendor] : {};
  return {
    autoSwitch: typeof own.autoSwitch === "boolean" ? own.autoSwitch : state?.autoSwitch !== false,
    rotateOnRateLimit: typeof own.rotateOnRateLimit === "boolean" ? own.rotateOnRateLimit : state?.rotateOnRateLimit === true,
  };
}

/** Coerce whatever is on disk into a valid state. */
function coerce(raw) {
  if (!isRecord(raw) || !Array.isArray(raw.keys)) return emptyState();
  const keys = raw.keys.filter((record) => isRecord(record) && asString(record.id) && asString(record.key) && endpointById(record.endpoint));
  const endpoints = {};
  for (const [id, value] of Object.entries(isRecord(raw.endpoints) ? raw.endpoints : {})) {
    if (!endpointById(id) || !isRecord(value)) continue;
    const own = keys.filter((record) => record.endpoint === id);
    if (own.length === 0) continue;
    endpoints[id] = { ...value, activeKeyId: own.some((record) => record.id === value.activeKeyId) ? value.activeKeyId : own[0].id };
  }
  for (const record of keys) {
    if (!endpoints[record.endpoint]) endpoints[record.endpoint] = { activeKeyId: record.id };
  }
  const vendors = {};
  for (const [id, value] of Object.entries(isRecord(raw.vendors) ? raw.vendors : {})) {
    if (!VENDOR_IDS.includes(id) || !isRecord(value)) continue;
    vendors[id] = Object.fromEntries(Object.entries(value).filter(([name, item]) => ["autoSwitch", "rotateOnRateLimit"].includes(name) && typeof item === "boolean"));
  }
  const hidden = Array.isArray(raw.hiddenVendors) ? [...new Set(raw.hiddenVendors.filter((id) => VENDOR_IDS.includes(id)))] : [];
  // At least one vendor tab stays visible.
  const hiddenVendors = hidden.length >= VENDOR_IDS.length ? hidden.slice(0, VENDOR_IDS.length - 1) : hidden;
  return { version: VERSION, autoSwitch: raw.autoSwitch !== false, rotateOnRateLimit: raw.rotateOnRateLimit === true, vendors, hiddenVendors, endpoints, keys };
}

/** One key's usage, with buckets from another day or month read as empty. */
function usageView(record, now) {
  const day = record.usage?.day?.date === dayOf(now) ? record.usage.day : { date: dayOf(now), ...emptyBucket() };
  const month = record.usage?.month?.month === monthOf(now) ? record.usage.month : { month: monthOf(now), ...emptyBucket() };
  return { day, month };
}

/**
 * The public, secret-free view of one key.
 * @param {object} record - stored key.
 * @param {string | null} activeId - the endpoint's active key id.
 */
export function summarizeKey(record, activeId, now = Date.now()) {
  const endpoint = endpointById(record.endpoint);
  return {
    id: record.id,
    endpoint: record.endpoint,
    label: record.label ?? null,
    key: record.key,
    masked: maskKey(record.key),
    planLabel: planLabelOf(record),
    plan: isPlanKey(record),
    active: record.id === activeId,
    status: record.status ?? "unknown",
    statusMessage: record.statusMessage ?? null,
    checkedAt: record.checkedAt ?? null,
    // The two checks, apart: when the vendor last accepted the key, and when its funds were last read.
    validatedAt: record.validatedAt ?? null,
    validityError: record.validityError ?? null,
    quotaAt: record.quotaAt ?? null,
    quotaError: record.quotaError ?? null,
    // What the vendor shows for this key: "balance", "quota", or null (nothing to read).
    funds: fundsOf(record, endpoint),
    balance: record.balance ?? null,
    quota: record.quota ?? null,
    limitedUntil: typeof record.limitedUntil === "number" && record.limitedUntil > now ? new Date(record.limitedUntil).toISOString() : null,
    limitedReason: typeof record.limitedUntil === "number" && record.limitedUntil > now ? record.limitedReason ?? null : null,
    // Whether the hold ends at the vendor's own reset time (else it is when the plugin tries again).
    limitedExact: typeof record.limitedUntil === "number" && record.limitedUntil > now ? record.limitedExact === true : null,
    // Models this key may not serve for now (the key itself still serves the others).
    modelHolds: activeModelHolds(record, now).map(([model, hold]) => ({ model, until: new Date(hold.until).toISOString(), reason: hold.reason ?? null, message: hold.message ?? null })),
    // A custom base URL is shown by host only.
    customHost: record.baseUrl && endpoint && record.baseUrl !== endpoint.baseUrl ? new URL(record.baseUrl).host : null,
    usage: usageView(record, now),
    lastUsedAt: record.lastUsedAt ?? null,
    source: record.source ?? null,
    addedAt: record.addedAt ?? null,
  };
}

export class KeyStore {
  #file;
  #fs;
  #now;
  #chain = Promise.resolve();
  #cache;
  #cacheStamp;

  /**
   * @param {object} [options] - wiring.
   * @param {string} [options.file] - store path (default `$DSH_HOME/storages/cn-models-keys.json`).
   * @param {object} [options.fs] - `node:fs/promises` or a test double.
   * @param {() => number} [options.now] - clock.
   */
  constructor({ file = keysPath(), fs = defaultFs, now = () => Date.now() } = {}) {
    this.#file = file;
    this.#fs = fs;
    this.#now = now;
  }

  /** The store's path. */
  path() {
    return this.#file;
  }

  /** Current state, re-read when another process changed the file. */
  async read() {
    let stamp;
    try {
      const info = await this.#fs.stat(this.#file);
      stamp = `${info.mtimeMs}:${info.size}`;
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      stamp = "absent";
    }
    if (this.#cache !== undefined && stamp === this.#cacheStamp) return this.#cache;
    let state = emptyState();
    if (stamp !== "absent") {
      try {
        state = coerce(safeJson(await this.#fs.readFile(this.#file, "utf8")));
      } catch {
        state = emptyState();
      }
    }
    this.#cache = state;
    this.#cacheStamp = stamp;
    return state;
  }

  async #write(state) {
    await this.#fs.mkdir(dirname(this.#file), { recursive: true });
    // A unique sibling per write: another store instance or process writing at the same time
    // (the terminal importer, a second mount) cannot rename this one away first.
    const next = `${this.#file}.${process.pid}-${Math.random().toString(36).slice(2, 10)}.new`;
    await this.#fs.writeFile(next, `${JSON.stringify(state, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    await replaceFile(this.#fs, next, this.#file);
    this.#cache = state;
    try {
      const info = await this.#fs.stat(this.#file);
      this.#cacheStamp = `${info.mtimeMs}:${info.size}`;
    } catch {
      this.#cacheStamp = undefined;
    }
  }

  /**
   * Serialized read-modify-write. `fn` receives a deep copy and returns the
   * next state (or undefined to leave the file untouched) plus a result.
   */
  mutate(fn) {
    const run = this.#chain.then(async () => {
      const current = structuredClone(await this.read());
      const outcome = await fn(current);
      if (outcome?.state !== undefined) await this.#write(coerce(outcome.state));
      return outcome?.result;
    });
    this.#chain = run.catch(() => undefined);
    return run;
  }

  /** Every key, in their stored (drag) order. */
  async keys() {
    return (await this.read()).keys;
  }

  /** One endpoint's keys, in order. */
  async keysFor(endpointId) {
    return (await this.keys()).filter((record) => record.endpoint === endpointId);
  }

  /** One key by id. */
  async get(id) {
    return (await this.keys()).find((record) => record.id === id);
  }

  /** Endpoints that have at least one key, in first-key order. */
  async endpointIds() {
    return [...new Set((await this.keys()).map((record) => record.endpoint))];
  }

  /** The key an endpoint uses now. */
  async active(endpointId) {
    const state = await this.read();
    const own = state.keys.filter((record) => record.endpoint === endpointId);
    return own.find((record) => record.id === state.endpoints[endpointId]?.activeKeyId) ?? own[0];
  }

  /** The public view of the whole store. */
  async summary() {
    const state = await this.read();
    const now = this.#now();
    return {
      autoSwitch: state.autoSwitch,
      rotateOnRateLimit: state.rotateOnRateLimit,
      vendorSettings: Object.fromEntries(VENDOR_IDS.map((id) => [id, vendorSettings(state, id)])),
      hiddenVendors: state.hiddenVendors,
      endpoints: Object.fromEntries(Object.entries(state.endpoints).map(([id, value]) => [id, { activeKeyId: value.activeKeyId }])),
      keys: state.keys.map((record) => summarizeKey(record, state.endpoints[record.endpoint]?.activeKeyId ?? null, now)),
    };
  }

  /**
   * Add a key, or update the same key on the same endpoint.
   * @param {object} input - `{ endpoint, key, label?, baseUrl?, source? }`.
   * @returns `{ record, created }`.
   */
  async add({ endpoint, key, label, baseUrl, source }) {
    const now = this.#now();
    return this.mutate((state) => {
      const id = keyIdOf(endpoint, key);
      const existing = state.keys.find((record) => record.id === id);
      const record = {
        ...existing,
        id,
        endpoint,
        key,
        ...(asString(label) ? { label: label.trim().slice(0, 60) } : {}),
        ...(asString(baseUrl) ? { baseUrl } : {}),
        status: existing?.status ?? "unknown",
        source: existing?.source ?? source ?? null,
        addedAt: existing?.addedAt ?? new Date(now).toISOString(),
        updatedAt: new Date(now).toISOString(),
      };
      const keys = existing ? state.keys.map((item) => (item === existing ? record : item)) : [...state.keys, record];
      return { state: { ...state, keys }, result: { record, created: !existing } };
    });
  }

  /** Change a key's label or base URL (`null` clears either). */
  async update(id, { label, baseUrl } = {}) {
    return this.mutate((state) => {
      const record = state.keys.find((item) => item.id === id);
      if (!record) return { result: false };
      if (label !== undefined) record.label = asString(label?.trim?.()) ? label.trim().slice(0, 60) : null;
      if (baseUrl !== undefined) {
        if (asString(baseUrl)) record.baseUrl = baseUrl;
        else delete record.baseUrl;
        // A changed address is a new chance: re-check before trusting the old verdict.
        record.status = "unknown";
        delete record.limitedUntil;
        delete record.modelHolds;
      }
      record.updatedAt = new Date(this.#now()).toISOString();
      return { state, result: true };
    });
  }

  /** Forget one key. */
  async remove(id) {
    return this.mutate((state) => {
      const keys = state.keys.filter((record) => record.id !== id);
      return keys.length === state.keys.length ? { result: false } : { state: { ...state, keys }, result: true };
    });
  }

  /**
   * Put one endpoint's keys in the given order (the tab's drag order, which is
   * also the order switching tries them in). Unknown ids are ignored; the
   * endpoint's other keys keep their relative order after the listed ones.
   */
  async reorder(endpointId, ids) {
    return this.mutate((state) => {
      const own = state.keys.filter((record) => record.endpoint === endpointId);
      const listed = [...new Set(ids)].map((id) => own.find((record) => record.id === id)).filter(Boolean);
      const ordered = [...listed, ...own.filter((record) => !listed.includes(record))];
      let index = 0;
      const keys = state.keys.map((record) => (record.endpoint === endpointId ? ordered[index++] : record));
      if (keys.every((record, position) => record === state.keys[position])) return { result: false };
      return { state: { ...state, keys }, result: true };
    });
  }

  /** Make one key its endpoint's active key. */
  async setActive(keyId) {
    return this.mutate((state) => {
      const record = state.keys.find((item) => item.id === keyId);
      if (!record) return { result: false };
      if (state.endpoints[record.endpoint]?.activeKeyId === keyId) return { result: true };
      return { state: { ...state, endpoints: { ...state.endpoints, [record.endpoint]: { ...state.endpoints[record.endpoint], activeKeyId: keyId } } }, result: true };
    });
  }

  /** Merge non-secret facts into one key (status, balance, quota, limits). */
  async patch(id, values) {
    return this.mutate((state) => {
      const record = state.keys.find((item) => item.id === id);
      if (!record) return { result: false };
      for (const [name, value] of Object.entries(values)) {
        if (value === undefined) delete record[name];
        else record[name] = value;
      }
      return { state, result: true };
    });
  }

  /** Count one finished request against today's and this month's buckets. */
  async noteUsage(id, usage = {}) {
    const now = this.#now();
    return this.mutate((state) => {
      const record = state.keys.find((item) => item.id === id);
      if (!record) return { result: false };
      const { day, month } = usageView(record, now);
      for (const bucket of [day, month]) {
        bucket.requests += 1;
        bucket.input += Number(usage.inputTokens) || 0;
        bucket.output += Number(usage.outputTokens) || 0;
        bucket.cacheRead += Number(usage.cacheReadTokens) || 0;
        bucket.cacheWrite += Number(usage.cacheWriteTokens) || 0;
      }
      record.usage = { day, month };
      record.lastUsedAt = new Date(now).toISOString();
      return { state, result: true };
    });
  }

  /**
   * Switching settings: one vendor's (with `vendor`), else the defaults every
   * vendor without its own follows. `hiddenVendors`: vendor tabs not shown.
   */
  async setSettings({ vendor, autoSwitch, rotateOnRateLimit, hiddenVendors } = {}) {
    return this.mutate((state) => {
      const patch = {
        ...(typeof autoSwitch === "boolean" ? { autoSwitch } : {}),
        ...(typeof rotateOnRateLimit === "boolean" ? { rotateOnRateLimit } : {}),
      };
      const next = vendor
        ? { ...state, vendors: { ...state.vendors, [vendor]: { ...state.vendors?.[vendor], ...patch } } }
        : { ...state, ...patch };
      if (Array.isArray(hiddenVendors)) next.hiddenVendors = hiddenVendors;
      return { state: next, result: true };
    });
  }

  /** Whether a key may serve a request now. */
  usable(record) {
    if (!record || DEAD.has(record.status)) return false;
    return !(typeof record.limitedUntil === "number" && record.limitedUntil > this.#now());
  }

  /** Whether a key may serve a request for this model now (the key, then its model holds). */
  usableFor(record, modelId) {
    return this.usable(record) && !this.modelHeld(record, modelId);
  }

  /** Whether this model is held on this key. */
  modelHeld(record, modelId) {
    return modelId !== undefined && activeModelHolds(record, this.#now()).some(([id]) => id === modelId);
  }

  /** Hold one model on one key until `until` (a later hold never gets shorter); expired holds are dropped. */
  async holdModel(id, modelId, { until, reason, message }) {
    const now = this.#now();
    return this.mutate((state) => {
      const record = state.keys.find((item) => item.id === id);
      if (!record) return { result: false };
      const holds = Object.fromEntries(activeModelHolds(record, now));
      const current = holds[modelId]?.until ?? 0;
      holds[modelId] = { until: Math.max(until, current), ...(reason ? { reason } : {}), ...(message ? { message: String(message).slice(0, 300) } : {}) };
      record.modelHolds = holds;
      return { state, result: true };
    });
  }

  /** Lift one model's hold on one key (it answered again); no write when there is none. */
  async releaseModel(id, modelId) {
    return this.mutate((state) => {
      const record = state.keys.find((item) => item.id === id);
      if (!record || !isRecord(record.modelHolds) || !(modelId in record.modelHolds)) return { result: false };
      const holds = Object.fromEntries(activeModelHolds(record, this.#now()).filter(([model]) => model !== modelId));
      if (Object.keys(holds).length) record.modelHolds = holds;
      else delete record.modelHolds;
      return { state, result: true };
    });
  }
}
