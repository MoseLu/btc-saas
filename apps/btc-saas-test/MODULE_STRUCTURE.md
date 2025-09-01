# BTC SaaS Test 模块化结构

本项目已成功重构为符合 cool-admin 风格的模块化架构，实现了"约定 > 配置、热扫描、自动生效"的开发体验。

## 🎯 重构成果

### ✅ 自动化功能
- **自动路由发现**：基于 `src/modules/*/pages/**` 自动生成路由
- **API 聚合**：自动收集模块的 API 配置和端口代理
- **热重载**：新增/删除文件即刻生效
- **类型安全**：自动生成 TypeScript 声明文件
- **调试面板**：提供健康检查和调试接口

### ✅ 目录结构
```
src/
├── modules/                    # 模块化目录
│   ├── mock/                   # Mock管理模块
│   │   ├── module.config.ts    # 模块配置
│   │   ├── pages/              # 路由页面
│   │   │   └── index.vue       # /mock
│   │   └── components/         # 模块组件
│   │       ├── MockStats.vue
│   │       ├── MockFilters.vue
│   │       ├── MockTree.vue
│   │       ├── MockTable.vue
│   │       └── MockDialogs.vue
│   ├── plugin/                 # 插件管理模块
│   │   ├── module.config.ts
│   │   └── pages/
│   │       └── index.vue       # /plugin
│   ├── service/                # 服务管理模块
│   │   ├── module.config.ts
│   │   └── pages/
│   │       └── index.vue       # /service
│   ├── log/                    # 日志查看模块
│   │   ├── module.config.ts
│   │   └── pages/
│   │       └── index.vue       # /log
│   ├── eps/                    # EPS演示模块
│   │   ├── module.config.ts
│   │   └── pages/
│   │       └── index.vue       # /eps
│   ├── module/                 # 模块管理模块
│   │   ├── module.config.ts
│   │   └── pages/
│   │       └── index.vue       # /module
│   ├── route/                  # 路由管理模块
│   │   ├── module.config.ts
│   │   └── pages/
│   │       └── index.vue       # /route
│   ├── feature/                # 功能测试模块
│   │   ├── module.config.ts
│   │   └── pages/
│   │       └── index.vue       # /feature
│   └── icon/                   # 图标管理模块
│       ├── module.config.ts
│       └── pages/
│           └── index.vue       # /icon
├── pages/                      # 全局页面
│   └── index.vue               # 首页 (/)
├── layouts/                    # 布局文件
│   └── default.vue             # 默认布局
├── components/                 # 全局组件
├── composables/                # 组合式函数
├── stores/                     # 状态管理
├── types/                      # 类型定义
│   └── btc-auto-discover.d.ts  # 自动生成的类型声明
├── assets/                     # 静态资源
├── data/                       # 数据文件
├── utils/                      # 工具函数
├── App.vue                     # 根组件
├── main.ts                     # 入口文件
└── router/                     # 路由配置
    └── index.ts                # 使用虚拟模块的路由
```

## 🔧 模块配置示例

### Mock 模块配置
```ts
// src/modules/mock/module.config.ts
export default {
  id: 'mock',                    // 模块唯一ID（= 路由前缀）
  title: 'Mock管理',             // 模块标题
  apiBase: '/api/mock',         // API前缀（dev模式可被代理到动态端口）
  devPort: 8311,                // 本地服务端口（用于代理）
  routeMeta: {                  // 路由元信息
    auth: true,
    title: 'Mock管理',
    icon: 'DataAnalysis'
  }
}
```

## 🚀 虚拟模块

插件自动生成以下虚拟模块：

### 1. 路由模块
```ts
// virtual:@btc/auto/routes
import routes from 'virtual:@btc/auto/routes'
// 自动生成的路由配置
```

### 2. API 配置模块
```ts
// virtual:@btc/auto/apis
import { apiOf, apis } from 'virtual:@btc/auto/apis'

const userApi = apiOf('user') // => { base: '/api/user', devPort: 8311 }
```

### 3. 元数据模块
```ts
// virtual:@btc/auto/meta
import meta from 'virtual:@btc/auto/meta'
// 所有模块的配置信息
```

## 🔍 调试接口

- `GET /__btc__/health` - 健康检查
- `GET /__btc__/panel` - 调试面板（显示所有模块信息）

## 📝 开发指南

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

## 🎯 核心优势

1. **零配置**：遵循约定即可自动生效
2. **热重载**：文件变更即刻生效，无需重启
3. **类型安全**：自动生成 TypeScript 声明
4. **模块化**：清晰的模块边界和职责分离
5. **可扩展**：易于添加新模块和功能
6. **调试友好**：提供调试面板和健康检查

## 🔒 安全建议

- **不要**在 `module.config.ts` 中写入敏感密钥
- **不要**在生产环境保留 `devPort` 配置
- 使用环境变量管理敏感配置

## 📦 生产部署

生产环境下：
1. 移除 `devPort` 配置
2. 使用后端网关做真实转发
3. 虚拟模块会被打包到最终构建中

## 🎉 总结

通过这次重构，我们成功实现了：

1. **目录结构规范化**：遵循 Nuxt.js 约定
2. **自动化路由发现**：基于文件系统的路由生成
3. **模块化架构**：清晰的模块边界和配置
4. **热重载支持**：开发体验大幅提升
5. **类型安全**：完整的 TypeScript 支持
6. **调试友好**：提供调试工具和面板

现在可以享受 cool-admin 级别的开发体验了！🎊
