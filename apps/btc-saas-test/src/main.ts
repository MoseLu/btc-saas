import { createApp, nextTick } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// Element Plus 样式导入 - 按照 CSS Layers 顺序
// 1. 先导入 Element Plus 完整样式（放在 element-plus 层）
import 'element-plus/dist/index.css'

// 2. 再导入暗色主题变量
import 'element-plus/theme-chalk/dark/css-vars.css'

// 导入统一样式系统
import '@btc/styles/index.scss'

// 导入自定义滚动条样式
import './styles/scrollbar.scss'

// 导入完美主题切换系统
import { initTheme } from './utils/perfectTheme'

// 导入滚动条管理工具
import './utils/scrollbarManager'

// 导入布局自检脚本（开发环境）
import './utils/layout-debug'

// 导入全局View Transitions CSS（确保选择器能正确命中）
import './assets/styles/theme-transition.css'

// 导入 Element Plus 浮层保护样式
import './assets/styles/element-plus-protection.css'

// 导入预水合工具
import { prefetchOpeneds } from './bootstrap/opened-prefetch'
import { useMenuStore } from './stores/menu'
import { useTabsStore } from './stores/tabs'

// 初始化应用
async function bootstrap() {
  // 初始化完美主题切换系统
  initTheme()
  
  // 添加首帧标记，禁用过渡动画
  document.documentElement.setAttribute('data-first-paint', '1')
  
  const app = createApp(App)
  const pinia = createPinia()
  
  // 注册 Pinia
  app.use(pinia)
  
  // 关键：在 mount 前把 openeds 写进 store（同步！）
  const menuStore = useMenuStore(pinia)
  const tabsStore = useTabsStore(pinia)
  const prefetchedOpeneds = prefetchOpeneds()
  menuStore.$patch({ 
    openeds: prefetchedOpeneds,
    isCollapse: localStorage.getItem('menuCollapse') === 'true'
  })

  // 预水合：在挂载前恢复"内容全屏"标志，防止布局闪烁
  tabsStore.hydrateOnBoot()

  // 可选：给 DOM 标个"已预水合"标记，CSS 用得上
  document.documentElement.setAttribute('data-menu-hydrated', '1')

  // Element Plus 组件和图标现在通过 Auto Import 自动注册

  // 注册路由
  app.use(router)

  await nextTick()
  app.mount('#app')
  
  // 延迟移除首帧标记，确保应用完全渲染完成
  setTimeout(() => {
    document.documentElement.removeAttribute('data-first-paint')
  }, 100)
}

// 启动应用
bootstrap()
