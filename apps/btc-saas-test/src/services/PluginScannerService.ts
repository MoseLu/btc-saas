import { ref, reactive } from 'vue'

// 扩展 ImportMeta 接口以支持 Vite 的虚拟模块
declare global {
  interface ImportMeta {
    glob(pattern: string, options?: { eager?: boolean }): Record<string, any>
  }
}

export interface PluginInfo {
  name: string
  displayName: string
  description: string
  version: string
  author: string
  category: string
  icon: string
  features: string[]
  path: string
  status: 'active' | 'inactive' | 'error'
  enabled: boolean
  lastModified: Date
  dependencies?: string[]
}

export interface PluginStatus {
  [pluginName: string]: {
    enabled: boolean
    lastModified: Date
    error?: string
  }
}

class PluginScannerService {
  private plugins = reactive<Map<string, PluginInfo>>(new Map())
  private pluginStatus = reactive<PluginStatus>({})
  private scanInProgress = ref(false)
  private lastScanTime = ref<Date | null>(null)

  // 真实插件目录扫描
  async scanPlugins(): Promise<PluginInfo[]> {
    this.scanInProgress.value = true
    
    try {
      // 扫描真实的插件目录
      const discoveredPlugins = await this.scanRealPlugins()
      
      // 更新插件列表
      this.plugins.clear()
      discoveredPlugins.forEach(plugin => {
        this.plugins.set(plugin.name, plugin)
        
        // 初始化状态
        if (!this.pluginStatus[plugin.name]) {
          this.pluginStatus[plugin.name] = {
            enabled: plugin.enabled,
            lastModified: plugin.lastModified
          }
        }
      })

      this.lastScanTime.value = new Date()
      
      return discoveredPlugins
    } catch (error) {
      console.error('插件扫描失败:', error)
      throw error
    } finally {
      this.scanInProgress.value = false
    }
  }

    // 扫描真实插件目录
  private async scanRealPlugins(): Promise<PluginInfo[]> {
    try {
      // 暂时使用后备插件列表，避免虚拟模块导入问题
      return this.getFallbackPlugins()
    } catch (error) {
      // 如果扫描失败，返回已实现的插件列表作为后备
      return this.getFallbackPlugins()
    }
  }

  // 从BTCPlugin转换为PluginInfo
  private convertFromBTCPlugin(plugin: any): PluginInfo {
    return {
      name: plugin.name,
      displayName: plugin.displayName,
      description: plugin.description || '插件描述',
      version: plugin.version,
      author: plugin.author || 'BTC Team',
      category: plugin.category,
      icon: plugin.icon || 'Setting',
      features: plugin.features || ['基础功能'],
      path: plugin.path,
      status: plugin.status === 'active' ? 'active' : 'inactive',
      enabled: plugin.status === 'active',
      lastModified: new Date(),
      dependencies: []
    }
  }

  // 后备插件列表（当真实扫描失败时使用）
  private getFallbackPlugins(): PluginInfo[] {
    return [
      {
        name: 'pdf2png',
        displayName: 'PDF转PNG',
        description: '将PDF文档转换为PNG图片格式，支持批量转换和自定义分辨率',
        version: '1.0.0',
        author: 'BTC Team',
        category: 'converter',
        icon: 'Picture',
        features: ['PDF转换', '批量处理', '自定义分辨率', '图片导出'],
        path: '/packages/plugins/pdf2png',
        status: 'active',
        enabled: true,
        lastModified: new Date(),
        dependencies: []
      },
      {
        name: 'richtext',
        displayName: '富文本编辑器',
        description: '提供富文本编辑功能，支持格式化文本、图片插入、表格等高级编辑功能',
        version: '1.0.0',
        author: 'BTC Team',
        category: 'editor',
        icon: 'Edit',
        features: ['文本编辑', '格式化', '图片插入', '表格支持'],
        path: '/packages/plugins/richtext',
        status: 'active',
        enabled: true,
        lastModified: new Date(),
        dependencies: []
      }
    ]
  }



  // 获取插件列表
  getPlugins(): PluginInfo[] {
    return Array.from(this.plugins.values())
  }

  // 获取插件信息
  getPlugin(name: string): PluginInfo | undefined {
    return this.plugins.get(name)
  }

  // 切换插件状态
  togglePlugin(name: string, enabled: boolean): void {
    const plugin = this.plugins.get(name)
    if (plugin) {
      plugin.enabled = enabled
      plugin.status = enabled ? 'active' : 'inactive'
      
      // 更新状态记录
      this.pluginStatus[name] = {
        ...this.pluginStatus[name],
        enabled,
        lastModified: new Date()
      }

             // 触发状态变更事件
       this.emitStatusChange(name, enabled)
    }
  }

  // 获取插件状态
  getPluginStatus(name: string): boolean {
    return this.pluginStatus[name]?.enabled ?? false
  }

  // 获取所有插件状态
  getAllPluginStatus(): PluginStatus {
    return { ...this.pluginStatus }
  }

  // 检查扫描状态
  isScanning(): boolean {
    return this.scanInProgress.value
  }

  // 获取最后扫描时间
  getLastScanTime(): Date | null {
    return this.lastScanTime.value
  }

  // 获取插件统计信息
  getPluginStats() {
    const plugins = this.getPlugins()
    return {
      total: plugins.length,
      active: plugins.filter(p => p.status === 'active').length,
      inactive: plugins.filter(p => p.status === 'inactive').length,
      error: plugins.filter(p => p.status === 'error').length,
      enabled: plugins.filter(p => p.enabled).length,
      disabled: plugins.filter(p => !p.enabled).length
    }
  }

  // 按分类获取插件
  getPluginsByCategory(category: string): PluginInfo[] {
    return this.getPlugins().filter(plugin => plugin.category === category)
  }

  // 搜索插件
  searchPlugins(query: string): PluginInfo[] {
    const plugins = this.getPlugins()
    const lowerQuery = query.toLowerCase()
    
    return plugins.filter(plugin => 
      plugin.name.toLowerCase().includes(lowerQuery) ||
      plugin.displayName.toLowerCase().includes(lowerQuery) ||
      plugin.description.toLowerCase().includes(lowerQuery) ||
      plugin.features.some(feature => feature.toLowerCase().includes(lowerQuery))
    )
  }

  // 状态变更事件
  private emitStatusChange(pluginName: string, enabled: boolean): void {
    // 触发自定义事件，供其他组件监听
    window.dispatchEvent(new CustomEvent('plugin-status-change', {
      detail: {
        pluginName,
        enabled,
        timestamp: new Date()
      }
    }))
  }

  // 监听状态变更
  onStatusChange(callback: (event: CustomEvent) => void): void {
    window.addEventListener('plugin-status-change', callback as EventListener)
  }

  // 移除状态变更监听
  offStatusChange(callback: (event: CustomEvent) => void): void {
    window.removeEventListener('plugin-status-change', callback as EventListener)
  }
}

// 创建单例实例
export const pluginScannerService = new PluginScannerService()
