# BTC SaaS Plugin System

BTC SaaS 插件系统，基于 Vite 虚拟模块实现，提供丝滑的开发体验。

## 特性

- 🚀 **Vite 虚拟模块**: 使用 `virtual:btc-plugins` 提供动态插件列表
- 🔥 **HMR 热更新**: 开发时插件变更自动热更新
- 📦 **自动扫描**: 自动扫描 `packages/plugins/` 目录
- 🎯 **类型安全**: 完整的 TypeScript 类型支持
- ⚡ **高性能**: 基于 Vite 的高性能构建

## 安装

```bash
pnpm add @btc/plugins
```

## 使用方法

### 1. 在 Vite 配置中添加插件

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import btcPlugins from '@btc/plugins'

export default defineConfig({
  plugins: [
    btcPlugins()
  ]
})
```

### 2. 在代码中使用虚拟模块

```typescript
// 导入插件列表
import { plugins } from 'virtual:btc-plugins'

console.log('可用插件:', plugins)
```

### 3. 创建新插件

在 `packages/plugins/` 目录下创建新的插件目录：

```
packages/plugins/
├── my-plugin/
│   ├── index.ts          # 插件入口文件
│   ├── package.json      # 插件配置（可选）
│   └── README.md         # 插件文档
```

#### 插件入口文件示例

```typescript
// packages/plugins/my-plugin/index.ts
export const myPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  description: '我的插件',
  author: 'BTC Team',
  setup: (config: any) => {
    // 插件初始化逻辑
    console.log('插件已加载:', config)
    
    return {
      // 插件提供的功能
      doSomething: () => {
        console.log('插件功能执行')
      }
    }
  }
}
```

#### 插件配置示例

```json
// packages/plugins/my-plugin/package.json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "我的插件",
  "author": "BTC Team",
  "keywords": ["btc-plugin"],
  "btc": {
    "displayName": "我的插件",
    "category": "utility",
    "status": "active",
    "icon": "Setting",
    "features": ["功能1", "功能2"]
  }
}
```

## 插件元数据

插件系统支持以下元数据：

- `displayName`: 显示名称
- `category`: 插件分类
- `status`: 插件状态 (draft/active/deprecated)
- `icon`: 插件图标
- `description`: 插件描述
- `author`: 插件作者
- `features`: 功能特性列表
- `routes`: 路由配置
- `capabilities`: 能力列表

## 开发

### 本地开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build
```

### 添加新插件

1. 在 `packages/plugins/` 目录下创建新插件目录
2. 创建 `index.ts` 入口文件
3. 可选：创建 `package.json` 配置文件
4. 重启开发服务器，插件将自动被发现

### 热更新

插件系统支持热更新，当您修改插件文件时，相关组件会自动更新，无需手动刷新页面。

## 类型定义

```typescript
interface BTCPlugin {
  name: string
  version: string
  displayName: string
  category: string
  status: string
  routes?: string[]
  capabilities?: string[]
  icon?: string
  description?: string
  author?: string
  features?: string[]
  path: string
}
```

## 许可证

MIT
