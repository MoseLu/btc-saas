# BTC SaaS Test 目录结构

本项目遵循 Nuxt.js 的文件夹规范，提供清晰的文件组织结构和自动化的功能。

## 📁 目录结构

```
src/
├── pages/                    # 页面文件 - 自动路由
│   ├── index.vue            # 首页 (/)
│   ├── mock-manager.vue     # Mock管理 (/mock-manager)
│   ├── plugin-manager.vue   # 插件管理 (/plugin-manager)
│   ├── service-manager.vue  # 服务管理 (/service-manager)
│   ├── log-viewer.vue       # 日志查看 (/log-viewer)
│   ├── eps-demo.vue         # EPS演示 (/eps-demo)
│   ├── module-manager.vue   # 模块管理 (/module-manager)
│   ├── route-manager.vue    # 路由管理 (/route-manager)
│   ├── feature-tester.vue   # 功能测试 (/feature-tester)
│   └── icon-manager.vue     # 图标管理 (/icon-manager)
├── layouts/                  # 布局文件
│   └── default.vue          # 默认布局
├── components/               # 组件文件 - 自动注册
│   ├── mock/                # Mock相关组件
│   │   ├── MockStats.vue
│   │   ├── MockFilters.vue
│   │   ├── MockTree.vue
│   │   ├── MockTable.vue
│   │   └── MockDialogs.vue
│   ├── PluginManager.vue
│   ├── ServiceList.vue
│   ├── PluginPreview.vue
│   ├── PluginList.vue
│   ├── ServiceStats.vue
│   └── PluginStats.vue
├── composables/              # 组合式函数 - 自动导入
│   ├── useLogViewer.ts
│   ├── usePluginManager.ts
│   ├── useServiceManager.ts
│   └── useThemeWaveSwitch.ts
├── plugins/                  # 插件文件 - 自动加载
│   ├── icon-manager/
│   └── chart/
├── middleware/               # 中间件 - 路由守卫
│   └── auth.ts              # 认证中间件
├── server/                   # 服务端API
│   └── api/
│       └── hello.ts         # API路由 (/api/hello)
├── stores/                   # 状态管理 (Pinia)
│   └── app.ts               # 应用状态
├── assets/                   # 静态资源 - 参与构建
│   └── styles/
├── public/                   # 静态资源 - 直接访问
├── types/                    # TypeScript类型定义
├── services/                 # API服务层
├── data/                     # 数据文件
├── utils/                    # 工具函数
├── mocks/                    # Mock数据
├── modules/                  # 业务模块
├── styles/                   # 全局样式
├── App.vue                   # 根组件
└── main.ts                   # 入口文件
```

## 🚀 功能特性

### 自动路由
- `pages/` 目录下的文件会自动生成路由
- 文件名即路由路径，支持动态路由 `[id].vue`
- 支持嵌套路由和布局

### 自动组件注册
- `components/` 目录下的组件会自动全局注册
- 无需手动 import，可直接使用
- 建议按功能模块分子目录

### 自动导入
- `composables/` 目录下的函数会自动导入
- 命名规范：`useXxx.ts`
- 可在任何组件中直接使用

### 布局系统
- `layouts/` 目录定义页面骨架
- 默认使用 `layouts/default.vue`
- 页面可通过 `definePageMeta({ layout: 'custom' })` 指定布局

### 中间件
- `middleware/` 目录定义路由守卫
- 文件名即中间件名
- 使用：`definePageMeta({ middleware: 'auth' })`

### API路由
- `server/api/` 目录定义后端API
- 文件路径即API路径
- 例如：`server/api/users.ts` → `/api/users`

### 状态管理
- `stores/` 目录使用 Pinia
- 自动导入：`stores/counter.ts` → `useCounterStore()`
- 支持持久化存储

## 📝 命名规范

### 文件命名
- 页面文件：kebab-case (如：`mock-manager.vue`)
- 组件文件：PascalCase (如：`MockStats.vue`)
- 组合式函数：camelCase (如：`useLogViewer.ts`)
- API文件：kebab-case (如：`user-profile.ts`)

### 目录命名
- 使用 kebab-case
- 按功能模块分组
- 保持目录结构清晰

## 🔧 开发指南

### 添加新页面
1. 在 `pages/` 目录创建 `.vue` 文件
2. 文件名即路由路径
3. 使用 `definePageMeta()` 定义页面元信息

### 添加新组件
1. 在 `components/` 目录创建 `.vue` 文件
2. 按功能模块分组到子目录
3. 组件会自动全局注册

### 添加新API
1. 在 `server/api/` 目录创建 `.ts` 文件
2. 使用 `defineEventHandler()` 定义处理函数
3. 文件路径即API路径

### 添加新中间件
1. 在 `middleware/` 目录创建 `.ts` 文件
2. 使用 `defineNuxtRouteMiddleware()` 定义中间件
3. 在页面中使用 `definePageMeta({ middleware: 'xxx' })`

## 🎯 最佳实践

1. **单一职责**：每个文件只负责一个功能
2. **模块化**：按功能模块组织文件
3. **命名清晰**：使用描述性的文件名和目录名
4. **类型安全**：充分利用 TypeScript
5. **组件复用**：将通用功能提取为组件
6. **状态管理**：合理使用 Pinia 管理状态
7. **API设计**：遵循 RESTful 规范
8. **错误处理**：完善的错误处理机制

## 📚 相关文档

- [Nuxt.js 官方文档](https://nuxt.com/docs)
- [Vue.js 官方文档](https://vuejs.org/)
- [Pinia 状态管理](https://pinia.vuejs.org/)
- [Element Plus 组件库](https://element-plus.org/)
