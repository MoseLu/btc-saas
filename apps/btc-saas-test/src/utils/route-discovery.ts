/**
 * 自动路由发现工具
 * 
 * 功能：
 * 1. 自动扫描packages/plugins下的插件路由
 * 2. 自动扫描apps下的应用路由
 * 3. 自动扫描modules下的业务模块路由
 * 4. 支持多级路由嵌套
 * 5. 自动生成菜单和面包屑
 */

import type { RouteRecordRaw } from 'vue-router'

// 路由元数据接口
export interface RouteMeta {
  title?: string
  icon?: string
  module?: string
  category?: string
  order?: number
  hidden?: boolean
  requiresAuth?: boolean
  roles?: string[]
  breadcrumb?: string[]
  description?: string
  tags?: string[]
}

// 插件路由配置接口
export interface PluginRouteConfig {
  name: string
  path: string
  component: string | (() => Promise<any>)
  meta: RouteMeta
  children?: PluginRouteConfig[]
}

// 应用路由配置接口
export interface AppRouteConfig {
  name: string
  path: string
  component: string | (() => Promise<any>)
  meta: RouteMeta
  children?: AppRouteConfig[]
}

// 模块路由配置接口
export interface ModuleRouteConfig {
  name: string
  path: string
  component: string | (() => Promise<any>)
  meta: RouteMeta
  children?: ModuleRouteConfig[]
}

/**
 * 路由发现器类
 */
export class RouteDiscovery {
  private static instance: RouteDiscovery
  private discoveredRoutes: RouteRecordRaw[] = []
  private routeCache = new Map<string, RouteRecordRaw>()

  private constructor() {}

  static getInstance(): RouteDiscovery {
    if (!RouteDiscovery.instance) {
      RouteDiscovery.instance = new RouteDiscovery()
    }
    return RouteDiscovery.instance
  }

  /**
   * 发现所有路由
   */
  async discoverAllRoutes(): Promise<RouteRecordRaw[]> {
    const routes: RouteRecordRaw[] = []

    // 1. 发现插件路由
    const pluginRoutes = await this.discoverPluginRoutes()
    routes.push(...pluginRoutes)

    // 2. 发现应用路由
    const appRoutes = await this.discoverAppRoutes()
    routes.push(...appRoutes)

    // 3. 发现模块路由
    const moduleRoutes = await this.discoverModuleRoutes()
    routes.push(...moduleRoutes)

    // 4. 缓存路由
    this.discoveredRoutes = routes
    routes.forEach(route => {
      this.routeCache.set(route.path, route)
    })

    return routes
  }

  /**
   * 发现插件路由
   */
  private async discoverPluginRoutes(): Promise<RouteRecordRaw[]> {
    const routes: RouteRecordRaw[] = []

    try {
      // 动态导入插件路由配置
      const pluginModules = import.meta.glob('../../packages/plugins/*/routes.ts', { eager: true })
      
      for (const [path, module] of Object.entries(pluginModules)) {
        const pluginName = path.split('/')[3] // 提取插件名称
        const routeConfig = (module as any).default || (module as any).routes

        if (routeConfig) {
          const pluginRoutes = this.convertToVueRoutes(routeConfig, `plugin-${pluginName}`)
          routes.push(...pluginRoutes)
        }
      }
    } catch (error) {
      console.warn('插件路由发现失败:', error)
    }

    return routes
  }

  /**
   * 发现应用路由
   */
  private async discoverAppRoutes(): Promise<RouteRecordRaw[]> {
    const routes: RouteRecordRaw[] = []

    try {
      // 动态导入应用路由配置
      const appModules = import.meta.glob('../../apps/*/src/routes.ts', { eager: true })
      
      for (const [path, module] of Object.entries(appModules)) {
        const appName = path.split('/')[3] // 提取应用名称
        const routeConfig = (module as any).default || (module as any).routes

        if (routeConfig) {
          const appRoutes = this.convertToVueRoutes(routeConfig, `app-${appName}`)
          routes.push(...appRoutes)
        }
      }
    } catch (error) {
      console.warn('应用路由发现失败:', error)
    }

    return routes
  }

  /**
   * 发现模块路由
   */
  private async discoverModuleRoutes(): Promise<RouteRecordRaw[]> {
    const routes: RouteRecordRaw[] = []

    try {
      // 动态导入模块路由配置
      const moduleFiles = import.meta.glob('../modules/*/index.ts', { eager: true })
      
      for (const [path, module] of Object.entries(moduleFiles)) {
        const moduleName = path.split('/')[3] // 提取模块名称
        const routeConfig = (module as any).routes || (module as any).moduleRoutes

        if (routeConfig) {
          const moduleRoutes = this.convertToVueRoutes(routeConfig, `module-${moduleName}`)
          routes.push(...moduleRoutes)
        }
      }
    } catch (error) {
      console.warn('模块路由发现失败:', error)
    }

    return routes
  }

  /**
   * 转换路由配置为Vue Router格式
   */
  private convertToVueRoutes(
    config: PluginRouteConfig | AppRouteConfig | ModuleRouteConfig,
    namespace: string
  ): RouteRecordRaw[] {
    const routes: RouteRecordRaw[] = []

    const convertRoute = (routeConfig: any, parentPath = ''): RouteRecordRaw => {
      const fullPath = parentPath + routeConfig.path
      
      const route: RouteRecordRaw = {
        path: routeConfig.path,
        name: `${namespace}-${routeConfig.name}`,
        component: this.resolveComponent(routeConfig.component),
        meta: {
          ...routeConfig.meta,
          namespace,
          fullPath
        }
      }

      // 处理子路由
      if (routeConfig.children && routeConfig.children.length > 0) {
        route.children = routeConfig.children.map(child => 
          convertRoute(child, fullPath)
        )
      }

      return route
    }

    routes.push(convertRoute(config))
    return routes
  }

  /**
   * 解析组件
   */
  private resolveComponent(component: string | (() => Promise<any>)) {
    if (typeof component === 'function') {
      return component
    }

    // 字符串路径转换为动态导入
    if (typeof component === 'string') {
      return () => import(component)
    }

    return component
  }

  /**
   * 获取所有发现的路由
   */
  getDiscoveredRoutes(): RouteRecordRaw[] {
    return this.discoveredRoutes
  }

  /**
   * 根据路径获取路由
   */
  getRouteByPath(path: string): RouteRecordRaw | undefined {
    return this.routeCache.get(path)
  }

  /**
   * 获取菜单路由（过滤掉隐藏的路由）
   */
  getMenuRoutes(): RouteRecordRaw[] {
    return this.discoveredRoutes.filter(route => 
      !route.meta?.hidden && route.meta?.title
    )
  }

  /**
   * 根据模块获取路由
   */
  getRoutesByModule(module: string): RouteRecordRaw[] {
    return this.discoveredRoutes.filter(route => 
      route.meta?.module === module
    )
  }

  /**
   * 根据分类获取路由
   */
  getRoutesByCategory(category: string): RouteRecordRaw[] {
    return this.discoveredRoutes.filter(route => 
      route.meta?.category === category
    )
  }

  /**
   * 刷新路由发现
   */
  async refresh(): Promise<RouteRecordRaw[]> {
    this.routeCache.clear()
    return this.discoverAllRoutes()
  }

  /**
   * 监听文件变化并自动刷新路由
   */
  watchForChanges(): void {
    // 在开发模式下监听文件变化
    if (import.meta.env.DEV) {
      // 这里可以添加文件监听逻辑
      // 例如使用 chokidar 监听路由文件变化

    }
  }
}

/**
 * 路由工具函数
 */
export class RouteUtils {
  /**
   * 生成面包屑导航
   */
  static generateBreadcrumb(route: RouteRecordRaw): string[] {
    const breadcrumb: string[] = []
    
    if (route.meta?.breadcrumb) {
      breadcrumb.push(...route.meta.breadcrumb)
    } else if (route.meta?.title) {
      breadcrumb.push(route.meta.title)
    }

    return breadcrumb
  }

  /**
   * 生成路由树结构
   */
  static generateRouteTree(routes: RouteRecordRaw[]): any[] {
    const routeMap = new Map<string, any>()
    const rootRoutes: any[] = []

    // 创建路由映射
    routes.forEach(route => {
      routeMap.set(route.path, {
        ...route,
        children: []
      })
    })

    // 构建树结构
    routes.forEach(route => {
      const routeNode = routeMap.get(route.path)
      
      if (route.path === '/' || !route.path.includes('/')) {
        rootRoutes.push(routeNode)
      } else {
        const parentPath = route.path.substring(0, route.path.lastIndexOf('/'))
        const parent = routeMap.get(parentPath)
        if (parent) {
          parent.children.push(routeNode)
        } else {
          rootRoutes.push(routeNode)
        }
      }
    })

    return rootRoutes
  }

  /**
   * 验证路由配置
   */
  static validateRouteConfig(config: any): boolean {
    if (!config.name || !config.path) {
      console.error('路由配置缺少必要字段:', config)
      return false
    }

    if (config.children) {
      return config.children.every((child: any) => 
        this.validateRouteConfig(child)
      )
    }

    return true
  }

  /**
   * 生成路由名称
   */
  static generateRouteName(prefix: string, name: string): string {
    return `${prefix}-${name}`.toLowerCase().replace(/[^a-z0-9-]/g, '-')
  }
}

// 导出单例实例
export const routeDiscovery = RouteDiscovery.getInstance()
