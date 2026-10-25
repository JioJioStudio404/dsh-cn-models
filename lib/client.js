/**
 * dsh-cn-models — browser half.
 *
 * A hand-written module in the `window.__ModuleLoader__.load({ id, factory })`
 * shape every DSH client half uses (no ESM syntax). It requires only `react`
 * and the shared UI primitives, and talks to the host through the `cnModels`
 * Remote namespace. The vendor tabs show each key in full (at the user's
 * request); compact places (the switch notice, the Models-page card) mask it.
 *
 * It contributes:
 *  - one tab per vendor beside 对话 / 轨迹 (`conversation.view`): DeepSeek,
 *    Kimi, GLM, MiniMax, Qwen, MiMo, Qianfan (hideable). Each manages only its vendor:
 *    one card per endpoint with keys — each key on two lines (the key itself,
 *    then its validity, balance or plan quota, today's usage, switch /
 *    validity / refresh / edit / remove), drag order — the endpoint's model
 *    selection, its own switching settings, its export, and its add-keys
 *    dialog (paste, a file, or DSH's own keys), detecting among its endpoints;
 *  - each endpoint row's card on Settings → Models (`settings.models.provider-card`).
 */
window.__ModuleLoader__.load({
  id: "dsh-cn-models",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    const React = require("react");
    const P = require("@deepseek-ai/dsh-client-ui-primitives");
    const h = React.createElement;

    const NS = "cn-models";
    /** The settings namespace of the plugin's Models-page rows (the bundle patch's row id). */
    const SETTINGS_NS = "dsh-cn-models";
    /** The (local, cheap) status is re-read this often while a view is open. */
    const STATUS_INTERVAL_MS = 15_000;
    /** Free checks (balances, plan windows) run this often while the tab is open. */
    const CHECK_INTERVAL_MS = 5 * 60_000;
    /** An automatic switch is announced for this long. */
    const SWITCH_NOTICE_MS = 30 * 60_000;
    /** Largest key file accepted. */
    const MAX_FILE_BYTES = 256 * 1024;

    const DICTS = {
      en: {
        "tab.label": "CN models",
        "head.title": "{vendor} API keys",
        "head.tabs": "Tabs",
        "head.tabsTitle": "Switch vendor tabs on or off (a vendor switched off also leaves the model picker)",
        "tabs.title": "Vendor tabs",
        "tabs.keys": "{count} keys",
        "tabs.switchTitle": "Off: the tab is hidden and its models leave the model picker at the bottom (the keys are kept)",
        "tabs.last": "At least one vendor stays on",
        "tabs.save": "Save",
        "tabs.cancel": "Cancel",
        "tabs.close": "Close",
        "status.low": "Low balance",
        "head.autoSwitch": "Auto-switch keys",
        "head.autoSwitchHint": "When a key's balance or plan quota runs out, the next key (top to bottom) takes over.",
        "head.rotateOnRateLimit": "Also on rate limits",
        "head.rotateHint": "Rate limits count per account at these vendors: switching only helps when the keys belong to different accounts.",
        "head.validate": "Verify all",
        "head.validating": "Verifying…",
        "head.validateHint": "Check that the vendor accepts each key (a key without a free check gets one tiny request).",
        "head.funds": "Refresh quota",
        "head.fundsing": "Refreshing…",
        "head.fundsHint": "Re-read balances and plan windows (free). They also refresh when this tab opens, every 5 minutes, and after each request.",
        "head.export": "Export",
        "head.exporting": "Exporting…",
        "head.exported": "Exported {count} keys: {path}",
        "head.add": "Add keys",
        "empty": "No {vendor} key yet.",
        "notice.switched": "{time} switched key on {endpoint}: {from} → {to} ({reason})",
        "notice.dismiss": "Dismiss",
        "reason.invalid-key": "key invalid",
        "reason.expired": "no plan or expired",
        "reason.no-balance": "no balance",
        "reason.plan-quota": "plan quota used up",
        "reason.forbidden": "not allowed",
        "reason.rate-limit": "rate limited",
        "reason.unusable": "key unavailable",
        "reason.model-no-balance": "account overdue for this model",
        "section.plan": "Plan",
        "section.models": "Models {count}/{total}",
        "section.modelsTitle": "Choose the models this endpoint offers in the picker",
        "col.status": "Status",
        "col.balance": "Balance",
        "col.quota": "Quota",
        "col.usage": "Today",
        "status.ok": "Valid",
        "status.unknown": "Not checked",
        "status.unknownChat": "Not checked — use ✓ (one tiny request)",
        "status.no-balance": "No balance",
        "status.plan-quota": "Quota used up",
        "status.invalid": "Key invalid",
        "status.expired": "No plan / expired",
        "status.error": "Check failed",
        "status.held": "Paused until {time}",
        "status.modelHolds": "{count} models overdue",
        "status.modelHoldsDetail": "Account overdue, so these models (no free quota or package left) are paused on this key until {time}: {models}. Its other models still answer.",
        "status.recheck": "May have recovered · rechecking",
        "status.recheckManual": "May have recovered · use ✓",
        "status.lastError": "Last check failed: {message}",
        "status.checked": "checked {time} ago",
        "status.never": "never checked",
        "status.backAt": "back {time}",
        "key.copy": "Copy the key",
        "key.copied": "Copied",
        "balance.none": "—",
        "balance.noApi": "The vendor shows no balance or quota for this key",
        "funds.failed": "Read failed",
        "funds.stale": "as of {time} ago",
        "quota.window.5h": "5h",
        "quota.window.week": "Week",
        "quota.cell": "{window} {percent}%",
        "quota.detail": "{window} window: {percent}% left, resets {time}",
        "usage.today": "{requests} req · {tokens}",
        "usage.none": "—",
        "usage.month": "This month: {requests} requests, {tokens} tokens",
        "key.active": "In use",
        "key.switch": "Use",
        "key.validate": "Check validity",
        "key.validateChat": "Check validity (one tiny request)",
        "key.funds": "Refresh balance / quota",
        "key.edit": "Edit",
        "key.remove": "Remove",
        "key.removeConfirm": "Confirm",
        "key.drag": "Drag to reorder (or ↑ ↓). Switching tries keys top to bottom.",
        "key.custom": "Custom address",
        "key.customTitle": "Custom address: {host}",
        "add.title": "Add {vendor} API keys",
        "add.endpoint": "Endpoint",
        "add.auto": "Detect",
        "add.paste": "One key per line",
        "add.label": "Name (optional)",
        "add.baseUrl": "Custom address",
        "add.advanced": "Custom address…",
        "add.submit": "Add",
        "add.working": "Checking…",
        "add.file": "From file",
        "add.dsh": "Import DSH keys",
        "add.dshNone": "DSH stores no key for this vendor.",
        "add.dshFound": "Found in DSH: {refs}",
        "add.ok": "{masked} → {endpoint}: {state}",
        "add.wrongVendor": "{masked}: {error}",
        "add.updated": "{masked} → {endpoint}: already added, updated ({state})",
        "add.fail": "{masked}: not added ({error})",
        "add.tooLarge": "{name}: too large to be a key file",
        "add.close": "Close",
        "edit.title": "Edit key {masked}",
        "edit.label": "Name",
        "edit.baseUrl": "Custom address (empty: {host})",
        "edit.restore": "Use the default address ({host})",
        "edit.save": "Save",
        "edit.cancel": "Cancel",
        "models.title": "Models — {endpoint}",
        "models.selected": "{count} of {total} selected",
        "models.fetched": "list fetched {time} ago",
        "models.snapshot": "built-in list",
        "models.fetch": "Fetch list",
        "models.fetching": "Fetching…",
        "models.image": "image",
        "models.thinking": "thinking",
        "models.new": "new",
        "models.retiring": "retires {date}",
        "models.unusable": "unavailable",
        "models.all": "All",
        "models.none": "None",
        "models.reset": "Default",
        "models.save": "Save",
        "models.cancel": "Cancel",
        "models.close": "Close",
        "card.summary": "{count} keys · in use: {key} ({state})",
        "card.none": "No key on this endpoint",
        "time.days": "{d}d {h}h",
        "time.hours": "{h}h {m}m",
        "time.minutes": "{m}m",
        "time.now": "<1m",
        "error.generic": "Failed: {message}",
        "error.unavailable": "The plugin's host half is not loaded yet — restart the app once after installing.",
      },
      zh: {
        "tab.label": "国内模型",
        "head.title": "{vendor} API Key",
        "head.tabs": "管理标签",
        "head.tabsTitle": "打开或关闭厂商标签（关闭的厂商，底部模型选择栏也不再显示它的模型）",
        "tabs.title": "厂商标签",
        "tabs.keys": "{count} 个 Key",
        "tabs.switchTitle": "关闭后隐藏这个标签，底部模型选择栏也不再显示它的模型（Key 保留）",
        "tabs.last": "至少保留一个厂商",
        "tabs.save": "保存",
        "tabs.cancel": "取消",
        "tabs.close": "关闭",
        "status.low": "余额偏低",
        "head.autoSwitch": "自动换 Key",
        "head.autoSwitchHint": "余额或套餐额度用尽时，按从上到下的顺序换下一个 Key。",
        "head.rotateOnRateLimit": "限流时也换",
        "head.rotateHint": "这些厂商的限流按账号计算：只有 Key 来自不同账号时，限流换 Key 才有用。",
        "head.validate": "验证全部",
        "head.validating": "正在验证…",
        "head.validateHint": "检测厂商是否接受每个 Key（没有免费校验接口的 Key 会发一次最小请求）。",
        "head.funds": "刷新额度",
        "head.fundsing": "正在刷新…",
        "head.fundsHint": "重新读取余额和套餐额度（免费）。打开标签页时、之后每 5 分钟、每次请求后也会自动刷新。",
        "head.export": "导出",
        "head.exporting": "正在导出…",
        "head.exported": "已导出 {count} 个 Key：{path}",
        "head.add": "添加 Key",
        "empty": "还没有 {vendor} 的 Key。",
        "notice.switched": "{time} {endpoint} 已自动换 Key：{from} → {to}（{reason}）",
        "notice.dismiss": "关闭提示",
        "reason.invalid-key": "Key 无效",
        "reason.expired": "无套餐或已过期",
        "reason.no-balance": "余额不足",
        "reason.plan-quota": "套餐额度用尽",
        "reason.forbidden": "无权使用",
        "reason.rate-limit": "被限流",
        "reason.unusable": "Key 不可用",
        "reason.model-no-balance": "该模型欠费",
        "section.plan": "套餐",
        "section.models": "模型 {count}/{total}",
        "section.modelsTitle": "选择这个接入点在模型选择器里提供的模型",
        "col.status": "状态",
        "col.balance": "余额",
        "col.quota": "额度",
        "col.usage": "今日用量",
        "status.ok": "有效",
        "status.unknown": "未检测",
        "status.unknownChat": "未检测，点 ✓ 检测（发一次最小请求）",
        "status.no-balance": "余额不足",
        "status.plan-quota": "额度用尽",
        "status.invalid": "Key 无效",
        "status.expired": "无套餐 / 已过期",
        "status.error": "检测失败",
        "status.held": "暂停至 {time}",
        "status.modelHolds": "{count} 个模型欠费",
        "status.modelHoldsDetail": "账户欠费，这些模型没有可用的免费额度或资源包，在这个 Key 上暂停到 {time}：{models}。其他模型照常可用。",
        "status.recheck": "可能已恢复 · 正在重新检测",
        "status.recheckManual": "可能已恢复 · 点 ✓ 检测",
        "status.lastError": "上次检测失败：{message}",
        "status.checked": "{time}前检测",
        "status.never": "尚未检测",
        "status.backAt": "{time} 恢复",
        "key.copy": "复制 Key",
        "key.copied": "已复制",
        "balance.none": "—",
        "balance.noApi": "厂商不提供这个 Key 的余额或额度查询",
        "funds.failed": "读取失败",
        "funds.stale": "{time}前的数据",
        "quota.window.5h": "5 小时",
        "quota.window.week": "本周",
        "quota.cell": "{window} {percent}%",
        "quota.detail": "{window}：剩余 {percent}%，{time} 重置",
        "usage.today": "{requests} 次 · {tokens}",
        "usage.none": "—",
        "usage.month": "本月：{requests} 次请求，{tokens} tokens",
        "key.active": "使用中",
        "key.switch": "切换",
        "key.validate": "检测有效性",
        "key.validateChat": "检测有效性（发一次最小请求）",
        "key.funds": "刷新余额 / 额度",
        "key.edit": "编辑",
        "key.remove": "删除",
        "key.removeConfirm": "确认删除",
        "key.drag": "拖动排序（或按 ↑ ↓），自动换 Key 按从上到下的顺序。",
        "key.custom": "自定义地址",
        "key.customTitle": "自定义地址：{host}",
        "add.title": "添加 {vendor} API Key",
        "add.endpoint": "接入点",
        "add.auto": "自动识别",
        "add.paste": "每行一个 Key",
        "add.label": "名称（可选）",
        "add.baseUrl": "自定义地址",
        "add.advanced": "自定义地址…",
        "add.submit": "添加",
        "add.working": "正在检测…",
        "add.file": "从文件导入",
        "add.dsh": "导入 DSH Key",
        "add.dshNone": "DSH 里没有这个厂商的 Key。",
        "add.dshFound": "在 DSH 中找到：{refs}",
        "add.ok": "{masked} → {endpoint}：{state}",
        "add.wrongVendor": "{masked}：{error}",
        "add.updated": "{masked} → {endpoint}：已存在，已更新（{state}）",
        "add.fail": "{masked}：未添加（{error}）",
        "add.tooLarge": "{name}：文件过大，不是 Key 文件",
        "add.close": "关闭",
        "edit.title": "编辑 Key {masked}",
        "edit.label": "名称",
        "edit.baseUrl": "自定义地址（留空：{host}）",
        "edit.restore": "恢复默认地址（{host}）",
        "edit.save": "保存",
        "edit.cancel": "取消",
        "models.title": "模型 — {endpoint}",
        "models.selected": "已选 {count} / {total}",
        "models.fetched": "列表 {time}前获取",
        "models.snapshot": "内置列表",
        "models.fetch": "获取列表",
        "models.fetching": "正在获取…",
        "models.image": "图片",
        "models.thinking": "思考",
        "models.new": "新",
        "models.retiring": "{date} 下线",
        "models.unusable": "不可用",
        "models.all": "全选",
        "models.none": "全不选",
        "models.reset": "恢复默认",
        "models.save": "保存",
        "models.cancel": "取消",
        "models.close": "关闭",
        "card.summary": "{count} 个 Key · 使用中：{key}（{state}）",
        "card.none": "这个接入点还没有 Key",
        "time.days": "{d}天{h}小时",
        "time.hours": "{h}小时{m}分",
        "time.minutes": "{m}分钟",
        "time.now": "不到1分钟",
        "error.generic": "操作失败：{message}",
        "error.unavailable": "插件宿主端尚未加载——安装后请重启一次应用。",
      },
    };

    const CSS = [
      ".cn-root{display:flex;flex-direction:column;gap:14px;font-size:13px;color:var(--dsw-alias-label-primary)}",
      // The tab fills the conversation width (a column flex parent would otherwise shrink it to its content).
      ".cn-view{box-sizing:border-box;width:100%;max-width:1320px;margin:0 auto;padding:20px 28px calc(var(--dsh-composer-height, 152px) + 24px)}",
      ".cn-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
      ".cn-title{font-size:15px;font-weight:600;margin-right:4px}",
      ".cn-spacer{flex:1}",
      ".cn-muted{color:var(--dsw-alias-label-tertiary);font-size:12px}",
      ".cn-error{color:var(--dsw-alias-state-error-primary);font-size:12px}",
      ".cn-ok{color:var(--dsw-alias-state-success-primary);font-size:12px}",
      ".cn-warn{color:var(--dsw-alias-state-warn-primary)}",
      ".cn-switch{display:flex;align-items:center;gap:7px;margin-right:6px;color:var(--dsw-alias-label-secondary)}",
      // Every text button the same width (the in-use badge is not a button).
      ".cn-btn.cn-btn{min-width:92px;justify-content:center}",
      ".cn-banner{display:flex;align-items:center;gap:8px;font-size:12px;padding:6px 10px;border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-bg-layer-1,transparent);border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary)}",
      ".cn-banner>span{flex:1;min-width:0;overflow-wrap:anywhere;user-select:text}",
      ".cn-close{flex:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;padding:0;border:none;border-radius:var(--dsw-radius-xs);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;font-size:14px;line-height:1}",
      ".cn-close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
      // One card per endpoint.
      ".cn-section{container-type:inline-size;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);overflow:hidden}",
      ".cn-section-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:9px 14px;background:var(--dsw-alias-bg-layer-1,transparent);border-bottom:1px solid var(--dsw-alias-border-l2)}",
      ".cn-section-name{font-weight:600}",
      ".cn-tag{flex:none;font-size:11px;padding:1px 7px;border-radius:var(--dsw-radius-xs);border:1px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary);white-space:nowrap}",
      ".cn-tag[data-tone=plan]{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}",
      ".cn-tag[title]{cursor:help}",
      // A key's second line: status, balance or quota (only the column the endpoint has), today, actions.
      ".cn-grid{display:grid;grid-template-columns:minmax(150px,1fr) minmax(110px,.8fr) 236px;align-items:center;column-gap:14px;padding:3px 14px 10px 30px}",
      ".cn-section[data-funds=balance] .cn-grid,.cn-section[data-funds=quota] .cn-grid{grid-template-columns:minmax(150px,1fr) minmax(200px,1.5fr) minmax(110px,.8fr) 236px}",
      ".cn-thead{font-size:12px;color:var(--dsw-alias-label-tertiary);border-bottom:1px solid var(--dsw-alias-border-l2);padding-top:6px;padding-bottom:6px}",
      ".cn-key{position:relative;border-bottom:1px solid var(--dsw-alias-border-l2)}",
      ".cn-key:last-child{border-bottom:none}",
      ".cn-key[data-active=true]{box-shadow:inset 3px 0 0 var(--dsw-alias-state-business-primary)}",
      ".cn-key[data-dead=true] .cn-funds,.cn-key[data-dead=true] .cn-usage{opacity:.45}",
      ".cn-key[data-dragging=true]{opacity:.45}",
      ".cn-key[data-drop]::after{content:\"\";position:absolute;left:0;right:0;height:2px;background:var(--dsw-alias-state-business-primary);pointer-events:none;z-index:1}",
      ".cn-key[data-drop=before]::after{top:-1px}",
      ".cn-key[data-drop=after]::after{bottom:-1px}",
      ".cn-grip{position:absolute;left:6px;top:7px;display:flex;align-items:center;justify-content:center;width:18px;height:24px;border-radius:var(--dsw-radius-xs);color:var(--dsw-alias-label-tertiary);opacity:.4;cursor:grab}",
      ".cn-key:hover .cn-grip,.cn-grip:focus-visible{opacity:1}",
      ".cn-grip:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".cn-grip:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,currentColor);outline-offset:0}",
      // A key's first line: name, tags, the key in full on one line (scrolls when it does not fit), copy.
      ".cn-line1{display:flex;align-items:center;gap:8px;min-width:0;padding:9px 14px 2px 30px}",
      ".cn-name-text{flex:none;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}",
      ".cn-full{flex:0 1 auto;min-width:0;overflow-x:auto;overflow-y:hidden;white-space:nowrap;scrollbar-width:thin;font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace);font-size:12px;line-height:20px;color:var(--dsw-alias-label-primary);user-select:all;-webkit-user-select:all}",
      ".cn-copy{flex:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;padding:0;border:none;border-radius:var(--dsw-radius-xs);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;font-size:12px}",
      ".cn-copy:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
      ".cn-copy[data-copied=true]{color:var(--dsw-alias-state-success-primary)}",
      ".cn-chip{display:inline-flex;align-items:center;gap:5px;max-width:100%;font-size:12px;padding:2px 8px;border-radius:999px;border:1px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:default}",
      ".cn-chip::before{content:\"\";flex:none;width:6px;height:6px;border-radius:50%;background:currentColor}",
      ".cn-chip[data-tone=ok]{color:var(--dsw-alias-state-success-primary);border-color:currentColor}",
      ".cn-chip[data-tone=warn]{color:var(--dsw-alias-state-warn-primary);border-color:currentColor}",
      ".cn-chip[data-tone=bad]{color:var(--dsw-alias-state-error-primary);border-color:currentColor}",
      ".cn-funds{display:flex;align-items:center;gap:8px;min-width:0}",
      ".cn-funds[data-stale=true] .cn-amount,.cn-funds[data-stale=true] .cn-windows{opacity:.5}",
      ".cn-failed{flex:none;font-size:12px;color:var(--dsw-alias-state-warn-primary);cursor:help;border-bottom:1px dotted currentColor}",
      ".cn-amount{font-variant-numeric:tabular-nums;font-weight:600}",
      ".cn-windows{display:flex;gap:10px;flex:1;min-width:0}",
      ".cn-window{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}",
      ".cn-window-num{font-size:12px;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary);white-space:nowrap}",
      ".cn-bar{height:4px;border-radius:2px;background:var(--dsw-alias-border-l2);overflow:hidden}",
      ".cn-fill{height:100%;border-radius:2px;background:var(--dsw-alias-state-success-primary)}",
      ".cn-fill[data-level=mid]{background:var(--dsw-alias-state-warn-primary)}",
      ".cn-fill[data-level=low]{background:var(--dsw-alias-state-error-primary)}",
      ".cn-usage{font-size:12px;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary);white-space:nowrap}",
      ".cn-actions{display:flex;align-items:center;justify-content:flex-end;gap:4px;white-space:nowrap}",
      // The in-use badge sits in the switch button's place, so the icons line up row to row.
      ".cn-slot{flex:none;width:92px;display:flex;justify-content:center}",
      ".cn-badge{font-size:11px;padding:3px 8px;border-radius:var(--dsw-radius-xs);background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary-inverted,#fff);white-space:nowrap}",
      ".cn-icon{flex:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:none;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;font-size:14px}",
      ".cn-icon:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
      ".cn-icon:disabled{cursor:default}",
      ".cn-icon:disabled:not([aria-busy=true]){opacity:.3}",
      ".cn-icon[data-spin=true] svg{animation:cn-spin .9s linear infinite}",
      ".cn-icon[data-pulse=true] svg{animation:cn-pulse .9s ease-in-out infinite}",
      ".cn-icon[data-confirm=true]{color:var(--dsw-alias-state-error-primary);width:auto;padding:0 8px;font-size:12px}",
      "@keyframes cn-spin{to{transform:rotate(360deg)}}",
      "@keyframes cn-pulse{50%{opacity:.3}}",
      ".cn-note{padding:0 14px 8px 30px;font-size:12px}",
      // Narrow: no header row; the second line wraps, the actions keep to the right.
      "@container (max-width: 720px){.cn-section .cn-thead.cn-thead{display:none}.cn-section .cn-grid.cn-grid:not(.cn-thead){display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px}.cn-funds{min-width:180px}.cn-actions{margin-left:auto}}",
      // Dialogs.
      ".cn-modal.cn-modal{width:min(var(--cn-modal-width,640px),100%);max-height:100%}",
      ".cn-modal-wide{--cn-modal-width:860px}",
      ".cn-modal-content{flex:1 1 auto;min-height:0;overflow-y:auto}",
      ".cn-dialog{display:flex;flex-direction:column;gap:12px}",
      ".cn-field{display:flex;flex-direction:column;gap:5px}",
      ".cn-field>label{font-size:12px;color:var(--dsw-alias-label-secondary)}",
      ".cn-select,.cn-text{box-sizing:border-box;width:100%;height:32px;padding:0 8px;font:inherit;font-size:13px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base,transparent);border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm)}",
      ".cn-textarea{box-sizing:border-box;width:100%;min-height:120px;resize:vertical;font:12px/1.5 var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base,transparent);border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm);padding:8px}",
      ".cn-select:focus,.cn-text:focus,.cn-textarea:focus{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,currentColor);outline-offset:1px}",
      ".cn-inline{display:flex;gap:6px;align-items:center;flex-wrap:wrap}",
      ".cn-tabrow{gap:10px;min-height:28px}",
      ".cn-tabname{min-width:96px;font-weight:600}",
      ".cn-link{border:none;background:none;padding:0;color:var(--dsw-alias-link,var(--dsw-alias-state-business-primary));cursor:pointer;font-size:12px;align-self:flex-start}",
      ".cn-results{display:flex;flex-direction:column;gap:4px;font-size:12px;overflow-wrap:anywhere}",
      // A card per model, three to a row (fewer when the window is narrow).
      ".cn-model-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(max(220px,calc((100% - 20px) / 3)),1fr));gap:10px}",
      ".cn-model-card{display:flex;flex-direction:column;gap:4px;min-width:0;padding:8px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-sm)}",
      ".cn-model-card:hover{border-color:var(--dsw-alias-border-l3)}",
      ".cn-model-card[data-selected=true]{border-color:var(--dsw-alias-state-business-primary)}",
      ".cn-model-card .cn-model-name{align-items:flex-start;overflow-wrap:anywhere}",
      ".cn-model-card .cn-model-name input{margin-top:2px}",
      ".cn-model-meta{display:flex;flex-wrap:wrap;gap:2px 8px;padding-left:22px}",
      ".cn-model-tag{font-size:11px;color:var(--dsw-alias-label-tertiary);white-space:nowrap}",
      ".cn-model-tag[data-tone=warn]{color:var(--dsw-alias-state-warn-primary)}",
      ".cn-empty{display:flex;align-items:center;gap:12px;font-size:13px;padding:14px 16px;border:1px dashed var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-md);color:var(--dsw-alias-label-secondary)}",
      ".cn-summary{display:flex;flex-direction:column;gap:4px;padding:2px 0 6px;font-size:13px;color:var(--dsw-alias-label-secondary)}",
    ].join("");
    const styleId = "dsh-cn-models/client.css";
    if (typeof document !== "undefined") {
      // A replaced module re-runs this factory; the newest stylesheet wins.
      document.querySelector(`style[data-plugin-css=${JSON.stringify(styleId)}]`)?.remove();
      const style = document.createElement("style");
      style.dataset.pluginCss = styleId;
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    /** Register the dictionaries once per live mount (a duplicate registration throws). */
    function installLocale(ctx) {
      const locale = ctx.locale;
      if (locale === undefined || typeof locale.register !== "function") return;
      try {
        if (typeof locale.bind === "function" && locale.bind(NS)("tab.label") !== "tab.label") return;
      } catch {
        /* an unreadable locale face is not a reason to skip the registration */
      }
      try {
        ctx.effect(() => locale.register(NS, DICTS), "dsh-cn-models: locale namespace");
      } catch (error) {
        console.warn("dsh-cn-models: locale namespace already registered; reusing it", error);
      }
    }

    // ---------------------------------------------------------------- store

    /** Vendor tabs, in order: id and the tab's English label (not translated). */
    const VENDOR_TABS = [["deepseek", "DeepSeek"], ["kimi", "Kimi"], ["glm", "GLM"], ["minimax", "MiniMax"], ["qwen", "Qwen"], ["mimo", "MiMo"], ["qianfan", "Qianfan"]];
    const tabName = (vendor) => VENDOR_TABS.find(([id]) => id === vendor)?.[1] ?? vendor;

    /** One shared snapshot for every view; immutable updates. `checking` and `checkedAt` are per vendor. */
    let snapshot = { status: null, loading: false, checking: {}, error: null, checkedAt: {} };
    const listeners = new Set();
    const subscribe = (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    };
    const read = () => snapshot;
    const update = (patch) => {
      snapshot = { ...snapshot, ...patch };
      for (const listener of [...listeners]) listener();
    };
    const useCn = () => React.useSyncExternalStore(subscribe, read, read);

    /** Host operations, bound in apply(). */
    let call = async () => {
      throw new Error("remote.cnModels is not mounted");
    };

    /** Run one operation; a returned status replaces the shared one. */
    async function run(method, request) {
      const value = await call(method, request ?? {});
      if (value && typeof value === "object" && Array.isArray(value.keys)) update({ status: value, error: null });
      return value;
    }

    async function loadStatus() {
      if (snapshot.loading) return;
      update({ loading: true });
      try {
        await run("status");
      } catch (error) {
        update({ error: String(error?.message ?? error) });
      } finally {
        update({ loading: false });
      }
    }

    /** The vendor an endpoint belongs to. */
    const vendorOf = (status, endpointId) => status?.endpoints?.find((endpoint) => endpoint.id === endpointId)?.vendor;
    /** One vendor's keys. */
    const keysOf = (status, vendor) => (status?.keys ?? []).filter((key) => vendorOf(status, key.endpoint) === vendor);

    /**
     * Check one vendor's keys. `auto` (the timer): what the vendor tells for
     * free; `funds`: balances and plan windows; `validity` (with `deep`, one
     * tiny request where nothing free validates a key). `checking[vendor]` is
     * the running mode.
     */
    async function checkVendor(vendor, { mode = "auto", deep = false } = {}) {
      if (snapshot.checking[vendor]) return;
      update({ checking: { ...snapshot.checking, [vendor]: mode } });
      try {
        await run("checkKeys", { vendor, ...(mode !== "auto" ? { mode } : {}), ...(deep ? { deep: true } : {}) });
        if (mode !== "validity") update({ checkedAt: { ...snapshot.checkedAt, [vendor]: Date.now() } });
      } catch (error) {
        update({ error: String(error?.message ?? error) });
      } finally {
        update({ checking: { ...snapshot.checking, [vendor]: false } });
      }
    }

    /**
     * Keep the shared state live while a view is on screen: every view reads
     * the (local, cheap) status; a vendor tab also runs that vendor's free
     * checks every 5 minutes — only that vendor's, only while it is open. A
     * hidden window polls nothing and catches up when shown again.
     */
    let statusWatchers = 0;
    let statusTimer;
    const vendorWatchers = new Map();
    const visible = () => typeof document === "undefined" || document.visibilityState !== "hidden";
    const hasKeys = (vendor) => keysOf(snapshot.status, vendor).length > 0;
    const checksStale = (vendor) => Date.now() - (snapshot.checkedAt[vendor] ?? 0) > CHECK_INTERVAL_MS;
    const onVisibility = () => {
      if (!visible()) return;
      void loadStatus();
      for (const vendor of vendorWatchers.keys()) if (hasKeys(vendor) && checksStale(vendor)) void checkVendor(vendor);
    };
    function watch({ vendor } = {}) {
      statusWatchers += 1;
      if (statusWatchers === 1) {
        statusTimer = setInterval(() => { if (visible()) void loadStatus(); }, STATUS_INTERVAL_MS);
        if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVisibility);
      }
      if (vendor) {
        const entry = vendorWatchers.get(vendor) ?? { count: 0, timer: undefined };
        entry.count += 1;
        if (entry.count === 1) entry.timer = setInterval(() => { if (visible() && hasKeys(vendor)) void checkVendor(vendor); }, CHECK_INTERVAL_MS);
        vendorWatchers.set(vendor, entry);
      }
      void loadStatus().then(() => {
        if (vendor && hasKeys(vendor) && checksStale(vendor)) void checkVendor(vendor);
      });
      return () => {
        statusWatchers -= 1;
        if (vendor) {
          const entry = vendorWatchers.get(vendor);
          entry.count -= 1;
          if (entry.count === 0) {
            clearInterval(entry.timer);
            vendorWatchers.delete(vendor);
          }
        }
        if (statusWatchers === 0) {
          clearInterval(statusTimer);
          if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVisibility);
        }
      };
    }
    const useWatch = ({ vendor } = {}) => React.useEffect(() => watch({ vendor }), [vendor]);

    /** The hidden vendor tabs, cached in this browser so the tabs appear at once on the next load. */
    const HIDDEN_KEY = "dsh-cn-models:hidden-vendors";
    function readHidden() {
      try {
        const value = JSON.parse(globalThis.localStorage?.getItem(HIDDEN_KEY) ?? "[]");
        return Array.isArray(value) ? value.filter((id) => VENDOR_TABS.some(([vendor]) => vendor === id)) : [];
      } catch {
        return [];
      }
    }
    function writeHidden(hidden) {
      try {
        globalThis.localStorage?.setItem(HIDDEN_KEY, JSON.stringify(hidden));
      } catch {
        /* the host keeps the real setting */
      }
    }

    /** The switch notice the viewer closed (by its time), remembered in this browser. */
    const DISMISS_KEY = "dsh-cn-models:dismissed-switch";
    let dismissedSwitch = (() => {
      try {
        return globalThis.localStorage?.getItem(DISMISS_KEY) ?? null;
      } catch {
        return null;
      }
    })();
    function dismissSwitch(at) {
      dismissedSwitch = at;
      try {
        globalThis.localStorage?.setItem(DISMISS_KEY, at);
      } catch {
        /* the notice still closes for this page */
      }
      update({});
    }

    // ---------------------------------------------------------- pure helpers

    /** A countdown in the dictionary's units. */
    function duration(t, ms) {
      if (!Number.isFinite(ms) || ms <= 60_000) return t("time.now");
      const minutes = Math.round(ms / 60_000);
      const d = Math.floor(minutes / 1440);
      const hh = Math.floor((minutes % 1440) / 60);
      const m = minutes % 60;
      if (d > 0) return t("time.days", { d, h: hh });
      if (hh > 0) return t("time.hours", { h: hh, m });
      return t("time.minutes", { m });
    }
    const since = (t, value, now = Date.now()) => duration(t, now - (typeof value === "number" ? value : Date.parse(value)));

    /** "19:59" (or "19:59:31"), 24-hour, with the date when it is not today. */
    function clock(iso, { seconds = false } = {}) {
      const date = new Date(iso);
      if (!Number.isFinite(date.getTime())) return "";
      const pad = (value) => String(value).padStart(2, "0");
      const time = `${pad(date.getHours())}:${pad(date.getMinutes())}${seconds ? `:${pad(date.getSeconds())}` : ""}`;
      return date.toDateString() === new Date().toDateString() ? time : `${date.getMonth() + 1}/${date.getDate()} ${time}`;
    }

    /** "¥32.35" / "$1.20". */
    function money(balance) {
      if (!balance || typeof balance.amount !== "number") return null;
      const symbol = balance.currency === "USD" ? "$" : balance.currency === "CNY" || !balance.currency ? "¥" : `${balance.currency} `;
      return `${symbol}${balance.amount.toFixed(2)}`;
    }

    /** Copy text to the clipboard (the async API, else the selection fallback). */
    async function copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        /* fall back below */
      }
      try {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.cssText = "position:fixed;opacity:0;pointer-events:none";
        document.body.appendChild(area);
        area.select();
        const done = document.execCommand("copy");
        area.remove();
        return done;
      } catch {
        return false;
      }
    }

    /** A balance worth a warning: under ¥5 (or $1). */
    const isLow = (balance) => typeof balance?.amount === "number" && balance.amount < (balance.currency === "USD" ? 1 : 5);

    /** "12.3k" / "1.2M". */
    function compact(value) {
      const number = Number(value) || 0;
      if (number >= 1e6) return `${(number / 1e6).toFixed(number >= 1e7 ? 0 : 1)}M`;
      if (number >= 1e3) return `${(number / 1e3).toFixed(number >= 1e4 ? 0 : 1)}k`;
      return String(number);
    }
    const tokensOf = (bucket) => (Number(bucket?.input) || 0) + (Number(bucket?.output) || 0) + (Number(bucket?.cacheRead) || 0) + (Number(bucket?.cacheWrite) || 0);
    const level = (value) => (value === null || value === undefined ? "low" : value <= 15 ? "low" : value <= 40 ? "mid" : "ok");
    const keyTitle = (key) => key.label || key.masked;
    const unavailableError = (message) => /not mounted|invocation-unavailable|service-unavailable|definition-unavailable|binding-invalid/.test(String(message ?? ""));
    const windowName = (t, id) => (id === "5h" ? t("quota.window.5h") : id === "week" ? t("quota.window.week") : id);

    /** The endpoints that have keys, in vendor then endpoint order, each with its keys. */
    function groupsOf(status) {
      const keys = status?.keys ?? [];
      return (status?.endpoints ?? []).filter((endpoint) => keys.some((key) => key.endpoint === endpoint.id)).map((endpoint) => ({
        endpoint,
        keys: keys.filter((key) => key.endpoint === endpoint.id),
      }));
    }

    /**
     * A key's status for its chip: tone, short label, and a full description
     * (balance, quota, the last check and its failures).
     */
    function statusInfo(t, key, endpoint, now = Date.now()) {
      const held = key.limitedUntil && Date.parse(key.limitedUntil) > now ? key.limitedUntil : null;
      const low = key.status === "ok" && !held && isLow(key.balance);
      // Models the key may not serve for now, while it serves the others.
      const modelHolds = (key.modelHolds ?? []).filter((hold) => Date.parse(hold.until) > now);
      const label = (() => {
        switch (key.status) {
          case "ok": return held ? t("status.held", { time: clock(held) }) : low ? t("status.low") : modelHolds.length ? t("status.modelHolds", { count: modelHolds.length }) : t("status.ok");
          // A hold that ran out: the old verdict is stale until the next check.
          case "no-balance": return held ? t("status.no-balance") : endpoint?.freeCheck === false ? t("status.recheckManual") : t("status.recheck");
          case "plan-quota": return held ? `${t("status.plan-quota")} · ${t("status.backAt", { time: clock(held) })}` : endpoint?.freeCheck === false ? t("status.recheckManual") : t("status.recheck");
          case "invalid": return t("status.invalid");
          case "expired": return t("status.expired");
          case "error": return t("status.error");
          default: return t("status.unknown");
        }
      })();
      const lapsed = (key.status === "plan-quota" || key.status === "no-balance") && !held;
      const tone = key.status === "ok" ? (held || low || modelHolds.length ? "warn" : "ok") : lapsed ? "neutral" : key.status === "plan-quota" || key.status === "no-balance" ? (key.status === "no-balance" ? "bad" : "warn") : key.status === "invalid" || key.status === "expired" ? "bad" : "neutral";
      const parts = [label];
      if (key.statusMessage && key.status !== "ok") parts.push(key.statusMessage);
      if (modelHolds.length) parts.push(t("status.modelHoldsDetail", { models: modelHolds.map((hold) => hold.model).join("、"), time: clock(modelHolds.map((hold) => hold.until).sort().at(-1)) }));
      const amount = money(key.balance);
      if (amount) parts.push(amount);
      for (const window of key.quota?.windows ?? []) {
        if (typeof window.remainingPercent === "number") parts.push(t("quota.detail", { window: windowName(t, window.id), percent: window.remainingPercent, time: window.resetAt ? clock(window.resetAt) : "—" }));
      }
      if (key.status === "unknown" && endpoint && !endpoint.freeCheck) parts.push(t("status.unknownChat"));
      if (key.validityError && key.status !== "error") parts.push(t("status.lastError", { message: key.validityError }));
      if (key.quotaError) parts.push(`${t("funds.failed")}：${key.quotaError}`);
      parts.push(key.checkedAt ? t("status.checked", { time: since(t, key.checkedAt, now) }) : t("status.never"));
      return { tone, label, detail: parts.join(" · ") };
    }

    /** One result line of an add. */
    function addLine(t, result) {
      const shown = result.key ?? result.masked;
      if (!result.ok && result.kind === "wrong-vendor") return { tone: "warn", text: t("add.wrongVendor", { masked: shown, error: result.error }) };
      if (!result.ok) return { tone: "error", text: t("add.fail", { masked: shown, error: result.error ?? t("status.invalid") }) };
      const state = [t(`status.${result.status}`) ?? result.status, money(result.balance), ...(result.quota?.windows ?? []).filter((window) => typeof window.remainingPercent === "number").map((window) => t("quota.cell", { window: windowName(t, window.id), percent: window.remainingPercent }))].filter(Boolean).join(" · ");
      return { tone: result.status === "ok" ? "ok" : "warn", text: t(result.created ? "add.ok" : "add.updated", { masked: shown, endpoint: result.endpointName, state }) };
    }

    /** The order after dropping `dragId` before or after `targetId`; null when nothing moves. */
    function reordered(ids, dragId, targetId, after) {
      if (dragId === targetId || !ids.includes(dragId) || !ids.includes(targetId)) return null;
      const rest = ids.filter((id) => id !== dragId);
      const at = rest.indexOf(targetId) + (after ? 1 : 0);
      const next = [...rest.slice(0, at), dragId, ...rest.slice(at)];
      return next.every((id, index) => id === ids[index]) ? null : next;
    }

    /** The order after moving one id by `delta` places, or null at an edge. */
    function moved(ids, id, delta) {
      const from = ids.indexOf(id);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= ids.length) return null;
      const next = [...ids];
      next.splice(from, 1);
      next.splice(to, 0, id);
      return next;
    }

    const Grip = () => h("svg", { width: 10, height: 16, viewBox: "0 0 10 16", fill: "currentColor", "aria-hidden": true },
      [3, 8, 13].flatMap((cy) => [h("circle", { key: `l${cy}`, cx: 2.5, cy, r: 1.3 }), h("circle", { key: `r${cy}`, cx: 7.5, cy, r: 1.3 })]));
    const CopyIcon = () => h("svg", { width: 13, height: 13, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
      h("rect", { x: 5.5, y: 5.5, width: 8, height: 8, rx: 1.5 }), h("path", { d: "M10.5 5.5V3.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" }));
    const PenIcon = () => h("svg", { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
      h("path", { d: "M10.5 2.5l3 3L6 13H3v-3z" }));
    const TrashIcon = () => h("svg", { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
      h("path", { d: "M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" }));

    const ShieldIcon = () => h("svg", { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
      h("path", { d: "M8 1.8l5 2v3.6c0 3.1-2.1 5.6-5 6.8-2.9-1.2-5-3.7-5-6.8V3.8z" }), h("path", { d: "M5.8 8.1l1.6 1.6 3-3.2" }));

    // ------------------------------------------------------------ components

    /**
     * A key's balance or plan windows — the column its endpoint has. A failed
     * read says so (reason in the tooltip) and dims the last numbers.
     */
    function FundsCell({ t, keyInfo: key, column }) {
      const failed = key.quotaError
        ? h("span", { className: "cn-failed", title: [key.quotaError, key.quotaAt ? t("funds.stale", { time: since(t, key.quotaAt) }) : null].filter(Boolean).join(" · ") }, t("funds.failed"))
        : null;
      const stale = failed ? "true" : "false";
      if (!key.funds) return h("div", { className: "cn-funds" }, h("span", { className: "cn-muted", title: t("balance.noApi") }, t("balance.none")));
      const windows = (key.quota?.windows ?? []).filter((window) => typeof window.remainingPercent === "number");
      if (column === "quota" && windows.length) {
        return h("div", { className: "cn-funds", "data-stale": stale },
          h("div", { className: "cn-windows" }, windows.map((window) => h("div", {
            key: window.id,
            className: "cn-window",
            title: t("quota.detail", { window: windowName(t, window.id), percent: window.remainingPercent, time: window.resetAt ? clock(window.resetAt) : "—" }),
          },
            h("span", { className: `cn-window-num${window.remainingPercent === 0 ? " cn-warn" : ""}` }, t("quota.cell", { window: windowName(t, window.id), percent: window.remainingPercent })),
            h("div", { className: "cn-bar", role: "meter", "aria-label": windowName(t, window.id), "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": window.remainingPercent },
              h("div", { className: "cn-fill", "data-level": level(window.remainingPercent), style: { width: `${window.remainingPercent}%` } }))))),
          failed);
      }
      const amount = money(key.balance);
      if (column === "balance" && amount) {
        return h("div", { className: "cn-funds", "data-stale": stale },
          h("span", { className: `cn-amount${isLow(key.balance) ? " cn-warn" : ""}`, title: isLow(key.balance) ? t("status.low") : undefined }, amount),
          failed);
      }
      return h("div", { className: "cn-funds" }, failed ?? h("span", { className: "cn-muted" }, t("balance.none")));
    }

    function KeyRow({ t, keyInfo: key, endpoint, column, drag, onEdit }) {
      const [busy, setBusy] = React.useState(null);
      const [confirming, setConfirming] = React.useState(false);
      const [error, setError] = React.useState(null);
      const [copied, setCopied] = React.useState(false);
      const info = statusInfo(t, key, endpoint);
      const copy = async () => {
        if (await copyText(key.key ?? "")) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }
      };
      const dead = key.status === "invalid" || key.status === "expired";
      const stop = (handler) => (event) => {
        event?.stopPropagation?.();
        handler(event);
      };
      const act = async (method, request) => {
        setError(null);
        try {
          await run(method, request);
        } catch (failure) {
          setError(String(failure?.message ?? failure));
        }
      };
      const check = async (mode) => {
        setBusy(mode);
        await act("checkKeys", { keyIds: [key.id], mode, ...(mode === "validity" ? { deep: true } : {}) });
        setBusy(null);
      };
      const day = key.usage?.day;
      const month = key.usage?.month;
      // The plan a key belongs to when its endpoint does not say (MiniMax M Plan keys).
      const planTag = key.planLabel && !endpoint?.plan ? key.planLabel : null;
      return h("li", {
        className: "cn-key",
        "data-active": key.active ? "true" : "false",
        "data-dead": dead ? "true" : "false",
        "data-dragging": drag?.dragging ? "true" : "false",
        "data-drop": drag?.drop ?? undefined,
        onDragOver: drag?.onDragOver,
        onDrop: drag?.onDrop,
      },
        drag?.enabled ? h("span", {
          className: "cn-grip",
          role: "button",
          tabIndex: 0,
          draggable: true,
          title: t("key.drag"),
          "aria-label": t("key.drag"),
          onKeyDown: (event) => {
            if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
            event.preventDefault();
            drag.onMove(event.key === "ArrowUp" ? -1 : 1);
          },
          onDragStart: drag.onDragStart,
          onDragEnd: drag.onDragEnd,
        }, h(Grip)) : null,
        // Line 1: who it is, and the key in full on one line.
        h("div", { className: "cn-line1" },
          key.label ? h("span", { className: "cn-name-text", title: key.label }, key.label) : null,
          planTag ? h("span", { className: "cn-tag", "data-tone": "plan" }, planTag) : null,
          key.customHost ? h("span", { className: "cn-tag", title: t("key.customTitle", { host: key.customHost }) }, t("key.custom")) : null,
          h("code", { className: "cn-full" }, key.key ?? key.masked),
          key.key ? h("button", { type: "button", className: "cn-copy", title: copied ? t("key.copied") : t("key.copy"), "aria-label": t("key.copy"), "data-copied": copied ? "true" : "false", onClick: stop(() => void copy()) }, copied ? "✓" : h(CopyIcon)) : null),
        // Line 2: its state.
        h("div", { className: "cn-grid" },
          h("div", { className: "cn-status" }, h("span", { className: "cn-chip", "data-tone": info.tone, title: info.detail }, info.label)),
          column ? h(FundsCell, { t, keyInfo: key, column }) : null,
          h("div", {
            className: "cn-usage",
            title: month ? t("usage.month", { requests: month.requests ?? 0, tokens: compact(tokensOf(month)) }) : undefined,
          }, day?.requests ? t("usage.today", { requests: day.requests, tokens: compact(tokensOf(day)) }) : t("usage.none")),
          h("div", { className: "cn-actions" },
            h("span", { className: "cn-slot" }, key.active
              ? h("span", { className: "cn-badge" }, t("key.active"))
              : h(P.Button, { className: "cn-btn", size: "sm", variant: "outline", disabled: dead, onClick: stop(() => void act("switchKey", { keyId: key.id })) }, t("key.switch"))),
            h("button", {
              type: "button",
              className: "cn-icon",
              title: endpoint?.freeCheck === false ? t("key.validateChat") : t("key.validate"),
              "aria-label": t("key.validate"),
              "aria-busy": busy === "validity",
              disabled: busy !== null,
              "data-pulse": busy === "validity" ? "true" : "false",
              onClick: stop(() => void check("validity")),
            }, h(ShieldIcon)),
            h("button", {
              type: "button",
              className: "cn-icon",
              title: key.funds ? t("key.funds") : t("balance.noApi"),
              "aria-label": t("key.funds"),
              "aria-busy": busy === "funds",
              disabled: busy !== null || !key.funds,
              "data-spin": busy === "funds" ? "true" : "false",
              onClick: stop(() => void check("funds")),
            }, h(P.IconRefreshOutlineRegular, { size: 14 })),
            h("button", { type: "button", className: "cn-icon", title: t("key.edit"), "aria-label": t("key.edit"), onClick: stop(() => onEdit(key)) }, h(PenIcon)),
            h("button", {
              type: "button",
              className: "cn-icon",
              "data-confirm": confirming ? "true" : "false",
              title: t("key.remove"),
              "aria-label": confirming ? t("key.removeConfirm") : t("key.remove"),
              onClick: stop(() => {
                if (!confirming) {
                  setConfirming(true);
                  setTimeout(() => setConfirming(false), 4000);
                  return;
                }
                void act("removeKey", { keyId: key.id });
              }),
            }, confirming ? t("key.removeConfirm") : h(TrashIcon)))),
        error ? h("div", { className: "cn-error cn-note", role: "alert" }, t("error.generic", { message: error })) : null);
    }

    /** One endpoint's model chooser. */
    function ModelsDialog({ t, endpoint, models, onClose }) {
      const options = models?.options ?? [];
      const [draft, setDraft] = React.useState(() => new Set(options.filter((entry) => entry.enabled).map((entry) => entry.id)));
      const [busy, setBusy] = React.useState(null);
      const [error, setError] = React.useState(null);
      const ids = options.map((entry) => entry.id);
      const toggle = (id, next) => {
        const set = new Set(draft);
        if (next) set.add(id);
        else set.delete(id);
        setDraft(set);
      };
      const act = async (label, method, request, after) => {
        setBusy(label);
        setError(null);
        try {
          const value = await run(method, request);
          after?.(value);
        } catch (failure) {
          setError(String(failure?.message ?? failure));
        } finally {
          setBusy(null);
        }
      };
      const fetched = models?.fetchedAt ? t("models.fetched", { time: since(t, models.fetchedAt) }) : models?.live === false ? t("models.snapshot") : null;
      return h(P.Modal, {
        open: true,
        onClose,
        title: t("models.title", { endpoint: endpoint.name }),
        closeLabel: t("models.close"),
        className: "cn-modal cn-modal-wide",
        contentClassName: "cn-modal-content",
        children: h("div", { className: "cn-dialog" },
          h("div", { className: "cn-head" },
            h("span", { className: "cn-muted" }, [t("models.selected", { count: ids.filter((id) => draft.has(id)).length, total: ids.length }), fetched].filter(Boolean).join(" · ")),
            h("span", { className: "cn-spacer" }),
            models?.live !== false ? h(P.Button, {
              className: "cn-btn",
              size: "sm",
              variant: "outline",
              icon: h(P.IconRefreshOutlineRegular, { size: 14 }),
              disabled: busy !== null,
              onClick: () => void act("fetch", "refreshModels", { endpoint: endpoint.id }, (value) => {
                const fresh = value?.models?.[endpoint.id]?.options;
                if (fresh) setDraft(new Set(fresh.filter((entry) => entry.enabled).map((entry) => entry.id)));
              }),
            }, busy === "fetch" ? t("models.fetching") : t("models.fetch")) : null),
          // A card per model, three to a row.
          h("div", { className: "cn-model-grid" }, options.map((entry) => {
            const tags = [
              entry.image ? h("span", { key: "image", className: "cn-model-tag" }, t("models.image")) : null,
              entry.reasoning ? h("span", { key: "thinking", className: "cn-model-tag" }, t("models.thinking")) : null,
              entry.newer ? h("span", { key: "new", className: "cn-model-tag" }, t("models.new")) : null,
              entry.retiring ? h("span", { key: "retiring", className: "cn-model-tag", "data-tone": "warn" }, t("models.retiring", { date: entry.retiring.slice(5).replace("-", "/") })) : null,
              entry.unusable ? h("span", { key: "unusable", className: "cn-model-tag", "data-tone": "warn", title: entry.unusable }, t("models.unusable")) : null,
            ].filter(Boolean);
            return h("div", { key: entry.id, className: "cn-model-card", "data-selected": draft.has(entry.id) ? "true" : undefined, title: entry.id },
              h(P.Checkbox, { className: "cn-model-name", checked: draft.has(entry.id), label: entry.name, onChange: (next) => toggle(entry.id, next) }),
              tags.length ? h("div", { className: "cn-model-meta" }, tags) : null);
          })),
          error ? h("div", { className: "cn-error", role: "alert" }, t("error.generic", { message: error })) : null),
        footer: h(React.Fragment, null,
          h(P.Button, { className: "cn-btn", size: "sm", variant: "ghost", onClick: () => setDraft(new Set(ids)) }, t("models.all")),
          h(P.Button, { className: "cn-btn", size: "sm", variant: "ghost", onClick: () => setDraft(new Set()) }, t("models.none")),
          h(P.Button, { className: "cn-btn", size: "sm", variant: "ghost", disabled: busy !== null, onClick: () => void act("reset", "updateSettings", { endpoint: endpoint.id, enabledModelIds: null }, onClose) }, t("models.reset")),
          h("span", { className: "cn-spacer" }),
          h(P.Button, { className: "cn-btn", size: "sm", variant: "outline", onClick: onClose }, t("models.cancel")),
          h(P.Button, { className: "cn-btn", size: "sm", variant: "primary", disabled: busy !== null, onClick: () => void act("save", "updateSettings", { endpoint: endpoint.id, enabledModelIds: ids.filter((id) => draft.has(id)) }, onClose) }, t("models.save"))),
      });
    }

    function EditKeyDialog({ t, keyInfo: key, endpoint, onClose }) {
      const [label, setLabel] = React.useState(key.label ?? "");
      const [baseUrl, setBaseUrl] = React.useState("");
      const [restore, setRestore] = React.useState(false);
      const [working, setWorking] = React.useState(false);
      const [error, setError] = React.useState(null);
      const save = async () => {
        setWorking(true);
        setError(null);
        try {
          // An empty address field keeps the current address; "restore" drops a custom one.
          await run("updateKey", { keyId: key.id, label: label.trim() || null, ...(restore ? { baseUrl: null } : baseUrl.trim() ? { baseUrl: baseUrl.trim() } : {}) });
          onClose();
        } catch (failure) {
          setError(String(failure?.message ?? failure));
        } finally {
          setWorking(false);
        }
      };
      return h(P.Modal, {
        open: true,
        onClose: () => { if (!working) onClose(); },
        title: t("edit.title", { masked: key.masked }),
        closeLabel: t("edit.cancel"),
        className: "cn-modal",
        contentClassName: "cn-modal-content",
        children: h("div", { className: "cn-dialog" },
          h("div", { className: "cn-field" },
            h("label", { htmlFor: `cn-edit-label-${key.id}` }, t("edit.label")),
            h("input", { id: `cn-edit-label-${key.id}`, className: "cn-text", value: label, maxLength: 60, onChange: (event) => setLabel(event.target.value), "data-modal-autofocus": true })),
          h("div", { className: "cn-field" },
            h("label", { htmlFor: `cn-edit-base-${key.id}` }, t("edit.baseUrl", { host: endpoint?.host ?? "" })),
            h("input", { id: `cn-edit-base-${key.id}`, className: "cn-text", value: baseUrl, disabled: restore, placeholder: key.customHost ? `https://${key.customHost}/…` : `https://${endpoint?.host ?? ""}/…`, spellCheck: false, onChange: (event) => setBaseUrl(event.target.value) }),
            key.customHost ? h(P.Checkbox, { checked: restore, label: t("edit.restore", { host: endpoint?.host ?? "" }), onChange: setRestore }) : null),
          error ? h("div", { className: "cn-error", role: "alert" }, t("error.generic", { message: error })) : null),
        footer: h(React.Fragment, null,
          h(P.Button, { className: "cn-btn", size: "sm", variant: "outline", disabled: working, onClick: onClose }, t("edit.cancel")),
          h(P.Button, { className: "cn-btn", size: "sm", variant: "primary", disabled: working, onClick: () => void save() }, t("edit.save"))),
      });
    }

    /**
     * One vendor's add-keys dialog: paste (or a file) and that vendor's own
     * DSH keys; detection tries this vendor's endpoints only, and a key that is
     * plainly another vendor's is pointed at its tab.
     */
    function AddKeysDialog({ t, status, vendor, onClose }) {
      const [endpoint, setEndpoint] = React.useState("auto");
      const [text, setText] = React.useState("");
      const [label, setLabel] = React.useState("");
      const [baseUrl, setBaseUrl] = React.useState("");
      const [advanced, setAdvanced] = React.useState(false);
      const [working, setWorking] = React.useState(false);
      const [lines, setLines] = React.useState([]);
      const picker = React.useRef(null);
      const tab = tabName(vendor);
      const endpoints = (status?.endpoints ?? []).filter((item) => item.vendor === vendor);
      const submit = async (method, request) => {
        setWorking(true);
        setLines([]);
        try {
          const value = await run(method, { vendor, ...request });
          const out = (value?.added ?? []).map((result) => addLine(t, result));
          if (method === "importDshKeys") out.unshift({ tone: "muted", text: value?.refs?.length ? t("add.dshFound", { refs: value.refs.join(", ") }) : t("add.dshNone") });
          setLines(out);
          if (method === "addKeys" && out.some((line) => line.tone === "ok")) setText("");
        } catch (error) {
          setLines([{ tone: "error", text: t("error.generic", { message: String(error?.message ?? error) }) }]);
        } finally {
          setWorking(false);
        }
      };
      const add = () => submit("addKeys", { text, ...(endpoint !== "auto" ? { endpoint } : {}), ...(label.trim() ? { label: label.trim() } : {}), ...(baseUrl.trim() ? { baseUrl: baseUrl.trim() } : {}) });
      /** Read a key file in the page; only its text reaches the host. */
      const fromFile = async (fileList) => {
        const file = [...(fileList ?? [])][0];
        if (!file) return;
        if (file.size > MAX_FILE_BYTES) {
          setLines([{ tone: "error", text: t("add.tooLarge", { name: file.name }) }]);
          return;
        }
        const content = await file.text();
        await submit("addKeys", { text: content, source: "file", ...(endpoint !== "auto" ? { endpoint } : {}) });
      };
      return h(P.Modal, {
        open: true,
        onClose: () => { if (!working) onClose(); },
        title: t("add.title", { vendor: tab }),
        closeLabel: t("add.close"),
        className: "cn-modal cn-modal-wide",
        contentClassName: "cn-modal-content",
        children: h("div", { className: "cn-dialog" },
          h("div", { className: "cn-field" },
            h("label", { htmlFor: "cn-add-endpoint" }, t("add.endpoint")),
            h("select", { id: "cn-add-endpoint", className: "cn-select", value: endpoint, onChange: (event) => setEndpoint(event.target.value) },
              h("option", { value: "auto" }, t("add.auto")),
              endpoints.map((item) => h("option", { key: item.id, value: item.id }, `${item.name} · ${item.host}`)))),
          h("textarea", { className: "cn-textarea", value: text, placeholder: t("add.paste"), "aria-label": t("add.paste"), spellCheck: false, autoComplete: "off", "data-modal-autofocus": true, onChange: (event) => setText(event.target.value) }),
          h("div", { className: "cn-field" },
            h("label", { htmlFor: "cn-add-label" }, t("add.label")),
            h("input", { id: "cn-add-label", className: "cn-text", value: label, maxLength: 60, onChange: (event) => setLabel(event.target.value) })),
          advanced
            ? h("div", { className: "cn-field" },
              h("label", { htmlFor: "cn-add-base" }, t("add.baseUrl")),
              h("input", { id: "cn-add-base", className: "cn-text", value: baseUrl, spellCheck: false, placeholder: "https://…", onChange: (event) => setBaseUrl(event.target.value) }))
            : h("button", { type: "button", className: "cn-link", onClick: () => setAdvanced(true) }, t("add.advanced")),
          h("div", { className: "cn-inline" },
            h(P.Button, { className: "cn-btn", size: "sm", variant: "primary", disabled: working || !text.trim(), onClick: () => void add() }, working ? t("add.working") : t("add.submit")),
            h(P.Button, { className: "cn-btn", size: "sm", variant: "outline", disabled: working, onClick: () => picker.current?.click() }, t("add.file")),
            h(P.Button, { className: "cn-btn", size: "sm", variant: "outline", disabled: working, onClick: () => void submit("importDshKeys", {}) }, t("add.dsh")),
            h("input", {
              ref: picker,
              type: "file",
              style: { display: "none" },
              onChange: (event) => {
                const target = event.target;
                void fromFile(target.files).finally(() => { target.value = ""; });
              },
            })),
          lines.length ? h("div", { className: "cn-results", role: "status" }, lines.map((line, index) => h("div", { key: index, className: line.tone === "ok" ? "cn-ok" : line.tone === "warn" ? "cn-warn" : line.tone === "muted" ? "cn-muted" : "cn-error" }, line.text))) : null),
        footer: h(P.Button, { className: "cn-btn", size: "sm", variant: "outline", disabled: working, onClick: onClose }, t("add.close")),
      });
    }

    /** Which vendor tabs are shown (at least one). */
    function TabsDialog({ t, status, onClose }) {
      const hidden = status?.hiddenVendors ?? [];
      const [shown, setShown] = React.useState(() => new Set(VENDOR_TABS.map(([id]) => id).filter((id) => !hidden.includes(id))));
      const [working, setWorking] = React.useState(false);
      const [error, setError] = React.useState(null);
      const toggle = (id, next) => {
        const set = new Set(shown);
        if (next) set.add(id);
        else set.delete(id);
        setShown(set);
      };
      const save = async () => {
        setWorking(true);
        setError(null);
        try {
          await run("updateSettings", { hiddenVendors: VENDOR_TABS.map(([id]) => id).filter((id) => !shown.has(id)) });
          onClose();
        } catch (failure) {
          setError(String(failure?.message ?? failure));
        } finally {
          setWorking(false);
        }
      };
      return h(P.Modal, {
        open: true,
        onClose: () => { if (!working) onClose(); },
        title: t("tabs.title"),
        closeLabel: t("tabs.close"),
        className: "cn-modal",
        contentClassName: "cn-modal-content",
        children: h("div", { className: "cn-dialog" },
          VENDOR_TABS.map(([id, tab]) => {
            const count = keysOf(status, id).length;
            const last = shown.has(id) && shown.size === 1;
            return h("div", { key: id, className: "cn-inline cn-tabrow" },
              h(P.Switch, { checked: shown.has(id), label: tab, disabled: working || last, title: last ? t("tabs.last") : t("tabs.switchTitle"), onChange: (next) => toggle(id, next) }),
              h("span", { className: "cn-tabname" }, tab),
              h("span", { className: "cn-muted" }, [status?.vendors?.find((vendor) => vendor.id === id)?.name, count ? t("tabs.keys", { count }) : null].filter((part) => part && part !== tab).join(" · ")));
          }),
          error ? h("div", { className: "cn-error", role: "alert" }, t("error.generic", { message: error })) : null),
        footer: h(React.Fragment, null,
          h(P.Button, { className: "cn-btn", size: "sm", variant: "outline", disabled: working, onClick: onClose }, t("tabs.cancel")),
          h(P.Button, { className: "cn-btn", size: "sm", variant: "primary", disabled: working || shown.size === 0, onClick: () => void save() }, t("tabs.save"))),
      });
    }

    function EndpointSection({ t, endpoint, keys, models, drag, onModels, onEdit }) {
      const options = models?.options ?? [];
      const enabled = options.filter((entry) => entry.enabled && !entry.unusable).length;
      // Only the column this endpoint has: a balance, plan windows, or neither.
      const column = endpoint.showsBalance ? "balance" : endpoint.showsQuota ? "quota" : null;
      return h("section", { className: "cn-section", "aria-label": endpoint.name, "data-funds": column ?? "none" },
        h("div", { className: "cn-section-head" },
          // The plan terms live in a tooltip: on the plan tag, else on the name.
          h("span", { className: "cn-section-name", title: !endpoint.plan && endpoint.terms ? endpoint.terms : undefined }, endpoint.name),
          endpoint.plan ? h("span", { className: "cn-tag", "data-tone": "plan", title: [endpoint.plan, endpoint.terms].filter(Boolean).join(" — ") }, t("section.plan")) : null,
          h("span", { className: "cn-muted" }, endpoint.host),
          h("span", { className: "cn-spacer" }),
          h(P.Button, { className: "cn-btn", size: "sm", variant: "ghost", title: t("section.modelsTitle"), onClick: onModels }, t("section.models", { count: enabled, total: options.length }))),
        h("div", { className: "cn-grid cn-thead", "aria-hidden": true },
          h("span", null, t("col.status")),
          column ? h("span", null, t(column === "balance" ? "col.balance" : "col.quota")) : null,
          h("span", null, t("col.usage")),
          h("span", null, "")),
        h("ul", { style: { listStyle: "none", margin: 0, padding: 0 } }, keys.map((key) => h(KeyRow, { key: key.id, t, keyInfo: key, endpoint, column, drag: drag(endpoint.id, keys, key), onEdit }))));
    }

    /** One vendor's tab: its endpoints with keys, its switching settings, its checks and export, its notice. */
    function VendorPanel({ t, vendor }) {
      useWatch({ vendor });
      const state = useCn();
      const [adding, setAdding] = React.useState(false);
      const [tabs, setTabs] = React.useState(false);
      const [editing, setEditing] = React.useState(null);
      const [choosing, setChoosing] = React.useState(null);
      const [settingsError, setSettingsError] = React.useState(null);
      const [exporting, setExporting] = React.useState(false);
      const [exported, setExported] = React.useState(null);
      // Drag order within one endpoint.
      const [dragging, setDragging] = React.useState(null);
      const [dropAt, setDropAt] = React.useState(null);
      const [pending, setPending] = React.useState(null);
      const status = state.status;
      const tab = tabName(vendor);
      const settings = status?.vendorSettings?.[vendor] ?? { autoSwitch: status?.autoSwitch !== false, rotateOnRateLimit: status?.rotateOnRateLimit === true };
      const groups = groupsOf(status).filter((group) => group.endpoint.vendor === vendor).map((group) => {
        if (!pending || pending.endpoint !== group.endpoint.id) return group;
        const byId = new Map(group.keys.map((key) => [key.id, key]));
        return { ...group, keys: [...pending.ids.map((id) => byId.get(id)).filter(Boolean), ...group.keys.filter((key) => !pending.ids.includes(key.id))] };
      });
      const vendorKeys = keysOf(status, vendor);
      // A hold that ran out (plan window reset, balance maybe topped up): re-check
      // those keys for free, and wake up when the next hold ends.
      const rechecked = React.useRef(new Map());
      React.useEffect(() => {
        if (!status) return undefined;
        const now = Date.now();
        const free = new Set((status.endpoints ?? []).filter((endpoint) => endpoint.freeCheck).map((endpoint) => endpoint.id));
        const lapsed = vendorKeys.filter((key) => (key.status === "plan-quota" || key.status === "no-balance") && !key.limitedUntil && free.has(key.endpoint)
          && now - (rechecked.current.get(key.id) ?? 0) > 10 * 60_000);
        if (lapsed.length) {
          for (const key of lapsed) rechecked.current.set(key.id, now);
          void run("checkKeys", { keyIds: lapsed.map((key) => key.id) }).catch(() => undefined);
        }
        const ends = vendorKeys.map((key) => (key.limitedUntil ? Date.parse(key.limitedUntil) : NaN)).filter((at) => at > now);
        if (!ends.length) return undefined;
        const wait = Math.min(...ends) - now + 3_000;
        if (wait > 6 * 3_600_000) return undefined;
        const timer = setTimeout(() => void loadStatus(), wait);
        return () => clearTimeout(timer);
      }, [status]);
      const keyCount = vendorKeys.length;
      const hasFunds = vendorKeys.some((key) => key.funds);
      const commitOrder = (endpointId, next) => {
        if (!next) return;
        setPending({ endpoint: endpointId, ids: next });
        run("reorderKeys", { endpoint: endpointId, keyIds: next }).catch((error) => setSettingsError(String(error?.message ?? error))).finally(() => setPending(null));
      };
      const endDrag = () => {
        setDragging(null);
        setDropAt(null);
      };
      const drag = (endpointId, keys, key) => {
        const ids = keys.map((item) => item.id);
        const sameEndpoint = dragging?.endpoint === endpointId;
        return {
          enabled: keys.length > 1,
          dragging: dragging?.id === key.id,
          drop: sameEndpoint && dropAt?.id === key.id && dragging.id !== key.id ? (dropAt.after ? "after" : "before") : null,
          onMove: (delta) => commitOrder(endpointId, moved(ids, key.id, delta)),
          onDragStart: (event) => {
            event.stopPropagation?.();
            try {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", key.id);
              const row = event.currentTarget?.closest?.("li");
              if (row) event.dataTransfer.setDragImage(row, 24, 20);
            } catch {
              /* a minimal DataTransfer still drags */
            }
            setDragging({ endpoint: endpointId, id: key.id });
          },
          onDragEnd: endDrag,
          onDragOver: (event) => {
            if (!sameEndpoint) return;
            event.preventDefault();
            if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
            const rect = event.currentTarget.getBoundingClientRect();
            const after = event.clientY > rect.top + rect.height / 2;
            if (dropAt?.id !== key.id || dropAt.after !== after) setDropAt({ id: key.id, after });
          },
          onDrop: (event) => {
            if (!sameEndpoint) return;
            event.preventDefault();
            const rect = event.currentTarget.getBoundingClientRect();
            commitOrder(endpointId, reordered(ids, dragging.id, key.id, event.clientY > rect.top + rect.height / 2));
            endDrag();
          },
        };
      };
      const setting = (patch) => {
        setSettingsError(null);
        run("updateSettings", { vendor, ...patch }).catch((error) => setSettingsError(String(error?.message ?? error)));
      };
      /** This tab's keys to a text file in Downloads (`Vendor: key` lines). */
      const exportKeys = async () => {
        setExporting(true);
        setSettingsError(null);
        try {
          setExported(await call("exportKeys", { vendor }));
        } catch (error) {
          setSettingsError(String(error?.message ?? error));
        } finally {
          setExporting(false);
        }
      };
      const endpointOf = (id) => status?.endpoints?.find((item) => item.id === id);
      const keyName = (id) => {
        const key = status?.keys?.find((item) => item.id === id);
        return key ? keyTitle(key) : "—";
      };
      const last = status?.lastSwitches?.[vendor];
      const switched = last && last.at !== dismissedSwitch && Date.now() - Date.parse(last.at) < SWITCH_NOTICE_MS ? last : null;
      const checking = state.checking[vendor];
      const choosingGroup = choosing ? groups.find((group) => group.endpoint.id === choosing) : null;
      const editingKey = editing ? status?.keys?.find((key) => key.id === editing) : null;
      return h("div", { className: "cn-root" },
        h("div", { className: "cn-head" },
          h("span", { className: "cn-title" }, t("head.title", { vendor: tab })),
          h("span", { className: "cn-spacer" }),
          status === null ? null : h("span", { className: "cn-switch", title: t("head.autoSwitchHint") },
            h(P.Switch, { checked: settings.autoSwitch, label: t("head.autoSwitch"), onChange: (next) => setting({ autoSwitch: next }) }),
            h("span", null, t("head.autoSwitch"))),
          status === null ? null : h("span", { className: "cn-switch", title: t("head.rotateHint") },
            h(P.Switch, { checked: settings.rotateOnRateLimit, label: t("head.rotateOnRateLimit"), disabled: !settings.autoSwitch, onChange: (next) => setting({ rotateOnRateLimit: next }) }),
            h("span", null, t("head.rotateOnRateLimit"))),
          h(P.Button, { className: "cn-btn", size: "sm", variant: "outline", icon: h(ShieldIcon), title: t("head.validateHint"), disabled: Boolean(checking) || keyCount === 0, onClick: () => void checkVendor(vendor, { mode: "validity", deep: true }) }, checking === "validity" ? t("head.validating") : t("head.validate")),
          h(P.Button, { className: "cn-btn", size: "sm", variant: "outline", icon: h(P.IconRefreshOutlineRegular, { size: 14 }), title: t("head.fundsHint"), disabled: Boolean(checking) || !hasFunds, onClick: () => void checkVendor(vendor, { mode: "funds" }) }, checking === "funds" ? t("head.fundsing") : t("head.funds")),
          h(P.Button, { className: "cn-btn", size: "sm", variant: "outline", disabled: exporting || keyCount === 0, onClick: () => void exportKeys() }, exporting ? t("head.exporting") : t("head.export")),
          h(P.Button, { className: "cn-btn", size: "sm", variant: "outline", title: t("head.tabsTitle"), onClick: () => setTabs(true) }, t("head.tabs")),
          h(P.Button, { className: "cn-btn", size: "sm", variant: "primary", onClick: () => setAdding(true) }, t("head.add"))),
        exported ? h("div", { className: "cn-banner", role: "status" },
          h("span", null, t("head.exported", { count: exported.count, path: exported.path })),
          h("button", { type: "button", className: "cn-close", title: t("notice.dismiss"), "aria-label": t("notice.dismiss"), onClick: () => setExported(null) }, "×")) : null,
        switched ? h("div", { className: "cn-banner", role: "status" },
          h("span", null, t("notice.switched", {
            time: clock(switched.at),
            endpoint: endpointOf(switched.endpoint)?.name ?? switched.endpoint,
            from: keyName(switched.from),
            to: keyName(switched.to),
            reason: [switched.model, t(`reason.${switched.reason}`) === `reason.${switched.reason}` ? switched.reason : t(`reason.${switched.reason}`)].filter(Boolean).join(" · "),
          })),
          h("button", { type: "button", className: "cn-close", title: t("notice.dismiss"), "aria-label": t("notice.dismiss"), onClick: () => dismissSwitch(switched.at) }, "×")) : null,
        settingsError ? h("div", { className: "cn-error" }, t("error.generic", { message: settingsError })) : null,
        state.error ? h("div", { className: "cn-error", role: "alert" }, unavailableError(state.error) ? t("error.unavailable") : t("error.generic", { message: state.error })) : null,
        status !== null && keyCount === 0 ? h("div", { className: "cn-empty" },
          h("span", null, t("empty", { vendor: tab })),
          h(P.Button, { className: "cn-btn", size: "sm", variant: "primary", onClick: () => setAdding(true) }, t("head.add"))) : null,
        groups.map((group) => h(EndpointSection, {
          key: group.endpoint.id,
          t,
          endpoint: group.endpoint,
          keys: group.keys,
          models: status?.models?.[group.endpoint.id],
          drag,
          onModels: () => setChoosing(group.endpoint.id),
          onEdit: (key) => setEditing(key.id),
        })),
        adding ? h(AddKeysDialog, { t, status, vendor, onClose: () => setAdding(false) }) : null,
        tabs ? h(TabsDialog, { t, status, onClose: () => setTabs(false) }) : null,
        editingKey ? h(EditKeyDialog, { t, keyInfo: editingKey, endpoint: endpointOf(editingKey.endpoint), onClose: () => setEditing(null) }) : null,
        choosingGroup ? h(ModelsDialog, { t, endpoint: choosingGroup.endpoint, models: status?.models?.[choosingGroup.endpoint.id], onClose: () => setChoosing(null) }) : null);
    }

    /** One component per vendor tab (stable identities, so a re-registration keeps its state). */
    const VIEWS = new Map();
    function viewFor(vendor) {
      if (!VIEWS.has(vendor)) {
        const View = (props) => h("div", { className: "cn-view" }, h(VendorPanel, { ...props, vendor }));
        View.displayName = `CnModels(${tabName(vendor)})`;
        VIEWS.set(vendor, View);
      }
      return VIEWS.get(vendor);
    }

    /**
     * The card inside an endpoint's row of Settings → Models: that endpoint's
     * keys in one line. Keys are managed in the conversation tab.
     */
    function ProviderCard({ t, provider }) {
      useWatch({});
      const state = useCn();
      const route = provider?.provider ?? "";
      const endpointId = route.startsWith("cn-") ? route.slice(3) : null;
      const keys = (state.status?.keys ?? []).filter((key) => key.endpoint === endpointId);
      const active = keys.find((key) => key.active) ?? keys[0];
      const endpoint = state.status?.endpoints?.find((item) => item.id === endpointId);
      const line = state.status === null ? null : keys.length === 0 ? t("card.none") : t("card.summary", { count: keys.length, key: keyTitle(active), state: statusInfo(t, active, endpoint).label });
      return h("div", { className: "cn-summary" },
        unavailableError(state.error) ? h("span", { className: "cn-error" }, t("error.unavailable")) : line ? h("span", null, line) : null);
    }

    // ------------------------------------------------------------------ apply

    const METHODS = ["status", "checkKeys", "addKeys", "importDshKeys", "updateKey", "removeKey", "switchKey", "reorderKeys", "refreshModels", "updateSettings", "exportKeys"];
    const inert = (typeSymbol) => ({ mode: "strict", typeSymbol, create: () => ({ parse: (value) => value }) });
    const descriptors = METHODS.map((method) => ({
      id: `dsh-cn-models#cnModels/${method}`,
      service: "cnModelsKeys",
      namespace: "cnModels",
      method,
      invocation: { kind: "direct" },
      parameters: [{ name: "request", wire: "request", source: "json", codec: inert(`dsh-cn-models/types#${method}Request`) }],
      cancellation: { parameter: "signal" },
      result: inert(`dsh-cn-models/types#${method}Result`),
    }));

    async function apply(ctx) {
      installLocale(ctx);
      const remote = ctx.remote;
      if (remote !== undefined && typeof remote.$mount === "function" && ctx.get("remote.cnModels") === undefined) {
        const unmount = await remote.$mount({ package: "dsh-cn-models", descriptors });
        if (unmount !== undefined) ctx.effect(() => unmount, "dsh-cn-models: remote contribution");
      }
      call = async (method, request) => {
        const service = ctx.get("remote.cnModels");
        if (service === undefined || typeof service[method] !== "function") throw new Error("remote.cnModels is not mounted");
        const result = await service[method](request);
        if (result?.ok === true) return result.value;
        const code = typeof result?.error?.code === "string" ? ` (${result.error.code})` : "";
        throw new Error(`${String(result?.error?.message ?? "request failed")}${code}`);
      };
      const slots = ctx.slots;
      if (slots === undefined) return;
      // One tab per vendor (English labels), minus the hidden ones. The hidden
      // set lives on the host; this browser's copy lets the tabs appear at once.
      const tabs = new Map();
      let shown = null;
      const syncTabs = (hidden) => {
        const signature = hidden.join();
        if (shown === signature) return;
        shown = signature;
        VENDOR_TABS.forEach(([vendor, tab], index) => {
          const wanted = !hidden.includes(vendor);
          if (wanted && !tabs.has(vendor)) {
            tabs.set(vendor, slots.inject("conversation.view", () => slots.register({
              name: "conversation.view",
              id: `cn-${vendor}`,
              order: 31 + index,
              locale: NS,
              label: () => tab,
            }, viewFor(vendor))));
          } else if (!wanted && tabs.has(vendor)) {
            try {
              tabs.get(vendor)?.();
            } catch {
              /* already gone */
            }
            tabs.delete(vendor);
          }
        });
      };
      syncTabs(readHidden());
      const unsubscribe = subscribe(() => {
        const hidden = snapshot.status?.hiddenVendors;
        if (!Array.isArray(hidden)) return;
        writeHidden(hidden);
        syncTabs(hidden);
      });
      ctx.effect(() => () => {
        unsubscribe();
        for (const dispose of tabs.values()) {
          try {
            dispose?.();
          } catch {
            /* already gone */
          }
        }
        tabs.clear();
        shown = null;
      }, "dsh-cn-models: vendor tabs");
      // Learn the hidden tabs from the host even before a tab is opened.
      void loadStatus();
      ctx.effect(() => slots.inject("settings.models.provider-card", () => slots.register({
        name: "settings.models.provider-card",
        key: SETTINGS_NS,
        locale: NS,
      }, ProviderCard)), "dsh-cn-models: models card");
    }

    exports.name = "dsh-cn-models";
    exports.apply = apply;
    exports.inject = ["remote", "slots", "locale"];
    /** Pure helpers, exposed for the self-test only. */
    exports.__internals = Object.freeze({
      duration, clock, money, compact, isLow, statusInfo, addLine, groupsOf, reordered, moved, DICTS, METHODS, VENDOR_TABS,
      /** Seed the shared state (render tests). */
      seed: (patch) => update(patch),
    });
    return module.exports;
  },
});
