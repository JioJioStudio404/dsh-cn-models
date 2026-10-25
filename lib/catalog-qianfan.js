/**
 * Baidu Qianfan's models, which models.dev (the source of `catalog-data.js`)
 * does not list. Names are this plugin's own (Qianfan's `model_name` repeats
 * across variants); `context` is the input limit (`prompt_tokens`, not
 * `context_length`, which adds the output), `output` and image input come from
 * Qianfan's own `GET /v2/models` on 2026-10-21, and `released` from its
 * `created`. Tool-calling chat models only.
 *
 * Reasoning controls were checked by live calls on 2026-10-21: every model
 * thinks by default; `thinking: { type: "disabled" }` turns it off cleanly for
 * the DeepSeek models, GLM-5.2 (Fast) and ERNIE 5.1. GLM-5.3 Flash refuses it
 * ("该模型始终思考…请使用 low、high 或 max"), and GLM-5.3 accepts it but then
 * writes its thinking into the answer (ending in a stray `</think>`), so both
 * offer low / high / max only (low thinks little or not at all). DeepSeek's
 * `reasoning_effort` takes high and max (low and medium read as high). The
 * Qwen3.5 and ERNIE 5.0 entries follow Qianfan's thinking docs (their switch
 * is `enable_thinking`); no test key could call them.
 *
 * The Token Plan lists are the plans' documented model ids (2026-10-21);
 * `qianfan-code-latest` is whichever model the plan's console page picked, so
 * nothing is assumed about it.
 *
 * Maintained by hand: `scripts/gen-catalog.mjs` does not touch this file.
 *
 * @module dsh-cn-models/catalog-qianfan
 */

const THINKS_WITH_EFFORT = Object.freeze({ toggle: true, efforts: ["high", "max"], budget: false });
const THINKS = Object.freeze({ toggle: true, efforts: null, budget: false });
const ALWAYS_THINKS = Object.freeze({ toggle: false, efforts: ["low", "high", "max"], budget: false });

const model = (id, name, context, output, image, reasoning, released, recommended) => Object.freeze({ id, name, context, output, image, reasoning, interleaved: false, released, recommended });

const DEEPSEEK_V41_FLASH = model("deepseek-v4.1-flash", "DeepSeek V4.1 Flash", 1048576, 393216, true, THINKS_WITH_EFFORT, "2026-09-10", true);
const DEEPSEEK_V4_PRO = model("deepseek-v4-pro", "DeepSeek V4 Pro", 1048576, 393216, false, THINKS_WITH_EFFORT, "2026-04-24", false);
const DEEPSEEK_V4_PRO_0813 = model("deepseek-v4-pro-0813", "DeepSeek V4 Pro 0813", 1048576, 393216, false, THINKS_WITH_EFFORT, "2026-08-13", true);
const DEEPSEEK_V4_FLASH_0731 = model("deepseek-v4-flash-0731", "DeepSeek V4 Flash 0731", 1048576, 393216, false, THINKS_WITH_EFFORT, "2026-08-02", false);
const GLM_53 = model("glm-5.3", "GLM-5.3", 1048576, 131072, false, ALWAYS_THINKS, "2026-08-18", true);
const GLM_53_FLASH = model("glm-5.3-flash", "GLM-5.3 Flash", 1048576, 131072, true, ALWAYS_THINKS, "2026-08-28", true);
const GLM_52 = model("glm-5.2", "GLM-5.2", 1048576, 131072, false, THINKS, "2026-06-15", false);
const GLM_51 = model("glm-5.1", "GLM-5.1", 202752, 131072, false, THINKS, "2026-04-07", false);

/** The plans' lists are the vendor's own short pick: all of it by default. */
const planPick = (entry) => (entry.recommended ? entry : Object.freeze({ ...entry, recommended: true }));
const PLAN_MODELS = [DEEPSEEK_V41_FLASH, DEEPSEEK_V4_PRO, DEEPSEEK_V4_PRO_0813, DEEPSEEK_V4_FLASH_0731, GLM_53, GLM_53_FLASH, GLM_52, GLM_51].map(planPick);
const CONSOLE_PICK = model("qianfan-code-latest", "qianfan-code-latest（控制台所选模型）", null, null, false, null, null, false);

export const QIANFAN_CATALOGS = Object.freeze({
  qianfan: Object.freeze([
    DEEPSEEK_V41_FLASH,
    model("deepseek-v4.1-flash-1017", "DeepSeek V4.1 Flash 1017", 1048576, 393216, true, THINKS_WITH_EFFORT, "2026-10-17", false),
    DEEPSEEK_V4_PRO_0813,
    DEEPSEEK_V4_PRO,
    DEEPSEEK_V4_FLASH_0731,
    GLM_53,
    GLM_53_FLASH,
    model("glm-5.2-fast", "GLM-5.2 Fast", 1048576, 131072, false, THINKS, "2026-08-13", false),
    GLM_52,
    GLM_51,
    model("ernie-5.1", "ERNIE 5.1", 121856, 126976, false, THINKS, "2026-05-08", true),
    model("ernie-5.0", "ERNIE 5.0", 121856, 126976, true, null, "2026-03-05", false),
    model("ernie-5.0-thinking-preview", "ERNIE 5.0 Thinking Preview", 121856, 126976, true, THINKS, "2026-01-22", false),
    model("ernie-4.5-turbo-20260402", "ERNIE 4.5 Turbo 0402", 125952, 12288, false, null, "2026-04-02", false),
    model("qwen3.5-397b-a17b", "Qwen3.5 397B A17B", 260096, 147456, true, THINKS, "2026-03-05", false),
    model("qwen3.5-122b-a10b", "Qwen3.5 122B A10B", 260096, 147456, true, THINKS, "2026-03-05", false),
    model("qwen3.5-35b-a3b", "Qwen3.5 35B A3B", 260096, 147456, true, THINKS, "2026-03-05", false),
    model("qwen3.5-27b", "Qwen3.5 27B", 260096, 147456, true, THINKS, "2026-03-05", false),
  ]),
  "qianfan-token-personal": Object.freeze([...PLAN_MODELS, CONSOLE_PICK]),
  // The team plan adds DeepSeek V3.2 (not on the pay-as-you-go list; its limits are not published there).
  "qianfan-token-team": Object.freeze([...PLAN_MODELS, model("deepseek-v3.2", "DeepSeek V3.2", null, null, false, THINKS, null, true), CONSOLE_PICK]),
});
