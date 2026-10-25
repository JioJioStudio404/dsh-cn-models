# dsh-cn-models

DeepSeek Harness 的国内模型插件，支持 DeepSeek、Kimi、智谱 GLM / Z.ai、MiniMax、通义千问（阿里云百炼）、小米 MiMo、百度千帆。

## 功能

- 每个接入点可放多个 API Key，显示有效性、余额或套餐额度、今日用量
- 余额不足、额度用尽或 Key 无效时，自动换到下一个 Key
- 支持国内 / 国际端点与各家编程套餐（Kimi Code、GLM Coding Plan、MiniMax M Plan、百炼 Coding / Token Plan、MiMo / 千帆 Token Plan）
- 推理强度、工具调用、思考内容回传
- 按厂商分标签管理，可隐藏不用的厂商

## 安装

```bash
git clone https://github.com/JioJioStudio404/dsh-cn-models.git
dsh plugin --profile desktop add "/path/to/dsh-cn-models"
```

安装后重启 DeepSeek Harness。

## 许可证

MIT
