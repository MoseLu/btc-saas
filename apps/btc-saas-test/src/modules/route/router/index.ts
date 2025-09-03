export interface RouteInfo {
  id: string
  name: string
  path: string
  component: string
  meta: {
    title: string
    icon: string
    category: string
    auth: boolean
    showInMenu: boolean
    description?: string
    tags?: string[]
    order?: number
    hidden?: boolean
    requiresAuth?: boolean
    breadcrumb?: string[]
  }
  children?: RouteInfo[]
}

export interface RouteCategory {
  id: string
  name: string
  icon: string
  routes: RouteInfo[]
}

// 模拟路由数据
const mockRoutes: RouteInfo[] = [
  {
    id: 'dashboard',
    name: '仪表板',
    path: '/dashboard',
    component: 'Dashboard',
    meta: {
      title: '仪表板',
      icon: 'DataBoard',
      category: 'main',
      auth: true,
      showInMenu: true
    }
  },
  {
    id: 'user',
    name: '用户管理',
    path: '/user',
    component: 'UserManagement',
    meta: {
      title: '用户管理',
      icon: 'User',
      category: 'system',
      auth: true,
      showInMenu: true
    },
    children: [
      {
        id: 'user-list',
        name: '用户列表',
        path: '/user/list',
        component: 'UserList',
        meta: {
          title: '用户列表',
          icon: 'List',
          category: 'system',
          auth: true,
          showInMenu: true
        }
      },
      {
        id: 'user-profile',
        name: '用户资料',
        path: '/user/profile',
        component: 'UserProfile',
        meta: {
          title: '用户资料',
          icon: 'UserFilled',
          category: 'system',
          auth: true,
          showInMenu: false
        }
      }
    ]
  },
  {
    id: 'settings',
    name: '系统设置',
    path: '/settings',
    component: 'Settings',
    meta: {
      title: '系统设置',
      icon: 'Setting',
      category: 'system',
      auth: true,
      showInMenu: true
    }
  }
]

export function getAllRoutes(): RouteInfo[] {
  return mockRoutes
}

export function getRoutesByCategory(category?: string): RouteInfo[] {
  if (category) {
    return mockRoutes.filter(route => route.meta.category === category)
  }
  
  // 如果没有指定分类，返回所有路由
  return mockRoutes
}

function getCategoryName(categoryId: string): string {
  const names: Record<string, string> = {
    main: '主要功能',
    system: '系统管理',
    tools: '开发工具',
    demo: '演示功能'
  }
  return names[categoryId] || categoryId
}

function getCategoryIcon(categoryId: string): string {
  const icons: Record<string, string> = {
    main: 'House',
    system: 'Setting',
    tools: 'Tools',
    demo: 'Star'
  }
  return icons[categoryId] || 'Folder'
}

export function getRouteById(id: string): RouteInfo | null {
  const findRoute = (routes: RouteInfo[]): RouteInfo | null => {
    for (const route of routes) {
      if (route.id === id) {
        return route
      }
      if (route.children) {
        const found = findRoute(route.children)
        if (found) return found
      }
    }
    return null
  }
  
  return findRoute(mockRoutes)
}

export function getFlatRoutes(): RouteInfo[] {
  const flat: RouteInfo[] = []
  
  const flatten = (routes: RouteInfo[]) => {
    routes.forEach(route => {
      flat.push(route)
      if (route.children) {
        flatten(route.children)
      }
    })
  }
  
  flatten(mockRoutes)
  return flat
}
