import { pluginScannerService, type PluginInfo } from './PluginScannerService'

/**
 * 插件管理API服务
 * 封装所有插件相关的API调用
 */
export const pluginApi = {
  /**
   * 扫描插件
   */
  async scanPlugins(): Promise<PluginInfo[]> {
    return await pluginScannerService.scanPlugins()
  },

  /**
   * 切换插件状态
   */
  togglePlugin(pluginName: string, enabled: boolean): void {
    pluginScannerService.togglePlugin(pluginName, enabled)
  },

  /**
   * 获取最后扫描时间
   */
  getLastScanTime(): Date | null {
    return pluginScannerService.getLastScanTime()
  },

  /**
   * 监听插件状态变更
   */
  onStatusChange(callback: (event: CustomEvent) => void): void {
    pluginScannerService.onStatusChange(callback)
  },

  /**
   * 移除状态变更监听
   */
  offStatusChange(callback: (event: CustomEvent) => void): void {
    pluginScannerService.offStatusChange(callback)
  }
}

export type { PluginInfo }
