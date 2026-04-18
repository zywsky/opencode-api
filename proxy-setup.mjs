/**
 * 预加载脚本：在 copilot-api 启动前设置 undici 全局代理
 * 用法: NODE_OPTIONS="--import=./proxy-setup.mjs" copilot-api ...
 *      或通过 package.json scripts 调用
 */
import { setGlobalDispatcher, EnvHttpProxyAgent } from 'undici'

// 如果环境变量没有设置，自动使用系统代理默认值
if (!process.env.HTTPS_PROXY && !process.env.HTTP_PROXY) {
  process.env.HTTPS_PROXY = 'http://127.0.0.1:7897'
  process.env.HTTP_PROXY = 'http://127.0.0.1:7897'
}

setGlobalDispatcher(new EnvHttpProxyAgent())
