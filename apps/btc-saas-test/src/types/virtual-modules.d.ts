// 虚拟模块类型声明
declare module 'virtual:btc-plugins' {
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

  export const plugins: BTCPlugin[]
}

// Vue组件模块声明
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}