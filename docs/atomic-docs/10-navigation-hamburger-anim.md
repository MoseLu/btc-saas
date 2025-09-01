---
title: 导航汉堡菜单动画
category: navigation
order: 10
owners: [frontend, ui]
auditable: true
acceptance:
  - [ ] 汉堡菜单动画流畅
  - [ ] 键盘可达性支持
  - [ ] 中心对称动画
  - [ ] 导航日志记录
outputs:
  - packages/bridge/src/components/HamburgerToggle.vue
  - packages/bridge/src/components/Navigation.vue
  - packages/bridge/src/styles/navigation.sass
related: [02-bridge-sdk-and-topbar, 08-styles-and-ep-theme.sass]
---

# 导航汉堡菜单动画

## 背景与目标

实现阿里云风格的汉堡菜单动画，支持悬浮/点击/键盘可达，三横线↔叉中心对称，200-300ms动画，记录导航日志。

## 约定

### 动画规范
- 动画时长：200-300ms
- 缓动函数：ease-in-out
- 中心对称变换
- 支持键盘操作
- 无障碍访问支持

## 步骤

### 1. 创建汉堡菜单组件
创建`packages/bridge/src/components/HamburgerToggle.vue`：
```vue
<template>
  <button
    ref="buttonRef"
    class="hamburger-toggle"
    :class="{ 'is-active': modelValue }"
    :aria-expanded="modelValue"
    :aria-label="modelValue ? '关闭菜单' : '打开菜单'"
    @click="toggleMenu"
    @keydown="handleKeydown"
  >
    <div class="hamburger-icon">
      <span class="line line-1"></span>
      <span class="line line-2"></span>
      <span class="line line-3"></span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { log } from '@btc/logs'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const buttonRef = ref<HTMLButtonElement>()

const toggleMenu = async () => {
  const newValue = !props.modelValue
  emit('update:modelValue', newValue)
  
  // 记录导航日志
  log.navigation('汉堡菜单切换', {
    action: newValue ? 'open' : 'close',
    timestamp: Date.now()
  })
  
  // 焦点管理
  await nextTick()
  if (buttonRef.value) {
    buttonRef.value.focus()
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      toggleMenu()
      break
    case 'Escape':
      if (props.modelValue) {
        event.preventDefault()
        emit('update:modelValue', false)
        log.navigation('汉堡菜单关闭', {
          action: 'escape',
          timestamp: Date.now()
        })
      }
      break
  }
}
</script>

<style scoped lang="sass">
.hamburger-toggle
  position: relative
  width: 40px
  height: 40px
  border: none
  background: transparent
  cursor: pointer
  border-radius: 4px
  transition: background-color 0.2s ease
  
  &:hover
    background-color: rgba(0, 0, 0, 0.05)
  
  &:focus
    outline: 2px solid var(--btc-primary)
    outline-offset: 2px
  
  &:active
    background-color: rgba(0, 0, 0, 0.1)

.hamburger-icon
  position: relative
  width: 20px
  height: 20px
  margin: 0 auto

.line
  position: absolute
  left: 0
  width: 100%
  height: 2px
  background-color: var(--btc-text-primary)
  border-radius: 1px
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
  transform-origin: center

.line-1
  top: 4px
  transform: translateY(0) rotate(0deg)

.line-2
  top: 50%
  transform: translateY(-50%) scaleX(1)

.line-3
  bottom: 4px
  transform: translateY(0) rotate(0deg)

// 激活状态动画
.hamburger-toggle.is-active
  .line-1
    transform: translateY(6px) rotate(45deg)
  
  .line-2
    transform: translateY(-50%) scaleX(0)
    opacity: 0
  
  .line-3
    transform: translateY(-6px) rotate(-45deg)

// 深色主题适配
[data-theme="dark"] .hamburger-toggle
  &:hover
    background-color: rgba(255, 255, 255, 0.1)
  
  &:active
    background-color: rgba(255, 255, 255, 0.2)
  
  .line
    background-color: var(--btc-text-primary)

// 响应式设计
@media (max-width: 768px)
  .hamburger-toggle
    width: 36px
    height: 36px
  
  .hamburger-icon
    width: 18px
    height: 18px
</style>
```

### 2. 创建导航组件
创建`packages/bridge/src/components/Navigation.vue`：
```vue
<template>
  <nav class="navigation" :class="{ 'is-open': isOpen }">
    <div class="navigation-header">
      <h2 class="navigation-title">BTC MES</h2>
      <HamburgerToggle v-model="isOpen" />
    </div>
    
    <div class="navigation-content">
      <div class="navigation-section">
        <h3 class="section-title">主要功能</h3>
        <ul class="navigation-list">
          <li v-for="item in mainMenu" :key="item.id">
            <a
              :href="item.href"
              :class="['navigation-link', { 'is-active': item.isActive }]"
              @click="handleNavigation(item)"
            >
              <i :class="item.icon" class="link-icon"></i>
              <span class="link-text">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </div>
      
      <div class="navigation-section">
        <h3 class="section-title">子系统</h3>
        <ul class="navigation-list">
          <li v-for="app in subApps" :key="app.id">
            <a
              :href="app.href"
              class="navigation-link"
              target="_blank"
              rel="noopener noreferrer"
              @click="handleAppNavigation(app)"
            >
              <i :class="app.icon" class="link-icon"></i>
              <span class="link-text">{{ app.label }}</span>
              <i class="external-icon">↗</i>
            </a>
          </li>
        </ul>
      </div>
      
      <div class="navigation-section">
        <h3 class="section-title">工具</h3>
        <ul class="navigation-list">
          <li v-for="tool in tools" :key="tool.id">
            <a
              :href="tool.href"
              class="navigation-link"
              @click="handleToolNavigation(tool)"
            >
              <i :class="tool.icon" class="link-icon"></i>
              <span class="link-text">{{ tool.label }}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
    
    <div class="navigation-footer">
      <div class="user-info">
        <img :src="userAvatar" :alt="userName" class="user-avatar" />
        <div class="user-details">
          <span class="user-name">{{ userName }}</span>
          <span class="user-role">{{ userRole }}</span>
        </div>
      </div>
    </div>
  </nav>
  
  <!-- 遮罩层 -->
  <div
    v-if="isOpen"
    class="navigation-overlay"
    @click="closeNavigation"
  ></div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { log } from '@btc/logs'
import HamburgerToggle from './HamburgerToggle.vue'

interface NavigationItem {
  id: string
  label: string
  href: string
  icon: string
  isActive?: boolean
}

interface SubApp {
  id: string
  label: string
  href: string
  icon: string
  description?: string
}

interface Tool {
  id: string
  label: string
  href: string
  icon: string
}

const authStore = useAuthStore()
const isOpen = ref(false)

// 用户信息
const userName = computed(() => authStore.user?.name || '用户')
const userRole = computed(() => authStore.user?.roles[0]?.name || '普通用户')
const userAvatar = computed(() => authStore.user?.avatar || '/default-avatar.png')

// 主导航菜单
const mainMenu = ref<NavigationItem[]>([
  {
    id: 'dashboard',
    label: '仪表板',
    href: '/dashboard',
    icon: 'icon-dashboard',
    isActive: true
  },
  {
    id: 'quality',
    label: '品质管理',
    href: '/quality',
    icon: 'icon-quality'
  },
  {
    id: 'purchase',
    label: '采购管理',
    href: '/purchase',
    icon: 'icon-purchase'
  },
  {
    id: 'engineering',
    label: '工程管理',
    href: '/engineering',
    icon: 'icon-engineering'
  },
  {
    id: 'production',
    label: '生产控制',
    href: '/production',
    icon: 'icon-production'
  },
  {
    id: 'bi',
    label: '商业智能',
    href: '/bi',
    icon: 'icon-bi'
  }
])

// 子系统应用
const subApps = ref<SubApp[]>([
  {
    id: 'quality-app',
    label: '品质系统',
    href: 'http://quality.btc.com',
    icon: 'icon-quality-app',
    description: '品质检测与管理系统'
  },
  {
    id: 'purchase-app',
    label: '采购系统',
    href: 'http://purchase.btc.com',
    icon: 'icon-purchase-app',
    description: '采购流程管理系统'
  },
  {
    id: 'engineering-app',
    label: '工程系统',
    href: 'http://engineering.btc.com',
    icon: 'icon-engineering-app',
    description: '工程项目管理系统'
  },
  {
    id: 'production-app',
    label: '生产系统',
    href: 'http://production.btc.com',
    icon: 'icon-production-app',
    description: '生产计划与控制系统'
  },
  {
    id: 'bi-app',
    label: 'BI系统',
    href: 'http://bi.btc.com',
    icon: 'icon-bi-app',
    description: '商业智能分析系统'
  }
])

// 工具菜单
const tools = ref<Tool[]>([
  {
    id: 'settings',
    label: '系统设置',
    href: '/settings',
    icon: 'icon-settings'
  },
  {
    id: 'help',
    label: '帮助文档',
    href: '/help',
    icon: 'icon-help'
  },
  {
    id: 'feedback',
    label: '意见反馈',
    href: '/feedback',
    icon: 'icon-feedback'
  }
])

// 处理主导航点击
const handleNavigation = (item: NavigationItem) => {
  log.navigation('主导航点击', {
    item: item.id,
    label: item.label,
    href: item.href,
    timestamp: Date.now()
  })
  
  // 更新激活状态
  mainMenu.value.forEach(menuItem => {
    menuItem.isActive = menuItem.id === item.id
  })
  
  closeNavigation()
}

// 处理子系统导航
const handleAppNavigation = (app: SubApp) => {
  log.navigation('子系统导航', {
    app: app.id,
    label: app.label,
    href: app.href,
    timestamp: Date.now()
  })
  
  // 在新窗口打开
  window.open(app.href, '_blank', 'noopener,noreferrer')
  closeNavigation()
}

// 处理工具导航
const handleToolNavigation = (tool: Tool) => {
  log.navigation('工具导航', {
    tool: tool.id,
    label: tool.label,
    href: tool.href,
    timestamp: Date.now()
  })
  
  closeNavigation()
}

// 关闭导航
const closeNavigation = () => {
  isOpen.value = false
}

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeNavigation()
  }
}

// 监听键盘事件
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="sass">
.navigation
  position: fixed
  top: 0
  left: 0
  width: 280px
  height: 100vh
  background: var(--btc-bg-primary)
  border-right: 1px solid var(--btc-border-color)
  transform: translateX(-100%)
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)
  z-index: 1000
  display: flex
  flex-direction: column
  
  &.is-open
    transform: translateX(0)
  
  @media (max-width: 768px)
    width: 100vw

.navigation-header
  display: flex
  align-items: center
  justify-content: space-between
  padding: 16px
  border-bottom: 1px solid var(--btc-border-color)

.navigation-title
  font-size: 18px
  font-weight: 600
  color: var(--btc-text-primary)
  margin: 0

.navigation-content
  flex: 1
  overflow-y: auto
  padding: 16px 0

.navigation-section
  margin-bottom: 24px
  
  &:last-child
    margin-bottom: 0

.section-title
  font-size: 12px
  font-weight: 600
  color: var(--btc-text-secondary)
  text-transform: uppercase
  letter-spacing: 0.5px
  margin: 0 0 8px 16px

.navigation-list
  list-style: none
  margin: 0
  padding: 0

.navigation-link
  display: flex
  align-items: center
  padding: 12px 16px
  color: var(--btc-text-primary)
  text-decoration: none
  transition: all 0.2s ease
  position: relative
  
  &:hover
    background-color: rgba(0, 0, 0, 0.05)
    color: var(--btc-primary)
  
  &:focus
    outline: 2px solid var(--btc-primary)
    outline-offset: -2px
  
  &.is-active
    background-color: rgba(229, 62, 62, 0.1)
    color: var(--btc-primary)
    
    &::before
      content: ''
      position: absolute
      left: 0
      top: 0
      bottom: 0
      width: 3px
      background-color: var(--btc-primary)

.link-icon
  width: 20px
  height: 20px
  margin-right: 12px
  display: flex
  align-items: center
  justify-content: center

.link-text
  flex: 1
  font-size: 14px
  font-weight: 500

.external-icon
  font-size: 12px
  color: var(--btc-text-secondary)
  margin-left: 8px

.navigation-footer
  padding: 16px
  border-top: 1px solid var(--btc-border-color)

.user-info
  display: flex
  align-items: center

.user-avatar
  width: 32px
  height: 32px
  border-radius: 50%
  margin-right: 12px

.user-details
  display: flex
  flex-direction: column

.user-name
  font-size: 14px
  font-weight: 500
  color: var(--btc-text-primary)

.user-role
  font-size: 12px
  color: var(--btc-text-secondary)

.navigation-overlay
  position: fixed
  top: 0
  left: 0
  width: 100vw
  height: 100vh
  background-color: rgba(0, 0, 0, 0.5)
  z-index: 999
  animation: fadeIn 0.2s ease

@keyframes fadeIn
  from
    opacity: 0
  to
    opacity: 1

// 深色主题适配
[data-theme="dark"] .navigation
  .navigation-link:hover
    background-color: rgba(255, 255, 255, 0.1)
  
  .navigation-link.is-active
    background-color: rgba(229, 62, 62, 0.2)

// 响应式设计
@media (max-width: 768px)
  .navigation
    .navigation-header
      padding: 12px
    
    .navigation-content
      padding: 12px 0
    
    .section-title
      margin: 0 0 8px 12px
    
    .navigation-link
      padding: 10px 12px
    
    .navigation-footer
      padding: 12px
</style>
```

### 3. 创建导航样式
创建`packages/bridge/src/styles/navigation.sass`：
```sass
// 导航图标字体
@font-face
  font-family: 'btc-icons'
  src: url('../assets/fonts/btc-icons.woff2') format('woff2')
  font-weight: normal
  font-style: normal

.icon
  font-family: 'btc-icons'
  font-style: normal
  font-weight: normal
  font-variant: normal
  text-transform: none
  line-height: 1
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale

// 图标定义
.icon-dashboard:before
  content: '\e900'

.icon-quality:before
  content: '\e901'

.icon-purchase:before
  content: '\e902'

.icon-engineering:before
  content: '\e903'

.icon-production:before
  content: '\e904'

.icon-bi:before
  content: '\e905'

.icon-settings:before
  content: '\e906'

.icon-help:before
  content: '\e907'

.icon-feedback:before
  content: '\e908'

// 导航动画
@keyframes slideInLeft
  from
    transform: translateX(-100%)
    opacity: 0
  to
    transform: translateX(0)
    opacity: 1

@keyframes slideOutLeft
  from
    transform: translateX(0)
    opacity: 1
  to
    transform: translateX(-100%)
    opacity: 0

@keyframes fadeIn
  from
    opacity: 0
  to
    opacity: 1

@keyframes fadeOut
  from
    opacity: 1
  to
    opacity: 0

// 导航过渡效果
.navigation-enter-active
  animation: slideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1)

.navigation-leave-active
  animation: slideOutLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1)

.overlay-enter-active
  animation: fadeIn 0.2s ease

.overlay-leave-active
  animation: fadeOut 0.2s ease

// 无障碍访问支持
.navigation
  &:focus-within
    outline: 2px solid var(--btc-primary)
    outline-offset: -2px

.navigation-link
  &:focus-visible
    outline: 2px solid var(--btc-primary)
    outline-offset: -2px
    background-color: rgba(229, 62, 62, 0.1)

// 高对比度模式支持
@media (prefers-contrast: high)
  .navigation
    border-right: 2px solid var(--btc-text-primary)
  
  .navigation-link
    border-bottom: 1px solid var(--btc-border-color)
    
    &:hover
      background-color: var(--btc-primary)
      color: white

// 减少动画模式支持
@media (prefers-reduced-motion: reduce)
  .navigation,
  .navigation-link,
  .hamburger-toggle,
  .line
    transition: none
    animation: none
```

### 4. 创建导航服务
创建`packages/bridge/src/services/navigation.ts`：
```typescript
import { log } from '@btc/logs'

export interface NavigationEvent {
  type: 'menu' | 'link' | 'app' | 'tool'
  target: string
  label: string
  href: string
  timestamp: number
  userAgent?: string
  referrer?: string
}

export class NavigationService {
  private static instance: NavigationService
  private navigationHistory: NavigationEvent[] = []

  static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService()
    }
    return NavigationService.instance
  }

  // 记录导航事件
  recordNavigation(event: Omit<NavigationEvent, 'timestamp'>): void {
    const navigationEvent: NavigationEvent = {
      ...event,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    }

    this.navigationHistory.push(navigationEvent)
    
    // 记录到日志系统
    log.navigation('导航事件', navigationEvent)
    
    // 限制历史记录数量
    if (this.navigationHistory.length > 100) {
      this.navigationHistory = this.navigationHistory.slice(-50)
    }
  }

  // 获取导航历史
  getNavigationHistory(): NavigationEvent[] {
    return [...this.navigationHistory]
  }

  // 获取最近的导航
  getRecentNavigation(limit: number = 10): NavigationEvent[] {
    return this.navigationHistory.slice(-limit)
  }

  // 分析导航模式
  analyzeNavigationPattern(): {
    mostVisited: string[]
    averageSessionTime: number
    bounceRate: number
  } {
    const visits = new Map<string, number>()
    
    this.navigationHistory.forEach(event => {
      const key = `${event.type}:${event.target}`
      visits.set(key, (visits.get(key) || 0) + 1)
    })
    
    const mostVisited = Array.from(visits.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([key]) => key)
    
    return {
      mostVisited,
      averageSessionTime: this.calculateAverageSessionTime(),
      bounceRate: this.calculateBounceRate()
    }
  }

  private calculateAverageSessionTime(): number {
    // 简单的会话时间计算
    if (this.navigationHistory.length < 2) return 0
    
    const firstEvent = this.navigationHistory[0]
    const lastEvent = this.navigationHistory[this.navigationHistory.length - 1]
    
    return (lastEvent.timestamp - firstEvent.timestamp) / 1000
  }

  private calculateBounceRate(): number {
    // 简单的跳出率计算
    if (this.navigationHistory.length === 0) return 0
    
    const singlePageVisits = this.navigationHistory.filter((event, index, array) => {
      if (index === 0) return false
      const prevEvent = array[index - 1]
      return event.timestamp - prevEvent.timestamp > 30000 // 30秒内无其他导航
    }).length
    
    return (singlePageVisits / this.navigationHistory.length) * 100
  }

  // 清理导航历史
  clearHistory(): void {
    this.navigationHistory = []
  }
}

export const navigationService = NavigationService.getInstance()
```

## 产出物

- [x] `packages/bridge/src/components/HamburgerToggle.vue` - 汉堡菜单组件
- [x] `packages/bridge/src/components/Navigation.vue` - 导航组件
- [x] `packages/bridge/src/styles/navigation.sass` - 导航样式
- [x] `packages/bridge/src/services/navigation.ts` - 导航服务

## 审计清单

- [ ] 汉堡菜单动画流畅
- [ ] 键盘可达性支持
- [ ] 中心对称动画
- [ ] 导航日志记录
- [ ] 无障碍访问支持
- [ ] 响应式设计
- [ ] 深色主题适配
