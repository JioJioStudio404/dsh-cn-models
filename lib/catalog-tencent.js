/**
 * Tencent Cloud TokenHub's models, which models.dev (the source of
 * `catalog-data.js`) does not list. Windows, outputs and image input are
 * TokenHub's model list page (cloud.tencent.com/document/product/1823/130051,
 * 2026-11-03); its API lists ids only. Tool-calling chat models only.
 *
 * Neither TokenHub nor the Token Plan documents how a model's thinking is
 * switched, so no levels are offered: each model thinks as it does by default.
 *
 * The Token Plan list is the ids its own `/plan/v3/models` answered on
 * 2026-11-03 (its dashed aliases, such as `glm-5-1`, left out); its models take
 * no images ("Token Plan 可用模型暂不支持多模态能力"). `tc-code-latest` is the
 * model the platform picks, so nothing is assumed about it.
 *
 * Maintained by hand: `scripts/gen-catalog.mjs` does not touch this file.
 *
 * @module dsh-cn-models/catalog-tencent
 */

const model = (id, name, context, output, image, released, recommended) => Object.freeze({ id, name, context, output, image, reasoning: null, interleaved: false, released, recommended });

/** TokenHub's chat models (pay as you go). */
const HUB = [
  model("deepseek-v4.1-flash", "DeepSeek V4.1 Flash", 1048576, 393216, true, "2026-09-10", true),
  model("deepseek-v4-pro", "DeepSeek V4 Pro", 1048576, 393216, false, "2026-04-24", true),
  model("kimi-k3.1-pro", "Kimi K3.1 Pro", 1048576, 131072, true, null, true),
  model("glm-5.3", "GLM-5.3", 1048576, 131072, false, "2026-08-18", true),
  model("minimax-m3", "MiniMax-M3", 1048576, 131072, true, null, true),
  model("hy4-preview", "Hy4 preview", 1048576, 65536, false, null, true),
  model("deepseek-v4.1-flash-1017", "DeepSeek V4.1 Flash 1017", 1048576, 393216, true, "2026-10-17", false),
  model("deepseek-v4-pro-0813", "DeepSeek V4 Pro 0813", 1048576, 393216, false, "2026-08-13", false),
  model("deepseek/deepseek-flash", "DeepSeek V4.1 Flash 1017（原厂直供）", 1048576, 393216, true, "2026-10-17", false),
  model("deepseek/deepseek-v4-pro", "DeepSeek V4 Pro 0813（原厂直供）", 1048576, 393216, false, "2026-08-13", false),
  model("kimi-k3.1-pro-highspeed", "Kimi K3.1 Pro HighSpeed", 1048576, 131072, true, null, false),
  model("kimi-k3", "Kimi K3", 1048576, 131072, true, "2026-07-16", false),
  model("kimi-k2.8-preview", "Kimi K2.8 Preview", 1048576, 131072, true, null, false),
  model("kimi-k2.7-code", "Kimi K2.7 Code", 262144, 131072, true, null, false),
  model("kimi-k2.7-code-highspeed", "Kimi K2.7 Code HighSpeed", 262144, 131072, true, null, false),
  model("kimi-k2.6", "Kimi K2.6", 262144, 131072, true, null, false),
  model("glm-5.3-flash", "GLM-5.3 Flash", 1048576, 131072, true, "2026-08-28", false),
  model("glm-5.3-flashx", "GLM-5.3 FlashX", 1048576, 131072, true, null, false),
  model("glm-5.2", "GLM-5.2", 1048576, 131072, false, "2026-06-15", false),
  model("minimax-m3.1-flash", "MiniMax-M3.1 Flash", 1048576, 131072, true, null, false),
  model("minimax-m2.7", "MiniMax-M2.7", 204800, 131072, false, null, false),
  model("mimo-v2.6-pro", "MiMo V2.6 Pro", 1048576, 131072, true, null, false),
  model("mimo-v2.6-flash", "MiMo V2.6 Flash", 1048576, 131072, true, null, false),
  model("mimo-v2.5-pro", "MiMo V2.5 Pro", 1048576, 131072, false, null, false),
  model("hy3", "Hy3", 262144, 131072, false, null, false),
  model("step-5-preview", "Step 5 Preview", 1048576, 65536, true, null, false),
];

/** The Token Plan's models (no images on the plan). */
const PLAN = [
  model("tc-code-latest", "tc-code-latest（平台自动选择）", null, null, false, null, true),
  model("deepseek/deepseek-flash", "DeepSeek V4.1 Flash（原厂直供）", 1048576, 393216, false, "2026-10-17", true),
  model("kimi-k3", "Kimi K3", 1048576, 131072, false, "2026-07-16", true),
  model("glm-5.3", "GLM-5.3", 1048576, 131072, false, "2026-08-18", true),
  model("minimax-m3", "MiniMax-M3", 1048576, 131072, false, null, true),
  model("hy4-preview", "Hy4 preview", 1048576, 65536, false, null, true),
  model("deepseek/deepseek-v4-pro", "DeepSeek V4 Pro（原厂直供）", 1048576, 393216, false, "2026-04-24", false),
  model("deepseek/deepseek-v4-pro-0813", "DeepSeek V4 Pro 0813（原厂直供）", 1048576, 393216, false, "2026-08-13", false),
  model("deepseek/deepseek-v4-flash-0731", "DeepSeek V4 Flash 0731（原厂直供）", 1048576, 393216, false, "2026-08-02", false),
  model("deepseek/deepseek-v4-flash", "DeepSeek V4 Flash（原厂直供）", 1048576, 393216, false, null, false),
  model("deepseek-v4-pro-202606", "DeepSeek V4 Pro 202606", 1048576, 393216, false, null, false),
  model("deepseek-v4-flash-202605", "DeepSeek V4 Flash 202605", 1048576, 393216, false, null, false),
  model("glm-5.3-flash", "GLM-5.3 Flash", 1048576, 131072, false, "2026-08-28", false),
  model("glm-5.2", "GLM-5.2", 1048576, 131072, false, "2026-06-15", false),
  model("glm-5.1", "GLM-5.1", null, null, false, null, false),
  model("glm-5", "GLM-5", null, null, false, null, false),
  model("kimi-k2.7-code", "Kimi K2.7 Code", 262144, 131072, false, null, false),
  model("kimi-k2.5", "Kimi K2.5", 262144, 131072, false, null, false),
  model("minimax-m2.7", "MiniMax-M2.7", 204800, 131072, false, null, false),
  model("minimax-m2.5", "MiniMax-M2.5", 204800, 131072, false, null, false),
  model("mimo-v2.6-flash", "MiMo V2.6 Flash", 1048576, 131072, false, null, false),
];

export const TENCENT_CATALOGS = Object.freeze({ "tencent-hub": Object.freeze(HUB), "tencent-plan": Object.freeze(PLAN) });
