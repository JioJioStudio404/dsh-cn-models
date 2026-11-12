# dsh-cn-models

DeepSeek Harness 的国内模型插件，支持 DeepSeek、Kimi、智谱 GLM / Z.ai、MiniMax、通义千问（阿里云百炼 / Qwen Cloud）、小米 MiMo、百度千帆、腾讯云 TokenHub。

## 功能

- 每个接入点可放多个 API Key，显示有效性、余额或套餐额度、今日用量
- 余额不足、额度用尽或 Key 无效时，自动换到下一个 Key；这个接入点没有可用的 Key 时，换到同一厂商其他站点（国内站 / 国际站、其他地域）中计费方式相同、提供同一模型的 Key
- 支持国内 / 国际端点与各家编程套餐（Kimi Code、GLM Coding Plan、MiniMax M Plan、百炼 Coding / Token Plan、Qwen Cloud Token Plan、MiMo / 千帆 Token Plan、腾讯云 Token Plan）
- GLM / Z.ai 按量付费的 Key 显示账户余额，GLM Coding Plan 显示 5 小时与每周额度，MiMo Token Plan 显示本期剩余额度
- 推理强度、工具调用、思考内容回传
- 请求体超限（413）时自动替换旧图片或压缩上下文，最大输出按上下文大小设置，自动压缩按时触发
- 标出 DeepSeek Harness 不支持在对话中途切换到的模型（「切换受限」）
- 按厂商分标签管理，可隐藏不用的厂商

## 安装

需要 Node.js 24.9 或更高版本（DeepSeek Harness 0.2.2 的最低要求）。

```bash
git clone https://github.com/JioJioStudio404/dsh-cn-models.git
dsh plugin --profile desktop add "/path/to/dsh-cn-models"
```

安装后重启 DeepSeek Harness。

## 许可证

MIT
