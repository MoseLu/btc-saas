/**
 * BTC SaaS 应用配置
 * 
 * 定义应用级别的配置选项，包括默认路由、主题设置等
 */

export interface AppConfig {
  /** 默认首页路径 - 显式约定，避免侥幸匹配 */
  home: string
  
  /** 应用标题 */
  title: string
  
  /** 是否启用TabBar */
  enableTabBar: boolean
  
  /** 是否启用面包屑导航 */
  enableBreadcrumb: boolean
  
  /** 默认主题 */
  defaultTheme: 'light' | 'dark' | 'auto'
}

const appConfig: AppConfig = {
  // 设置首页为根路由
  home: '/',
  
  title: 'BTC SaaS 管理平台',
  
  enableTabBar: true,
  
  enableBreadcrumb: true,
  
  defaultTheme: 'light'
}

export default appConfig
