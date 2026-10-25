#!/usr/bin/env node
// Regenerate lib/catalog-data.js from the live models.dev catalog (the one opencode and DSH's pi-ai use).
//
//   node scripts/gen-catalog.mjs [out.js]
//
// Needs network access; review the diff before committing (vendors retire models often).
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const OUT = process.argv[2] ?? fileURLToPath(new URL("../lib/catalog-data.js", import.meta.url));
const RECENT = new Date(Date.now() - 183 * 86_400_000).toISOString().slice(0, 10);
/** Vendor-announced retirement dates (official docs); update when vendors announce more. */
const RETIRING = { "mimo-v2.5": "2026-10-21", "mimo-v2.5-pro": "2026-10-21", "mimo-v2.5-pro-ultraspeed": "2026-10-21", "MiniMax-M2.7": "2026-11-18", "MiniMax-M2.7-highspeed": "2026-11-18" };

const response = await fetch("https://models.dev/api.json");
if (!response.ok) throw new Error(`models.dev answered ${response.status}`);
const providers = await response.json();
const data = { _meta: { fetched: new Date().toISOString().slice(0, 10) } };

/** models.dev provider ids each catalog draws from (plan catalogs add their extra models). */
const CATALOGS = {
  deepseek: ["deepseek"],
  "moonshotai-cn": ["moonshotai-cn"],
  moonshotai: ["moonshotai"],
  "kimi-code": ["kimi-code-plan-cn", "kimi-code-plan-global"],
  zhipuai: ["zhipuai"],
  zai: ["zai"],
  "zhipuai-coding-plan": ["zhipuai-coding-plan"],
  "zai-coding-plan": ["zai-coding-plan"],
  "minimax-cn": ["minimax-cn", "minimax-cn-coding-plan"],
  minimax: ["minimax", "minimax-coding-plan"],
  "alibaba-cn": ["alibaba-cn"],
  alibaba: ["alibaba"],
  "alibaba-coding-plan-cn": ["alibaba-coding-plan-cn"],
  "alibaba-coding-plan": ["alibaba-coding-plan"],
  "alibaba-token-plan-cn": ["alibaba-token-plan-cn"],
  "alibaba-token-plan": ["alibaba-token-plan"],
  xiaomi: ["xiaomi"],
  "xiaomi-token-plan-cn": ["xiaomi-token-plan-cn"],
  "xiaomi-token-plan-sgp": ["xiaomi-token-plan-sgp"],
  "xiaomi-token-plan-ams": ["xiaomi-token-plan-ams"],
};

function reasoningOf(model) {
  if (!model.reasoning) return null;
  const options = Array.isArray(model.reasoning_options) ? model.reasoning_options : [];
  const toggle = options.some((option) => option.type === "toggle");
  const efforts = options.find((option) => option.type === "effort")?.values ?? null;
  const budget = options.some((option) => option.type === "budget_tokens" || option.type === "budget");
  return { toggle, efforts: Array.isArray(efforts) && efforts.length ? efforts : null, budget };
}

const out = {};
const report = [];
for (const [catalog, sources] of Object.entries(CATALOGS)) {
  const seen = new Map();
  for (const source of sources) {
    const provider = providers[source];
    if (!provider) throw new Error(`missing provider ${source}`);
    for (const model of Object.values(provider.models ?? {})) {
      if (model.status === "deprecated" || !model.tool_call) continue;
      if (!(model.modalities?.output ?? ["text"]).includes("text")) continue;
      if (/image|tts|asr|embed|rerank|omni|realtime|audio|ocr|livetranslate/i.test(model.id)) continue;
      if (seen.has(model.id)) continue;
      const input = model.modalities?.input ?? ["text"];
      seen.set(model.id, {
        id: model.id,
        name: model.name ?? model.id,
        context: model.limit?.context ?? null,
        output: model.limit?.output ?? null,
        image: input.includes("image"),
        reasoning: reasoningOf(model),
        interleaved: Boolean(model.interleaved),
        released: model.release_date ?? null,
        recommended: (model.release_date ?? "") >= RECENT,
      });
    }
  }
  const models = [...seen.values()].sort((a, b) => String(b.released ?? "").localeCompare(String(a.released ?? "")) || a.id.localeCompare(b.id));
  // Announced retirements: listed (until they go), never selected by default.
  for (const model of models) if (RETIRING[model.id]) Object.assign(model, { recommended: false, retiring: RETIRING[model.id] });
  // A plan's list is the vendor's own short pick: all of it by default.
  if (models.length <= 10) models.forEach((model) => { if (!model.retiring) model.recommended = true; });
  // A catalog with no recent model still offers its newest few by default.
  if (!models.some((model) => model.recommended)) models.filter((model) => !model.retiring).slice(0, 4).forEach((model) => { model.recommended = true; });
  out[catalog] = models;
  report.push(`${catalog.padEnd(26)} ${String(models.length).padStart(3)} models, ${models.filter((m) => m.recommended).length} recommended: ${models.filter((m) => m.recommended).map((m) => m.id).join(", ")}`);
}

const header = `/**
 * Bundled model catalog, generated from models.dev (${data._meta.fetched}) — the
 * catalog opencode and DSH's pi-ai use — for the endpoints this plugin knows.
 * Only current, tool-calling chat models are kept. Each endpoint's live
 * \`GET /models\` list is merged over this at runtime; this snapshot supplies
 * names, limits, image input, and reasoning controls. \`recommended\` (released
 * since ${RECENT}) is the default selection.
 *
 * Regenerate with the research script; do not edit by hand.
 *
 * @module dsh-cn-models/catalog-data
 */
`;
writeFileSync(OUT, `${header}export const CATALOG_FETCHED = ${JSON.stringify(data._meta.fetched)};\n\nexport const CATALOGS = Object.freeze(${JSON.stringify(out, null, 1)});\n`);
console.log(report.join("\n"));
