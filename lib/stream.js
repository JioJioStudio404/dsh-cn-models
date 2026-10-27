/**
 * One streaming Chat Completions response → harness stream chunks.
 *
 * Reasoning arrives as `delta.reasoning_content` (DeepSeek, Kimi, GLM, Qwen,
 * MiMo), `delta.reasoning`, or MiniMax's `delta.reasoning_details[]` (kept
 * raw for replay); a MiniMax answer that still embeds `<think>…</think>` in
 * its text is split apart. Tool calls stream by index. An error frame inside
 * the stream is classified like an HTTP failure, so a key that turns out to be
 * out of balance mid-way is still rotated when nothing was shown yet.
 *
 * @module dsh-cn-models/stream
 */
import { randomBytes } from "node:crypto";
import { classifyFailure, KIND_LABELS } from "./dialects.js";
import { asNumber, asString, cnError, CODES, isRecord, safeJson } from "./errors.js";
import { REPLAY_KIND, REPLAY_VERSION } from "./request.js";
import { ssePayloads } from "./wire.js";

/**
 * Harness usage from an OpenAI-style usage object. Counts are disjoint:
 * `inputTokens` is the uncached input only. None (or all zeros) is no usage:
 * DSH then estimates the context itself instead of reading 0 %.
 */
export function mapUsage(usage) {
  if (!isRecord(usage)) return undefined;
  const prompt = asNumber(usage.prompt_tokens) ?? 0;
  const completion = asNumber(usage.completion_tokens) ?? 0;
  if (prompt <= 0 && completion <= 0) return undefined;
  const cacheRead = asNumber(usage.prompt_cache_hit_tokens) ?? asNumber(usage.prompt_tokens_details?.cached_tokens) ?? asNumber(usage.cached_tokens) ?? 0;
  const cacheWrite = asNumber(usage.cache_write_tokens) ?? asNumber(usage.prompt_tokens_details?.cache_creation_input_tokens) ?? asNumber(usage.cache_creation_input_tokens) ?? 0;
  const reasoning = asNumber(usage.completion_tokens_details?.reasoning_tokens) ?? asNumber(usage.reasoning_tokens) ?? 0;
  return {
    inputTokens: Math.max(0, prompt - cacheRead - cacheWrite),
    outputTokens: completion,
    ...(asNumber(usage.total_tokens) ? { totalTokens: asNumber(usage.total_tokens) } : {}),
    ...(cacheRead > 0 ? { cacheReadTokens: cacheRead } : {}),
    ...(cacheWrite > 0 ? { cacheWriteTokens: cacheWrite } : {}),
    ...(reasoning > 0 ? { reasoningTokens: reasoning } : {}),
  };
}

/** The reasoning text a delta carries, and its raw `reasoning_details` (MiniMax). */
function reasoningOf(delta) {
  if (typeof delta.reasoning_content === "string" && delta.reasoning_content) return { text: delta.reasoning_content };
  if (typeof delta.reasoning === "string" && delta.reasoning) return { text: delta.reasoning };
  if (Array.isArray(delta.reasoning_details) && delta.reasoning_details.length) {
    const text = delta.reasoning_details.map((item) => (typeof item?.text === "string" ? item.text : "")).join("");
    return { text, details: delta.reasoning_details };
  }
  return undefined;
}

/** Merge streamed `reasoning_details` pieces into whole entries (text concatenated per index/id). */
function mergeDetails(target, pieces) {
  for (const piece of pieces) {
    if (!isRecord(piece)) continue;
    const key = piece.index ?? piece.id ?? 0;
    const existing = target.find((item) => (item.index ?? item.id ?? 0) === key);
    if (!existing) target.push({ ...piece });
    else if (typeof piece.text === "string") existing.text = `${existing.text ?? ""}${piece.text}`;
  }
}

/**
 * Translate one streaming response.
 * @param {Response} response - the 2xx SSE response.
 * @param {object} meta - `{ vendor, endpoint, model, keyId, idle, plan }`.
 * @returns an async iterable of stream chunks; throws classified errors.
 */
export async function* streamChunks(response, meta) {
  const replay = [];
  let blockCount = 0;
  let current;
  const tools = new Map();
  let openTool;
  let finishReason;
  let usage;
  let sawContent = false;
  // MiniMax fallback: <think> inside the text when reasoning_split was not honoured.
  let inThink = false;

  const close = function* () {
    if (!current) return;
    if (current.details) replay[current.index] = { ...replay[current.index], details: current.details };
    yield { type: "block-end", index: current.index, block: { type: current.type, text: current.text } };
    current = undefined;
  };
  const closeTool = function* () {
    if (openTool === undefined) return;
    const tool = tools.get(openTool);
    openTool = undefined;
    if (!tool || tool.closed) return;
    tool.closed = true;
    const args = tool.args.trim() ? tool.args : "{}";
    yield { type: "block-end", index: tool.index, block: { type: "tool-call", id: tool.id, name: tool.name, arguments: args } };
  };
  const emit = function* (type, text, details) {
    if (!text && !details) return;
    yield* closeTool();
    if (!current || current.type !== type) {
      yield* close();
      current = { type, text: "", index: blockCount++ };
      replay.push({});
      yield { type: "block-start", index: current.index, blockType: type };
    }
    if (details) mergeDetails((current.details ??= []), details);
    if (!text) return;
    current.text += text;
    sawContent = true;
    yield { type: type === "text" ? "text-delta" : "reasoning-delta", index: current.index, text };
  };
  const emitText = function* (text) {
    if (meta.vendor !== "minimax" || (!inThink && !text.includes("<think>"))) {
      yield* emit("text", text);
      return;
    }
    let rest = text;
    while (rest) {
      if (inThink) {
        const end = rest.indexOf("</think>");
        if (end < 0) { yield* emit("reasoning", rest); return; }
        yield* emit("reasoning", rest.slice(0, end));
        rest = rest.slice(end + 8);
        inThink = false;
      } else {
        const start = rest.indexOf("<think>");
        if (start < 0) { yield* emit("text", rest); return; }
        yield* emit("text", rest.slice(0, start));
        rest = rest.slice(start + 7);
        inThink = true;
      }
    }
  };

  for await (const payload of ssePayloads(response, meta.idle)) {
    const frame = safeJson(payload);
    if (!isRecord(frame)) continue;
    // An error inside the stream (or MiniMax's non-zero base_resp).
    const baseCode = asNumber(frame.base_resp?.status_code);
    if (isRecord(frame.error) || (baseCode !== undefined && baseCode !== 0)) {
      const failure = classifyFailure(meta.vendor, asNumber(frame.error?.http_code ?? frame.error?.code) ?? 200, frame, { plan: meta.plan });
      throw cnError(failure.code, `${meta.endpointName ?? meta.endpoint}：${KIND_LABELS[failure.kind] ?? "请求失败"}：${failure.message}`, { kind: failure.kind, keyId: meta.keyId, endpoint: meta.endpoint, vendorCode: failure.vendorCode, resetAt: failure.resetAt });
    }
    const choice = Array.isArray(frame.choices) ? frame.choices[0] : undefined;
    if (isRecord(frame.usage)) usage = frame.usage;
    else if (isRecord(choice?.usage)) usage = choice.usage;
    if (!choice) continue;
    const delta = isRecord(choice.delta) ? choice.delta : isRecord(choice.message) ? choice.message : {};
    const reasoning = reasoningOf(delta);
    if (reasoning) yield* emit("reasoning", reasoning.text, reasoning.details);
    if (typeof delta.content === "string" && delta.content) yield* emitText(delta.content);
    for (const call of Array.isArray(delta.tool_calls) ? delta.tool_calls : []) {
      if (!isRecord(call)) continue;
      const position = Number.isInteger(call.index) ? call.index : tools.size;
      let tool = tools.get(position);
      if (!tool) {
        yield* close();
        yield* closeTool();
        tool = { id: asString(call.id) ?? `call_${randomBytes(6).toString("hex")}`, name: asString(call.function?.name) ?? "", args: "", index: blockCount++, closed: false };
        tools.set(position, tool);
        replay.push({});
        openTool = position;
        yield { type: "block-start", index: tool.index, blockType: "tool-call" };
      } else if (!tool.name && asString(call.function?.name)) tool.name = call.function.name;
      const piece = typeof call.function?.arguments === "string" ? call.function.arguments : isRecord(call.function?.arguments) ? JSON.stringify(call.function.arguments) : "";
      sawContent = true;
      if (tool.closed) {
        // A late piece for an earlier call (interleaved streams): keep it for the record.
        tool.args += piece;
        continue;
      }
      tool.args += piece;
      yield { type: "tool-call-delta", index: tool.index, id: tool.id, ...(tool.name ? { name: tool.name } : {}), argumentsDelta: piece };
    }
    if (asString(choice.finish_reason)) finishReason = choice.finish_reason;
  }
  yield* close();
  for (const position of tools.keys()) {
    openTool = position;
    yield* closeTool();
  }

  const reason = String(finishReason ?? "").toLowerCase();
  if (!sawContent) {
    if (reason === "content_filter" || reason === "sensitive") throw cnError(CODES.badRequest, `${meta.endpointName ?? meta.endpoint}：内容审核未通过`, { kind: "moderation" });
    throw cnError(CODES.empty, `${meta.endpointName ?? meta.endpoint} 没有返回内容（${meta.model}）`, { kind: "empty" });
  }
  const mapped = mapUsage(usage);
  if (mapped) yield { type: "usage", usage: mapped };
  let finish;
  if (tools.size > 0) finish = { kind: "tool-calls" };
  else if (reason === "length") finish = { kind: "max-tokens" };
  else if (reason === "content_filter" || reason === "sensitive") finish = { kind: "error", failure: { message: "内容审核未通过，回答被截断", code: CODES.badRequest } };
  else if (reason === "network_error" || reason === "insufficient_system_resource") finish = { kind: "error", failure: { message: `${meta.endpointName ?? meta.endpoint} 服务端中断（${reason}）`, code: CODES.server } };
  else finish = { kind: "stop" };
  yield {
    type: "finish",
    reason: finish,
    replayState: {
      response: { kind: REPLAY_KIND, version: REPLAY_VERSION, vendor: meta.vendor, endpoint: meta.endpoint, model: meta.model, ...(meta.keyId ? { keyId: meta.keyId } : {}) },
      blocks: replay,
    },
  };
}
