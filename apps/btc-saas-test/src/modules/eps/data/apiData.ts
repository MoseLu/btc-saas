export interface EpsEndpoint {
  id: string
  name: string
  path: string
  method: string
  description?: string
  status: 'active' | 'inactive' | 'deprecated'
  responseTime?: number
  errorRate?: number
  parameters?: ApiParameter[]
  responses?: ApiResponse[]
}

export interface EpsService {
  id: string
  name: string
  description: string
  children: EpsEndpoint[]
}

// 为了向后兼容，添加别名类型
export type ApiEndpoint = EpsEndpoint
export type ApiService = EpsService

// 添加缺失的类型定义
export interface ApiParameter {
  name: string
  type: string
  required: boolean
  description?: string
  defaultValue?: any
}

export interface ApiResponse {
  status: number
  description: string
  schema?: any
  examples?: any[]
}

export const apiData: EpsService[] = [
  {
    id: 'eps-service',
    name: 'EPS服务',
    description: 'EPS相关API',
    children: [
      {
        id: 'eps-data',
        name: 'EPS数据',
        path: '/api/eps/data',
        method: 'GET',
        description: '获取EPS数据',
        status: 'active',
        responseTime: 150,
        errorRate: 0
      },
      {
        id: 'eps-config',
        name: 'EPS配置',
        path: '/api/eps/config',
        method: 'POST',
        description: '更新EPS配置',
        status: 'active',
        responseTime: 200,
        errorRate: 0
      }
    ]
  }
]

export function getEpsStats() {
  const totalEndpoints = apiData.flatMap(service => service.children)
  const activeEndpoints = totalEndpoints.filter(ep => ep.status === 'active')
  
  return {
    totalEndpoints: totalEndpoints.length,
    enabledEndpoints: activeEndpoints.length,
    totalDelay: totalEndpoints.reduce((sum, ep) => sum + (ep.responseTime || 0), 0),
    services: apiData.length
  }
}
