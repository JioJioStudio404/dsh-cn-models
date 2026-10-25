/**
 * What differs between the vendors' OpenAI-compatible APIs: how thinking is
 * switched and sized, which sampling values they accept, the max-tokens field,
 * and how their errors read. Everything else is one protocol (`request.js`,
 * `stream.js`).
 *
 * Error classification decides key rotation, so it reads the vendor's own code
 * in the body first and the HTTP status last: GLM answers 429 for both "no
 * balance" (1113) and "rate limited" (1302); MiniMax answers 429
 * `rate_limit_error` for "plan used up" with the real code only as "(2056)"
 * in the message; Kimi Code answers 403 for its weekly limit; Qianfan answers
 * 401 for an unknown model (`invalid_model`) and refuses one model at a time
 * when the account is overdue (`account_overdue`: models its free quota or
 * resource packages still cover keep answering).
 *
 * @module dsh-cn-models/dialects
 */
import { asNumber, isRecord, safeJson } from "./errors.js";

/** Reasoning effort names shown in the picker. */
export const EFFORT_NAMES = Object.freeze({ off: "Off", on: "On", minimal: "Minimal", low: "Low", medium: "Medium", high: "High", xhigh: "Extra high", max: "Max" });

/**
 * The reasoning efforts one model offers, from its catalog entry: `off` when
 * thinking can be switched off, then the vendor's levels (or `on`). A model
 * that always thinks with nothing to choose offers none.
 */
export function effortsOf(model) {
  const reasoning = model?.reasoning;
  if (!isRecord(reasoning)) return [];
  const levels = Array.isArray(reasoning.efforts) ? reasoning.efforts.filter((level) => typeof level === "string" && level !== "none") : [];
  const list = [];
  if (reasoning.toggle) list.push("off");
  if (levels.length) list.push(...levels);
  else if (reasoning.toggle) list.push("on");
  return list;
}

/** The default effort: "high" when offered, else thinking on, else the first. */
export function defaultEffortOf(model) {
  const efforts = effortsOf(model);
  if (efforts.length === 0) return undefined;
  if (efforts.includes("high")) return "high";
  if (efforts.includes("on")) return "on";
  return efforts.find((effort) => effort !== "off") ?? efforts[0];
}

/** A requested effort, checked against what the model offers (unknown → the default). */
export function resolveEffort(model, requested, purpose) {
  const efforts = effortsOf(model);
  if (efforts.length === 0) return undefined;
  // Titles and compaction need no deliberation where it can be switched off.
  if ((purpose === "session-title" || purpose === "compaction") && efforts.includes("off")) return "off";
  return efforts.includes(requested) ? requested : defaultEffortOf(model);
}

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/** Per-vendor request shaping. `thinking(model, effort)` returns body fields. */
export const DIALECTS = Object.freeze({
  deepseek: {
    maxTokensField: "max_tokens",
    streamUsage: true,
    stopMax: 16,
    // With tools, every assistant turn must carry its reasoning back (400 otherwise).
    reasoningOnAssistant: true,
    thinking(model, effort) {
      if (effort === undefined) return {};
      if (effort === "off") return { thinking: { type: "disabled" } };
      return effort === "on" ? { thinking: { type: "enabled" } } : { thinking: { type: "enabled" }, reasoning_effort: effort };
    },
    temperature: (value) => value,
  },
  kimi: {
    maxTokensField: "max_completion_tokens",
    streamUsage: true,
    stopMax: 5,
    reasoningOnAssistant: true,
    enumNeedsType: true,
    thinking(model, effort) {
      const id = String(model?.id ?? "");
      // K2.7-code always thinks and must keep its history.
      if (/k2\.7-code/.test(id)) return { thinking: { type: "enabled", keep: "all" } };
      if (effort === undefined) return {};
      if (effort === "off") return { thinking: { type: "disabled" } };
      if (effort === "on") return { thinking: { type: "enabled", keep: "all" } };
      return { reasoning_effort: effort };
    },
    // Sampling is fixed by the model; any other value is an error.
    temperature: () => undefined,
  },
  glm: {
    maxTokensField: "max_tokens",
    maxTokensCap: 131072,
    // Usage always arrives in the last chunk; stream_options is not documented.
    streamUsage: false,
    stopMax: 1,
    reasoningOnAssistant: false,
    toolStream: true,
    thinking(model, effort) {
      if (!model?.reasoning) return {};
      // Preserved thinking: earlier reasoning is replayed byte for byte.
      if (effort === "off") return { thinking: { type: "disabled" } };
      if (effort === undefined || effort === "on") return { thinking: { type: "enabled", clear_thinking: false } };
      return { thinking: { type: "enabled", clear_thinking: false }, reasoning_effort: effort };
    },
    temperature: (value) => clamp(value, 0, 1),
  },
  minimax: {
    maxTokensField: "max_tokens",
    streamUsage: true,
    stopMax: 4,
    reasoningOnAssistant: false,
    // Reasoning arrives in its own field instead of <think> tags inside the text.
    extra: { reasoning_split: true },
    replayDetails: true,
    thinking(model, effort) {
      if (effort === undefined) return {};
      if (effort === "off") return { thinking: { type: "disabled" } };
      return effort === "on" ? { thinking: { type: "adaptive" } } : { thinking: { type: "adaptive" }, reasoning_effort: effort };
    },
    temperature: (value) => clamp(value <= 0 ? 0.01 : value, 0.01, 2),
  },
  qwen: {
    maxTokensField: "max_tokens",
    streamUsage: true,
    stopMax: 4,
    // Hosted Kimi models in a tool loop need it too; harmless elsewhere.
    reasoningOnAssistant: true,
    thinking(model, effort) {
      if (!model?.reasoning || effort === undefined) return {};
      return effort === "off" ? { enable_thinking: false } : { enable_thinking: true, preserve_thinking: true };
    },
    temperature: (value) => clamp(value, 0, 1.99),
  },
  mimo: {
    maxTokensField: "max_completion_tokens",
    streamUsage: false,
    stopMax: 4,
    // Not passing reasoning back in full is a 400.
    reasoningOnAssistant: true,
    thinking(model, effort) {
      if (!model?.reasoning || effort === undefined) return {};
      return effort === "off" ? { thinking: { type: "disabled" } } : { thinking: { type: "enabled" } };
    },
    // Fixed while thinking; free otherwise.
    temperature: (value, thinkingOn) => (thinkingOn ? undefined : clamp(value, 0, 1.5)),
  },
  qianfan: {
    maxTokensField: "max_tokens",
    streamUsage: true,
    // "stop length must be less than 4".
    stopMax: 3,
    // Ignored where not needed; DeepSeek's tool loops read it.
    reasoningOnAssistant: true,
    thinking(model, effort) {
      if (!model?.reasoning || effort === undefined) return {};
      // Qwen and the ERNIE 5.0 family switch with `enable_thinking`; DeepSeek, GLM and ERNIE 5.1 with `thinking`.
      if (/^(qwen|ernie-(4|5\.0))/i.test(String(model.id ?? ""))) return { enable_thinking: effort !== "off" };
      if (effort === "off") return { thinking: { type: "disabled" } };
      return effort === "on" ? { thinking: { type: "enabled" } } : { thinking: { type: "enabled" }, reasoning_effort: effort };
    },
    // "temperature range is [0, 2.0]".
    temperature: (value) => clamp(value, 0, 2),
  },
});

/** The dialect of a vendor. */
export const dialectOf = (vendor) => DIALECTS[vendor] ?? DIALECTS.deepseek;

/**
 * What a failure means for the key that got it:
 *  - `invalid-key`, `expired`: the key is dead → mark it, try the next key;
 *  - `no-balance`, `plan-quota`: the key (account) is out → mark it until it recovers, try the next key;
 *  - `forbidden`: this key may not use this → try the next key, leave the key's status;
 *  - `rate-limit`: per account at these vendors → back off (DSH retries), next key only if the user allows;
 *  - `moderation`, `bad-request`, `context`, `not-found`: the request itself → never switch keys;
 *  - `overloaded`, `server`, `transport`, `timeout`: transient → DSH retries.
 */
export const ROTATE_KINDS = Object.freeze(new Set(["invalid-key", "expired", "no-balance", "plan-quota", "forbidden"]));

/** The harness code each kind surfaces as. */
export const KIND_CODES = Object.freeze({
  "invalid-key": "INVALID_CREDENTIAL",
  expired: "INVALID_CREDENTIAL",
  forbidden: "INVALID_CREDENTIAL",
  "no-balance": "QUOTA",
  "plan-quota": "QUOTA",
  "rate-limit": "RATE_LIMIT",
  overloaded: "SERVER",
  server: "SERVER",
  moderation: "INVALID_REQUEST",
  "bad-request": "INVALID_REQUEST",
  context: "CONTEXT_WINDOW_EXCEEDED",
  "not-found": "UNKNOWN_MODEL",
  transport: "TRANSPORT",
  timeout: "TIMEOUT",
});

/** A short Chinese label per kind (status chips, error text). */
export const KIND_LABELS = Object.freeze({
  "invalid-key": "Key 无效",
  expired: "无套餐或已过期",
  forbidden: "无权使用",
  "no-balance": "余额不足",
  "plan-quota": "套餐额度用尽",
  "rate-limit": "被限流",
  overloaded: "服务繁忙",
  server: "服务端错误",
  moderation: "内容审核未通过",
  "bad-request": "请求参数错误",
  context: "超出上下文长度",
  "not-found": "模型不存在",
  transport: "网络错误",
  timeout: "超时",
});

/** Retry-After (seconds or an HTTP date) in ms. */
export function retryAfterMs(headers) {
  const raw = typeof headers?.get === "function" ? headers.get("retry-after") : headers?.["retry-after"];
  if (!raw) return undefined;
  const seconds = Number(raw);
  if (Number.isFinite(seconds)) return seconds > 0 ? seconds * 1000 : undefined;
  const at = Date.parse(raw);
  return Number.isFinite(at) && at > Date.now() ? at - Date.now() : undefined;
}

/** The parts of an error body every vendor's rules read. */
export function errorParts(status, text) {
  const body = typeof text === "string" ? safeJson(text) : text;
  const error = isRecord(body?.error) ? body.error : isRecord(body) ? body : {};
  const message = String(error.message ?? body?.message ?? body?.msg ?? body?.base_resp?.status_msg ?? (typeof text === "string" && !isRecord(body) ? text : "") ?? "");
  // MiniMax: `base_resp.status_code`, or "(2056)" at the end of the message.
  const bracket = /\((\d{4})\)\s*$/.exec(message)?.[1];
  const code = String(bracket ?? body?.base_resp?.status_code ?? error.code ?? body?.code ?? "");
  const type = String(error.type ?? "");
  const resetAt = asNumber(error.next_flush_time ?? body?.next_flush_time);
  return { status, code, type, message, resetAt: resetAt ? (resetAt < 1e12 ? resetAt * 1000 : resetAt) : undefined };
}

const has = (pattern, ...values) => values.some((value) => pattern.test(String(value ?? "")));

/**
 * Classify one failed response.
 * @param {string} vendor - endpoint vendor.
 * @param {number} status - HTTP status (0 for transport).
 * @param {string | object} text - response body.
 * @param {object} [extra] - `{ plan, headers }`.
 * @returns `{ kind, code, message, vendorCode, scope?, retryAfterMs?, resetAt? }` —
 * `scope: "model"` when the refusal holds for this model on this key only.
 */
export function classifyFailure(vendor, status, text, { plan, headers } = {}) {
  const parts = errorParts(status, text);
  const { code, type } = parts;
  let { message } = parts;
  const numeric = Number(code);
  let scope;
  const kind = (() => {
    // 0. Qianfan's own codes, read before its statuses mislead (401 for an unknown model or an
    //    internal error; 403 for an overdue account, which still serves the models a package covers).
    if (vendor === "qianfan") {
      if (code === "invalid_model" || code === "model_not_supported") return "not-found";
      if (code === "internal_error") return "server";
      if (code === "account_overdue") {
        scope = "model";
        message = `账户欠费：这个模型没有可用的免费额度或资源包（其他模型可能仍可用）。${message}`;
        return "no-balance";
      }
      // A plan endpoint refusing an ordinary key, or the ordinary API refusing a plan's own key:
      // the key may be fine, only not for this endpoint.
      if (/^(token|coding)_plan(_person)?_api_key_required$/.test(code)) {
        scope = "endpoint";
        message = `这个接入点只接受套餐专属 Key。${message}`;
        return "invalid-key";
      }
      if (/^(token|coding)_plan(_person)?_api_key_not_allowed$/.test(code)) {
        scope = "endpoint";
        message = `这是套餐专属 Key，只能用于对应的 Token Plan 接入点。${message}`;
        return "invalid-key";
      }
      if (code === "invalid_iam_token" || code === "AccessDenied") return "invalid-key";
      if (code === "subscription_expired" || code === "no_subscription") return "expired";
      if (code === "token_quota_exceeded") return "plan-quota";
    }
    // 1. The request itself was refused: never a key problem.
    if (vendor === "glm" && code === "1301") return "moderation";
    if (vendor === "minimax" && (code === "1026" || code === "1027")) return "moderation";
    if (vendor === "qwen" && has(/DataInspectionFailed|data_inspection_failed/i, code, type, message)) return "moderation";
    if (vendor === "kimi" && (type === "content_filter" || code === "content_filter" || /high risk/i.test(message))) return "moderation";
    if (vendor === "mimo" && status === 421) return "moderation";
    if ([400, 403, 421, 422].includes(status) && has(/content.?filter|sensitive|moderation|审核|敏感|违规|不安全/i, type, message)) return "moderation";
    // 2. The key is not accepted.
    if (vendor === "glm" && numeric >= 1000 && numeric <= 1005) return "invalid-key";
    if (vendor === "minimax" && (code === "1004" || code === "2049")) return "invalid-key";
    if (has(/InvalidApiKey|invalid_api_key|invalid_authentication|incorrect_api_key|authentication_error|authorized_error/i, code, type)) return "invalid-key";
    if (status === 401) return "invalid-key";
    // 3. The account has no money.
    if (vendor === "deepseek" && status === 402) return "no-balance";
    if (vendor === "glm" && code === "1113") return "no-balance";
    if (vendor === "minimax" && code === "1008") return "no-balance";
    if (vendor === "qwen" && has(/^Arrearage$/i, code) ) return "no-balance";
    if (vendor === "mimo" && status === 402) return "no-balance";
    if (vendor === "kimi" && type === "exceeded_current_quota_error" && /balance/i.test(message)) return "no-balance";
    if (has(/insufficient.?balance|余额不足|欠费|arrear|good standing|recharge/i, message, code)) return "no-balance";
    // 4. A plan window or allowance is used up — or the account has no such plan at all.
    if (vendor === "glm" && code === "1309") return "expired";
    if (vendor === "minimax" && code === "2062") return "expired";
    // Kimi Code says both "weekly limit reached" and "your membership has no Kimi Code" with this type.
    // ("Upgrade your plan" appears in both; only the membership refusal says "does not have access".)
    if (vendor === "kimi" && type === "access_terminated_error" && /does not have access/i.test(message) && !/usage limit/i.test(message)) return "expired";
    if (vendor === "glm" && (code === "1308" || (numeric >= 1310 && numeric <= 1321))) return "plan-quota";
    if (vendor === "minimax" && code === "2056") return "plan-quota";
    if (vendor === "kimi" && (type === "access_terminated_error" || type === "exceeded_current_quota_error" || /usage limit/i.test(message))) return "plan-quota";
    if (vendor === "kimi" && status === 402 && plan) return "invalid-key";
    if (vendor === "qwen" && has(/FreeTierOnly|Free allocated quota exceeded/i, code, message)) return "plan-quota";
    if (vendor === "qwen" && /allocated quota exceeded/i.test(message) && !/concurrency/i.test(message)) return "plan-quota";
    if (vendor === "mimo" && status === 429 && /quota|plan|额度|用量/i.test(message)) return "plan-quota";
    if (has(/quota.{0,12}(exceeded|exhausted|reached|insufficient)|usage limit|额度.{0,6}(用尽|上限|不足)|用量上限/i, message)) return "plan-quota";
    // 5. Too fast for this account right now.
    if (vendor === "glm" && code === "1302") return "rate-limit";
    if (vendor === "glm" && code === "1305") return "overloaded";
    if (vendor === "minimax" && ["1002", "1039", "1041", "2045"].includes(code)) return "rate-limit";
    if (vendor === "kimi" && type === "engine_overloaded_error") return "overloaded";
    if (has(/Throttling|limit_requests|rate_limit|rate limit|too many requests|insufficient_quota/i, code, type, message)) return "rate-limit";
    if (status === 429) return "rate-limit";
    // 6. The request does not fit.
    if (has(/context.?(length|window)|maximum context|too long|exceeds? .{0,20}(token|context)|prompt is too long|上下文|1261/i, message, code)) return "context";
    if (status === 404 || has(/ModelNotFound|model_not_found|model.{0,20}(not exist|not found|does not exist)|不存在该模型|模型不存在/i, code, message)) return "not-found";
    if (status === 403) return "forbidden";
    if (status === 503 || status === 529 || has(/overload|capacity|busy|繁忙/i, message)) return "overloaded";
    if (status === 400 || status === 422 || status === 413) return "bad-request";
    if (status === 0) return "transport";
    return "server";
  })();
  return {
    kind,
    code: KIND_CODES[kind],
    message: message || `HTTP ${status}`,
    vendorCode: code || null,
    ...(scope ? { scope } : {}),
    ...(retryAfterMs(headers) ? { retryAfterMs: retryAfterMs(headers) } : {}),
    ...(parts.resetAt ? { resetAt: parts.resetAt } : {}),
  };
}
