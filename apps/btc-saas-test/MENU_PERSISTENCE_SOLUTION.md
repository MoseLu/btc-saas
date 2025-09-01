# 菜单状态持久化解决方案

## 问题描述

在刷新浏览器时，如果已经展开了一级菜单，二级菜单会消失，出现"先收起→再弹开"的闪烁现象。

## 问题本质

**症状本质**：刷新后首屏是"默认折叠态"先渲染，Pinia/路由状态还没恢复，等到水合/挂载完才把二级菜单展开，所以看到"先收起→再弹开"的闪烁。

## 解决方案

采用"三板斧"预水合方案，确保在应用挂载前就恢复菜单状态：

### 1. 首屏"预水合"openKeys

#### 核心文件

**`src/bootstrap/opened-prefetch.ts`**
```typescript
const KEY = 'btc:menu:openeds'

export function prefetchOpeneds(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function persistOpeneds(keys: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(keys))
  } catch {
    // 忽略存储错误
  }
}
```

**`src/stores/menu.ts`**
```typescript
import { defineStore } from 'pinia'
import { persistOpeneds } from '../bootstrap/opened-prefetch'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    openeds: [] as string[],
    isCollapse: false
  }),
  
  actions: {
    setOpeneds(keys: string[]) {
      this.openeds = keys
      persistOpeneds(keys)
    },
    
    toggle(key: string) {
      const set = new Set(this.openeds)
      set.has(key) ? set.delete(key) : set.add(key)
      this.setOpeneds([...set])
    },
    
    addOpened(key: string) {
      if (!this.openeds.includes(key)) {
        this.setOpeneds([...this.openeds, key])
      }
    },
    
    removeOpened(key: string) {
      const index = this.openeds.indexOf(key)
      if (index > -1) {
        const newOpeneds = [...this.openeds]
        newOpeneds.splice(index, 1)
        this.setOpeneds(newOpeneds)
      }
    }
  }
})
```

**`src/main.ts`**
```typescript
async function bootstrap() {
  // 添加首屏标记，禁用过渡动画
  document.documentElement.setAttribute('data-first-paint', '1')
  
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)
  
  // 关键：在 mount 前把 openeds 写进 store（同步！）
  const menuStore = useMenuStore(pinia)
  const prefetchedOpeneds = prefetchOpeneds()
  menuStore.$patch({ 
    openeds: prefetchedOpeneds,
    isCollapse: localStorage.getItem('menuCollapse') === 'true'
  })

  // 给 DOM 标个"已预水合"标记
  document.documentElement.setAttribute('data-menu-hydrated', '1')

  await nextTick()
  app.mount('#app')
  
  // 挂载完成后移除首屏标记，恢复过渡动画
  setTimeout(() => {
    document.documentElement.removeAttribute('data-first-paint')
  }, 100)
}
```

### 2. 首屏"防闪烁"处理

**`index.html`**
```html
<style>
  [v-cloak] { visibility: hidden !important; }
  
  /* 默认隐藏侧栏，等 main.ts 打上 data-menu-hydrated=1 再显示 */
  html:not([data-menu-hydrated="1"]) .sidebar { 
    visibility: hidden; 
  }
  
  /* 首屏禁用过渡动画，减少闪烁 */
  html[data-first-paint="1"] .el-menu--collapse,
  html[data-first-paint="1"] .el-sub-menu__title { 
    transition: none !important; 
  }
</style>
```

**`AdminLayout.vue`**
```vue
<el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar" v-cloak>
  <el-menu
    :default-active="activeMenu"
    :collapse="isCollapse"
    :unique-opened="true"
    :default-openeds="openeds"
    router
    class="sidebar-menu"
    :collapse-transition="false"
    @select="handleMenuSelect"
    @open="handleMenuOpen"
    @close="handleMenuClose"
  >
    <!-- 菜单内容 -->
  </el-menu>
</el-aside>
```

### 3. 路由驱动展开

**`AdminLayout.vue`**
```typescript
// 监听路由变化
watch(() => route.path, (newPath) => {
  // 路由变化时，确保当前路由对应的菜单分类是展开的
  const currentCategory = route.meta?.category as string
  if (currentCategory) {
    menuStore.addOpened(currentCategory)
  }
}, { immediate: true })
```

## 核心优势

1. **预水合**：在 Vue 挂载前就恢复菜单状态，避免"先收起→再弹开"
2. **防闪烁**：使用 `v-cloak` 和 CSS 控制，确保首屏渲染稳定
3. **路由驱动**：根据当前路由自动展开对应菜单分类
4. **状态持久化**：使用 Pinia store 统一管理菜单状态

## 测试方法

1. 访问 `/test` 页面查看菜单状态测试工具
2. 展开左侧菜单中的任意一级菜单
3. 刷新浏览器页面
4. 检查菜单是否保持展开状态（应该没有闪烁）

## 技术要点

- **关键时机**：在 `app.mount()` 前就准备好 `default-openeds`
- **状态同步**：使用 Pinia store 确保状态一致性
- **防抖处理**：首屏禁用过渡动画，挂载后恢复
- **错误处理**：localStorage 操作包含 try-catch 保护

## 文件结构

```
src/
├── bootstrap/
│   └── opened-prefetch.ts    # 预水合工具
├── stores/
│   └── menu.ts              # 菜单状态管理
├── layouts/
│   └── AdminLayout.vue      # 主布局组件
├── modules/
│   └── test/                # 测试模块
│       ├── module.config.ts
│       └── pages/
│           └── index.vue
└── main.ts                  # 应用入口
```

这个解决方案彻底解决了菜单状态在刷新时的闪烁问题，提供了流畅的用户体验。
