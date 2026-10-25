/**
 * Bundled model catalog, generated from models.dev (2026-10-15) — the
 * catalog opencode and DSH's pi-ai use — for the endpoints this plugin knows.
 * Only current, tool-calling chat models are kept. Each endpoint's live
 * `GET /models` list is merged over this at runtime; this snapshot supplies
 * names, limits, image input, and reasoning controls. `recommended` (released
 * since 2026-04-15) is the default selection.
 *
 * Regenerate with the research script; do not edit by hand.
 *
 * @module dsh-cn-models/catalog-data
 */
export const CATALOG_FETCHED = "2026-10-15";

export const CATALOGS = Object.freeze({
 "deepseek": [
  {
   "id": "deepseek-flash",
   "name": "DeepSeek V4.1 Flash",
   "context": 1000000,
   "output": 393216,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-09-10",
   "recommended": true
  },
  {
   "id": "deepseek-v4-pro",
   "name": "DeepSeek V4 Pro",
   "context": 1000000,
   "output": 393216,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-08-12",
   "recommended": true
  }
 ],
 "moonshotai-cn": [
  {
   "id": "kimi-k3",
   "name": "Kimi K3",
   "context": 1048576,
   "output": 1048576,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-07-16",
   "recommended": true
  },
  {
   "id": "kimi-k2.7-code",
   "name": "Kimi K2.7 Code",
   "context": 262144,
   "output": 262144,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-06-12",
   "recommended": true
  },
  {
   "id": "kimi-k2.7-code-highspeed",
   "name": "Kimi K2.7 Code HighSpeed",
   "context": 262144,
   "output": 262144,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-06-12",
   "recommended": true
  },
  {
   "id": "kimi-k2.6",
   "name": "Kimi K2.6",
   "context": 262144,
   "output": 262144,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-21",
   "recommended": true
  }
 ],
 "moonshotai": [
  {
   "id": "kimi-k3",
   "name": "Kimi K3",
   "context": 1048576,
   "output": 1048576,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-07-16",
   "recommended": true
  },
  {
   "id": "kimi-k2.7-code",
   "name": "Kimi K2.7 Code",
   "context": 262144,
   "output": 262144,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-06-12",
   "recommended": true
  },
  {
   "id": "kimi-k2.7-code-highspeed",
   "name": "Kimi K2.7 Code HighSpeed",
   "context": 262144,
   "output": 262144,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-06-12",
   "recommended": true
  },
  {
   "id": "kimi-k2.6",
   "name": "Kimi K2.6",
   "context": 262144,
   "output": 262144,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-21",
   "recommended": true
  }
 ],
 "kimi-code": [
  {
   "id": "kimi-for-coding",
   "name": "kimi-for-coding",
   "context": 1048576,
   "output": 32768,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-09-11",
   "recommended": true
  },
  {
   "id": "k3",
   "name": "Kimi K3",
   "context": 1048576,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-07-16",
   "recommended": true
  },
  {
   "id": "k3-256k",
   "name": "Kimi K3-256K",
   "context": 262144,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-07-16",
   "recommended": true
  },
  {
   "id": "kimi-for-coding-highspeed",
   "name": "Kimi For Coding HighSpeed",
   "context": 262144,
   "output": 32768,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-06-12",
   "recommended": true
  }
 ],
 "zhipuai": [
  {
   "id": "glm-5.3-flashx",
   "name": "GLM-5.3-FlashX",
   "context": 1000000,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-09-18",
   "recommended": true
  },
  {
   "id": "glm-5.3-flash",
   "name": "GLM-5.3-Flash",
   "context": 1000000,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-08-26",
   "recommended": true
  },
  {
   "id": "glm-5.3",
   "name": "GLM-5.3",
   "context": 1000000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-08-14",
   "recommended": true
  },
  {
   "id": "glm-5.2",
   "name": "GLM-5.2",
   "context": 1000000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-06-13",
   "recommended": true
  },
  {
   "id": "glm-5v-turbo",
   "name": "GLM-5V-Turbo",
   "context": 200000,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-01",
   "recommended": false
  },
  {
   "id": "glm-5.1",
   "name": "GLM-5.1",
   "context": 200000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-03-27",
   "recommended": false
  },
  {
   "id": "glm-5",
   "name": "GLM-5",
   "context": 204800,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-02-11",
   "recommended": false
  },
  {
   "id": "glm-4.7-flash",
   "name": "GLM-4.7-Flash",
   "context": 200000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2026-01-19",
   "recommended": false
  },
  {
   "id": "glm-4.7-flashx",
   "name": "GLM-4.7-FlashX",
   "context": 200000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2026-01-19",
   "recommended": false
  },
  {
   "id": "glm-4.7",
   "name": "GLM-4.7",
   "context": 204800,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2025-12-22",
   "recommended": false
  },
  {
   "id": "glm-4.6v",
   "name": "GLM-4.6V",
   "context": 128000,
   "output": 32768,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-12-08",
   "recommended": false
  },
  {
   "id": "glm-4.6v-flash",
   "name": "GLM-4.6V-Flash",
   "context": 128000,
   "output": 32768,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-12-08",
   "recommended": false
  },
  {
   "id": "glm-4.6",
   "name": "GLM-4.6",
   "context": 204800,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-09-30",
   "recommended": false
  },
  {
   "id": "glm-4.5v",
   "name": "GLM-4.5V",
   "context": 64000,
   "output": 16384,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-08-11",
   "recommended": false
  },
  {
   "id": "glm-4.5",
   "name": "GLM-4.5",
   "context": 131072,
   "output": 98304,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-07-28",
   "recommended": false
  },
  {
   "id": "glm-4.5-air",
   "name": "GLM-4.5-Air",
   "context": 131072,
   "output": 98304,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-07-28",
   "recommended": false
  },
  {
   "id": "glm-4.5-flash",
   "name": "GLM-4.5-Flash",
   "context": 131072,
   "output": 98304,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-07-28",
   "recommended": false
  }
 ],
 "zai": [
  {
   "id": "glm-5.3-flashx",
   "name": "GLM-5.3-FlashX",
   "context": 1000000,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-09-18",
   "recommended": true
  },
  {
   "id": "glm-5.3-flash",
   "name": "GLM-5.3-Flash",
   "context": 1000000,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-08-26",
   "recommended": true
  },
  {
   "id": "glm-5.3",
   "name": "GLM-5.3",
   "context": 1000000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-08-14",
   "recommended": true
  },
  {
   "id": "glm-5.2",
   "name": "GLM-5.2",
   "context": 1000000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-06-13",
   "recommended": true
  },
  {
   "id": "glm-5.1",
   "name": "GLM-5.1",
   "context": 200000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-07",
   "recommended": false
  },
  {
   "id": "glm-5v-turbo",
   "name": "GLM-5V-Turbo",
   "context": 200000,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-01",
   "recommended": false
  },
  {
   "id": "glm-5-turbo",
   "name": "GLM-5-Turbo",
   "context": 200000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-03-16",
   "recommended": false
  },
  {
   "id": "glm-5",
   "name": "GLM-5",
   "context": 204800,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-02-12",
   "recommended": false
  },
  {
   "id": "glm-4.7-flash",
   "name": "GLM-4.7-Flash",
   "context": 200000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2026-01-19",
   "recommended": false
  },
  {
   "id": "glm-4.7-flashx",
   "name": "GLM-4.7-FlashX",
   "context": 200000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2026-01-19",
   "recommended": false
  },
  {
   "id": "glm-4.7",
   "name": "GLM-4.7",
   "context": 204800,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2025-12-22",
   "recommended": false
  },
  {
   "id": "glm-4.6v",
   "name": "GLM-4.6V",
   "context": 128000,
   "output": 32768,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-12-08",
   "recommended": false
  },
  {
   "id": "glm-4.6v-flash",
   "name": "GLM-4.6V-Flash",
   "context": 128000,
   "output": 32768,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-12-08",
   "recommended": false
  },
  {
   "id": "glm-4.6",
   "name": "GLM-4.6",
   "context": 204800,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-09-30",
   "recommended": false
  },
  {
   "id": "glm-4.5v",
   "name": "GLM-4.5V",
   "context": 64000,
   "output": 16384,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-08-11",
   "recommended": false
  },
  {
   "id": "glm-4.5",
   "name": "GLM-4.5",
   "context": 131072,
   "output": 98304,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-07-28",
   "recommended": false
  },
  {
   "id": "glm-4.5-air",
   "name": "GLM-4.5-Air",
   "context": 131072,
   "output": 98304,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-07-28",
   "recommended": false
  },
  {
   "id": "glm-4.5-flash",
   "name": "GLM-4.5-Flash",
   "context": 131072,
   "output": 98304,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-07-28",
   "recommended": false
  }
 ],
 "zhipuai-coding-plan": [
  {
   "id": "glm-5.3-flash",
   "name": "GLM-5.3-Flash",
   "context": 1000000,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-08-26",
   "recommended": true
  },
  {
   "id": "glm-5.3",
   "name": "GLM-5.3",
   "context": 1000000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-08-14",
   "recommended": true
  },
  {
   "id": "glm-5.3-highspeed",
   "name": "GLM-5.3 Highspeed",
   "context": 1000000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-08-14",
   "recommended": true
  },
  {
   "id": "glm-4.6v",
   "name": "GLM-4.6V",
   "context": 128000,
   "output": 32768,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-12-08",
   "recommended": true
  }
 ],
 "zai-coding-plan": [
  {
   "id": "glm-5.3-flash",
   "name": "GLM-5.3-Flash",
   "context": 1000000,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-08-26",
   "recommended": true
  },
  {
   "id": "glm-5.3",
   "name": "GLM-5.3",
   "context": 1000000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-08-14",
   "recommended": true
  },
  {
   "id": "glm-5.3-highspeed",
   "name": "GLM-5.3 Highspeed",
   "context": 1000000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-08-14",
   "recommended": true
  },
  {
   "id": "glm-5.2",
   "name": "GLM-5.2",
   "context": 1000000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-06-13",
   "recommended": true
  },
  {
   "id": "glm-5.2-highspeed",
   "name": "GLM-5.2 Highspeed",
   "context": 1000000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-06-13",
   "recommended": true
  },
  {
   "id": "glm-5-turbo",
   "name": "GLM-5-Turbo",
   "context": 200000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-03-16",
   "recommended": true
  },
  {
   "id": "glm-4.7",
   "name": "GLM-4.7",
   "context": 204800,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2025-12-22",
   "recommended": true
  }
 ],
 "minimax-cn": [
  {
   "id": "MiniMax-M3.1-Flash-Preview",
   "name": "MiniMax-M3.1-Flash-Preview",
   "context": 1000000,
   "output": 512000,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "medium",
     "high",
     "xhigh",
     "max"
    ],
    "budget": false
   },
   "interleaved": false,
   "released": "2026-09-27",
   "recommended": true
  },
  {
   "id": "MiniMax-M3",
   "name": "MiniMax-M3",
   "context": 1000000,
   "output": 512000,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2026-06-01",
   "recommended": true
  },
  {
   "id": "MiniMax-M2.7",
   "name": "MiniMax-M2.7",
   "context": 204800,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2026-03-18",
   "recommended": false,
   "retiring": "2026-11-18"
  },
  {
   "id": "MiniMax-M2.7-highspeed",
   "name": "MiniMax-M2.7-highspeed",
   "context": 204800,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2026-03-18",
   "recommended": false,
   "retiring": "2026-11-18"
  },
  {
   "id": "MiniMax-M2.5-highspeed",
   "name": "MiniMax-M2.5-highspeed",
   "context": 204800,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2026-02-13",
   "recommended": true
  },
  {
   "id": "MiniMax-M2.5",
   "name": "MiniMax-M2.5",
   "context": 204800,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2026-02-12",
   "recommended": true
  },
  {
   "id": "MiniMax-M2.1",
   "name": "MiniMax-M2.1",
   "context": 204800,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-12-23",
   "recommended": true
  },
  {
   "id": "MiniMax-M2",
   "name": "MiniMax-M2",
   "context": 204800,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-10-27",
   "recommended": true
  }
 ],
 "minimax": [
  {
   "id": "MiniMax-M3.1-Flash-Preview",
   "name": "MiniMax-M3.1-Flash-Preview",
   "context": 1000000,
   "output": 512000,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "medium",
     "high",
     "xhigh",
     "max"
    ],
    "budget": false
   },
   "interleaved": false,
   "released": "2026-09-27",
   "recommended": true
  },
  {
   "id": "MiniMax-M3",
   "name": "MiniMax-M3",
   "context": 1000000,
   "output": 512000,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2026-06-01",
   "recommended": true
  },
  {
   "id": "MiniMax-M2.7",
   "name": "MiniMax-M2.7",
   "context": 204800,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2026-03-18",
   "recommended": false,
   "retiring": "2026-11-18"
  },
  {
   "id": "MiniMax-M2.7-highspeed",
   "name": "MiniMax-M2.7-highspeed",
   "context": 204800,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2026-03-18",
   "recommended": false,
   "retiring": "2026-11-18"
  },
  {
   "id": "MiniMax-M2.5-highspeed",
   "name": "MiniMax-M2.5-highspeed",
   "context": 204800,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2026-02-13",
   "recommended": true
  },
  {
   "id": "MiniMax-M2.5",
   "name": "MiniMax-M2.5",
   "context": 204800,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2026-02-12",
   "recommended": true
  },
  {
   "id": "MiniMax-M2.1",
   "name": "MiniMax-M2.1",
   "context": 204800,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-12-23",
   "recommended": true
  },
  {
   "id": "MiniMax-M2",
   "name": "MiniMax-M2",
   "context": 204800,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-10-27",
   "recommended": true
  }
 ],
 "alibaba-cn": [
  {
   "id": "deepseek-v4.1-flash",
   "name": "DeepSeek V4.1 Flash",
   "context": 1000000,
   "output": 384000,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-09-10",
   "recommended": true
  },
  {
   "id": "qwen3.8-flash",
   "name": "Qwen3.8 Flash",
   "context": 1000000,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "low",
     "medium",
     "xhigh"
    ],
    "budget": true
   },
   "interleaved": true,
   "released": "2026-08-26",
   "recommended": true
  },
  {
   "id": "glm-5.3",
   "name": "GLM-5.3",
   "context": 1000000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-08-14",
   "recommended": true
  },
  {
   "id": "qwen3.8-max",
   "name": "Qwen3.8 Max",
   "context": 1000000,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "low",
     "medium",
     "xhigh"
    ],
    "budget": true
   },
   "interleaved": true,
   "released": "2026-08-03",
   "recommended": true
  },
  {
   "id": "kimi-k3",
   "name": "Kimi K3",
   "context": 1048576,
   "output": 1048576,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-07-16",
   "recommended": true
  },
  {
   "id": "qwen3.7-flash",
   "name": "Qwen3.7 Flash",
   "context": 1000000,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2026-07-15",
   "recommended": true
  },
  {
   "id": "glm-5.2",
   "name": "GLM-5.2",
   "context": 1000000,
   "output": 128000,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-06-13",
   "recommended": true
  },
  {
   "id": "qwen3.7-plus",
   "name": "Qwen3.7 Plus",
   "context": 1000000,
   "output": 64000,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2026-06-02",
   "recommended": true
  },
  {
   "id": "qwen3.7-max",
   "name": "Qwen3.7 Max",
   "context": 1000000,
   "output": 65536,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2026-05-21",
   "recommended": true
  },
  {
   "id": "qwen3.6-flash",
   "name": "Qwen3.6 Flash",
   "context": 1000000,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2026-04-27",
   "recommended": true
  },
  {
   "id": "deepseek-v4-flash",
   "name": "DeepSeek V4 Flash",
   "context": 1000000,
   "output": 384000,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-24",
   "recommended": true
  },
  {
   "id": "deepseek-v4-pro",
   "name": "DeepSeek V4 Pro",
   "context": 1000000,
   "output": 384000,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-24",
   "recommended": true
  },
  {
   "id": "kimi-k2.6",
   "name": "Moonshot Kimi K2.6",
   "context": 262144,
   "output": 16384,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-04-21",
   "recommended": true
  },
  {
   "id": "qwen3.6-max-preview",
   "name": "Qwen3.6 Max Preview",
   "context": 245800,
   "output": 65536,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2026-04-20",
   "recommended": true
  },
  {
   "id": "glm-5.1",
   "name": "GLM-5.1",
   "context": 202752,
   "output": 128000,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-04-14",
   "recommended": false
  },
  {
   "id": "qwen3.6-plus",
   "name": "Qwen3.6 Plus",
   "context": 1000000,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2026-04-02",
   "recommended": false
  },
  {
   "id": "MiniMax/MiniMax-M2.7",
   "name": "MiniMax-M2.7",
   "context": 204800,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2026-03-18",
   "recommended": false
  },
  {
   "id": "qwen3.5-flash",
   "name": "Qwen3.5 Flash",
   "context": 1000000,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-02-23",
   "recommended": false
  },
  {
   "id": "qwen3.5-397b-a17b",
   "name": "Qwen3.5 397B-A17B",
   "context": 262144,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2026-02-16",
   "recommended": false
  },
  {
   "id": "qwen3.5-plus",
   "name": "Qwen3.5 Plus",
   "context": 1000000,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-02-16",
   "recommended": false
  },
  {
   "id": "MiniMax-M2.5",
   "name": "MiniMax-M2.5",
   "context": 204800,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-02-12",
   "recommended": false
  },
  {
   "id": "glm-5",
   "name": "GLM-5",
   "context": 202752,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-02-11",
   "recommended": false
  },
  {
   "id": "kimi-k2.5",
   "name": "Moonshot Kimi K2.5",
   "context": 262144,
   "output": 32768,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-01-27",
   "recommended": false
  },
  {
   "id": "kimi/kimi-k2.5",
   "name": "kimi/kimi-k2.5",
   "context": 262144,
   "output": 262144,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-01-27",
   "recommended": false
  },
  {
   "id": "qwen3-max",
   "name": "Qwen3 Max",
   "context": 262144,
   "output": 65536,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-01-23",
   "recommended": false
  },
  {
   "id": "siliconflow/deepseek-v3.2",
   "name": "siliconflow/deepseek-v3.2",
   "context": 163840,
   "output": 65536,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-12-03",
   "recommended": false
  },
  {
   "id": "kimi-k2-thinking",
   "name": "Moonshot Kimi K2 Thinking",
   "context": 262144,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2025-11-06",
   "recommended": false
  },
  {
   "id": "siliconflow/deepseek-v3.1-terminus",
   "name": "siliconflow/deepseek-v3.1-terminus",
   "context": 163840,
   "output": 65536,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-09-29",
   "recommended": false
  },
  {
   "id": "qwen3-vl-plus",
   "name": "Qwen3-VL Plus",
   "context": 262144,
   "output": 32768,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2025-09-23",
   "recommended": false
  },
  {
   "id": "qwen3-next-80b-a3b-instruct",
   "name": "Qwen3-Next 80B-A3B Instruct",
   "context": 131072,
   "output": 32768,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2025-09",
   "recommended": false
  },
  {
   "id": "qwen3-next-80b-a3b-thinking",
   "name": "Qwen3-Next 80B-A3B (Thinking)",
   "context": 131072,
   "output": 32768,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2025-09",
   "recommended": false
  },
  {
   "id": "qwen-flash",
   "name": "Qwen Flash",
   "context": 1000000,
   "output": 32768,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2025-07-28",
   "recommended": false
  },
  {
   "id": "qwen3-coder-flash",
   "name": "Qwen3 Coder Flash",
   "context": 1000000,
   "output": 65536,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2025-07-28",
   "recommended": false
  },
  {
   "id": "qwen3-coder-plus",
   "name": "Qwen3 Coder Plus",
   "context": 1048576,
   "output": 65536,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2025-07-23",
   "recommended": false
  },
  {
   "id": "deepseek-r1-0528",
   "name": "DeepSeek R1 0528",
   "context": 131072,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-05-28",
   "recommended": false
  },
  {
   "id": "siliconflow/deepseek-r1-0528",
   "name": "siliconflow/deepseek-r1-0528",
   "context": 163840,
   "output": 32768,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-05-28",
   "recommended": false
  },
  {
   "id": "qwen3-14b",
   "name": "Qwen3 14B",
   "context": 131072,
   "output": 8192,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2025-04",
   "recommended": false
  },
  {
   "id": "qwen3-235b-a22b",
   "name": "Qwen3 235B-A22B",
   "context": 131072,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2025-04",
   "recommended": false
  },
  {
   "id": "qwen3-32b",
   "name": "Qwen3 32B",
   "context": 131072,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2025-04",
   "recommended": false
  },
  {
   "id": "qwen3-8b",
   "name": "Qwen3 8B",
   "context": 131072,
   "output": 8192,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2025-04",
   "recommended": false
  },
  {
   "id": "qwen3-coder-30b-a3b-instruct",
   "name": "Qwen3-Coder 30B-A3B Instruct",
   "context": 262144,
   "output": 65536,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2025-04",
   "recommended": false
  },
  {
   "id": "qwen3-coder-480b-a35b-instruct",
   "name": "Qwen3-Coder 480B-A35B Instruct",
   "context": 262144,
   "output": 65536,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2025-04",
   "recommended": false
  },
  {
   "id": "qwen3-vl-235b-a22b",
   "name": "Qwen3-VL 235B-A22B",
   "context": 131072,
   "output": 32768,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-04",
   "recommended": false
  },
  {
   "id": "qwen3-vl-30b-a3b",
   "name": "Qwen3-VL 30B-A3B",
   "context": 131072,
   "output": 32768,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-04",
   "recommended": false
  },
  {
   "id": "qvq-max",
   "name": "QVQ Max",
   "context": 131072,
   "output": 8192,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-03-25",
   "recommended": false
  },
  {
   "id": "qwq-plus",
   "name": "QwQ Plus",
   "context": 131072,
   "output": 8192,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-03-05",
   "recommended": false
  },
  {
   "id": "qwen-long",
   "name": "Qwen Long",
   "context": 10000000,
   "output": 8192,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2025-01-25",
   "recommended": false
  },
  {
   "id": "deepseek-r1",
   "name": "DeepSeek R1",
   "context": 131072,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-01-01",
   "recommended": false
  },
  {
   "id": "deepseek-r1-distill-llama-70b",
   "name": "DeepSeek R1 Distill Llama 70B",
   "context": 32768,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-01-01",
   "recommended": false
  },
  {
   "id": "deepseek-r1-distill-llama-8b",
   "name": "DeepSeek R1 Distill Llama 8B",
   "context": 32768,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-01-01",
   "recommended": false
  },
  {
   "id": "deepseek-r1-distill-qwen-1-5b",
   "name": "DeepSeek R1 Distill Qwen 1.5B",
   "context": 32768,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-01-01",
   "recommended": false
  },
  {
   "id": "deepseek-r1-distill-qwen-14b",
   "name": "DeepSeek R1 Distill Qwen 14B",
   "context": 32768,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-01-01",
   "recommended": false
  },
  {
   "id": "deepseek-r1-distill-qwen-32b",
   "name": "DeepSeek R1 Distill Qwen 32B",
   "context": 32768,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-01-01",
   "recommended": false
  },
  {
   "id": "deepseek-r1-distill-qwen-7b",
   "name": "DeepSeek R1 Distill Qwen 7B",
   "context": 32768,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-01-01",
   "recommended": false
  },
  {
   "id": "deepseek-v3-1",
   "name": "DeepSeek V3.1",
   "context": 131072,
   "output": 65536,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2025-01-01",
   "recommended": false
  },
  {
   "id": "deepseek-v3-2-exp",
   "name": "DeepSeek V3.2 Exp",
   "context": 131072,
   "output": 65536,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2025-01-01",
   "recommended": false
  },
  {
   "id": "moonshot-kimi-k2-instruct",
   "name": "Moonshot Kimi K2 Instruct",
   "context": 131072,
   "output": 8192,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2025-01-01",
   "recommended": false
  },
  {
   "id": "siliconflow/deepseek-v3-0324",
   "name": "siliconflow/deepseek-v3-0324",
   "context": 163840,
   "output": 163840,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-12-26",
   "recommended": false
  },
  {
   "id": "deepseek-v3",
   "name": "DeepSeek V3",
   "context": 65536,
   "output": 8192,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-12-01",
   "recommended": false
  },
  {
   "id": "qwq-32b",
   "name": "QwQ 32B",
   "context": 131072,
   "output": 8192,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2024-12",
   "recommended": false
  },
  {
   "id": "qwen-turbo",
   "name": "Qwen Turbo",
   "context": 1000000,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2024-11-01",
   "recommended": false
  },
  {
   "id": "qwen2-5-coder-32b-instruct",
   "name": "Qwen2.5-Coder 32B Instruct",
   "context": 131072,
   "output": 8192,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-11",
   "recommended": false
  },
  {
   "id": "qwen2-5-coder-7b-instruct",
   "name": "Qwen2.5-Coder 7B Instruct",
   "context": 131072,
   "output": 8192,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-11",
   "recommended": false
  },
  {
   "id": "qwen-math-turbo",
   "name": "Qwen Math Turbo",
   "context": 4096,
   "output": 3072,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-09-19",
   "recommended": false
  },
  {
   "id": "qwen2-5-14b-instruct",
   "name": "Qwen2.5 14B Instruct",
   "context": 131072,
   "output": 8192,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-09",
   "recommended": false
  },
  {
   "id": "qwen2-5-32b-instruct",
   "name": "Qwen2.5 32B Instruct",
   "context": 131072,
   "output": 8192,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-09",
   "recommended": false
  },
  {
   "id": "qwen2-5-72b-instruct",
   "name": "Qwen2.5 72B Instruct",
   "context": 131072,
   "output": 8192,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-09",
   "recommended": false
  },
  {
   "id": "qwen2-5-7b-instruct",
   "name": "Qwen2.5 7B Instruct",
   "context": 131072,
   "output": 8192,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-09",
   "recommended": false
  },
  {
   "id": "qwen2-5-math-72b-instruct",
   "name": "Qwen2.5-Math 72B Instruct",
   "context": 4096,
   "output": 3072,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-09",
   "recommended": false
  },
  {
   "id": "qwen2-5-math-7b-instruct",
   "name": "Qwen2.5-Math 7B Instruct",
   "context": 4096,
   "output": 3072,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-09",
   "recommended": false
  },
  {
   "id": "qwen2-5-vl-72b-instruct",
   "name": "Qwen2.5-VL 72B Instruct",
   "context": 131072,
   "output": 8192,
   "image": true,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-09",
   "recommended": false
  },
  {
   "id": "qwen2-5-vl-7b-instruct",
   "name": "Qwen2.5-VL 7B Instruct",
   "context": 131072,
   "output": 8192,
   "image": true,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-09",
   "recommended": false
  },
  {
   "id": "qwen-math-plus",
   "name": "Qwen Math Plus",
   "context": 4096,
   "output": 3072,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-08-16",
   "recommended": false
  },
  {
   "id": "qwen-vl-max",
   "name": "Qwen-VL Max",
   "context": 131072,
   "output": 8192,
   "image": true,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-04-08",
   "recommended": false
  },
  {
   "id": "qwen-max",
   "name": "Qwen Max",
   "context": 131072,
   "output": 8192,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-04-03",
   "recommended": false
  },
  {
   "id": "qwen-plus",
   "name": "Qwen Plus",
   "context": 1000000,
   "output": 32768,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2024-01-25",
   "recommended": false
  },
  {
   "id": "qwen-vl-plus",
   "name": "Qwen-VL Plus",
   "context": 131072,
   "output": 8192,
   "image": true,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-01-25",
   "recommended": false
  },
  {
   "id": "qwen-deep-research",
   "name": "Qwen Deep Research",
   "context": 1000000,
   "output": 32768,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-01",
   "recommended": false
  },
  {
   "id": "qwen-doc-turbo",
   "name": "Qwen Doc Turbo",
   "context": 131072,
   "output": 8192,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-01",
   "recommended": false
  },
  {
   "id": "qwen-plus-character",
   "name": "Qwen Plus Character",
   "context": 32768,
   "output": 4096,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-01",
   "recommended": false
  }
 ],
 "alibaba": [
  {
   "id": "qwen3.8-flash",
   "name": "Qwen3.8 Flash",
   "context": 1000000,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "low",
     "medium",
     "xhigh"
    ],
    "budget": true
   },
   "interleaved": true,
   "released": "2026-08-26",
   "recommended": true
  },
  {
   "id": "qwen3.8-max",
   "name": "Qwen3.8 Max",
   "context": 1000000,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "low",
     "medium",
     "xhigh"
    ],
    "budget": true
   },
   "interleaved": true,
   "released": "2026-08-03",
   "recommended": true
  },
  {
   "id": "deepseek-v4-flash-0731",
   "name": "DeepSeek V4 Flash 0731",
   "context": 1000000,
   "output": 384000,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-07-31",
   "recommended": true
  },
  {
   "id": "kimi-k3",
   "name": "Kimi K3",
   "context": 1048576,
   "output": 1048576,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-07-16",
   "recommended": true
  },
  {
   "id": "qwen3.7-flash",
   "name": "Qwen3.7 Flash",
   "context": 1000000,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-07-15",
   "recommended": true
  },
  {
   "id": "glm-5.2",
   "name": "GLM-5.2",
   "context": 1000000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "none",
     "minimal",
     "low",
     "medium",
     "high",
     "xhigh",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-06-13",
   "recommended": true
  },
  {
   "id": "qwen3.7-plus",
   "name": "Qwen3.7 Plus",
   "context": 1000000,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-06-02",
   "recommended": true
  },
  {
   "id": "qwen3.7-max",
   "name": "Qwen3.7 Max",
   "context": 1000000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2026-05-21",
   "recommended": true
  },
  {
   "id": "qwen3.6-flash",
   "name": "Qwen3.6 Flash",
   "context": 1000000,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2026-04-27",
   "recommended": true
  },
  {
   "id": "qwen3.6-27b",
   "name": "Qwen3.6 27B",
   "context": 262144,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2026-04-22",
   "recommended": true
  },
  {
   "id": "qwen3.6-max-preview",
   "name": "Qwen3.6 Max Preview",
   "context": 262144,
   "output": 65536,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2026-04-20",
   "recommended": true
  },
  {
   "id": "qwen3.6-35b-a3b",
   "name": "Qwen3.6 35B-A3B",
   "context": 262144,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2026-04-17",
   "recommended": true
  },
  {
   "id": "qwen3.6-plus",
   "name": "Qwen3.6 Plus",
   "context": 1000000,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2026-04-02",
   "recommended": false
  },
  {
   "id": "qwen3.5-122b-a10b",
   "name": "Qwen3.5 122B-A10B",
   "context": 262144,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2026-02-23",
   "recommended": false
  },
  {
   "id": "qwen3.5-27b",
   "name": "Qwen3.5 27B",
   "context": 262144,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2026-02-23",
   "recommended": false
  },
  {
   "id": "qwen3.5-35b-a3b",
   "name": "Qwen3.5 35B-A3B",
   "context": 262144,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2026-02-23",
   "recommended": false
  },
  {
   "id": "qwen3.5-flash",
   "name": "Qwen3.5 Flash",
   "context": 1000000,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-02-23",
   "recommended": false
  },
  {
   "id": "qwen3.5-plus",
   "name": "Qwen3.5 Plus",
   "context": 1000000,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2026-02-16",
   "recommended": false
  },
  {
   "id": "qwen3.5-397b-a17b",
   "name": "Qwen3.5 397B-A17B",
   "context": 262144,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2026-02-15",
   "recommended": false
  },
  {
   "id": "qwen3-max",
   "name": "Qwen3 Max",
   "context": 262144,
   "output": 65536,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2025-09-23",
   "recommended": false
  },
  {
   "id": "qwen3-vl-plus",
   "name": "Qwen3-VL Plus",
   "context": 262144,
   "output": 32768,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2025-09-23",
   "recommended": false
  },
  {
   "id": "qwen3-next-80b-a3b-instruct",
   "name": "Qwen3-Next 80B-A3B Instruct",
   "context": 131072,
   "output": 32768,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2025-09",
   "recommended": false
  },
  {
   "id": "qwen3-next-80b-a3b-thinking",
   "name": "Qwen3-Next 80B-A3B (Thinking)",
   "context": 131072,
   "output": 32768,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2025-09",
   "recommended": false
  },
  {
   "id": "qwen-flash",
   "name": "Qwen Flash",
   "context": 1000000,
   "output": 32768,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2025-07-28",
   "recommended": false
  },
  {
   "id": "qwen3-coder-flash",
   "name": "Qwen3 Coder Flash",
   "context": 1000000,
   "output": 65536,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2025-07-28",
   "recommended": false
  },
  {
   "id": "qwen3-coder-plus",
   "name": "Qwen3 Coder Plus",
   "context": 1048576,
   "output": 65536,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2025-07-23",
   "recommended": false
  },
  {
   "id": "qwen3-14b",
   "name": "Qwen3 14B",
   "context": 131072,
   "output": 8192,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2025-04",
   "recommended": false
  },
  {
   "id": "qwen3-235b-a22b",
   "name": "Qwen3 235B-A22B",
   "context": 131072,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2025-04",
   "recommended": false
  },
  {
   "id": "qwen3-32b",
   "name": "Qwen3 32B",
   "context": 131072,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2025-04",
   "recommended": false
  },
  {
   "id": "qwen3-8b",
   "name": "Qwen3 8B",
   "context": 131072,
   "output": 8192,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2025-04",
   "recommended": false
  },
  {
   "id": "qwen3-coder-30b-a3b-instruct",
   "name": "Qwen3-Coder 30B-A3B Instruct",
   "context": 262144,
   "output": 65536,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2025-04",
   "recommended": false
  },
  {
   "id": "qwen3-coder-480b-a35b-instruct",
   "name": "Qwen3-Coder 480B-A35B Instruct",
   "context": 262144,
   "output": 65536,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2025-04",
   "recommended": false
  },
  {
   "id": "qwen3-vl-235b-a22b",
   "name": "Qwen3-VL 235B-A22B",
   "context": 131072,
   "output": 32768,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2025-04",
   "recommended": false
  },
  {
   "id": "qwen3-vl-30b-a3b",
   "name": "Qwen3-VL 30B-A3B",
   "context": 131072,
   "output": 32768,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2025-04",
   "recommended": false
  },
  {
   "id": "qvq-max",
   "name": "QVQ Max",
   "context": 131072,
   "output": 8192,
   "image": true,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-03-25",
   "recommended": false
  },
  {
   "id": "qwq-plus",
   "name": "QwQ Plus",
   "context": 131072,
   "output": 8192,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-03-05",
   "recommended": false
  },
  {
   "id": "qwen-turbo",
   "name": "Qwen Turbo",
   "context": 1000000,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2024-11-01",
   "recommended": false
  },
  {
   "id": "qwen2-5-14b-instruct",
   "name": "Qwen2.5 14B Instruct",
   "context": 131072,
   "output": 8192,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-09",
   "recommended": false
  },
  {
   "id": "qwen2-5-32b-instruct",
   "name": "Qwen2.5 32B Instruct",
   "context": 131072,
   "output": 8192,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-09",
   "recommended": false
  },
  {
   "id": "qwen2-5-72b-instruct",
   "name": "Qwen2.5 72B Instruct",
   "context": 131072,
   "output": 8192,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-09",
   "recommended": false
  },
  {
   "id": "qwen2-5-7b-instruct",
   "name": "Qwen2.5 7B Instruct",
   "context": 131072,
   "output": 8192,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-09",
   "recommended": false
  },
  {
   "id": "qwen2-5-vl-72b-instruct",
   "name": "Qwen2.5-VL 72B Instruct",
   "context": 131072,
   "output": 8192,
   "image": true,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-09",
   "recommended": false
  },
  {
   "id": "qwen2-5-vl-7b-instruct",
   "name": "Qwen2.5-VL 7B Instruct",
   "context": 131072,
   "output": 8192,
   "image": true,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-09",
   "recommended": false
  },
  {
   "id": "qwen-vl-max",
   "name": "Qwen-VL Max",
   "context": 131072,
   "output": 8192,
   "image": true,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-04-08",
   "recommended": false
  },
  {
   "id": "qwen-max",
   "name": "Qwen Max",
   "context": 32768,
   "output": 8192,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-04-03",
   "recommended": false
  },
  {
   "id": "qwen-plus",
   "name": "Qwen Plus",
   "context": 1000000,
   "output": 32768,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": false,
   "released": "2024-01-25",
   "recommended": false
  },
  {
   "id": "qwen-vl-plus",
   "name": "Qwen-VL Plus",
   "context": 131072,
   "output": 8192,
   "image": true,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-01-25",
   "recommended": false
  },
  {
   "id": "qwen-plus-character-ja",
   "name": "Qwen Plus Character (Japanese)",
   "context": 8192,
   "output": 512,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2024-01",
   "recommended": false
  }
 ],
 "alibaba-coding-plan-cn": [
  {
   "id": "qwen3.7-plus",
   "name": "Qwen3.7 Plus",
   "context": 1000000,
   "output": 64000,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2026-06-02",
   "recommended": true
  },
  {
   "id": "qwen3.6-plus",
   "name": "Qwen3.6 Plus",
   "context": 1000000,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2026-04-02",
   "recommended": true
  },
  {
   "id": "qwen3.5-plus",
   "name": "Qwen3.5 Plus",
   "context": 1000000,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2026-02-16",
   "recommended": true
  },
  {
   "id": "MiniMax-M2.5",
   "name": "MiniMax-M2.5",
   "context": 196608,
   "output": 24576,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-02-12",
   "recommended": true
  },
  {
   "id": "glm-5",
   "name": "GLM-5",
   "context": 202752,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-02-11",
   "recommended": true
  },
  {
   "id": "qwen3-coder-next",
   "name": "Qwen3 Coder Next",
   "context": 262144,
   "output": 65536,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2026-02-03",
   "recommended": true
  },
  {
   "id": "kimi-k2.5",
   "name": "Kimi K2.5",
   "context": 262144,
   "output": 32768,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-01-27",
   "recommended": true
  },
  {
   "id": "qwen3-max-2026-01-23",
   "name": "Qwen3 Max",
   "context": 262144,
   "output": 32768,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2026-01-23",
   "recommended": true
  },
  {
   "id": "glm-4.7",
   "name": "GLM-4.7",
   "context": 202752,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2025-12-22",
   "recommended": true
  },
  {
   "id": "qwen3-coder-plus",
   "name": "Qwen3 Coder Plus",
   "context": 1000000,
   "output": 65536,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2025-07-23",
   "recommended": true
  }
 ],
 "alibaba-coding-plan": [
  {
   "id": "qwen3.7-plus",
   "name": "Qwen3.7 Plus",
   "context": 1000000,
   "output": 64000,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2026-06-02",
   "recommended": true
  },
  {
   "id": "qwen3.6-plus",
   "name": "Qwen3.6 Plus",
   "context": 1000000,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2026-04-02",
   "recommended": true
  },
  {
   "id": "qwen3.5-plus",
   "name": "Qwen3.5 Plus",
   "context": 1000000,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2026-02-16",
   "recommended": true
  },
  {
   "id": "MiniMax-M2.5",
   "name": "MiniMax-M2.5",
   "context": 196608,
   "output": 24576,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-02-12",
   "recommended": true
  },
  {
   "id": "glm-5",
   "name": "GLM-5",
   "context": 202752,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-02-11",
   "recommended": true
  },
  {
   "id": "qwen3-coder-next",
   "name": "Qwen3 Coder Next",
   "context": 262144,
   "output": 65536,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2026-02-03",
   "recommended": true
  },
  {
   "id": "kimi-k2.5",
   "name": "Kimi K2.5",
   "context": 262144,
   "output": 32768,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-01-27",
   "recommended": true
  },
  {
   "id": "qwen3-max-2026-01-23",
   "name": "Qwen3 Max",
   "context": 262144,
   "output": 32768,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2026-01-23",
   "recommended": true
  },
  {
   "id": "glm-4.7",
   "name": "GLM-4.7",
   "context": 202752,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2025-12-22",
   "recommended": true
  },
  {
   "id": "qwen3-coder-plus",
   "name": "Qwen3 Coder Plus",
   "context": 1000000,
   "output": 65536,
   "image": false,
   "reasoning": null,
   "interleaved": false,
   "released": "2025-07-23",
   "recommended": true
  }
 ],
 "alibaba-token-plan-cn": [
  {
   "id": "deepseek-v4.1-flash",
   "name": "DeepSeek V4.1 Flash",
   "context": 1000000,
   "output": 384000,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-09-10",
   "recommended": true
  },
  {
   "id": "qwen3.8-flash",
   "name": "Qwen3.8 Flash",
   "context": 1000000,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "low",
     "medium",
     "xhigh"
    ],
    "budget": true
   },
   "interleaved": true,
   "released": "2026-08-26",
   "recommended": true
  },
  {
   "id": "glm-5.3",
   "name": "GLM-5.3",
   "context": 1000000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-08-14",
   "recommended": true
  },
  {
   "id": "deepseek-v4-pro-0813",
   "name": "DeepSeek V4 Pro 0813",
   "context": 1000000,
   "output": 384000,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-08-12",
   "recommended": true
  },
  {
   "id": "qwen3.8-max",
   "name": "Qwen3.8 Max",
   "context": 1000000,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "low",
     "medium",
     "xhigh"
    ],
    "budget": true
   },
   "interleaved": true,
   "released": "2026-08-03",
   "recommended": true
  },
  {
   "id": "deepseek-v4-flash-0731",
   "name": "DeepSeek V4 Flash 0731",
   "context": 1000000,
   "output": 384000,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-07-31",
   "recommended": true
  },
  {
   "id": "glm-5.2",
   "name": "GLM-5.2",
   "context": 1000000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-06-13",
   "recommended": true
  },
  {
   "id": "kimi-k2.7-code",
   "name": "Kimi K2.7 Code",
   "context": 262144,
   "output": 262144,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-06-12",
   "recommended": true
  },
  {
   "id": "qwen3.7-plus",
   "name": "Qwen3.7 Plus",
   "context": 1000000,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-06-02",
   "recommended": true
  },
  {
   "id": "qwen3.7-max",
   "name": "Qwen3.7 Max",
   "context": 1000000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-05-21",
   "recommended": true
  },
  {
   "id": "qwen3.6-flash",
   "name": "Qwen3.6 Flash",
   "context": 1000000,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-04-27",
   "recommended": true
  },
  {
   "id": "deepseek-v4-flash",
   "name": "DeepSeek V4 Flash",
   "context": 1000000,
   "output": 384000,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-24",
   "recommended": true
  },
  {
   "id": "deepseek-v4-pro",
   "name": "DeepSeek V4 Pro",
   "context": 1000000,
   "output": 384000,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-24",
   "recommended": true
  },
  {
   "id": "kimi-k2.6",
   "name": "Kimi K2.6",
   "context": 262144,
   "output": 262144,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-21",
   "recommended": true
  },
  {
   "id": "glm-5.1",
   "name": "GLM-5.1",
   "context": 202752,
   "output": 128000,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-07",
   "recommended": false
  },
  {
   "id": "qwen3.6-plus",
   "name": "Qwen3.6 Plus",
   "context": 1000000,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-04-02",
   "recommended": false
  },
  {
   "id": "glm-5",
   "name": "GLM-5",
   "context": 202752,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-02-12",
   "recommended": false
  },
  {
   "id": "MiniMax-M2.5",
   "name": "MiniMax-M2.5",
   "context": 196608,
   "output": 32768,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-02-12",
   "recommended": false
  },
  {
   "id": "kimi-k2.5",
   "name": "Kimi K2.5",
   "context": 262144,
   "output": 98304,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-01",
   "recommended": false
  },
  {
   "id": "deepseek-v3.2",
   "name": "DeepSeek V3.2",
   "context": 131072,
   "output": 65536,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-12-03",
   "recommended": false
  }
 ],
 "alibaba-token-plan": [
  {
   "id": "deepseek-v4.1-flash",
   "name": "DeepSeek V4.1 Flash",
   "context": 1000000,
   "output": 384000,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-09-10",
   "recommended": true
  },
  {
   "id": "qwen3.8-flash",
   "name": "Qwen3.8 Flash",
   "context": 1000000,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "low",
     "medium",
     "xhigh"
    ],
    "budget": true
   },
   "interleaved": true,
   "released": "2026-08-26",
   "recommended": true
  },
  {
   "id": "glm-5.3",
   "name": "GLM-5.3",
   "context": 1000000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "low",
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-08-14",
   "recommended": true
  },
  {
   "id": "deepseek-v4-pro-0813",
   "name": "DeepSeek V4 Pro 0813",
   "context": 1000000,
   "output": 384000,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-08-12",
   "recommended": true
  },
  {
   "id": "qwen3.8-max",
   "name": "Qwen3.8 Max",
   "context": 1000000,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "low",
     "medium",
     "xhigh"
    ],
    "budget": true
   },
   "interleaved": true,
   "released": "2026-08-03",
   "recommended": true
  },
  {
   "id": "deepseek-v4-flash-0731",
   "name": "DeepSeek V4 Flash 0731",
   "context": 1000000,
   "output": 384000,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-07-31",
   "recommended": true
  },
  {
   "id": "glm-5.2",
   "name": "GLM-5.2",
   "context": 1000000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": [
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-06-13",
   "recommended": true
  },
  {
   "id": "kimi-k2.7-code",
   "name": "Kimi K2.7 Code",
   "context": 262144,
   "output": 262144,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-06-12",
   "recommended": true
  },
  {
   "id": "qwen3.7-plus",
   "name": "Qwen3.7 Plus",
   "context": 1000000,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-06-02",
   "recommended": true
  },
  {
   "id": "qwen3.7-max",
   "name": "Qwen3.7 Max",
   "context": 1000000,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-05-21",
   "recommended": true
  },
  {
   "id": "qwen3.6-flash",
   "name": "Qwen3.6 Flash",
   "context": 1000000,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-04-27",
   "recommended": true
  },
  {
   "id": "deepseek-v4-flash",
   "name": "DeepSeek V4 Flash",
   "context": 1000000,
   "output": 384000,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-24",
   "recommended": true
  },
  {
   "id": "deepseek-v4-pro",
   "name": "DeepSeek V4 Pro",
   "context": 1000000,
   "output": 384000,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": [
     "high",
     "max"
    ],
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-24",
   "recommended": true
  },
  {
   "id": "kimi-k2.6",
   "name": "Kimi K2.6",
   "context": 262144,
   "output": 262144,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-04-21",
   "recommended": true
  },
  {
   "id": "glm-5.1",
   "name": "GLM-5.1",
   "context": 202752,
   "output": 128000,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-07",
   "recommended": false
  },
  {
   "id": "qwen3.6-plus",
   "name": "Qwen3.6 Plus",
   "context": 1000000,
   "output": 65536,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-04-02",
   "recommended": false
  },
  {
   "id": "glm-5",
   "name": "GLM-5",
   "context": 202752,
   "output": 16384,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-02-12",
   "recommended": false
  },
  {
   "id": "MiniMax-M2.5",
   "name": "MiniMax-M2.5",
   "context": 196608,
   "output": 32768,
   "image": false,
   "reasoning": {
    "toggle": false,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-02-12",
   "recommended": false
  },
  {
   "id": "kimi-k2.5",
   "name": "Kimi K2.5",
   "context": 262144,
   "output": 98304,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": true
   },
   "interleaved": true,
   "released": "2026-01",
   "recommended": false
  },
  {
   "id": "deepseek-v3.2",
   "name": "DeepSeek V3.2",
   "context": 131072,
   "output": 65536,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": false,
   "released": "2025-12-03",
   "recommended": false
  }
 ],
 "xiaomi": [
  {
   "id": "mimo-v2.6-flash",
   "name": "MiMo-V2.6-Flash",
   "context": 1048576,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-09-22",
   "recommended": true
  },
  {
   "id": "mimo-v2.6-pro",
   "name": "MiMo-V2.6-Pro",
   "context": 1048576,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-09-22",
   "recommended": true
  },
  {
   "id": "mimo-v2.6-pro-ultraspeed",
   "name": "MiMo-V2.6-Pro-UltraSpeed",
   "context": 1048576,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-09-21",
   "recommended": true
  },
  {
   "id": "mimo-v2.5-pro-ultraspeed",
   "name": "MiMo-V2.5-Pro-UltraSpeed",
   "context": 1048576,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-06-08",
   "recommended": false,
   "retiring": "2026-10-21"
  },
  {
   "id": "mimo-v2.5",
   "name": "MiMo-V2.5",
   "context": 1048576,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-22",
   "recommended": false,
   "retiring": "2026-10-21"
  },
  {
   "id": "mimo-v2.5-pro",
   "name": "MiMo-V2.5-Pro",
   "context": 1048576,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-22",
   "recommended": false,
   "retiring": "2026-10-21"
  }
 ],
 "xiaomi-token-plan-cn": [
  {
   "id": "mimo-v2.6-flash",
   "name": "MiMo-V2.6-Flash",
   "context": 1048576,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-09-22",
   "recommended": true
  },
  {
   "id": "mimo-v2.6-pro",
   "name": "MiMo-V2.6-Pro",
   "context": 1048576,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-09-22",
   "recommended": true
  },
  {
   "id": "mimo-v2.5",
   "name": "MiMo-V2.5",
   "context": 1048576,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-22",
   "recommended": false,
   "retiring": "2026-10-21"
  },
  {
   "id": "mimo-v2.5-pro",
   "name": "MiMo-V2.5-Pro",
   "context": 1048576,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-22",
   "recommended": false,
   "retiring": "2026-10-21"
  }
 ],
 "xiaomi-token-plan-sgp": [
  {
   "id": "mimo-v2.6-flash",
   "name": "MiMo-V2.6-Flash",
   "context": 1048576,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-09-22",
   "recommended": true
  },
  {
   "id": "mimo-v2.6-pro",
   "name": "MiMo-V2.6-Pro",
   "context": 1048576,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-09-22",
   "recommended": true
  },
  {
   "id": "mimo-v2.5",
   "name": "MiMo-V2.5",
   "context": 1048576,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-22",
   "recommended": false,
   "retiring": "2026-10-21"
  },
  {
   "id": "mimo-v2.5-pro",
   "name": "MiMo-V2.5-Pro",
   "context": 1048576,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-22",
   "recommended": false,
   "retiring": "2026-10-21"
  }
 ],
 "xiaomi-token-plan-ams": [
  {
   "id": "mimo-v2.6-flash",
   "name": "MiMo-V2.6-Flash",
   "context": 1048576,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-09-22",
   "recommended": true
  },
  {
   "id": "mimo-v2.6-pro",
   "name": "MiMo-V2.6-Pro",
   "context": 1048576,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-09-22",
   "recommended": true
  },
  {
   "id": "mimo-v2.5",
   "name": "MiMo-V2.5",
   "context": 1048576,
   "output": 131072,
   "image": true,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-22",
   "recommended": false,
   "retiring": "2026-10-21"
  },
  {
   "id": "mimo-v2.5-pro",
   "name": "MiMo-V2.5-Pro",
   "context": 1048576,
   "output": 131072,
   "image": false,
   "reasoning": {
    "toggle": true,
    "efforts": null,
    "budget": false
   },
   "interleaved": true,
   "released": "2026-04-22",
   "recommended": false,
   "retiring": "2026-10-21"
  }
 ]
});
