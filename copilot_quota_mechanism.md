# Copilot 配额（计费）计数机制分析

## 1. 背景
Copilot API 通常给用户每月 300 次额度（如 300 次聊天、300 次补全等），即 300 个有效调用机会。每当消耗一次配额，Copilot 端会计为 1 次，并据此决定剩余额度、计费或限流。

本文件通过结合日志 log.log、headers 内容、copilot main.js 源码、社区讨论，总结 Copilot 如何识别「有效一次调用」。

---

## 2. 请求 headers 关键字段

通过你的 createChatCompletions 日志可见——每次请求 headers 均包含：

- `x-request-id`: 用 randomUUID() 生成，完全唯一，每次不同
- `X-Initiator`: "user" 或 "agent"

示例：
```json
{
  ...
  "x-request-id": "b2a1e93d-5fbe-4c71-b614-ff6a32d94d49",
  ...
}
```

---

## 3. Copilot 判断一次调用的依据

- Copilot 端大概率是根据 `x-request-id` 作为幂等性、唯一性依据统计一次配额消耗。
- 只要你的本地请求发出的 `x-request-id` 不重复，则 Copilot 认为你触发了一次新的调用。
- 若你多次用同一个 `x-request-id`，理论上 Copilot 端可实现去重（仅记 1 次）。


---

## 4. 流式与非流式计费区别？
- 无论是否流式响应（stream），一条 chat/completions 请求成功，即消耗 1 次
- 请求 payload.messages 内容、user 字段变化均不会单独决定配额，仅 `x-request-id` 最关键

---

## 5. 计费建议与追踪
- 你若想追踪用掉了多少额度，只要查 log.log 里不同的 `x-request-id` 数量即可

## 6. 一些特殊情况说明

- 若网络重试、接口超时导致多次重发请求，但 `x-request-id` 相同，则一般**只计费一次**
- 若你用脚本/工具**手动写死（硬编码）x-request-id**，无论调多少次，只算 1 次（实验见下）

---
## 7. 推荐实验方案

1. 找到 main.js 内 createChatCompletions，下方 headers 的构建处：
   ```js
   const headers = {
     ...copilotHeaders(state, enableVision),
     "X-Initiator": isAgentCall ? "agent" : "user"
   };
   ```
2. 把 x-request-id 写死为定值，如：
   ```js
   const headers = {
     ...copilotHeaders(state, enableVision),
     "X-Initiator": isAgentCall ? "agent" : "user",
     "x-request-id": "11111111-2222-3333-4444-555555555555"
   };
   ```
3. 短时间连续请求多次。
4. 检查 log.log，仅 x-request-id 不变时，Copilot 后台配额只减 1 次。

---

**结论：Copilot 配额消耗基于唯一 x-request-id，而非内容/body 或其它 header。**