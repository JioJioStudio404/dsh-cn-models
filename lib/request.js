/**
 * Harness options → one OpenAI-compatible Chat Completions body.
 *
 * Reasoning replay is where these vendors differ from OpenAI and where
 * requests break: DeepSeek, Kimi, MiMo and GLM's preserved thinking need every
 * earlier assistant turn's `reasoning_content` back (DeepSeek answers 400
 * without it once tools are in play; GLM needs it byte for byte), and MiniMax
 * its `reasoning_details` as received. This plugin's own turns carry that in
 * their replay envelope; another provider's turns never pass their reasoning
 * off as this vendor's, and get an empty field where one is required.
 *
 * @module dsh-cn-models/request
 */
import { dialectOf } from "./dialects.js";
import { cnError, CODES, isRecord, safeJson } from "./errors.js";

export const REPLAY_KIND = "cn-models";
export const REPLAY_VERSION = 1;

/** Strip lone surrogates (they break JSON on some vendors) and NULs. */
const clean = (text) => String(text ?? "").replace(/[\uD800-\uDFFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "�").replace(/\u0000/g, "");

/** The text of a content list (or a string). */
export function textOf(content) {
  if (typeof content === "string") return content;
  return (Array.isArray(content) ? content : []).filter((block) => block?.type === "text" && typeof block.text === "string").map((block) => block.text).join("");
}

/**
 * Clamp an image to the request budget without importing the attachment
 * package; the adapter reports the same target (`imageRequestTarget`).
 */
export function requestTarget(ref, maxPixels = 2048 * 2048, maxBytes = 5 * 1024 * 1024) {
  const width = Number(ref?.width) || 2048;
  const height = Number(ref?.height) || 2048;
  const scale = Math.min(1, Math.sqrt(maxPixels / (width * height)));
  return { width: Math.max(1, Math.floor(width * scale)), height: Math.max(1, Math.floor(height * scale)), maxBytes };
}

/** A call id every vendor accepts (history from other providers may carry others), stable per input. */
export function callIdFor(id) {
  const raw = String(id ?? "");
  const safe = raw.replace(/[^A-Za-z0-9_\-.:]/g, "_").slice(0, 64);
  return safe || "call_0";
}

/** This plugin's replay entries for an assistant message of the same vendor, or undefined. */
export function replayOf(message, vendor) {
  const state = message?.source?.replayState;
  if (!isRecord(state) || !isRecord(state.response) || state.response.kind !== REPLAY_KIND || state.response.version !== REPLAY_VERSION) return undefined;
  if (state.response.vendor !== vendor) return undefined;
  return Array.isArray(state.blocks) ? state.blocks : [];
}

/** JSON Schema cleanup: no `$schema`; Kimi wants a `type` beside every `enum`. */
export function sanitizeSchema(schema, { enumNeedsType = false } = {}) {
  const walk = (node) => {
    if (Array.isArray(node)) return node.map(walk);
    if (!isRecord(node)) return node;
    const out = {};
    for (const [key, value] of Object.entries(node)) {
      if (key === "$schema") continue;
      out[key] = walk(value);
    }
    if (enumNeedsType && Array.isArray(out.enum) && out.type === undefined) {
      const types = [...new Set(out.enum.map((value) => (value === null ? "null" : typeof value)))];
      out.type = types.length === 1 ? (types[0] === "number" && out.enum.every(Number.isInteger) ? "integer" : types[0]) : types;
    }
    return out;
  };
  return walk(isRecord(schema) ? schema : { type: "object", properties: {} });
}

/** Harness tool schemas → OpenAI `tools`. */
export function toolsOf(tools, dialect) {
  if (!Array.isArray(tools) || tools.length === 0) return undefined;
  return tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      ...(tool.description ? { description: clean(tool.description) } : {}),
      parameters: sanitizeSchema(tool.parameters, { enumNeedsType: dialect.enumNeedsType }),
    },
  }));
}

/** One user-side content list → OpenAI content (images as data URLs when the model takes them). */
async function userContent(content, { model, attachments, signal }) {
  const parts = [];
  for (const block of Array.isArray(content) ? content : typeof content === "string" ? [{ type: "text", text: content }] : []) {
    if (block?.type === "text" && typeof block.text === "string" && block.text.length > 0) {
      parts.push({ type: "text", text: clean(block.text) });
    } else if (block?.type === "image") {
      const ref = block.attachment;
      if (!model?.image) {
        parts.push({ type: "text", text: "[an image was attached; this model does not take images]" });
        continue;
      }
      if (block.offloaded === true || !ref) {
        parts.push({ type: "text", text: `[image ${ref?.attachmentId ?? ""} offloaded]` });
        continue;
      }
      if (typeof attachments?.readImageRequest !== "function") throw cnError(CODES.badRequest, "image input needs the DSH attachment service");
      const version = await attachments.readImageRequest(ref, requestTarget(ref), signal);
      const media = version.mediaType ?? ref.mediaType ?? "image/png";
      parts.push({ type: "image_url", image_url: { url: `data:${media};base64,${Buffer.from(version.data).toString("base64")}` } });
    }
  }
  return parts;
}

/** Text-only parts read as a plain string (the most widely accepted form). */
const contentValue = (parts) => (parts.every((part) => part.type === "text") ? parts.map((part) => part.text).join("\n\n") : parts);

/**
 * Harness messages → OpenAI messages.
 * @param {readonly object[]} messages - request messages.
 * @param {object} context - `{ system, vendor, model, attachments, signal, hasTools }`.
 */
export async function convertMessages(messages, context) {
  const dialect = dialectOf(context.vendor);
  const system = [];
  if (typeof context.system === "string" && context.system.trim()) system.push(clean(context.system));
  const out = [];
  const pushUser = (parts) => {
    if (parts.length === 0) return;
    const last = out.at(-1);
    // Consecutive user turns merge: some vendors expect alternation.
    if (last?.role === "user") {
      const previous = Array.isArray(last.content) ? last.content : [{ type: "text", text: last.content }];
      last.content = contentValue([...previous, ...parts]);
    } else out.push({ role: "user", content: contentValue(parts) });
  };
  for (const message of messages ?? []) {
    switch (message?.role) {
      case "system": {
        const text = textOf(message.content);
        if (text) system.push(clean(text));
        break;
      }
      case "developer": {
        // Session guidance (tool changes and such): read as a user note, since
        // several vendors refuse a `developer` role or a system message mid-way.
        const text = textOf(message.content);
        if (text) pushUser([{ type: "text", text: clean(text) }]);
        break;
      }
      case "assistant": {
        const replay = replayOf(message, context.vendor);
        const blocks = Array.isArray(message.content) ? message.content : [];
        let text = "";
        let reasoning = "";
        let details;
        const calls = [];
        blocks.forEach((block, index) => {
          if (block?.type === "text") text += String(block.text ?? "");
          else if (block?.type === "reasoning" && replay) {
            // Only this vendor's own reasoning goes back, exactly as received.
            reasoning += String(block.text ?? "");
            if (Array.isArray(replay[index]?.details)) details = [...(details ?? []), ...replay[index].details];
          } else if (block?.type === "tool-call") {
            const args = typeof block.arguments === "string" ? block.arguments : JSON.stringify(block.arguments ?? {});
            calls.push({ id: callIdFor(block.id), type: "function", function: { name: block.name, arguments: safeJson(args) === undefined ? "{}" : args } });
          }
        });
        const entry = { role: "assistant", content: clean(text) };
        if (reasoning) entry.reasoning_content = reasoning;
        else if (dialect.reasoningOnAssistant) entry.reasoning_content = "";
        if (details && dialect.replayDetails) entry.reasoning_details = details;
        if (calls.length) entry.tool_calls = calls;
        if (entry.content || entry.tool_calls || entry.reasoning_content) out.push(entry);
        break;
      }
      case "tool": {
        const output = textOf(message.content) || (message.isError ? "Tool failed" : "(no output)");
        out.push({ role: "tool", tool_call_id: callIdFor(message.toolCallId), content: clean(output) });
        // Images a tool returned travel in a following user turn (tool messages are text only).
        const images = (Array.isArray(message.content) ? message.content : []).filter((block) => block?.type === "image");
        if (images.length && context.model?.image) pushUser(await userContent(images, context));
        break;
      }
      default:
        pushUser(await userContent(message?.content, context));
    }
  }
  if (out.length === 0 || out[0].role !== "user") out.unshift({ role: "user", content: "(continue)" });
  if (system.length) out.unshift({ role: "system", content: system.join("\n\n") });
  return out;
}

/**
 * The complete body for one streaming call.
 * @param {object} input - `{ options, endpoint, model, effort, attachments }`.
 * @returns the body.
 */
export async function buildBody({ options, endpoint, model, effort, attachments }) {
  const dialect = dialectOf(endpoint.vendor);
  const tools = toolsOf(options.tools, dialect);
  const messages = await convertMessages(options.messages, { system: options.system, vendor: endpoint.vendor, model, attachments, signal: options.signal, hasTools: Boolean(tools) });
  const body = { model: model.id, messages, stream: true };
  if (dialect.streamUsage) body.stream_options = { include_usage: true };
  if (tools) {
    body.tools = tools;
    if (dialect.toolStream) body.tool_stream = true;
  }
  Object.assign(body, dialect.thinking(model, effort));
  const thinkingOn = Boolean(model.reasoning) && effort !== "off";
  if (typeof options.temperature === "number") {
    const temperature = dialect.temperature(options.temperature, thinkingOn);
    if (typeof temperature === "number") body.temperature = temperature;
  }
  if (Number.isInteger(options.maxTokens) && options.maxTokens > 0) {
    const cap = Math.min(model.output ?? Infinity, dialect.maxTokensCap ?? Infinity);
    body[dialect.maxTokensField] = Math.min(options.maxTokens, cap);
  }
  if (Array.isArray(options.stop) && options.stop.length) body.stop = options.stop.slice(0, dialect.stopMax);
  if (dialect.extra) Object.assign(body, dialect.extra);
  return body;
}
