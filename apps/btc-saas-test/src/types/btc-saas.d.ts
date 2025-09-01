
// 自动生成的 BTC Saas 类型声明
// 此文件由 @btc/btc-saas 插件自动生成，请勿手动修改

declare module 'virtual:btc-saas' {
  // 服务类型
  export interface BtcService {
    'user': any
  }

  // 环境配置类型
  export interface BtcEnv {
    NODE_ENV: string
    VITE_APP_TITLE: string
    VITE_API_BASE_URL: string
    [key: string]: any
  }

  // 主题配置类型
  export interface BtcTheme {
    primary: string
    success: string
    warning: string
    error: string
    [key: string]: any
  }

  // 工具方法类型
  export interface BtcUtils {
    apiPrefix: string
    formatDate: (date: Date) => string
    formatDateTime: (date: Date) => string
    debounce: <T extends (...args: any[]) => any>(fn: T, delay: number) => T
    throttle: <T extends (...args: any[]) => any>(fn: T, delay: number) => T
    [key: string]: any
  }

  // 主上下文类型
  export interface BtcContext {
    env: BtcEnv
    service: BtcService
    modules: any[]
    app?: any
    theme: BtcTheme
    utils: BtcUtils
    plugins?: any[]
    mocks?: any[]
  }

  // 导出主对象和设置函数
  export const btc: BtcContext
  export function setup(app: any): Promise<BtcContext>
  export default BtcContext
}
