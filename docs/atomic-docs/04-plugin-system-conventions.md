---
title: 插件系统约定
category: plugin
order: 4
owners: [frontend, arch]
auditable: true
acceptance:
  - [x] 插件自动发现注册
  - [x] 插件生命周期管理
  - [x] 插件配置热更新
  - [x] 插件日志记录
outputs:
  - packages/plugins/*/index.ts
  - packages/plugins/*/README.md
  - packages/plugins/*/assets/styles
related: [03-ui-kit-btc-components, 06-logs-conventions-and-channels]
---

# 插件系统约定

## 背景与目标

建立统一的插件系统，支持小工具的自动发现、注册和管理。实现插件的生命周期管理、配置热更新和日志记录。

## 约定

### 插件目录结构约定
```
packages/plugins/
├── pdf2png/              # PDF转PNG插件
│   ├── index.ts          # 插件入口
│   ├── README.md         # 插件文档
│   ├── package.json      # 插件配置
│   ├── src/              # 源码目录
│   │   ├── components/   # 插件组件
│   │   ├── utils/        # 工具函数
│   │   └── types/        # 类型定义
│   └── assets/           # 静态资源
│       ├── styles/       # 样式文件
│       └── icons/        # 图标文件
├── richtext/             # 富文本编辑器插件
├── chat/                 # 聊天工具插件
├── viewer/               # 文件查看器插件
└── highlight/            # 代码高亮插件
```

### 插件接口约定
```typescript
interface Plugin {
  name: string                    // 插件名称
  version: string                 // 插件版本
  description: string             // 插件描述
  author: string                  // 插件作者
  dependencies?: string[]         // 依赖插件
  setup: (app: App) => void      // 插件安装函数
  routes?: RouteRecordRaw[]       // 路由配置
  stores?: Store[]                // 状态管理
  provides?: Record<string, any>  // 依赖注入
  onActivate?: () => void         // 激活回调
  onDeactivate?: () => void       // 停用回调
  onUpdate?: (config: any) => void // 配置更新回调
}
```

## 步骤

### 1. 创建插件管理器 ✅
创建`packages/plugins/src/manager.ts`：
- 实现插件自动发现和注册
- 支持插件生命周期管理
- 提供插件配置管理功能

### 2. 创建PDF转PNG插件示例 ✅
创建`packages/plugins/pdf2png/index.ts`：
- 完整的插件接口实现
- 组件注册和路由配置
- 生命周期回调函数

### 3. 创建富文本编辑器插件 ✅
创建`packages/plugins/richtext/index.ts`：
- 富文本编辑器组件
- 工具栏和编辑功能
- 内容预览和保存

### 4. 创建插件配置管理 ✅
创建`packages/plugins/src/config.ts`：
- 配置持久化存储
- 热更新支持
- 配置变更事件

### 5. 创建插件管理界面 ✅
创建`packages/plugins/src/components/PluginManager.vue`：
- 插件列表展示
- 启用/禁用控制
- 配置编辑功能

## 产出物

- [x] `packages/plugins/src/manager.ts` - 插件管理器
- [x] `packages/plugins/src/config.ts` - 配置管理
- [x] `packages/plugins/src/components/PluginManager.vue` - 管理界面
- [x] `packages/plugins/pdf2png/` - PDF转PNG插件
- [x] `packages/plugins/richtext/` - 富文本编辑器插件
- [x] `packages/plugins/src/utils/` - 工具函数
- [x] `packages/plugins/src/types/` - 类型定义
- [x] `packages/plugins/index.ts` - 系统入口

## 审计清单

- [x] 插件自动发现注册
- [x] 插件生命周期管理
- [x] 插件配置热更新
- [x] 插件日志记录
- [x] 插件依赖管理
- [x] 插件管理界面
- [x] 插件文档完整
- [x] 插件测试覆盖
