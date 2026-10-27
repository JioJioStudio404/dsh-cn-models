/**
 * Errors the harness can classify without importing `@deepseek-ai/dsh-llm`.
 *
 * `normalizeLlmFailure` trusts a thrown error's own data properties when its
 * `code` and `failure.code` agree, so the code survives the package boundary
 * and the harness retry policy sees it (it retries RATE_LIMIT, SERVER,
 * TIMEOUT, TRANSPORT and EMPTY_RESPONSE by default).
 *
 * @module dsh-cn-models/errors
 */

/** Stable failure codes, matching the harness taxonomy. */
export const CODES = Object.freeze({
  quota: "QUOTA",
  rateLimit: "RATE_LIMIT",
  server: "SERVER",
  timeout: "TIMEOUT",
  transport: "TRANSPORT",
  empty: "EMPTY_RESPONSE",
  auth: "INVALID_CREDENTIAL",
  missing: "MISSING_CREDENTIAL",
  context: "CONTEXT_WINDOW_EXCEEDED",
  badRequest: "INVALID_REQUEST",
  unknownModel: "UNKNOWN_MODEL",
  aborted: "ABORTED",
  malformed: "MALFORMED_RESPONSE",
  imageOffload: "IMAGE_OFFLOAD_REQUIRED",
});

/**
 * Redact anything key-shaped before it is logged or shown: `sk-…` keys of
 * every vendor (including `sk-kimi-`, `sk-cp-`, `sk-sp-`, whose bodies may
 * hold `+ / = .`), Zhipu's `<hex>.<secret>`, MiMo plan keys, Qianfan's
 * `bce-v3/ALTAK-…/…`, bearer headers.
 */
export function redact(text) {
  return String(text ?? "")
    .replace(/\bBearer\s+[^\s"',;]+/gi, "Bearer [redacted]")
    .replace(/\bbce-v3\/[A-Za-z0-9._~+/=-]{12,}/g, "[redacted-key]")
    .replace(/\b(?:sk|tp|ttp)-[A-Za-z0-9._~+/=-]{12,}/g, "[redacted-key]")
    .replace(/\b[0-9a-f]{32}\.[A-Za-z0-9]{8,}\b/g, "[redacted-key]")
    .replace(/("?(?:api[_-]?key|authorization|x-api-key|key)"?\s*[:=]\s*")[^"]*(")/gi, "$1[redacted]$2");
}

/**
 * Build a classifiable error.
 * @param {string} code - one of {@link CODES}.
 * @param {string} message - user-facing message (redacted here).
 * @param {object} [extra] - `status`, `retryAfterMs`, `kind`, `keyId`, `endpoint`, `resetAt`, `vendorCode`,
 * `scope` (`"model"`: the refusal holds for this key and model only), `offloadImages` (how many of the
 * oldest images DSH should replace with text before retrying, with IMAGE_OFFLOAD_REQUIRED).
 * @returns the error.
 */
export function cnError(code, message, extra = {}) {
  const text = redact(message).slice(0, 900) || "request failed";
  const error = new Error(text);
  error.name = "CnModelsError";
  const failure = { message: text, code };
  if (Number.isInteger(extra.status) && extra.status >= 100 && extra.status <= 599) failure.status = extra.status;
  if (Number.isFinite(extra.retryAfterMs) && extra.retryAfterMs > 0) failure.providerRetryAfterMs = Math.round(extra.retryAfterMs);
  if (typeof extra.requestId === "string" && extra.requestId) failure.requestId = extra.requestId;
  if (Number.isSafeInteger(extra.offloadImages) && extra.offloadImages > 0) failure.offloadImages = extra.offloadImages;
  Object.defineProperty(error, "code", { value: code, enumerable: true, writable: false });
  Object.defineProperty(error, "failure", { value: Object.freeze(failure), enumerable: true, writable: false });
  for (const key of ["status", "kind", "keyId", "endpoint", "resetAt", "vendorCode", "scope"]) {
    if (extra[key] !== undefined) Object.defineProperty(error, key, { value: extra[key], enumerable: true });
  }
  return error;
}

/** Whether a value is a plain object. */
export function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** A non-empty string, or undefined. */
export function asString(value) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/** JSON.parse without throwing. */
export function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** A finite number from a number or numeric string, or undefined. */
export function asNumber(value) {
  const number = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  return typeof number === "number" && Number.isFinite(number) ? number : undefined;
}
