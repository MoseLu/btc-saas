export interface ApiEndpoint {
  id: string
  name: string
  path: string
  method: string
  description?: string
  status: 'active' | 'inactive' | 'deprecated'
  mockEnabled?: boolean
  responseTime?: number
  errorRate?: number
}

export interface ApiService {
  id: string
  name: string
  description: string
  children: ApiEndpoint[]
}

export const apiData: ApiService[] = [
  {
    id: 'user-service',
    name: '用户服务',
    description: '用户管理相关API',
    children: [
      {
        id: 'user-login',
        name: '用户登录',
        path: '/api/user/login',
        method: 'POST',
        description: '用户登录接口',
        status: 'active',
        mockEnabled: true,
        responseTime: 200,
        errorRate: 0
      },
      {
        id: 'user-register',
        name: '用户注册',
        path: '/api/user/register',
        method: 'POST',
        description: '用户注册接口',
        status: 'active',
        mockEnabled: true,
        responseTime: 300,
        errorRate: 0
      },
      {
        id: 'user-profile',
        name: '获取用户信息',
        path: '/api/user/profile',
        method: 'GET',
        description: '获取用户详细信息',
        status: 'active',
        mockEnabled: false,
        responseTime: 150,
        errorRate: 0
      }
    ]
  },
  {
    id: 'order-service',
    name: '订单服务',
    description: '订单管理相关API',
    children: [
      {
        id: 'order-create',
        name: '创建订单',
        path: '/api/order/create',
        method: 'POST',
        description: '创建新订单',
        status: 'active',
        mockEnabled: true,
        responseTime: 500,
        errorRate: 5
      },
      {
        id: 'order-list',
        name: '订单列表',
        path: '/api/order/list',
        method: 'GET',
        description: '获取订单列表',
        status: 'active',
        mockEnabled: true,
        responseTime: 250,
        errorRate: 0
      },
      {
        id: 'order-detail',
        name: '订单详情',
        path: '/api/order/{id}',
        method: 'GET',
        description: '获取订单详情',
        status: 'active',
        mockEnabled: false,
        responseTime: 200,
        errorRate: 0
      }
    ]
  },
  {
    id: 'product-service',
    name: '商品服务',
    description: '商品管理相关API',
    children: [
      {
        id: 'product-list',
        name: '商品列表',
        path: '/api/product/list',
        method: 'GET',
        description: '获取商品列表',
        status: 'active',
        mockEnabled: true,
        responseTime: 300,
        errorRate: 0
      },
      {
        id: 'product-detail',
        name: '商品详情',
        path: '/api/product/{id}',
        method: 'GET',
        description: '获取商品详情',
        status: 'active',
        mockEnabled: true,
        responseTime: 200,
        errorRate: 0
      },
      {
        id: 'product-search',
        name: '商品搜索',
        path: '/api/product/search',
        method: 'GET',
        description: '搜索商品',
        status: 'inactive',
        mockEnabled: false,
        responseTime: 400,
        errorRate: 10
      }
    ]
  }
]

export function getMockStats() {
  const totalEndpoints = apiData.flatMap(service => service.children)
  const enabledEndpoints = totalEndpoints.filter(ep => ep.mockEnabled)
  const totalDelay = totalEndpoints.reduce((sum, ep) => sum + (ep.responseTime || 0), 0)
  
  return {
    totalEndpoints: totalEndpoints.length,
    enabledEndpoints: enabledEndpoints.length,
    totalDelay: totalDelay,
    services: apiData.length
  }
}
