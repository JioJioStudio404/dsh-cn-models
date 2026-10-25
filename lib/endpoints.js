/**
 * The vendors and endpoints this plugin knows.
 *
 * An endpoint is one vendor × region × billing (pay-as-you-go or a plan): keys
 * are bound to exactly one (a Kimi `.cn` key fails on `.ai`, a Bailian plan key
 * only works on its plan host, a GLM plan key on the normal host bills the
 * balance), so keys belong to an endpoint and rotation stays inside it. Every
 * endpoint is reached over its OpenAI-compatible Chat Completions API; the
 * vendor differences live in `dialects.js`.
 *
 * Facts below were checked against the vendors' official docs and live calls
 * on 2026-10-15, Baidu Qianfan's on 2026-10-21 (see README).
 *
 * @module dsh-cn-models/endpoints
 */

/**
 * Vendors, in display (and tab) order. `tab`: the conversation tab's English
 * label. `dshRefs`: DSH credential references that may hold this vendor's key.
 */
export const VENDORS = Object.freeze([
  { id: "deepseek", tab: "DeepSeek", name: "DeepSeek", dshRefs: ["DEEPSEEK_API_KEY", "DEEPSEEK_OFFICIAL_API_KEY"] },
  { id: "kimi", tab: "Kimi", name: "Kimi（月之暗面）", dshRefs: ["MOONSHOT_API_KEY", "MOONSHOTAI_API_KEY", "MOONSHOTAI_CN_API_KEY", "KIMI_API_KEY", "KIMI_CODING_API_KEY"] },
  { id: "glm", tab: "GLM", name: "智谱 GLM / Z.ai", dshRefs: ["ZAI_API_KEY", "ZHIPU_API_KEY", "ZHIPUAI_API_KEY", "ZAI_CODING_CN_API_KEY"] },
  { id: "minimax", tab: "MiniMax", name: "MiniMax", dshRefs: ["MINIMAX_API_KEY", "MINIMAX_CN_API_KEY"] },
  { id: "qwen", tab: "Qwen", name: "通义千问（阿里云百炼）", dshRefs: ["DASHSCOPE_API_KEY", "ALIBABA_API_KEY", "QWEN_TOKEN_PLAN_API_KEY", "QWEN_TOKEN_PLAN_CN_API_KEY", "ALIBABA_CODING_PLAN_API_KEY"] },
  { id: "mimo", tab: "MiMo", name: "小米 MiMo", dshRefs: ["XIAOMI_API_KEY", "MIMO_API_KEY"] },
  { id: "qianfan", tab: "Qianfan", name: "百度千帆", dshRefs: ["QIANFAN_API_KEY", "BAIDU_QIANFAN_API_KEY", "QIANFAN_TOKEN_PLAN_API_KEY"] },
]);

/** Vendor ids, in order. */
export const VENDOR_IDS = Object.freeze(VENDORS.map((vendor) => vendor.id));

/** Plan terms worth showing next to a plan endpoint (vendors' own wording, abridged). */
const TERMS = {
  kimiCode: "Kimi Code 会员额度供编程工具使用，多个 Key 共享同一份额度（5 小时窗口 + 每周上限）。",
  glmCoding: "GLM Coding Plan 的额度只在官方支持的编程工具中生效；套餐 Key 调用普通端点会改扣账户余额。",
  minimaxPlan: "M Plan（sk-cp- 订阅 Key）额度按 5 小时窗口和每周上限计算。",
  bailianCoding: "百炼 Coding Plan 条款禁止用于自动化脚本或自定义应用后端，违反可能导致 Key 被封。",
  bailianToken: "百炼 Token Plan 限定在编程与 Agent 工具中使用。",
  mimoToken: "MiMo Token Plan（tp- / ttp- Key）与按量 Key 不能混用。",
  qianfanToken: "千帆 Token Plan 使用专属 Key，仅限在编程与 Agent 工具中交互使用，禁止用于自动化脚本或应用后端，违反可能导致订阅暂停或 Key 被封。",
};

/**
 * Endpoints. `check` says how a key's validity and balance are read:
 *  - `balance`: a free balance endpoint (DeepSeek, Kimi);
 *  - `kimi-code`: the Kimi Code usage endpoint (5-hour and weekly windows);
 *  - `minimax`: `GET /models` (validates the key) plus, for `sk-cp-` plan keys, the plan's remaining percentages;
 *  - `glm-plan`: the Coding Plan quota endpoint;
 *  - `models`: `GET /models`, which validates the key;
 *  - `chat`: no free endpoint validates the key, so a one-token request does (only on import or the row's ✓).
 */
export const ENDPOINTS = Object.freeze([
  {
    id: "deepseek", vendor: "deepseek", name: "DeepSeek", region: null, plan: null,
    baseUrl: "https://api.deepseek.com", catalog: "deepseek",
    check: { kind: "balance", path: "/user/balance" }, liveModels: true, probeModel: "deepseek-flash",
  },
  {
    id: "kimi-cn", vendor: "kimi", name: "Kimi（国内）", region: "cn", plan: null,
    baseUrl: "https://api.moonshot.cn/v1", catalog: "moonshotai-cn",
    check: { kind: "balance", path: "/users/me/balance" }, liveModels: true, probeModel: "kimi-k2.6",
  },
  {
    id: "kimi-intl", vendor: "kimi", name: "Kimi（国际）", region: "intl", plan: null,
    baseUrl: "https://api.moonshot.ai/v1", catalog: "moonshotai",
    check: { kind: "balance", path: "/users/me/balance" }, liveModels: true, probeModel: "kimi-k2.6",
  },
  {
    id: "kimi-code", vendor: "kimi", name: "Kimi Code", region: null, plan: "Kimi Code",
    baseUrl: "https://api.kimi.com/coding/v1", catalog: "kimi-code", keyPrefix: "sk-kimi-",
    check: { kind: "kimi-code", path: "/usages" }, liveModels: true, probeModel: "kimi-for-coding", terms: TERMS.kimiCode,
  },
  {
    id: "glm-cn", vendor: "glm", name: "智谱 GLM（国内）", region: "cn", plan: null,
    baseUrl: "https://open.bigmodel.cn/api/paas/v4", catalog: "zhipuai",
    check: { kind: "chat" }, liveModels: true, probeModel: "glm-4.5-air",
  },
  {
    id: "glm-intl", vendor: "glm", name: "Z.ai GLM（国际）", region: "intl", plan: null,
    baseUrl: "https://api.z.ai/api/paas/v4", catalog: "zai",
    check: { kind: "chat" }, liveModels: true, probeModel: "glm-4.5-air",
  },
  {
    id: "glm-coding-cn", vendor: "glm", name: "智谱 GLM Coding Plan", region: "cn", plan: "Coding Plan",
    baseUrl: "https://open.bigmodel.cn/api/coding/paas/v4", catalog: "zhipuai-coding-plan",
    check: { kind: "glm-plan", url: "https://open.bigmodel.cn/api/monitor/usage/quota/limit" }, liveModels: false, probeModel: "glm-5.3-flash", terms: TERMS.glmCoding,
  },
  {
    id: "glm-coding-intl", vendor: "glm", name: "Z.ai GLM Coding Plan", region: "intl", plan: "Coding Plan",
    baseUrl: "https://api.z.ai/api/coding/paas/v4", catalog: "zai-coding-plan",
    check: { kind: "glm-plan", url: "https://api.z.ai/api/monitor/usage/quota/limit" }, liveModels: false, probeModel: "glm-5.3-flash", terms: TERMS.glmCoding,
  },
  {
    id: "minimax-cn", vendor: "minimax", name: "MiniMax（国内）", region: "cn", plan: null,
    baseUrl: "https://api.minimax.cn/v1", catalog: "minimax-cn",
    check: { kind: "minimax", plan: "https://www.minimax.cn/v1/token_plan/remains" }, liveModels: true, probeModel: "MiniMax-M3", terms: TERMS.minimaxPlan,
  },
  {
    id: "minimax-intl", vendor: "minimax", name: "MiniMax（国际）", region: "intl", plan: null,
    baseUrl: "https://api.minimax.io/v1", catalog: "minimax",
    check: { kind: "minimax", plan: "https://www.minimax.io/v1/token_plan/remains" }, liveModels: true, probeModel: "MiniMax-M3", terms: TERMS.minimaxPlan,
  },
  {
    id: "qwen-cn", vendor: "qwen", name: "通义千问（国内）", region: "cn", plan: null,
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", catalog: "alibaba-cn",
    check: { kind: "models" }, liveModels: true, probeModel: "qwen3.8-flash",
  },
  {
    id: "qwen-intl", vendor: "qwen", name: "通义千问（国际）", region: "intl", plan: null,
    baseUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1", catalog: "alibaba",
    check: { kind: "models" }, liveModels: true, probeModel: "qwen3.8-flash",
  },
  {
    id: "qwen-coding-cn", vendor: "qwen", name: "百炼 Coding Plan", region: "cn", plan: "Coding Plan",
    baseUrl: "https://coding.dashscope.aliyuncs.com/v1", catalog: "alibaba-coding-plan-cn", keyPrefix: "sk-sp-",
    // Its /models answers 200 to any key, so it lists models but cannot validate one.
    check: { kind: "chat" }, liveModels: true, probeModel: "qwen3.5-plus", terms: TERMS.bailianCoding,
  },
  {
    id: "qwen-coding-intl", vendor: "qwen", name: "百炼 Coding Plan（国际）", region: "intl", plan: "Coding Plan",
    baseUrl: "https://coding-intl.dashscope.aliyuncs.com/v1", catalog: "alibaba-coding-plan", keyPrefix: "sk-sp-",
    check: { kind: "chat" }, liveModels: true, probeModel: "qwen3.5-plus", terms: TERMS.bailianCoding,
  },
  {
    id: "qwen-token-cn", vendor: "qwen", name: "百炼 Token Plan", region: "cn", plan: "Token Plan",
    baseUrl: "https://token-plan.cn-beijing.maas.aliyuncs.com/compatible-mode/v1", catalog: "alibaba-token-plan-cn", keyPrefix: "sk-sp-",
    check: { kind: "models" }, liveModels: true, probeModel: "qwen3.8-flash", terms: TERMS.bailianToken,
  },
  {
    id: "qwen-token-intl", vendor: "qwen", name: "百炼 Token Plan（国际）", region: "intl", plan: "Token Plan",
    baseUrl: "https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1", catalog: "alibaba-token-plan", keyPrefix: "sk-sp-",
    check: { kind: "models" }, liveModels: true, probeModel: "qwen3.8-flash", terms: TERMS.bailianToken,
  },
  {
    id: "mimo", vendor: "mimo", name: "小米 MiMo", region: null, plan: null,
    baseUrl: "https://api.xiaomimimo.com/v1", catalog: "xiaomi",
    check: { kind: "models" }, liveModels: true, probeModel: "mimo-v2.6-flash",
  },
  {
    id: "mimo-token-cn", vendor: "mimo", name: "小米 MiMo Token Plan（国内）", region: "cn", plan: "Token Plan",
    baseUrl: "https://token-plan-cn.xiaomimimo.com/v1", catalog: "xiaomi-token-plan-cn", keyPrefix: "tp-",
    check: { kind: "models" }, liveModels: true, probeModel: "mimo-v2.6-flash", terms: TERMS.mimoToken,
  },
  {
    id: "mimo-token-sgp", vendor: "mimo", name: "小米 MiMo Token Plan（新加坡）", region: "intl", plan: "Token Plan",
    baseUrl: "https://token-plan-sgp.xiaomimimo.com/v1", catalog: "xiaomi-token-plan-sgp", keyPrefix: "tp-",
    check: { kind: "models" }, liveModels: true, probeModel: "mimo-v2.6-flash", terms: TERMS.mimoToken,
  },
  {
    id: "mimo-token-ams", vendor: "mimo", name: "小米 MiMo Token Plan（阿姆斯特丹）", region: "intl", plan: "Token Plan",
    baseUrl: "https://token-plan-ams.xiaomimimo.com/v1", catalog: "xiaomi-token-plan-ams", keyPrefix: "tp-",
    check: { kind: "models" }, liveModels: true, probeModel: "mimo-v2.6-flash", terms: TERMS.mimoToken,
  },
  {
    id: "qianfan", vendor: "qianfan", name: "百度千帆", region: null, plan: null,
    baseUrl: "https://qianfan.baidubce.com/v2", catalog: "qianfan",
    // Its /models refuses a bad key (403 AccessDenied) but is throttled hard: 429 OverRateLimit
    // comes for valid keys too (and for a request with no usable key), so it is retried and proves nothing.
    check: { kind: "models", listThrottled: true }, liveModels: true, probeModel: "deepseek-v4.1-flash",
  },
  {
    id: "qianfan-token", vendor: "qianfan", name: "千帆 Token Plan 个人版", region: null, plan: "Token Plan",
    baseUrl: "https://qianfan.baidubce.com/v2/tokenplan/personal", catalog: "qianfan-token-personal",
    // No model list here (404), so a one-token request validates the plan's own key.
    check: { kind: "chat" }, liveModels: false, probeModel: "deepseek-v4.1-flash", terms: TERMS.qianfanToken,
  },
  {
    id: "qianfan-token-team", vendor: "qianfan", name: "千帆 Token Plan 企业版", region: null, plan: "Token Plan 企业版",
    baseUrl: "https://qianfan.baidubce.com/v2/tokenplan/team", catalog: "qianfan-token-team",
    check: { kind: "chat" }, liveModels: false, probeModel: "deepseek-v4.1-flash", terms: TERMS.qianfanToken,
  },
].map((endpoint) => Object.freeze(endpoint)));

const BY_ID = new Map(ENDPOINTS.map((endpoint) => [endpoint.id, endpoint]));

/** The DSH route of an endpoint (prefixed so it never collides with DSH's own `deepseek`, `minimax-cn`, …). */
export const routeOf = (endpointId) => `cn-${endpointId}`;

/** The endpoint behind a DSH route, or undefined. */
export function endpointOfRoute(route) {
  return typeof route === "string" && route.startsWith("cn-") ? BY_ID.get(route.slice(3)) : undefined;
}

/** One endpoint by id, or undefined. */
export const endpointById = (id) => BY_ID.get(id);

/** The vendor record of an endpoint. */
export const vendorOf = (endpoint) => VENDORS.find((vendor) => vendor.id === endpoint?.vendor);

/** The picker's group name: the endpoint plus a marker that it is this plugin's multi-key route. */
export const displayNameOf = (endpoint) => (endpoint.name.endsWith("）") ? `${endpoint.name.slice(0, -1)} · 多 Key）` : `${endpoint.name}（多 Key）`);

/**
 * An OpenAI-compatible base URL from what a user pasted: trailing slashes and
 * `/chat/completions` are dropped, and a vendor's Anthropic-compatible path is
 * mapped to its OpenAI one (`…/apps/anthropic` → `…/compatible-mode/v1`,
 * MiniMax `…/anthropic` → `…/v1`, GLM `…/api/anthropic` → `…/api/paas/v4`,
 * Qianfan `/anthropic[/tokenplan/…]` → `/v2[/tokenplan/…]`).
 * @returns the normalized URL, or undefined when it is not an http(s) URL.
 */
export function openaiBaseUrl(raw) {
  let url;
  try {
    url = new URL(String(raw ?? "").trim());
  } catch {
    return undefined;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
  let path = url.pathname.replace(/\/+$/, "").replace(/\/chat\/completions$/, "").replace(/\/v1\/messages$/, "");
  if (url.host === "qianfan.baidubce.com") path = path.replace(/^\/anthropic(?=\/|$)/, "/v2").replace(/^(\/v2\/tokenplan\/[a-z]+)\/v1$/, "$1");
  else if (/\/apps\/anthropic(\/v1)?$/.test(path)) path = path.replace(/\/apps\/anthropic(\/v1)?$/, "/compatible-mode/v1");
  else if (/\/api\/coding\/anthropic(\/v1)?$/.test(path) || (/\/api\/anthropic(\/v1)?$/.test(path) && /bigmodel|z\.ai/.test(url.host))) {
    path = path.replace(/\/api\/(coding\/)?anthropic(\/v1)?$/, (match, coding) => (coding ? "/api/coding/paas/v4" : "/api/paas/v4"));
  } else if (/\/anthropic(\/v1)?$/.test(path)) path = path.replace(/\/anthropic(\/v1)?$/, "/v1");
  return `${url.origin}${path}`;
}

/**
 * The known endpoint a base URL belongs to: an exact match, or (for Bailian
 * workspace hosts like `ws-….cn-beijing.maas.aliyuncs.com`) the region's
 * pay-as-you-go endpoint.
 * @returns `{ endpoint, custom }` — `custom` when the URL is not the endpoint's own.
 */
export function endpointForBaseUrl(raw) {
  const base = openaiBaseUrl(raw);
  if (!base) return undefined;
  const exact = ENDPOINTS.find((endpoint) => endpoint.baseUrl === base);
  if (exact) return { endpoint: exact, custom: false, baseUrl: base };
  const host = new URL(base).host;
  if (/\.maas\.aliyuncs\.com$/.test(host)) {
    const intl = !/cn-beijing/.test(host);
    const plan = /^token-plan\./.test(host) ? "token" : null;
    const id = plan ? (intl ? "qwen-token-intl" : "qwen-token-cn") : intl ? "qwen-intl" : "qwen-cn";
    return { endpoint: BY_ID.get(id), custom: true, baseUrl: base };
  }
  const sameHost = ENDPOINTS.find((endpoint) => new URL(endpoint.baseUrl).host === host);
  return sameHost ? { endpoint: sameHost, custom: true, baseUrl: base } : undefined;
}

/**
 * Endpoints a key may belong to, most likely first, from its shape and an
 * optional vendor hint (`deepseek:`, `kimi:`, … in pasted text). Detection
 * then probes them in this order.
 *
 * A prefix that names its endpoints decides alone: a Kimi Code key
 * (`sk-kimi-`, issued in the Kimi Code console for `api.kimi.com/coding`) is
 * never sent to Moonshot's open platform (`api.moonshot.cn`), whose `sk-…`
 * keys are a separate system; nor a Bailian plan key (`sk-sp-`) to the
 * pay-as-you-go hosts, nor a MiMo plan key (`tp-`) to MiMo's API. A plain key
 * is in turn not probed on the endpoints that take only a prefixed one. A
 * Qianfan key (`bce-v3/ALTAK-…/…`) is tried on the pay-as-you-go API first
 * (free), then on the Token Plans (which refuse any other key at once).
 */
export function candidateEndpoints(key, vendorHint) {
  const vendor = normalizeVendor(vendorHint);
  const ids = [];
  const add = (...list) => { for (const id of list) if (!ids.includes(id)) ids.push(id); };
  if (key.startsWith("sk-kimi-")) add("kimi-code");
  else if (key.startsWith("sk-cp-") || key.startsWith("sk-api-")) add("minimax-cn", "minimax-intl");
  else if (key.startsWith("sk-sp-")) add("qwen-token-cn", "qwen-coding-cn", "qwen-token-intl", "qwen-coding-intl");
  else if (/^t?tp-/.test(key)) add("mimo-token-cn", "mimo-token-sgp", "mimo-token-ams");
  else if (/^[0-9a-f]{32}\.[A-Za-z0-9]+$/.test(key)) add("glm-coding-cn", "glm-cn", "glm-coding-intl", "glm-intl");
  else if (key.startsWith("bce-v3/")) add("qianfan", "qianfan-token", "qianfan-token-team");
  if (ids.length) return ids;
  if (vendor) add(...ENDPOINTS.filter((endpoint) => endpoint.vendor === vendor && (!endpoint.keyPrefix || key.startsWith(endpoint.keyPrefix))).map((endpoint) => endpoint.id));
  // A shape no prefix identifies: every vendor that issues plain `sk-…` keys.
  if (ids.length === 0) {
    // Plain `sk-…` keys are shared by DeepSeek, Moonshot, DashScope and MiMo.
    if (/^sk-[0-9a-f]{32}$/.test(key)) add("deepseek", "qwen-cn", "qwen-intl");
    if (/^sk-[A-Za-z0-9]{40,}$/.test(key)) add("kimi-cn", "kimi-intl", "mimo");
    if (key.startsWith("sk-")) add("deepseek", "kimi-cn", "kimi-intl", "qwen-cn", "qwen-intl", "mimo", "minimax-cn", "minimax-intl");
  }
  return vendor ? ids.filter((id) => BY_ID.get(id).vendor === vendor) : ids;
}

/**
 * The vendor a key's shape names beyond doubt (`sk-kimi-` Kimi Code,
 * `sk-cp-`/`sk-api-` MiniMax, `sk-sp-` Bailian plans, `tp-`/`ttp-` MiMo plans,
 * `<hex>.<secret>` Zhipu, `bce-v3/…` Baidu Qianfan), or undefined for a plain
 * `sk-…` several vendors issue.
 */
export function vendorOfKeyShape(key) {
  const value = String(key ?? "");
  if (value.startsWith("sk-kimi-")) return "kimi";
  if (value.startsWith("sk-cp-") || value.startsWith("sk-api-")) return "minimax";
  if (value.startsWith("sk-sp-")) return "qwen";
  if (/^t?tp-/.test(value)) return "mimo";
  if (/^[0-9a-f]{32}\.[A-Za-z0-9]+$/.test(value)) return "glm";
  if (value.startsWith("bce-v3/")) return "qianfan";
  return undefined;
}

/** A vendor id from loose text ("dashscope", "aliyun", "zhipu", "xiaomi", "baidu", …). */
export function normalizeVendor(text) {
  const value = String(text ?? "").trim().toLowerCase();
  if (!value) return undefined;
  // Before the model names: Qianfan hosts DeepSeek, GLM and Qwen models too.
  if (/qianfan|baidu|千帆|百度|wenxin|文心|ernie/.test(value)) return "qianfan";
  if (/deepseek/.test(value)) return "deepseek";
  if (/kimi|moonshot/.test(value)) return "kimi";
  if (/glm|zhipu|bigmodel|z\.?ai/.test(value)) return "glm";
  if (/minimax/.test(value)) return "minimax";
  if (/qwen|dashscope|aliyun|alibaba|bailian|百炼|通义/.test(value)) return "qwen";
  if (/mimo|xiaomi|小米/.test(value)) return "mimo";
  return undefined;
}
