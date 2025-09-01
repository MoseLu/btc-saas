---
title: Bridge SDK 与顶栏开发
category: bridge
order: 2
owners: [frontend, sdk]
auditable: true
acceptance:
  - [x] window.BtcConsole SDK 可用
  - [x] 顶栏组件正常工作
  - [x] 全局状态管理生效
  - [x] 主题切换功能正常
outputs:
  - [x] packages/bridge/src/index.d.ts
  - [x] packages/bridge/dist/console-bridge.js
  - [x] packages/bridge/dist/console-bridge.css
related: [01-bootstrap-monorepo, 09-auth-rbac-and-pinia-stores]
---

# Bridge SDK 与顶栏开发

## 背景与目标

开发统一的顶栏SDK，为所有子系统提供一致的用户体验和功能接口。实现全局状态管理、主题切换、用户信息等功能。

## 约定

### SDK接口约定
```typescript
interface BtcConsole {
  getUser(): UserInfo
  getTheme(): Theme
  setTheme(theme: Theme): void
  log(event: LogEvent): void
  ws: WebSocket
  runtime: RuntimeConfig
}

interface UserInfo {
  id: string
  name: string
  avatar?: string
  roles: string[]
  permissions: string[]
}

interface Theme {
  mode: 'light' | 'dark'
  primary: string
  accent: string
}

interface RuntimeConfig {
  mock: boolean
  apiBase: string
  env: string
  tenant: string
  locale: string
  features: Record<string, boolean>
}
```

### 组件命名约定
- 顶栏组件：`BtcTopbar.vue`
- 用户菜单：`BtcUserMenu.vue`
- 主题切换：`BtcThemeToggle.vue`
- 通知组件：`BtcNotifications.vue`

## 步骤

### 1. 初始化bridge包
```bash
cd packages/bridge
pnpm init
pnpm add vue@^3.3.0 pinia@^2.1.0 element-plus@^2.3.0
pnpm add -D @vitejs/plugin-vue typescript vite
```

### 2. 创建SDK核心
创建`packages/bridge/src/index.ts`：
```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import BtcTopbar from './components/BtcTopbar.vue'
import { useAuthStore, useThemeStore, useRuntimeStore } from './stores'

class BtcConsole {
  private app: any
  private pinia: any

  constructor() {
    this.initStores()
    this.initWebSocket()
  }

  private initStores() {
    this.pinia = createPinia()
    this.app = createApp({})
    this.app.use(this.pinia)
  }

  getUser() {
    return useAuthStore().user
  }

  getTheme() {
    return useThemeStore().currentTheme
  }

  setTheme(theme: Theme) {
    useThemeStore().setTheme(theme)
  }

  log(event: LogEvent) {
    // 实现日志记录
  }

  get ws() {
    return useRuntimeStore().websocket
  }

  get runtime() {
    return useRuntimeStore().config
  }
}

// 挂载到全局
declare global {
  interface Window {
    BtcConsole: BtcConsole
  }
}

window.BtcConsole = new BtcConsole()

export { BtcConsole }
export default BtcConsole
```

### 3. 创建顶栏组件
创建`packages/bridge/src/components/BtcTopbar.vue`：
```vue
<template>
  <div class="btc-topbar">
    <div class="btc-topbar-left">
      <div class="btc-logo">BTC MES</div>
      <BtcHamburgerToggle v-model="isMenuOpen" />
    </div>
    
    <div class="btc-topbar-center">
      <BtcBreadcrumb />
    </div>
    
    <div class="btc-topbar-right">
      <BtcThemeToggle />
      <BtcNotifications />
      <BtcUserMenu />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import BtcHamburgerToggle from './BtcHamburgerToggle.vue'
import BtcBreadcrumb from './BtcBreadcrumb.vue'
import BtcThemeToggle from './BtcThemeToggle.vue'
import BtcNotifications from './BtcNotifications.vue'
import BtcUserMenu from './BtcUserMenu.vue'

const isMenuOpen = ref(false)
const authStore = useAuthStore()
</script>

<style scoped>
.btc-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  background: var(--btc-bg-primary);
  border-bottom: 1px solid var(--btc-border-color);
}

.btc-topbar-left,
.btc-topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btc-logo {
  font-size: 18px;
  font-weight: bold;
  color: var(--btc-text-primary);
}
</style>
```

### 4. 创建全局状态管理
创建`packages/bridge/src/stores/auth.ts`：
```typescript
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as UserInfo | null,
    isAuthenticated: false,
    permissions: [] as string[]
  }),
  
  actions: {
    setUser(user: UserInfo) {
      this.user = user
      this.isAuthenticated = true
      this.permissions = user.permissions
    },
    
    logout() {
      this.user = null
      this.isAuthenticated = false
      this.permissions = []
    }
  }
})
```

创建`packages/bridge/src/stores/theme.ts`：
```typescript
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentTheme: {
      mode: 'light' as 'light' | 'dark',
      primary: '#e53e3e',
      accent: '#2d3748'
    }
  }),
  
  actions: {
    setTheme(theme: Theme) {
      this.currentTheme = theme
      this.applyTheme()
    },
    
    toggleMode() {
      this.currentTheme.mode = this.currentTheme.mode === 'light' ? 'dark' : 'light'
      this.applyTheme()
    },
    
    applyTheme() {
      // 应用主题到CSS变量
      document.documentElement.style.setProperty('--btc-primary', this.currentTheme.primary)
      document.documentElement.style.setProperty('--btc-accent', this.currentTheme.accent)
      document.documentElement.setAttribute('data-theme', this.currentTheme.mode)
    }
  }
})
```

### 5. 创建类型定义文件
创建`packages/bridge/src/index.d.ts`：
```typescript
export interface UserInfo {
  id: string
  name: string
  avatar?: string
  roles: string[]
  permissions: string[]
}

export interface Theme {
  mode: 'light' | 'dark'
  primary: string
  accent: string
}

export interface LogEvent {
  type: string
  message: string
  data?: any
  timestamp: number
}

export interface RuntimeConfig {
  mock: boolean
  apiBase: string
  env: string
  tenant: string
  locale: string
  features: Record<string, boolean>
}

export interface BtcConsole {
  getUser(): UserInfo
  getTheme(): Theme
  setTheme(theme: Theme): void
  log(event: LogEvent): void
  ws: WebSocket
  runtime: RuntimeConfig
}

declare global {
  interface Window {
    BtcConsole: BtcConsole
  }
}
```

### 6. 配置构建
创建`packages/bridge/vite.config.ts`：
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BtcConsole',
      fileName: 'console-bridge'
    },
    rollupOptions: {
      external: ['vue', 'pinia'],
      output: {
        globals: {
          vue: 'Vue',
          pinia: 'Pinia'
        }
      }
    }
  }
})
```

## 产出物

- [x] `packages/bridge/src/index.ts` - SDK核心实现
- [x] `packages/bridge/src/index.d.ts` - 类型定义
- [x] `packages/bridge/src/components/BtcTopbar.vue` - 顶栏组件
- [x] `packages/bridge/src/stores/` - 全局状态管理
- [x] `packages/bridge/dist/console-bridge.js` - 构建产物
- [x] `packages/bridge/dist/console-bridge.css` - 样式文件
- [x] `packages/bridge/src/styles/index.css` - 样式文件
- [x] `packages/bridge/vite.config.ts` - 构建配置
- [x] `packages/bridge/tsconfig.json` - TypeScript配置
- [x] `packages/bridge/test.html` - 测试页面

## 审计清单

- [x] window.BtcConsole SDK 可用
- [x] 顶栏组件正常工作
- [x] 全局状态管理生效
- [x] 主题切换功能正常
- [x] 用户信息获取正常
- [x] 类型定义完整
- [x] 构建产物正确
- [x] 所有组件创建完成
- [x] 状态管理store创建完成
- [x] CSS样式文件创建完成
- [x] 构建配置完成
- [x] 测试页面创建完成

