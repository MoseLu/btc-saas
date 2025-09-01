import { serviceScannerService } from './ServiceScannerService'

/**
 * 服务信息接口
 */
export interface ServiceInfo {
  name: string
  displayName: string
  description: string
  version: string
  status: 'active' | 'inactive' | 'error'
  port?: number
  path: string
  endpoint?: string
  type?: string
  uptime?: string
  lastModified?: Date
  lastStarted?: Date
  lastStopped?: Date
  metrics?: {
    responseTime: number
    requests: number
    errorRate: number
  }
}

/**
 * 服务统计信息
 */
export interface ServiceStats {
  total: number
  active: number
  inactive: number
  error: number
}

/**
 * 服务管理API服务
 * 封装所有服务相关的API调用
 */
export const serviceApi = {
  /**
   * 获取服务列表
   */
  async getServices(): Promise<ServiceInfo[]> {
    return await serviceScannerService.getServices()
  },

  /**
   * 启动服务
   */
  async startService(serviceName: string): Promise<void> {
    return await serviceScannerService.startService(serviceName)
  },

  /**
   * 停止服务
   */
  async stopService(serviceName: string): Promise<void> {
    return await serviceScannerService.stopService(serviceName)
  },

  /**
   * 启动所有服务
   */
  async startAllServices(): Promise<void> {
    return await serviceScannerService.startAllServices()
  },

  /**
   * 停止所有服务
   */
  async stopAllServices(): Promise<void> {
    return await serviceScannerService.stopAllServices()
  },

  /**
   * 刷新服务状态
   */
  async refreshServices(): Promise<ServiceInfo[]> {
    return await serviceScannerService.refreshServices()
  }
}


