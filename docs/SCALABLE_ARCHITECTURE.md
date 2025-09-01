# 可扩展架构设计指南

## 概述

本文档描述了BTC SaaS项目的可扩展架构设计，确保在功能不断增加时，项目结构保持清晰、模块化和易于维护。

## 1. 整体架构设计

### 1.1 Monorepo 结构

```
btc-saas/
├── apps/                    # 应用层
│   ├── btc-saas/           # 主应用
│   ├── purchase/            # 采购系统
│   ├── bi/                  # 商业智能
│   ├── quality/             # 质量管理系统
│   ├── engineering/         # 工程管理系统
│   └── production/          # 生产管理系统
├── packages/                # 共享包层
│   ├── ui/                  # UI组件库
│   ├── bridge/              # 桥接服务
│   ├── logs/                # 日志系统
│   ├── plugins/             # 插件系统
│   ├── eps-plugin/          # EPS插件
│   ├── tools/               # 开发工具
│   ├── btc-admin/           # 管理后台
│   └── docs-model/          # 文档模型
├── docs/                    # 文档
├── scripts/                 # 构建脚本
└── .github/                 # CI/CD配置
```

### 1.2 应用层模块化设计

每个应用都采用相同的模块化结构：

```
apps/{app-name}/
├── src/
│   ├── modules/             # 业务模块
│   │   ├── user/            # 用户管理模块
│   │   │   ├── components/  # 模块组件
│   │   │   ├── composables/ # 业务逻辑
│   │   │   ├── services/    # API服务
│   │   │   ├── stores/      # 状态管理
│   │   │   ├── styles/      # 模块样式
│   │   │   ├── constants/   # 模块常量
│   │   │   ├── types/       # 类型定义
│   │   │   └── views/       # 页面视图
│   │   ├── order/           # 订单管理模块
│   │   ├── product/         # 产品管理模块
│   │   └── report/          # 报表模块
│   ├── shared/              # 应用内共享
│   │   ├── components/      # 共享组件
│   │   ├── composables/     # 共享逻辑
│   │   ├── services/        # 共享服务
│   │   ├── stores/          # 共享状态
│   │   ├── styles/          # 共享样式
│   │   ├── constants/       # 共享常量
│   │   ├── types/           # 共享类型
│   │   └── utils/           # 工具函数
│   ├── layouts/             # 布局组件
│   ├── router/              # 路由配置
│   ├── assets/              # 静态资源
│   └── main.ts              # 应用入口
├── public/                  # 公共资源
├── tests/                   # 测试文件
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 2. 模块化设计原则

### 2.1 业务模块独立性

每个业务模块应该：
- **高内聚**：模块内功能紧密相关
- **低耦合**：与其他模块的依赖最小化
- **可复用**：模块可以在不同应用间复用
- **可测试**：模块可以独立测试

### 2.2 分层架构

```
┌─────────────────────────────────────┐
│             视图层 (Views)           │
├─────────────────────────────────────┤
│           组件层 (Components)        │
├─────────────────────────────────────┤
│           逻辑层 (Composables)       │
├─────────────────────────────────────┤
│           服务层 (Services)          │
├─────────────────────────────────────┤
│           状态层 (Stores)            │
├─────────────────────────────────────┤
│           共享包层 (Packages)        │
└─────────────────────────────────────┘
```

## 3. 路径别名配置

### 3.1 TypeScript 配置

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@modules/*": ["src/modules/*"],
      "@shared/*": ["src/shared/*"],
      "@components/*": ["src/modules/*/components"],
      "@composables/*": ["src/modules/*/composables"],
      "@services/*": ["src/modules/*/services"],
      "@stores/*": ["src/modules/*/stores"],
      "@styles/*": ["src/modules/*/styles"],
      "@constants/*": ["src/modules/*/constants"],
      "@types/*": ["src/modules/*/types"],
      "@views/*": ["src/modules/*/views"],
      "@ui/*": ["../../packages/ui/src/*"],
      "@bridge/*": ["../../packages/bridge/src/*"],
      "@logs/*": ["../../packages/logs/src/*"],
      "@plugins/*": ["../../packages/plugins/src/*"]
    }
  }
}
```

### 3.2 Vite 配置

```typescript
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@modules': resolve(__dirname, 'src/modules'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@ui': resolve(__dirname, '../../packages/ui/src'),
      '@bridge': resolve(__dirname, '../../packages/bridge/src'),
      '@logs': resolve(__dirname, '../../packages/logs/src'),
      '@plugins': resolve(__dirname, '../../packages/plugins/src')
    }
  }
})
```

## 4. 路由懒加载策略

### 4.1 模块级懒加载

```typescript
// router/index.ts
const routes = [
  {
    path: '/user',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      {
        path: 'list',
        component: () => import('@modules/user/views/UserList.vue'),
        meta: { title: '用户列表', module: 'user' }
      },
      {
        path: 'form',
        component: () => import('@modules/user/views/UserForm.vue'),
        meta: { title: '用户表单', module: 'user' }
      }
    ]
  },
  {
    path: '/order',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      {
        path: 'list',
        component: () => import('@modules/order/views/OrderList.vue'),
        meta: { title: '订单列表', module: 'order' }
      }
    ]
  }
]
```

### 4.2 组件级懒加载

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// 懒加载重型组件
const UserEditorDialog = defineAsyncComponent(() => 
  import('@modules/user/components/UserEditorDialog.vue')
)

const OrderDetailModal = defineAsyncComponent(() => 
  import('@modules/order/components/OrderDetailModal.vue')
)
</script>
```

## 5. 状态管理策略

### 5.1 模块级状态管理

```typescript
// modules/user/stores/user.store.ts
import { defineStore } from 'pinia'
import { userApi } from '../services/user.api'
import type { User, UserListParams } from '../types/user'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userList = ref<User[]>([])
  const loading = ref(false)
  const total = ref(0)

  // 计算属性
  const userCount = computed(() => userList.value.length)

  // 方法
  const fetchUsers = async (params: UserListParams) => {
    loading.value = true
    try {
      const result = await userApi.getUsers(params)
      userList.value = result.data
      total.value = result.total
    } finally {
      loading.value = false
    }
  }

  return {
    userList,
    loading,
    total,
    userCount,
    fetchUsers
  }
})
```

### 5.2 全局状态管理

```typescript
// shared/stores/app.store.ts
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const theme = ref('light')
  const sidebarCollapsed = ref(false)
  const userInfo = ref(null)

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return {
    theme,
    sidebarCollapsed,
    userInfo,
    toggleTheme,
    toggleSidebar
  }
})
```

## 6. 样式管理策略

### 6.1 模块级样式

```scss
// modules/user/styles/user-list.module.scss
@use '../../../shared/styles/variables' as *;
@use '../../../shared/styles/mixins' as *;

.user-list {
  &__header {
    @include flex-between;
    margin-bottom: $spacing-lg;
  }

  &__table {
    .el-table {
      // 模块特定样式
    }
  }

  &__pagination {
    margin-top: $spacing-lg;
  }
}
```

### 6.2 全局样式系统

```scss
// shared/styles/index.scss
@use 'variables';
@use 'mixins';
@use 'base';
@use 'utilities';
@use 'components';
```

## 7. 测试策略

### 7.1 单元测试

```typescript
// modules/user/composables/__tests__/useUserList.test.ts
import { describe, it, expect, vi } from 'vitest'
import { useUserList } from '../useUserList'
import { userApi } from '../../services/user.api'

vi.mock('../../services/user.api')

describe('useUserList', () => {
  it('should fetch users successfully', async () => {
    const mockUsers = [{ id: 1, name: 'Test User' }]
    vi.mocked(userApi.getUsers).mockResolvedValue({
      data: mockUsers,
      total: 1
    })

    const { userList, fetchUsers } = useUserList()
    await fetchUsers({ page: 1, size: 10 })

    expect(userList.value).toEqual(mockUsers)
  })
})
```

### 7.2 集成测试

```typescript
// tests/integration/user-management.test.ts
import { describe, it, expect } from '@playwright/test'

describe('User Management', () => {
  it('should create a new user', async ({ page }) => {
    await page.goto('/user/form')
    await page.fill('[data-testid="user-name"]', 'New User')
    await page.fill('[data-testid="user-email"]', 'newuser@example.com')
    await page.click('[data-testid="submit-btn"]')
    
    await expect(page.locator('.el-message--success')).toBeVisible()
  })
})
```

## 8. 构建优化

### 8.1 代码分割

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'ui': ['element-plus'],
          'utils': ['lodash-es', 'dayjs']
        }
      }
    }
  }
})
```

### 8.2 预加载策略

```typescript
// router/index.ts
const routes = [
  {
    path: '/user',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      {
        path: 'list',
        component: () => import('@modules/user/views/UserList.vue'),
        meta: { 
          title: '用户列表', 
          module: 'user',
          preload: true // 预加载标记
        }
      }
    ]
  }
]
```

## 9. 开发工具配置

### 9.1 ESLint 配置

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier'
  ],
  rules: {
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'always'
      }
    ]
  }
}
```

### 9.2 Prettier 配置

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true
}
```

## 10. CI/CD 配置

### 10.1 GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm build
      - run: pnpm deploy
```

## 11. 文档管理

### 11.1 组件文档

```vue
<!-- components/UserTable.vue -->
<template>
  <div class="user-table">
    <!-- 组件内容 -->
  </div>
</template>

<script setup lang="ts">
/**
 * 用户表格组件
 * 
 * @example
 * ```vue
 * <UserTable 
 *   :users="userList" 
 *   :loading="loading"
 *   @select="handleSelect"
 * />
 * ```
 */
interface Props {
  /** 用户列表数据 */
  users: User[]
  /** 加载状态 */
  loading?: boolean
}

defineProps<Props>()
</script>
```

### 11.2 API 文档

```typescript
// services/user.api.ts
/**
 * 用户管理API服务
 * 
 * @example
 * ```typescript
 * const users = await userApi.getUsers({ page: 1, size: 10 })
 * ```
 */
export const userApi = {
  /**
   * 获取用户列表
   * @param params 查询参数
   * @returns 用户列表和总数
   */
  async getUsers(params: UserListParams): Promise<UserListResponse> {
    // 实现
  }
}
```

## 12. 性能监控

### 12.1 性能指标

```typescript
// shared/utils/performance.ts
export const performanceMonitor = {
  measurePageLoad() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ttfb: navigation.responseStart - navigation.requestStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      load: navigation.loadEventEnd - navigation.loadEventStart
    }
  },

  measureComponentRender(componentName: string) {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      console.log(`${componentName} render time: ${duration.toFixed(2)}ms`)
    }
  }
}
```

## 总结

通过以上架构设计，我们实现了：

1. **模块化**：每个业务模块独立，便于开发和维护
2. **可扩展**：新功能可以轻松添加新模块
3. **高性能**：通过懒加载和代码分割优化性能
4. **可维护**：统一的代码风格和文档规范
5. **可测试**：完整的测试策略和工具配置
6. **自动化**：CI/CD 流程确保代码质量

这个架构设计为项目的长期发展提供了坚实的基础，确保在功能不断增加时，项目依然保持清晰和高效。
