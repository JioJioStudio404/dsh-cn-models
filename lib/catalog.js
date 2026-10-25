/**
 * Model lists per endpoint, and what the picker offers.
 *
 * An endpoint's list is its live `GET /models` (fetched with one of its keys)
 * merged with the bundled snapshot: the live ids decide what exists, the
 * snapshot supplies names, limits, image input and reasoning controls. A model
 * the snapshot does not know (newer than it) is listed with conservative
 * defaults. Without a live list the snapshot stands.
 *
 * The selection is per endpoint; by default the snapshot's recommended models
 * plus any model newer than the snapshot.
 *
 * @module dsh-cn-models/catalog
 */
import * as defaultFs from "node:fs/promises";
import { dirname } from "node:path";
import { CATALOGS } from "./catalog-data.js";
import { QIANFAN_CATALOGS } from "./catalog-qianfan.js";
import { defaultEffortOf, EFFORT_NAMES, effortsOf } from "./dialects.js";
import { endpointById } from "./endpoints.js";
import { replaceFile } from "./keys.js";
import { asNumber, asString, isRecord, safeJson } from "./errors.js";
import { settingsPath } from "./paths.js";

const VERSION = 1;
/** A live list older than this is re-fetched in the background. */
export const CATALOG_TTL_MS = 24 * 60 * 60_000;
/** Ids in a `/models` answer that are not chat models. */
const NOT_CHAT = /embed|rerank|tts|asr|whisper|speech|audio|image|wanx|wan2|flux|video|ocr|realtime|moderation|-vl-max-latest|livetranslate|paraformer|sambert|cosyvoice/i;

/** Every bundled catalog: models.dev's snapshot plus Qianfan's (which models.dev does not list). */
export const BUNDLED = Object.freeze({ ...CATALOGS, ...QIANFAN_CATALOGS });
/** Model types in Qianfan's `/models` that are not chat models. */
const NOT_CHAT_TYPE = /^(embeddings?|text2image|image2image|rerank|tts|asr)$/i;

/** The bundled entries of an endpoint. */
const bundled = (endpoint) => BUNDLED[endpoint?.catalog] ?? [];

/** A model the snapshot does not describe, shaped conservatively. */
export function unknownModel(id, live = {}, { recommended = true } = {}) {
  return {
    id,
    name: asString(live.name) ?? id,
    context: asNumber(live.context) ?? null,
    output: asNumber(live.output) ?? null,
    image: live.image === true,
    reasoning: isRecord(live.reasoning) ? live.reasoning : null,
    interleaved: false,
    released: null,
    recommended,
    newer: true,
  };
}

/**
 * The fields a vendor's `/models` entry carries beyond its id:
 * DeepSeek `context_window`, `max_output_tokens`, `effort.supported_levels`;
 * Kimi `context_length`, `supports_reasoning`; Qianfan `prompt_tokens` (the
 * input limit; its `context_length` adds the output), `max_completions_tokens`
 * and `architecture.input_modalities`.
 */
export function liveEntry(item) {
  if (!isRecord(item) || !asString(item.id)) return undefined;
  const levels = Array.isArray(item.effort?.supported_levels) ? item.effort.supported_levels.filter((level) => typeof level === "string") : null;
  const context = asNumber(item.context_window ?? item.prompt_tokens ?? item.context_length);
  const output = asNumber(item.max_output_tokens ?? item.max_completions_tokens);
  const inputs = Array.isArray(item.architecture?.input_modalities) ? item.architecture.input_modalities : null;
  return {
    id: item.id,
    ...(asString(item.display_name) ? { name: item.display_name } : {}),
    ...(context ? { context } : {}),
    ...(output ? { output } : {}),
    ...(inputs ? { image: inputs.includes("image") } : {}),
    ...(levels?.length ? { efforts: levels } : {}),
    ...(typeof item.supports_reasoning === "boolean" ? { reasoning: item.supports_reasoning } : {}),
  };
}

/**
 * Whether a `/models` entry is a chat model DSH can drive: not an embedding,
 * image or speech model by id or (Qianfan) by `type`, and — where the vendor
 * lists capabilities (Qianfan's `features`) — one that calls tools.
 */
function chatModel(item) {
  if (NOT_CHAT.test(String(item?.id ?? ""))) return false;
  if (typeof item?.type === "string" && NOT_CHAT_TYPE.test(item.type)) return false;
  return !Array.isArray(item?.features) || item.features.includes("function_call");
}

/** Parse a `/models` answer into live entries (chat models only). */
export function parseModelList(body) {
  const list = Array.isArray(body?.data) ? body.data : Array.isArray(body?.models) ? body.models : [];
  return list.filter(chatModel).map(liveEntry).filter(Boolean);
}

/**
 * One merged entry: the snapshot's facts, refined by the live ones. A model
 * newer than the snapshot is selected by default only in a short vendor list
 * (DeepSeek, Kimi, MiniMax, GLM); in a long one (DashScope lists a hundred)
 * it is offered unticked.
 */
function merge(snapshot, live, { short }) {
  if (!live) return snapshot;
  const entry = snapshot ? { ...snapshot } : unknownModel(live.id, live, { recommended: short });
  if (live.context) entry.context = live.context;
  if (live.output) entry.output = live.output;
  if (live.efforts && entry.reasoning) entry.reasoning = { ...entry.reasoning, efforts: live.efforts.filter((level) => level !== "none") };
  return entry;
}

/** Harness model info for one entry (`listModels` / `resolveModel`). */
export function toModelInfo(route, entry) {
  const efforts = effortsOf(entry);
  const defaultEffort = defaultEffortOf(entry);
  return {
    provider: route,
    id: entry.id,
    name: entry.name ?? entry.id,
    inputModalities: entry.image ? ["text", "image"] : ["text"],
    ...(entry.context ? { context: { contextWindow: entry.context } } : {}),
    ...(entry.output ? { defaultMaxTokens: Math.min(entry.output, 131072) } : {}),
    ...(efforts.length
      ? { reasoning: { efforts: efforts.map((id) => ({ id, name: EFFORT_NAMES[id] ?? id })), ...(defaultEffort ? { defaultEffort } : {}) } }
      : {}),
  };
}

export class CatalogStore {
  #file;
  #fs;
  #now;
  #chain = Promise.resolve();
  #cache;
  #cacheStamp;
  /** Models that failed as unavailable in this process, per endpoint. */
  #unusable = new Map();

  constructor({ file = settingsPath(), fs = defaultFs, now = () => Date.now() } = {}) {
    this.#file = file;
    this.#fs = fs;
    this.#now = now;
  }

  path() {
    return this.#file;
  }

  async #read() {
    let stamp;
    try {
      const info = await this.#fs.stat(this.#file);
      stamp = `${info.mtimeMs}:${info.size}`;
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      stamp = "absent";
    }
    if (this.#cache !== undefined && stamp === this.#cacheStamp) return this.#cache;
    let state = { version: VERSION, endpoints: {} };
    if (stamp !== "absent") {
      const raw = safeJson(await this.#fs.readFile(this.#file, "utf8").catch(() => ""));
      if (isRecord(raw) && isRecord(raw.endpoints)) state = { version: VERSION, endpoints: raw.endpoints };
    }
    this.#cache = state;
    this.#cacheStamp = stamp;
    return state;
  }

  #mutate(fn) {
    const run = this.#chain.then(async () => {
      const next = fn(structuredClone(await this.#read()));
      await this.#fs.mkdir(dirname(this.#file), { recursive: true });
      // A unique sibling per write (see the key store).
      const temp = `${this.#file}.${process.pid}-${Math.random().toString(36).slice(2, 10)}.new`;
      await this.#fs.writeFile(temp, `${JSON.stringify(next, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
      await replaceFile(this.#fs, temp, this.#file);
      this.#cache = next;
      try {
        const info = await this.#fs.stat(this.#file);
        this.#cacheStamp = `${info.mtimeMs}:${info.size}`;
      } catch {
        this.#cacheStamp = undefined;
      }
      return next;
    });
    this.#chain = run.catch(() => undefined);
    return run;
  }

  /** Every model an endpoint offers (merged, in the vendor's order when live). */
  async models(endpointId) {
    const endpoint = endpointById(endpointId);
    const snapshot = bundled(endpoint);
    const state = (await this.#read()).endpoints[endpointId];
    const live = Array.isArray(state?.live) && state.live.length ? state.live : null;
    if (!live) return snapshot;
    const known = new Map(snapshot.map((entry) => [entry.id, entry]));
    // Vendor order, snapshot entries for the facts; a snapshot model the vendor no longer lists is gone.
    const short = live.length <= 15;
    return live.map((item) => merge(known.get(item.id), item, { short }));
  }

  /** When the live list was fetched (null: never). */
  async fetchedAt(endpointId) {
    return (await this.#read()).endpoints[endpointId]?.fetchedAt ?? null;
  }

  /** Whether the live list is missing or old. */
  async stale(endpointId) {
    const endpoint = endpointById(endpointId);
    if (!endpoint?.liveModels) return false;
    const at = await this.fetchedAt(endpointId);
    return !at || this.#now() - at > CATALOG_TTL_MS;
  }

  /** Store a live list. */
  async storeLive(endpointId, entries) {
    await this.#mutate((state) => ({
      ...state,
      endpoints: { ...state.endpoints, [endpointId]: { ...state.endpoints[endpointId], live: entries, fetchedAt: this.#now() } },
    }));
    this.#unusable.delete(endpointId);
  }

  /** The selection (null: the default). */
  async enabledIds(endpointId) {
    const ids = (await this.#read()).endpoints[endpointId]?.enabledIds;
    return Array.isArray(ids) ? ids : null;
  }

  /** Replace the selection (null: back to the default). */
  async setEnabled(endpointId, ids) {
    const next = ids === null ? null : [...new Set(ids.filter((id) => typeof id === "string" && id.length > 0))];
    await this.#mutate((state) => {
      const current = { ...state.endpoints[endpointId] };
      if (next === null) delete current.enabledIds;
      else current.enabledIds = next;
      return { ...state, endpoints: { ...state.endpoints, [endpointId]: current } };
    });
    return next;
  }

  /** Forget endpoints that have no key any more. */
  async prune(endpointIds) {
    const keep = new Set(endpointIds);
    const state = await this.#read();
    if (Object.keys(state.endpoints).every((id) => keep.has(id))) return;
    await this.#mutate((current) => ({ ...current, endpoints: Object.fromEntries(Object.entries(current.endpoints).filter(([id]) => keep.has(id))) }));
  }

  /** Remember, for this process, that a model failed as unavailable on an endpoint. */
  markUnusable(endpointId, modelId, reason) {
    if (!this.#unusable.has(endpointId)) this.#unusable.set(endpointId, new Map());
    this.#unusable.get(endpointId).set(modelId, reason);
  }

  /** Every model with its selection and availability (the dialog's rows). */
  async options(endpointId) {
    const models = await this.models(endpointId);
    const enabled = await this.enabledIds(endpointId);
    const unusable = this.#unusable.get(endpointId) ?? new Map();
    return models.map((entry) => ({
      ...entry,
      enabled: enabled === null ? entry.recommended === true : enabled.includes(entry.id),
      unusable: unusable.get(entry.id) ?? null,
    }));
  }

  /** What the picker offers for an endpoint. */
  async selected(endpointId) {
    return (await this.options(endpointId)).filter((entry) => entry.enabled && !entry.unusable);
  }

  /** One model of an endpoint, selected or not (an unknown id gets defaults). */
  async find(endpointId, modelId) {
    const models = await this.models(endpointId);
    return models.find((entry) => entry.id === modelId)
      ?? bundled(endpointById(endpointId)).find((entry) => entry.id === modelId)
      ?? unknownModel(modelId);
  }
}
