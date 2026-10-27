/**
 * HTTP to the vendors: JSON calls, the streaming chat call, and its SSE frames.
 *
 * Every request carries a real User-Agent naming DeepSeek Harness and this
 * plugin (DSH attribution; Kimi Code also asks clients not to disguise it).
 *
 * @module dsh-cn-models/wire
 */
import { cnError, CODES, safeJson } from "./errors.js";

export const VERSION = "0.5.2";
export const USER_AGENT = `deepseek-harness dsh-cn-models/${VERSION} (+https://github.com/deepseek-ai/deepseek-harness)`;

/** Default wait for a JSON call. */
const JSON_TIMEOUT_MS = 20_000;

/** The base URL a key talks to: its own override, else its endpoint's. */
export const baseUrlOf = (record, endpoint) => record?.baseUrl ?? endpoint.baseUrl;

/** Request headers for one key. `raw`: the key without "Bearer " (GLM's quota endpoint). */
export function headersFor(key, { raw = false, accept = "application/json", json = false } = {}) {
  return {
    authorization: raw ? key : `Bearer ${key}`,
    "user-agent": USER_AGENT,
    accept,
    ...(json ? { "content-type": "application/json" } : {}),
  };
}

/**
 * One JSON request. Never throws on an HTTP error: the caller classifies it.
 * @returns `{ status, ok, body, text, headers }`; status 0 for a transport failure.
 */
export async function requestJson(url, key, { method = "GET", body, raw = false, signal, timeoutMs = JSON_TIMEOUT_MS, fetchImpl = fetch } = {}) {
  const timeout = AbortSignal.timeout(timeoutMs);
  try {
    const response = await fetchImpl(url, {
      method,
      headers: headersFor(key, { raw, json: body !== undefined }),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
    const text = await response.text();
    return { status: response.status, ok: response.ok, body: safeJson(text), text, headers: response.headers };
  } catch (error) {
    if (signal?.aborted) throw cnError(CODES.aborted, "request aborted");
    const timedOut = timeout.aborted;
    return { status: 0, ok: false, body: undefined, text: timedOut ? "timed out" : String(error?.cause?.code ?? error?.message ?? error), headers: undefined, timedOut };
  }
}

/**
 * Open the streaming chat call. An idle stream (no byte for `idleMs`) is cut,
 * so a stalled connection fails as TIMEOUT instead of hanging the turn.
 * @returns `{ response, idle }` on 2xx (`idle.touch()` on every chunk), or `{ status, text, headers }` on failure.
 */
export async function openStream(url, key, body, { signal, fetchImpl = fetch, connectTimeoutMs = 120_000, idleMs = 600_000 } = {}) {
  const controller = new AbortController();
  const abort = () => controller.abort(signal?.reason);
  if (signal) {
    if (signal.aborted) abort();
    else signal.addEventListener("abort", abort, { once: true });
  }
  let timer = setTimeout(() => controller.abort(new Error("connect timeout")), connectTimeoutMs);
  const idle = {
    touch() {
      clearTimeout(timer);
      timer = setTimeout(() => controller.abort(new Error("idle timeout")), idleMs);
    },
    stop() {
      clearTimeout(timer);
      signal?.removeEventListener?.("abort", abort);
    },
    get timedOut() {
      return controller.signal.aborted && !signal?.aborted;
    },
  };
  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: headersFor(key, { json: true, accept: "text/event-stream" }),
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (response.ok) {
      idle.touch();
      return { response, idle };
    }
    const text = await response.text();
    idle.stop();
    return { status: response.status, text, headers: response.headers };
  } catch (error) {
    idle.stop();
    if (signal?.aborted) throw cnError(CODES.aborted, "request aborted by the caller");
    if (controller.signal.aborted) throw cnError(CODES.timeout, "the vendor did not answer in time");
    return { status: 0, text: String(error?.cause?.code ?? error?.message ?? error), headers: undefined };
  }
}

/**
 * SSE `data:` payloads of a response (comments such as DeepSeek's
 * `: keep-alive` are skipped, but still count as activity).
 */
export async function* ssePayloads(response, idle) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let pending = [];
  const flush = function* () {
    if (pending.length) yield pending.join("\n");
    pending = [];
  };
  try {
    while (true) {
      let chunk;
      try {
        chunk = await reader.read();
      } catch (error) {
        if (idle?.timedOut) throw cnError(CODES.timeout, "the vendor stopped sending (idle timeout)");
        throw cnError(CODES.transport, `the stream broke: ${error?.message ?? error}`);
      }
      if (chunk.done) break;
      idle?.touch();
      buffer += decoder.decode(chunk.value, { stream: true });
      let newline;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline).replace(/\r$/, "");
        buffer = buffer.slice(newline + 1);
        if (line === "") yield* flush();
        else if (line.startsWith("data:")) {
          const data = line.slice(5).trimStart();
          if (data === "[DONE]") return;
          pending.push(data);
        }
      }
    }
    buffer += decoder.decode();
    if (buffer.startsWith("data:")) {
      const data = buffer.slice(5).trimStart();
      if (data !== "[DONE]") pending.push(data);
    }
    yield* flush();
  } finally {
    idle?.stop();
    reader.releaseLock?.();
  }
}
