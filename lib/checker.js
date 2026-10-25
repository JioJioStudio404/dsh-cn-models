/**
 * Keeps every key's validity, balance and plan quota current.
 *
 * `check` runs one key's check (`auto`, `validity`, `funds` or `full`, see
 * probe.js) and stores the result; `afterUse` re-reads a key's balance or plan
 * window shortly after it served (or refused) a request, so the tab follows
 * real use. After-use checks are always free ones: a key that can only be
 * validated by a one-token request is not re-tested behind the user's back.
 *
 * @module dsh-cn-models/checker
 */
import { redact } from "./errors.js";
import { checkKey } from "./probe.js";

/** A request is followed by its key's check after this long (the vendor books it first). */
const AFTER_USE_DELAY_MS = 3_000;
/** …and at most this often per key (an agent turn makes many requests). */
const AFTER_USE_GAP_MS = 30_000;

/**
 * @param {object} deps - `{ keys, fetchImpl, log, now, delayMs, gapMs }`.
 * @returns `{ check(id, { mode, deep, signal }), afterUse(id) }`.
 */
export function createChecker({ keys, fetchImpl = fetch, log = () => {}, now = () => Date.now(), delayMs = AFTER_USE_DELAY_MS, gapMs = AFTER_USE_GAP_MS, retryDelayMs }) {
  const running = new Map();

  /** Check one key and store what was learned. Concurrent callers share one check. */
  function check(id, { mode = "auto", deep = false, signal } = {}) {
    const key = `${id}:${mode}:${deep}`;
    if (running.has(key)) return running.get(key);
    const run = (async () => {
      const record = await keys.get(id);
      if (!record) return { id, ok: false, error: "unknown key" };
      try {
        const result = await checkKey(record, { mode, deep, fetchImpl, signal, now, ...(retryDelayMs !== undefined ? { retryDelayMs } : {}) });
        const { unchanged, authenticated, wrongEndpoint, ...patch } = result;
        // The user's own ✓ on an accepted key gives its held models another try too.
        if (deep && authenticated) patch.modelHolds = undefined;
        await keys.patch(id, unchanged ? { checkedAt: patch.checkedAt } : patch);
        return { id, ok: true, status: unchanged ? record.status ?? "unknown" : patch.status };
      } catch (error) {
        log("warn", `check of ${id} failed: ${redact(error?.message ?? error)}`);
        return { id, ok: false, error: redact(error?.message ?? error) };
      }
    })().finally(() => running.delete(key));
    running.set(key, run);
    return run;
  }

  const pending = new Set();
  const lastRun = new Map();
  /** Re-read one key's balance or plan window shortly after it was used. */
  function afterUse(id) {
    if (!id || pending.has(id)) return;
    const wait = Math.max(delayMs, (lastRun.get(id) ?? 0) + gapMs - now());
    pending.add(id);
    const timer = setTimeout(() => {
      pending.delete(id);
      lastRun.set(id, now());
      check(id).catch(() => undefined);
    }, wait);
    timer.unref?.();
  }

  return { check, afterUse };
}
