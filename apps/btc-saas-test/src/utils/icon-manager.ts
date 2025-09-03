/**
 * 按需加载图标管理系统
 * 
 * 功能：
 * 1. 动态导入Element Plus图标组件
 * 2. 图标组件缓存管理
 * 3. 按需加载，减少初始包体积
 * 4. 支持图标预加载和懒加载
 */

import { markRaw, type Component } from 'vue'

// 图标组件类型
export type IconComponent = Component

// 图标缓存接口
interface IconCache {
  [key: string]: IconComponent
}

// 或者使用 Map 类型
type IconCacheMap = Map<string, IconComponent>

// 图标加载状态
interface IconLoadState {
  loading: boolean
  loaded: boolean
  error: boolean
  component: IconComponent | null
}

/**
 * 图标管理器类
 */
export class IconManager {
  private static instance: IconManager
  private iconCache: IconCacheMap = new Map()
  private loadStates: Map<string, IconLoadState> = new Map()
  private preloadQueue: string[] = []
  private isPreloading = false

  private constructor() {
    this.initializeDefaultIcons()
  }

  static getInstance(): IconManager {
    if (!IconManager.instance) {
      IconManager.instance = new IconManager()
    }
    return IconManager.instance
  }

  /**
   * 初始化默认图标（常用图标预加载）
   */
  private initializeDefaultIcons(): void {
    const defaultIcons = [
      'Setting', 'Grid', 'Monitor', 'User', 'Sunny', 'Moon',
      'Fold', 'Expand', 'Link', 'Document', 'Location', 'Folder'
    ]
    
    // 异步预加载默认图标
    this.preloadIcons(defaultIcons)
  }

  /**
   * 预加载图标列表
   */
  async preloadIcons(iconNames: string[]): Promise<void> {
    if (this.isPreloading) {
      this.preloadQueue.push(...iconNames)
      return
    }

    this.isPreloading = true
    
    try {
      const loadPromises = iconNames.map(name => this.loadIcon(name))
      await Promise.all(loadPromises)
      
      // 处理队列中的图标
      if (this.preloadQueue.length > 0) {
        const queuedIcons = [...this.preloadQueue]
        this.preloadQueue = []
        await this.preloadIcons(queuedIcons)
      }
    } catch (error) {
      console.warn('预加载图标失败:', error)
    } finally {
      this.isPreloading = false
    }
  }

  /**
   * 加载单个图标
   */
  async loadIcon(iconName: string): Promise<IconComponent> {
    // 检查缓存
    if (this.iconCache.has(iconName)) {
      return this.iconCache.get(iconName)!
    }

    // 检查加载状态
    const loadState = this.loadStates.get(iconName)
    if (loadState?.loading) {
      // 等待加载完成
      return new Promise((resolve, reject) => {
        const checkLoaded = () => {
          if (loadState.loaded && loadState.component) {
            resolve(loadState.component)
          } else if (loadState.error) {
            reject(new Error(`图标 ${iconName} 加载失败`))
          } else {
            setTimeout(checkLoaded, 50)
          }
        }
        checkLoaded()
      })
    }

    // 设置加载状态
    this.loadStates.set(iconName, {
      loading: true,
      loaded: false,
      error: false,
      component: null
    })

    try {
      // 动态导入图标组件
      const iconModule = await this.importIcon(iconName)
      const iconComponent = markRaw(iconModule.default || iconModule)
      
      // 缓存图标组件
      this.iconCache.set(iconName, iconComponent)
      
      // 更新加载状态
      this.loadStates.set(iconName, {
        loading: false,
        loaded: true,
        error: false,
        component: iconComponent
      })
      
      return iconComponent
    } catch (error) {
      // 更新错误状态
      this.loadStates.set(iconName, {
        loading: false,
        loaded: false,
        error: true,
        component: null
      })
      
      console.error(`加载图标 ${iconName} 失败:`, error)
      throw error
    }
  }

  /**
   * 动态导入图标组件
   */
  private async importIcon(iconName: string): Promise<any> {
    try {
      // 尝试从 @element-plus/icons-vue 导入
      const iconModule = await import(`@element-plus/icons-vue/es/${iconName}.mjs`)
      return iconModule
    } catch (error) {
      // 如果动态导入失败，尝试从主包导入
      try {
        const iconModule = await import('@element-plus/icons-vue')
        const IconComponent = (iconModule as any)[iconName]
        if (IconComponent) {
          return { default: IconComponent }
        }
        throw new Error(`图标 ${iconName} 不存在`)
      } catch (fallbackError) {
        throw new Error(`无法加载图标 ${iconName}: ${fallbackError}`)
      }
    }
  }

  /**
   * 获取图标组件（同步版本，如果已缓存）
   */
  getIcon(iconName: string): IconComponent | null {
    return this.iconCache.get(iconName) || null
  }

  /**
   * 检查图标是否已加载
   */
  isIconLoaded(iconName: string): boolean {
    return this.iconCache.has(iconName)
  }

  /**
   * 获取图标加载状态
   */
  getIconLoadState(iconName: string): IconLoadState | undefined {
    return this.loadStates.get(iconName)
  }

  /**
   * 清除图标缓存
   */
  clearCache(): void {
    this.iconCache.clear()
    this.loadStates.clear()
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): { cached: number; loading: number; total: number } {
    const cached = this.iconCache.size
    const loading = Array.from(this.loadStates.values()).filter(s => s.loading).length
    const total = this.loadStates.size
    
    return { cached, loading, total }
  }

  /**
   * 预加载常用图标
   */
  async preloadCommonIcons(): Promise<void> {
    const commonIcons = [
      'Setting', 'Grid', 'Monitor', 'User', 'Sunny', 'Moon',
      'Fold', 'Expand', 'Link', 'Document', 'Location', 'Folder',
      'DataAnalysis', 'Picture', 'Connection', 'Brush', 'House',
      'Money', 'TrendCharts', 'Box', 'Tools', 'List'
    ]
    
    await this.preloadIcons(commonIcons)
  }

  /**
   * 批量预加载图标
   */
  async batchPreload(iconNames: string[], batchSize = 5): Promise<void> {
    for (let i = 0; i < iconNames.length; i += batchSize) {
      const batch = iconNames.slice(i, i + batchSize)
      await this.preloadIcons(batch)
      
      // 添加小延迟，避免阻塞主线程
      if (i + batchSize < iconNames.length) {
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    }
  }
}

// 导出单例实例
export const iconManager = IconManager.getInstance()

// 导出便捷函数
export const loadIcon = (iconName: string) => iconManager.loadIcon(iconName)
export const getIcon = (iconName: string) => iconManager.getIcon(iconName)
export const isIconLoaded = (iconName: string) => iconManager.isIconLoaded(iconName)
export const preloadIcons = (iconNames: string[]) => iconManager.preloadIcons(iconNames)
