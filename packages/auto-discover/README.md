# @btc/auto-discover

BTC Auto Discover Plugin for Vite - 自动发现模块、路由、API

## 🚀 特性

- **自动路由发现**：基于 `src/modules/*/pages/**` 自动生成路由
- **API 聚合**：自动收集模块的 API 配置和端口代理
- **热重载**：新增/删除文件即刻生效
- **类型安全**：自动生成 TypeScript 声明文件
- **调试面板**：提供健康检查和调试接口

## 📁 目录约定

```
apps/<your-app>/
  src/
    modules/
      user/
        module.config.ts     # 模块配置（API、端口、元数据）
        pages/               # 路由页面，自动变为 /user/**
          index.vue
          [id].vue
        apis/                # 可选：API 客户端
      order/
        module.config.ts
        pages/...
    app.config.ts            # 全局配置
```

## 📝 模块配置

`module.config.ts` 最小形态：

```ts
// src/modules/user/module.config.ts
export default {
  id: 'user',                // 模块唯一ID（= 路由前缀）
  title: '用户中心',
  apiBase: '/api/user',      // API前缀（dev模式可被代理到动态端口）
  devPort: 8311,             // 可选：本地服务端口（用于代理）
  routeMeta: { auth: true }  // 可选：路由统一元信息
}
```

## 🔧 安装与配置

### 1. 安装插件

```bash
pnpm add @btc/auto-discover
```

### 2. 配置 Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { btcAutoDiscover } from '@btc/auto-discover'

export default defineConfig({
  plugins: [
    vue(),
    btcAutoDiscover(),
  ]
})
```

### 3. 使用虚拟模块

```ts
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import routes from 'virtual:@btc/auto/routes'

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
```

```ts
// 在组件中使用 API 配置
import { apiOf } from 'virtual:@btc/auto/apis'

const userApi = apiOf('user') // => { base: '/api/user', devPort: 8311 }
```

## 🔍 调试接口

插件提供以下调试接口：

- `GET /__btc__/health` - 健康检查
- `GET /__btc__/panel` - 调试面板（显示所有模块信息）

## 🛠️ 开发指南

### 添加新模块

1. 创建模块目录：`src/modules/your-module/`
2. 添加配置文件：`module.config.ts`
3. 创建页面：`pages/index.vue`
4. 重启开发服务器

### 路由规则

- `pages/index.vue` → `/your-module/`
- `pages/profile.vue` → `/your-module/profile`
- `pages/[id].vue` → `/your-module/:id`
- `pages/[...all].vue` → `/your-module/:all(.*)`

### API 代理

开发模式下，插件会自动将 `/api/<module>` 代理到对应的 `devPort`：

```ts
// module.config.ts
export default {
  id: 'user',
  apiBase: '/api/user',
  devPort: 8311
}
```

访问 `/api/user/profile` 会被代理到 `http://localhost:8311/profile`

## ⚠️ 常见问题

### 端口占用

如果 `devPort` 被占用，插件会跳过该模块的代理配置。检查端口占用：

```bash
netstat -ano | findstr :8311
```

### 路由冲突

确保模块 ID 唯一，避免路由前缀冲突。

### 重复模块 ID

插件会使用最后一个扫描到的模块配置。

### 文件监听失败

确保文件路径正确，Windows 路径使用反斜杠。

## 🔒 安全建议

### 敏感信息

- **不要**在 `module.config.ts` 中写入敏感密钥
- **不要**在生产环境保留 `devPort` 配置
- 使用环境变量管理敏感配置

### 多租户

对于多租户应用，建议：

1. 为每个租户生成不同的 API 前缀：`/api/<tenant>/<module>`
2. 通过网关按 `Host` 或 `Header` 路由
3. 前端只感知 `apiBase`，不关心具体端口

## 📦 生产部署

生产环境下：

1. 移除 `devPort` 配置
2. 使用后端网关（Nginx/ALB/Spring Cloud Gateway）做真实转发
3. 虚拟模块会被打包到最终构建中

## 🎯 最佳实践

1. **模块化设计**：每个模块职责单一，边界清晰
2. **配置驱动**：通过 `module.config.ts` 管理模块元数据
3. **类型安全**：充分利用自动生成的 TypeScript 声明
4. **调试友好**：使用 `/__btc__/panel` 监控模块状态
5. **渐进式**：可以逐步迁移现有代码到模块化结构

## 📚 相关文档

- [Vite Plugin API](https://vitejs.dev/guide/api-plugin.html)
- [Vue Router](https://router.vuejs.org/)
- [Chokidar](https://github.com/paulmillr/chokidar)
