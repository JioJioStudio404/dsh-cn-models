/**
 * Is a key valid, and what does it have left? Two separate checks:
 *
 * - **validity**: does the vendor accept the key? `GET /models` where that
 *   checks the key (free); GLM Coding Plan's quota API; else a one-token
 *   request — only when asked (`deep`: on import and the row's ✓), never on a
 *   timer.
 * - **funds**: the balance (DeepSeek, Kimi) or plan windows (Kimi Code,
 *   MiniMax M Plan, GLM Coding Plan), read for free. A plan the account does
 *   not have (MiniMax 2062, an empty Kimi Code usage) marks the key "expired".
 *
 * `auto` (the timer and after-use checks) reads funds where the vendor offers
 * them, else the free validity check. `full` (import) runs validity, then
 * funds. A transient failure (network, 5xx) is retried once and then kept as
 * `validityError` / `quotaError` without overturning the last verdict.
 * Response shapes were checked against live calls on 2026-10-15.
 *
 * @module dsh-cn-models/probe
 */
import { classifyFailure, dialectOf } from "./dialects.js";
import { candidateEndpoints, endpointById } from "./endpoints.js";
import { asNumber, isRecord, redact } from "./errors.js";
import { isPlanKey } from "./keys.js";
import { baseUrlOf, requestJson } from "./wire.js";

/** How long a key with no balance is held back before it is tried again. */
export const NO_BALANCE_HOLD_MS = 30 * 60_000;
/** How long a used-up plan is held back when the vendor names no reset time. */
export const PLAN_HOLD_MS = 60 * 60_000;
/** A failed check request (network, 5xx) is retried once after this long. */
const RETRY_DELAY_MS = 800;

const iso = (ms) => (Number.isFinite(ms) ? new Date(ms).toISOString() : null);
/** Fields cleared when a key's hold no longer applies. */
const NO_HOLD = { limitedUntil: undefined, limitedReason: undefined, limitedExact: undefined };
/** Statuses a validity check may overturn: a funds verdict (no plan, no balance, used up) is not its business. */
const VALIDITY_OWNS = new Set([undefined, "unknown", "invalid", "error"]);

/**
 * A key's state from one classified failure.
 * @returns the patch for the key store.
 */
export function statusFromFailure(failure, now = Date.now()) {
  // One model refused (Qianfan's overdue account): the key is valid and serves the others.
  if (failure.scope === "model") return { status: "ok", statusMessage: failure.message };
  switch (failure.kind) {
    case "invalid-key":
      return { status: "invalid", statusMessage: failure.message, ...NO_HOLD };
    case "expired":
      return { status: "expired", statusMessage: failure.message, ...NO_HOLD };
    case "no-balance":
      return { status: "no-balance", statusMessage: failure.message, limitedUntil: now + NO_BALANCE_HOLD_MS, limitedReason: "no-balance", limitedExact: false };
    case "plan-quota": {
      const exact = Boolean(failure.resetAt && failure.resetAt > now);
      return { status: "plan-quota", statusMessage: failure.message, limitedUntil: exact ? failure.resetAt : now + PLAN_HOLD_MS, limitedReason: "plan-quota", limitedExact: exact };
    }
    // The key got through authentication: it is valid, just busy or refused this one request.
    case "rate-limit":
    case "overloaded":
    case "moderation":
    case "bad-request":
    case "context":
    case "not-found":
      return { status: "ok", statusMessage: failure.message };
    default:
      return { status: "error", statusMessage: failure.message };
  }
}

/** How an endpoint's keys are validated: `models` (free), `glm-plan` (free, the plan API), `chat` (one-token request). */
export function validityKind(endpoint) {
  const kind = endpoint?.check?.kind;
  return kind === "chat" ? "chat" : kind === "glm-plan" ? "glm-plan" : "models";
}

/** Where one key's balance or plan windows are read; null when the vendor offers nothing. */
export function fundsKind(record, endpoint = endpointById(record?.endpoint)) {
  switch (endpoint?.check?.kind) {
    case "balance": return "balance";
    case "kimi-code": return "kimi-code";
    // Pay-as-you-go MiniMax keys (sk-api-) share the endpoint but have no public balance API.
    case "minimax": return isPlanKey(record) && endpoint.check.plan ? "minimax-plan" : null;
    case "glm-plan": return "glm-plan";
    default: return null;
  }
}

/** DeepSeek `GET /user/balance`. */
function deepseekBalance(body) {
  const info = Array.isArray(body?.balance_infos) ? body.balance_infos[0] : undefined;
  const amount = asNumber(info?.total_balance);
  return {
    balance: { currency: info?.currency ?? "CNY", amount: amount ?? null, granted: asNumber(info?.granted_balance) ?? null, toppedUp: asNumber(info?.topped_up_balance) ?? null },
    empty: body?.is_available === false || (amount !== undefined && amount <= 0),
  };
}

/** Kimi `GET /v1/users/me/balance`. */
function kimiBalance(body, endpoint) {
  const data = isRecord(body?.data) ? body.data : {};
  const amount = asNumber(data.available_balance);
  return {
    balance: { currency: endpoint.region === "intl" ? "USD" : "CNY", amount: amount ?? null, voucher: asNumber(data.voucher_balance) ?? null, cash: asNumber(data.cash_balance) ?? null },
    empty: amount !== undefined && amount <= 0,
  };
}

/**
 * Kimi Code `GET /coding/v1/usages`. Newer replies carry `usages.limit_5h` /
 * `usages.limit_7d` (`used_ratio` 0–1); older ones `limits[0]` (5-hour) and
 * `usage` (weekly). An account without Kimi Code answers `{}`.
 * @returns `{ windows, member }` (`member` false for the empty answer).
 */
export function kimiCodeQuota(body) {
  const windows = [];
  const fresh = isRecord(body?.usages) ? body.usages : null;
  const ratio = (item) => {
    const used = asNumber(item?.used_ratio);
    return used === undefined ? null : Math.max(0, Math.min(100, Math.round((1 - used) * 100)));
  };
  const five = Array.isArray(body?.limits) ? body.limits.find((item) => isRecord(item?.detail)) : undefined;
  if (isRecord(fresh?.limit_5h)) {
    windows.push({ id: "5h", label: "5h", remainingPercent: ratio(fresh.limit_5h), resetAt: fresh.limit_5h.reset_time ?? null });
  } else if (five) {
    const limit = asNumber(five.detail.limit);
    const remaining = asNumber(five.detail.remaining);
    const minutes = asNumber(five.window?.duration);
    windows.push({ id: "5h", label: minutes && minutes !== 300 ? `${Math.round(minutes / 60)}h` : "5h", remainingPercent: limit ? Math.round((remaining / limit) * 100) : null, resetAt: five.detail.resetTime ?? null });
  }
  if (isRecord(fresh?.limit_7d)) {
    windows.push({ id: "week", label: "week", remainingPercent: ratio(fresh.limit_7d), resetAt: fresh.limit_7d.reset_time ?? null });
  } else if (isRecord(body?.usage)) {
    const limit = asNumber(body.usage.limit);
    const used = asNumber(body.usage.used);
    windows.push({ id: "week", label: "week", remainingPercent: limit ? Math.max(0, Math.round(((limit - used) / limit) * 100)) : null, resetAt: body.usage.resetTime ?? null });
  }
  // An account without Kimi Code gets an empty object.
  const member = !(isRecord(body) && Object.keys(body).length === 0);
  return { windows, member };
}

/** MiniMax M Plan `GET /v1/token_plan/remains`: the "general" model's 5-hour and weekly windows. */
export function minimaxPlanQuota(body) {
  const list = Array.isArray(body?.model_remains) ? body.model_remains : [];
  const general = list.find((item) => item?.model_name === "general") ?? list[0];
  if (!general) return { windows: [] };
  return {
    windows: [
      { id: "5h", label: "5h", remainingPercent: asNumber(general.current_interval_remaining_percent) ?? null, resetAt: iso(asNumber(general.end_time)) },
      { id: "week", label: "week", remainingPercent: asNumber(general.current_weekly_remaining_percent) ?? null, resetAt: iso(asNumber(general.weekly_end_time)) },
    ],
  };
}

/**
 * GLM Coding Plan `GET /api/monitor/usage/quota/limit` (undocumented, raw-key
 * auth): `data.limits[]`, read defensively since its fields are not published.
 */
export function glmPlanQuota(body) {
  const limits = Array.isArray(body?.data?.limits) ? body.data.limits : [];
  const windows = [];
  for (const item of limits) {
    if (!isRecord(item) || !/TOKEN/i.test(String(item.type ?? ""))) continue;
    const used = asNumber(item.percentage);
    const remaining = used !== undefined ? 100 - used : asNumber(item.remaining);
    const reset = asNumber(item.nextResetTime);
    windows.push({ id: "5h", label: "5h", remainingPercent: remaining !== undefined ? Math.round(remaining) : null, resetAt: reset ? iso(reset < 1e12 ? reset * 1000 : reset) : null });
  }
  return { windows };
}

/** The window that holds a plan key back, if any is used up. */
function exhausted(quota) {
  return quota.windows.find((window) => window.remainingPercent === 0);
}

/** A transient failure: worth one retry. */
const transient = (response) => response.status === 0 || response.status >= 500;

/**
 * Shared wiring of one check run.
 * @returns helpers bound to one record and clock.
 */
function context(record, { fetchImpl, signal, now, retryDelayMs }) {
  const endpoint = endpointById(record.endpoint);
  const checkedAt = new Date(now()).toISOString();
  // A check endpoint throttled hard (Qianfan's model list): its 429 gets two more tries, later each time.
  const throttled = (response) => response.status === 429 && endpoint?.check?.listThrottled === true;
  const call = async (url, extra) => {
    let response = await requestJson(url, record.key, { fetchImpl, signal, ...extra });
    const tries = transient(response) ? 1 : throttled(response) ? 2 : 0;
    for (let attempt = 1; attempt <= tries && retryDelayMs >= 0 && (transient(response) || throttled(response)); attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, throttled(response) ? retryDelayMs * 2 * attempt : retryDelayMs));
      response = await requestJson(url, record.key, { fetchImpl, signal, ...extra });
    }
    return response;
  };
  const classify = (response) => classifyFailure(endpoint.vendor, response.status, response.text, { plan: Boolean(endpoint.plan), headers: response.headers });
  const why = (response, failure) => (response.timedOut ? "请求超时" : response.status === 0 ? `网络错误：${redact(response.text)}` : redact(failure?.message ?? `HTTP ${response.status}`));
  // A full funds verdict: the key works and here is what it has left.
  const funded = (extra = {}) => ({ status: "ok", statusMessage: null, ...NO_HOLD, checkedAt, validatedAt: checkedAt, validityError: null, quotaAt: checkedAt, quotaError: null, authenticated: true, ...extra });
  const usedUp = (quota, out) => ({
    status: "plan-quota", statusMessage: "套餐额度用尽", quota, limitedUntil: Date.parse(out.resetAt) || now() + PLAN_HOLD_MS, limitedReason: "plan-quota",
    limitedExact: Boolean(Date.parse(out.resetAt)), checkedAt, validatedAt: checkedAt, validityError: null, quotaAt: checkedAt, quotaError: null, authenticated: true,
  });
  // The account has no (active) plan here: the key is real but cannot serve.
  const noPlan = (message, { authenticated = true } = {}) => ({ status: "expired", statusMessage: message, ...NO_HOLD, quota: null, checkedAt, validatedAt: checkedAt, validityError: null, quotaAt: checkedAt, quotaError: null, authenticated });
  return { endpoint, checkedAt, now, call, classify, why, funded, usedUp, noPlan, base: baseUrlOf(record, endpoint) };
}

/** GLM Coding Plan's quota API: validity and funds in one answer. */
async function glmPlan(record, ctx) {
  const response = await ctx.call(ctx.endpoint.check.url, { raw: true });
  if (!response.ok) return fundsFailed(record, ctx, response);
  if (response.body?.success === false) {
    // "当前用户不存在coding plan": the key is real, but this account has no plan here (its
    // pay-as-you-go endpoint is the right one, so detection moves on).
    if (/coding ?plan/i.test(String(response.body?.msg ?? ""))) return ctx.noPlan("此账号没有 Coding Plan（或已过期）", { authenticated: false });
    return { checkedAt: ctx.checkedAt, quotaError: redact(response.body?.msg ?? "额度读取失败"), authenticated: true };
  }
  const quota = glmPlanQuota(response.body);
  const out = exhausted(quota);
  return out ? ctx.usedUp(quota, out) : ctx.funded({ quota });
}

/** A failed funds read: a key verdict when the vendor gave one, else a note beside the last one. */
function fundsFailed(record, ctx, response) {
  const failure = ctx.classify(response);
  if (response.status !== 404 && ["invalid-key", "expired", "no-balance", "plan-quota"].includes(failure.kind)) {
    return { ...statusFromFailure(failure, ctx.now()), checkedAt: ctx.checkedAt, quotaError: null, authenticated: failure.kind !== "invalid-key" };
  }
  // Rate limited and the like: past authentication, just no numbers this time.
  const past = response.status !== 404 && statusFromFailure(failure).status === "ok";
  return { checkedAt: ctx.checkedAt, quotaError: ctx.why(response, failure), ...(past ? { authenticated: true } : {}) };
}

/**
 * Read one key's balance or plan windows.
 * @returns a patch (with `authenticated` when the answer proved or disproved the key), or `{ unchanged }`.
 */
async function checkFunds(record, ctx) {
  const kind = fundsKind(record, ctx.endpoint);
  switch (kind) {
    case "balance": {
      const response = await ctx.call(`${ctx.base}${ctx.endpoint.check.path}`);
      if (!response.ok) return fundsFailed(record, ctx, response);
      const { balance, empty } = ctx.endpoint.vendor === "deepseek" ? deepseekBalance(response.body) : kimiBalance(response.body, ctx.endpoint);
      return empty
        ? { ...ctx.funded({ balance }), status: "no-balance", statusMessage: "余额不足", limitedUntil: Date.parse(ctx.checkedAt) + NO_BALANCE_HOLD_MS, limitedReason: "no-balance", limitedExact: false }
        : ctx.funded({ balance });
    }
    case "kimi-code": {
      const response = await ctx.call(`${ctx.base}${ctx.endpoint.check.path}`);
      if (!response.ok) return fundsFailed(record, ctx, response);
      if (!isRecord(response.body)) return { checkedAt: ctx.checkedAt, quotaError: "额度读取失败：无法解析厂商的回复", authenticated: true };
      const { windows, member } = kimiCodeQuota(response.body);
      if (!member) return ctx.noPlan("没有 Kimi Code 会员（或会员不含 Kimi Code）");
      if (windows.length === 0) return { checkedAt: ctx.checkedAt, quotaError: "额度读取失败：无法解析厂商的回复", authenticated: true };
      const quota = { windows };
      const out = exhausted(quota);
      return out ? ctx.usedUp(quota, out) : ctx.funded({ quota });
    }
    case "minimax-plan": {
      const response = await ctx.call(ctx.endpoint.check.plan);
      if (!response.ok) return fundsFailed(record, ctx, response);
      const code = asNumber(response.body?.base_resp?.status_code);
      if (code === 2062) return ctx.noPlan("没有生效中的 M Plan 套餐");
      if (code === 1004 || code === 2049) return { status: "invalid", statusMessage: redact(response.body?.base_resp?.status_msg ?? "Key 无效"), ...NO_HOLD, checkedAt: ctx.checkedAt, quotaError: null, authenticated: false };
      if (code !== undefined && code !== 0) return { checkedAt: ctx.checkedAt, quotaError: `${redact(response.body?.base_resp?.status_msg ?? "额度读取失败")}（${code}）`, authenticated: true };
      const quota = minimaxPlanQuota(response.body);
      if (quota.windows.length === 0) return { checkedAt: ctx.checkedAt, quotaError: "厂商没有返回额度", authenticated: true };
      const out = exhausted(quota);
      return out ? ctx.usedUp(quota, out) : ctx.funded({ quota });
    }
    case "glm-plan":
      return glmPlan(record, ctx);
    default:
      return { checkedAt: ctx.checkedAt, unchanged: true };
  }
}

/**
 * Does the vendor accept the key? Free where possible; a one-token request
 * only with `deep`.
 * @returns a patch with `authenticated`, or `{ unchanged }`.
 */
async function checkValidity(record, ctx, { deep }) {
  const kind = validityKind(ctx.endpoint);
  if (kind === "glm-plan") return glmPlan(record, ctx);
  if (kind === "chat" && !deep) return { checkedAt: ctx.checkedAt, unchanged: true };
  let response;
  if (kind === "models") {
    response = await ctx.call(`${ctx.base}/models`);
  } else {
    const dialect = dialectOf(ctx.endpoint.vendor);
    const probeModel = ctx.endpoint.probeModel;
    const body = {
      model: probeModel,
      messages: [{ role: "user", content: "hi" }],
      stream: false,
      [dialect.maxTokensField]: 4,
      ...dialect.thinking({ id: probeModel, reasoning: { toggle: true } }, "off"),
    };
    response = await ctx.call(`${ctx.base}/chat/completions`, { method: "POST", body, timeoutMs: 60_000 });
  }
  const passed = { checkedAt: ctx.checkedAt, validatedAt: ctx.checkedAt, validityError: null, authenticated: true };
  // A request that went through says everything: the key works now.
  if (response.ok) return kind === "chat" ? { status: "ok", statusMessage: null, ...NO_HOLD, ...passed } : { ...passed, ...(VALIDITY_OWNS.has(record.status) ? { status: "ok", statusMessage: null } : {}) };
  const failure = ctx.classify(response);
  // A missing check endpoint proves nothing; only a request's "no such model" implies it got past authentication.
  // Nor does a 429 from a check endpoint throttled for every caller (Qianfan's model list, still busy after its retries).
  const throttled = response.status === 429 && ctx.endpoint.check?.listThrottled === true;
  const inconclusive = response.status === 404 ? !(kind === "chat" && /model/i.test(response.text ?? "")) : throttled || statusFromFailure(failure).status === "error";
  if (inconclusive) {
    const message = response.status === 404 ? "检测接口不可用（404）" : throttled ? `厂商限流，暂时无法确认这个 Key，请稍后重试（${ctx.why(response, failure)}）` : ctx.why(response, failure);
    return { checkedAt: ctx.checkedAt, validityError: message, ...(record.status === undefined || record.status === "unknown" ? { status: "error", statusMessage: message } : {}) };
  }
  const verdict = statusFromFailure(failure, ctx.now());
  // `wrongEndpoint`: refused as not this endpoint's kind of key (a plan's own key, or not one), which says little about the key.
  if (verdict.status === "invalid") return { ...verdict, checkedAt: ctx.checkedAt, validityError: null, authenticated: false, ...(failure.scope === "endpoint" ? { wrongEndpoint: true } : {}) };
  // Past authentication (rate limit, moderation…), or a funds verdict from a real request.
  if (verdict.status === "ok") return { ...passed, ...(VALIDITY_OWNS.has(record.status) ? { status: "ok", statusMessage: null } : {}) };
  return { ...verdict, ...passed };
}

/**
 * Check one key.
 * @param {object} record - the stored key (with its secret).
 * @param {object} [options] - `mode` (`auto` | `validity` | `funds` | `full`), `deep` (a one-token request may validate), `fetchImpl`, `signal`, `now`, `retryDelayMs`.
 * @returns a patch for the key store (`status`, `statusMessage`, `checkedAt`, maybe `balance`, `quota`, holds, `validatedAt` / `validityError`, `quotaAt` / `quotaError`), plus `authenticated` and `unchanged` for the caller.
 */
export async function checkKey(record, { mode = "auto", deep = false, fetchImpl = fetch, signal, now = () => Date.now(), retryDelayMs = RETRY_DELAY_MS } = {}) {
  const ctx = context(record, { fetchImpl, signal, now, retryDelayMs });
  const funds = fundsKind(record, ctx.endpoint);
  switch (mode) {
    case "validity":
      return checkValidity(record, ctx, { deep });
    case "funds":
      return checkFunds(record, ctx);
    case "full": {
      const validity = await checkValidity(record, ctx, { deep });
      // GLM Coding Plan answered both at once; nothing more to read for a key that was refused.
      if (validityKind(ctx.endpoint) === "glm-plan" || !funds || validity.authenticated === false || validity.unchanged) return validity;
      const read = await checkFunds({ ...record, status: validity.status ?? record.status }, ctx);
      const merged = { ...validity, ...read, authenticated: read.authenticated ?? validity.authenticated };
      // The funds API accepted the key: an inconclusive validity check gives way to it.
      if (read.authenticated === true && !read.status && merged.status === "error") Object.assign(merged, { status: "ok", statusMessage: null });
      return merged;
    }
    default:
      // Timer and after-use: what the vendor tells for free (a one-token request only with `deep`).
      return funds ? checkFunds(record, ctx) : checkValidity(record, ctx, { deep });
  }
}

/** Whether a check proved the key belongs here (whatever its balance or plan). */
export const authenticated = (result) => result?.authenticated === true;

/**
 * Find the endpoint a key belongs to. Its candidates (from its shape and the
 * vendor) are tried in two parallel rounds: the free checks first, then — only
 * if none accepted the key — the one-token requests. The first candidate in
 * priority order that authenticates wins, so the answer does not depend on
 * which vendor host replied fastest.
 * @returns `{ endpoint, result, tried }` for the winner, else `{ endpoint: undefined, result, tried }` (the most telling failure).
 */
export async function detectEndpoint(key, vendorHint, { fetchImpl = fetch, signal, now, retryDelayMs } = {}) {
  const ids = candidateEndpoints(key, vendorHint);
  const tried = [];
  let last;
  // A definite verdict ("invalid") says more than an inconclusive one ("error"), which says more than
  // "not this endpoint's kind of key" (a Token Plan refusing an ordinary key whose own check was throttled).
  const weight = (result) => (!result?.status ? 0 : result.wrongEndpoint ? 1 : result.status === "error" ? 2 : 3);
  const round = async (group) => {
    const results = await Promise.all(group.map((id) => checkKey({ endpoint: id, key }, { mode: "full", deep: true, fetchImpl, signal, now, retryDelayMs }).then((result) => [id, result])));
    tried.push(...group);
    for (const [id, result] of results) {
      // A GLM key without a plan is real: its pay-as-you-go endpoint is in the next round.
      if (authenticated(result)) return { endpoint: endpointById(id), result, tried };
      if (!last || weight(result) > weight(last)) last = result;
    }
    return undefined;
  };
  const free = ids.filter((id) => validityKind(endpointById(id)) !== "chat");
  const paid = ids.filter((id) => validityKind(endpointById(id)) === "chat");
  return (free.length ? await round(free) : undefined) ?? (paid.length ? await round(paid) : undefined) ?? { endpoint: undefined, result: last, tried };
}
