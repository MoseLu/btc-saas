import { createApp, nextTick } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// 导入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 一次性引入暗色CSS，避免动态加载
import 'element-plus/theme-chalk/dark/css-vars.css'

// 导入图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 导入统一样式系统
import '@btc/styles/index.scss'

// 导入主题动画样式覆盖
import './styles/theme-wave-override.css'

// 导入预水合工具
import { prefetchOpeneds } from './bootstrap/opened-prefetch'
import { useMenuStore } from './stores/menu'
import { useTabsStore } from './stores/tabs'

// 初始化应用
async function bootstrap() {
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

  // 注册 Element Plus
  app.use(ElementPlus)

  // 注册所有图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

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
