/**
 * 自动路由注册器
 * 
 * 功能：
 * 1. 自动扫描views目录下的测试页面
 * 2. 根据文件命名约定自动生成路由配置
 * 3. 支持动态注册新的测试页面
 * 4. 提供路由分类和排序功能
 */

import type { RouteRecordRaw } from 'vue-router'

// 测试页面配置接口
export interface TestPageConfig {
  name: string
  path: string
  title: string
  icon: string
  category: string
  order: number
  description: string
  component: any
}

// 自动路由注册器类
export class AutoRouteRegistry {
  private static instance: AutoRouteRegistry
  private registeredRoutes: Map<string, TestPageConfig> = new Map()
  private routeConfigs: TestPageConfig[] = []

  private constructor() {
    this.initializeDefaultRoutes()
  }

  static getInstance(): AutoRouteRegistry {
    if (!AutoRouteRegistry.instance) {
      AutoRouteRegistry.instance = new AutoRouteRegistry()
    }
    return AutoRouteRegistry.instance
  }

  /**
   * 初始化默认路由配置
   */
  private initializeDefaultRoutes(): void {
    // 系统管理类
    this.registerRoute({
      name: 'PluginManager',
      path: '/plugins',
      title: '插件管理',
      icon: 'Grid',
      category: 'system',
      order: 1,
      description: '动态插件扫描和状态管理',
      component: () => import('../pages/PluginManager.vue')
    })

    this.registerRoute({
      name: 'ServiceManager',
      path: '/services',
      title: '服务管理',
      icon: 'Setting',
      category: 'system',
      order: 2,
      description: '服务状态监控和配置管理',
      component: () => import('../pages/ServiceManager.vue')
    })

    this.registerRoute({
      name: 'RouteManager',
      path: '/routes',
      title: '路由管理',
      icon: 'Location',
      category: 'system',
      order: 3,
      description: '自动路由发现和配置管理',
      component: () => import('../views/RouteManager.vue')
    })

    this.registerRoute({
      name: 'ModuleManager',
      path: '/modules',
      title: '模块管理',
      icon: 'Folder',
      category: 'system',
      order: 4,
      description: '动态模块发现和状态管理',
      component: () => import('../views/ModuleManager.vue')
    })

    // 开发工具类
    this.registerRoute({
      name: 'LogViewer',
      path: '/logs',
      title: '日志查看器',
      icon: 'Document',
      category: 'devtools',
      order: 1,
      description: '多通道日志系统查看和管理',
      component: () => import('../views/LogViewer.vue')
    })

    this.registerRoute({
      name: 'MockManager',
      path: '/mocks',
      title: 'Mock配置',
      icon: 'DataAnalysis',
      category: 'devtools',
      order: 2,
      description: 'Mock接口开关和配置管理',
      component: () => import('../views/MockManager.vue')
    })

    this.registerRoute({
      name: 'IconManager',
      path: '/icons',
      title: '图标管理',
      icon: 'Picture',
      category: 'devtools',
      order: 3,
      description: '图标预览和主题配置管理',
      component: () => import('../views/IconManager.vue')
    })

    // 功能演示类
    this.registerRoute({
      name: 'EpsDemo',
      path: '/eps',
      title: 'API文档',
      icon: 'Connection',
      category: 'demo',
      order: 1,
      description: 'API文档展示和测试',
      component: () => import('../views/EpsDemo.vue')
    })

    // 功能测试类
    this.registerRoute({
      name: 'FeatureTester',
      path: '/features',
      title: '功能测试器',
      icon: 'Monitor',
      category: 'demo',
      order: 2,
      description: '测试和演示各种新功能',
      component: () => import('../views/FeatureTester.vue')
    })

    // 主题切换测试
    this.registerRoute({
      name: 'ThemeTest',
      path: '/theme-test',
      title: '主题切换测试',
      icon: 'Brush',
      category: 'demo',
      order: 3,
      description: '测试 cool-admin 风格的主题切换动画效果',
      component: () => import('../pages/theme-test.vue')
    })
  }

  /**
   * 注册新的测试页面路由
   */
  registerRoute(config: TestPageConfig): void {
    if (this.registeredRoutes.has(config.name)) {
      console.warn(`路由 ${config.name} 已存在，将被覆盖`)
    }

    this.registeredRoutes.set(config.name, config)
    this.routeConfigs.push(config)
    
    // 按分类和排序重新组织
    this.routeConfigs.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category)
      }
      return a.order - b.order
    })


  }

  /**
   * 根据命名约定自动注册页面组件
   */
  autoRegisterPages(): void {
    try {
      // 动态导入所有页面组件
      const pageModules = import.meta.glob('../pages/*.vue', { eager: true })
      
      for (const [path, module] of Object.entries(pageModules)) {
        const fileName = path.split('/').pop()?.replace('.vue', '') || ''
        
        // 跳过已注册的组件
        if (this.isAlreadyRegistered(fileName)) {
          continue
        }

        // 根据文件名生成配置
        const config = this.generateConfigFromFileName(fileName, module)
        if (config) {
          this.registerRoute(config)
        }
      }
    } catch (error) {
      console.warn('自动注册页面组件失败:', error)
    }
  }

  /**
   * 检查是否已注册
   */
  private isAlreadyRegistered(name: string): boolean {
    return this.registeredRoutes.has(name)
  }

  /**
   * 根据文件名生成配置
   */
  private generateConfigFromFileName(fileName: string, module: any): TestPageConfig | null {
    // 跳过基础组件
    if (['AdminLayout', 'LoginLayout'].includes(fileName)) {
      return null
    }

    // 根据文件名生成配置
    const configMap: Record<string, Partial<TestPageConfig>> = {
      'LogViewer': {
        title: '日志查看器',
        icon: 'Document',
        category: 'devtools',
        order: 1,
        description: '多通道日志系统查看和管理'
      },
      'RouteManager': {
        title: '路由管理',
        icon: 'Location',
        category: 'system',
        order: 3,
        description: '自动路由发现和配置管理'
      },
      'EpsDemo': {
        title: 'EPS演示',
        icon: 'Connection',
        category: 'demo',
        order: 1,
        description: 'EPS插件服务生成演示'
      },
      'IconManager': {
        title: '图标管理',
        icon: 'Picture',
        category: 'devtools',
        order: 3,
        description: '图标预览和主题配置管理'
      },
      'ModuleManager': {
        title: '模块管理',
        icon: 'Folder',
        category: 'system',
        order: 4,
        description: '动态模块发现和状态管理'
      },
      'MockManager': {
        title: 'Mock管理',
        icon: 'DataAnalysis',
        category: 'devtools',
        order: 2,
        description: 'Mock接口配置和状态管理'
      },
      'theme-test': {
        title: '主题切换测试',
        icon: 'Brush',
        category: 'demo',
        order: 3,
        description: '测试 cool-admin 风格的主题切换动画效果'
      }
    }

    const baseConfig = configMap[fileName]
    if (!baseConfig) {
      // 自动生成配置
      const path = `/${fileName.toLowerCase().replace(/Manager$/, '').replace(/Demo$/, '').replace(/Viewer$/, '')}`
      return {
        name: fileName,
        path,
        title: this.generateTitleFromFileName(fileName),
        icon: 'Setting',
        category: 'demo',
        order: 999,
        description: `${fileName} 功能测试页面`,
        component: () => module.default
      }
    }

    return {
      name: fileName,
      path: `/${fileName.toLowerCase().replace(/Manager$/, '').replace(/Demo$/, '').replace(/Viewer$/, '')}`,
      ...baseConfig,
      component: () => module.default
    } as TestPageConfig
  }

  /**
   * 根据文件名生成标题
   */
  private generateTitleFromFileName(fileName: string): string {
    return fileName
      .replace(/Manager$/, '管理')
      .replace(/Demo$/, '演示')
      .replace(/Viewer$/, '查看器')
      .replace(/([A-Z])/g, ' $1')
      .trim()
  }

  /**
   * 获取所有注册的路由
   */
  getAllRoutes(): TestPageConfig[] {
    return [...this.routeConfigs]
  }

  /**
   * 根据分类获取路由
   */
  getRoutesByCategory(category: string): TestPageConfig[] {
    return this.routeConfigs.filter(route => route.category === category)
  }

  /**
   * 转换为Vue Router格式
   */
  toVueRoutes(): RouteRecordRaw[] {
    return this.routeConfigs.map(config => ({
      path: config.path,
      name: config.name,
      component: config.component,
      meta: {
        title: config.title,
        icon: config.icon,
        category: config.category,
        order: config.order,
        description: config.description
      }
    }))
  }

  /**
   * 获取分类统计
   */
  getCategoryStats(): Record<string, number> {
    const stats: Record<string, number> = {}
    this.routeConfigs.forEach(route => {
      stats[route.category] = (stats[route.category] || 0) + 1
    })
    return stats
  }

  /**
   * 刷新路由注册
   */
  refresh(): void {
    this.autoRegisterPages()
  }

  /**
   * 导出路由配置
   */
  exportConfig(): string {
    return JSON.stringify({
      total: this.routeConfigs.length,
      categories: this.getCategoryStats(),
      routes: this.routeConfigs.map(route => ({
        name: route.name,
        path: route.path,
        title: route.title,
        category: route.category,
        order: route.order,
        description: route.description
      }))
    }, null, 2)
  }
}

// 导出单例实例
export const autoRouteRegistry = AutoRouteRegistry.getInstance()
