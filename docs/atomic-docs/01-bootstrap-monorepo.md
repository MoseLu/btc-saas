---
title: 启动 Monorepo 与基础脚手架
category: bootstrap
order: 1
owners: [frontend, arch]
auditable: true
acceptance:
  - [x] pnpm workspaces 生效
  - [x] 基础 tsconfig / biome 配置
  - [x] turbo/changesets 可运行
outputs:
  - [x] apps/*, packages/* 初始目录
  - [x] scripts: dev/build/lint
related: [02-bridge-sdk-and-topbar, 13-dev-scripts-and-ports]
---

# 启动 Monorepo 与基础脚手架

## 背景与目标

构建BTC MES控制台的基础架构，采用monorepo模式统一管理多个子系统和共享包。建立约定式开发环境，为后续开发奠定基础。

## 约定

### 目录结构约定
```
btc-saas/
├── apps/                    # 子系统应用
│   ├── quality/            # 品质系统
│   ├── purchase/           # 采购系统
│   ├── engineering/        # 工程系统
│   ├── production/         # 生产控制系统
│   └── bi/                 # BI系统
├── packages/               # 共享包
│   ├── bridge/             # 顶栏SDK
│   ├── ui/                 # 公共组件
│   ├── plugins/            # 插件体系
│   ├── tools/              # 工具体系
│   ├── logs/               # 日志体系
│   ├── eps-plugin/         # EPS插件
│   └── docs-model/         # 文档模型
├── docs/                   # 文档体系
├── pnpm-workspace.yaml     # 工作空间配置
├── package.json            # 根包配置
├── turbo.json              # Turbo配置
└── tsconfig.json           # TypeScript配置
```

### 命名约定
- 包名使用kebab-case
- 组件名使用PascalCase
- 文件名使用kebab-case
- Pinia store使用camelCase

## 步骤

### 1. 初始化项目结构
```bash
# 创建目录结构
mkdir -p apps/{quality,purchase,engineering,production,bi}
mkdir -p packages/{bridge,ui,plugins,tools,logs,eps-plugin,docs-model}
```

### 2. 配置pnpm workspace
创建`pnpm-workspace.yaml`：
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 3. 配置根package.json
```json
{
  "name": "btc-saas",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "release": "changeset publish",
    "docs:sidebar": "docs-model generate"
  },
  "devDependencies": {
    "@changesets/cli": "^2.26.0",
    "turbo": "^1.10.0",
    "typescript": "^5.0.0",
    "@biomejs/biome": "^1.0.0"
  }
}
```

### 4. 配置turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    }
  }
}
```

### 5. 配置tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@btc/*": ["packages/*/src"],
      "@apps/*": ["apps/*/src"]
    }
  },
  "include": ["apps/*/src", "packages/*/src"],
  "exclude": ["node_modules", "dist"]
}
```

### 6. 配置biome.json
```json
{
  "$schema": "https://biomejs.dev/schemas/1.5.3/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  }
}
```

## 产出物

- [x] `pnpm-workspace.yaml` - 工作空间配置
- [x] `package.json` - 根包配置和脚本
- [x] `turbo.json` - 构建管道配置
- [x] `tsconfig.json` - TypeScript配置
- [x] `biome.json` - 代码质量配置
- [x] `apps/*` - 子系统目录
- [x] `packages/*` - 共享包目录

## 审计清单

- [x] pnpm workspaces 生效
- [x] 基础 tsconfig / biome 配置
- [x] turbo/changesets 可运行
- [x] 目录结构完整
- [x] 脚本命令可用
- [x] 所有子包package.json配置完成
- [x] turbo.json配置更新到2.0版本
- [x] biome.json配置更新到2.2.2版本
- [x] 构建、lint、typecheck、clean命令测试通过
- [x] changesets初始化完成
