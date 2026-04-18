# opencode-api

OpenCode 连接 GitHub Copilot API 的代理服务，基于 [copilot-api](https://github.com/ericc-ch/copilot-api) 包。

> **警告**: 这是对 GitHub Copilot API 的逆向工程代理，不受 GitHub 官方支持。请合理使用，避免触发滥用检测。

## 环境要求

- Node.js >= 18
- GitHub 账号（需订阅 Copilot）

## 快速开始

### 1. 首次认证

```bash
npm run auth
```

按提示完成 GitHub OAuth 授权，Token 会保存到本地。

### 2. 启动代理服务

```bash
npm start
```

默认监听 `http://localhost:4141`

### 3. 配置 OpenCode

在 OpenCode 中配置自定义 API 提供商：

- **API Base URL**: `http://localhost:4141`
- **API Key**: `dummy`（任意字符串）

## 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run auth` | GitHub 认证，获取 Token |
| `npm start` | 启动代理（默认端口 4141） |
| `npm run start:verbose` | 启动代理（详细日志） |
| `npm run start:business` | 启动代理（Business 账号） |
| `npm run start:enterprise` | 启动代理（Enterprise 账号） |
| `npm run usage` | 查看 Copilot 使用量 |
| `npm run debug` | 显示调试信息 |

## API 端点

代理启动后，以下端点可用：

### OpenAI 兼容
- `POST /v1/chat/completions` - 聊天补全
- `GET /v1/models` - 可用模型列表
- `POST /v1/embeddings` - 文本嵌入

### Anthropic 兼容
- `POST /v1/messages` - 消息 API
- `POST /v1/messages/count_tokens` - Token 计数

### 监控
- `GET /usage` - 查看使用量和配额

## 高级选项

```bash
# 指定端口
node_modules/.bin/copilot-api start --port 8080

# 设置请求间隔（避免频率限制）
node_modules/.bin/copilot-api start --rate-limit 5

# 使用已有 GitHub Token（通过 npm run auth 生成）
node_modules/.bin/copilot-api start --github-token <token>
```

### 代理环境变量支持（--proxy-env）

启动时如需让代理服务自动读取你操作系统的代理环境变量，比如 HTTP_PROXY、HTTPS_PROXY、NO_PROXY 等，可以在命令后添加 `--proxy-env` 参数。例如：

```bash
node_modules/.bin/copilot-api start --proxy-env
```
或
```bash
npm start # 已默认包含 --proxy-env
```

这样 copilot-api 会自动使用你当前 shell 环境下的代理设置发起所有 HTTP 请求。

**常见环境变量说明：**
- `http_proxy` / `HTTP_PROXY`：用于普通 HTTP 请求的代理地址。
- `https_proxy` / `HTTPS_PROXY`：用于 HTTPS 请求的代理地址。
- `no_proxy` / `NO_PROXY`：指定哪些域名不走代理。

**使用场景举例：**
假如你在公司内网，需要走内网 HTTP 代理访问外部 GitHub，可以：
```bash
export http_proxy="http://proxy.mycompany.com:3128"
export https_proxy="http://proxy.mycompany.com:3128"
npm start
```
或者直接：
```bash
node_modules/.bin/copilot-api start --proxy-env
```

如不加 `--proxy-env`，则服务不会自动读取这些环境变量。

## 使用量仪表板

启动后，控制台会显示使用量仪表板链接：

```
https://ericc-ch.github.io/copilot-api?endpoint=http://localhost:4141/usage
```
