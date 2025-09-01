import type { ServiceInfo } from './service.api'

/**
 * 服务扫描器服务
 * 负责扫描、启动、停止和管理各种服务
 */
class ServiceScannerService {
  private services: ServiceInfo[] = []

  constructor() {
    this.initializeServices()
  }

  /**
   * 初始化默认服务列表
   */
  private initializeServices() {
    this.services = [
      {
        name: 'auth-service',
        displayName: '认证服务',
        description: '用户认证和授权服务，提供JWT令牌验证和权限管理',
        version: '1.0.0',
        status: 'active',
        port: 3001,
        path: '/auth',
        endpoint: 'http://localhost:3001/auth',
        type: 'API服务',
        uptime: '2天 3小时 45分钟',
        lastModified: new Date(Date.now() - 86400000), // 1天前
        lastStarted: new Date(),
        metrics: {
          responseTime: 45,
          requests: 1250,
          errorRate: 0.2
        }
      },
      {
        name: 'user-service',
        displayName: '用户服务',
        description: '用户管理服务，处理用户注册、登录和个人信息管理',
        version: '1.0.0',
        status: 'active',
        port: 3002,
        path: '/users',
        endpoint: 'http://localhost:3002/users',
        type: 'API服务',
        uptime: '1天 8小时 20分钟',
        lastModified: new Date(Date.now() - 172800000), // 2天前
        lastStarted: new Date(),
        metrics: {
          responseTime: 32,
          requests: 890,
          errorRate: 0.1
        }
      },
      {
        name: 'plugin-service',
        displayName: '插件服务',
        description: '插件管理服务，负责插件的安装、卸载和状态管理',
        version: '1.0.0',
        status: 'inactive',
        port: 3003,
        path: '/plugins',
        endpoint: 'http://localhost:3003/plugins',
        type: '管理服务',
        uptime: '0天 0小时 0分钟',
        lastModified: new Date(Date.now() - 259200000), // 3天前
        lastStopped: new Date(),
        metrics: {
          responseTime: 0,
          requests: 0,
          errorRate: 0
        }
      },
      {
        name: 'log-service',
        displayName: '日志服务',
        description: '日志收集和分析服务，提供系统日志的存储和查询功能',
        version: '1.0.0',
        status: 'active',
        port: 3004,
        path: '/logs',
        endpoint: 'http://localhost:3004/logs',
        type: '数据服务',
        uptime: '5天 12小时 30分钟',
        lastModified: new Date(Date.now() - 432000000), // 5天前
        lastStarted: new Date(),
        metrics: {
          responseTime: 78,
          requests: 2100,
          errorRate: 0.05
        }
      },
      {
        name: 'notification-service',
        displayName: '通知服务',
        description: '消息通知服务，处理邮件、短信和推送通知',
        version: '1.0.0',
        status: 'error',
        port: 3005,
        path: '/notifications',
        endpoint: 'http://localhost:3005/notifications',
        type: '通信服务',
        uptime: '0天 0小时 0分钟',
        lastModified: new Date(Date.now() - 3600000), // 1小时前
        lastStopped: new Date(),
        metrics: {
          responseTime: 0,
          requests: 0,
          errorRate: 100
        }
      }
    ]
  }

  /**
   * 获取所有服务
   */
  async getServices(): Promise<ServiceInfo[]> {
    return this.services
  }

  /**
   * 启动指定服务
   */
  async startService(serviceName: string): Promise<void> {
    const service = this.services.find(s => s.name === serviceName)
    if (service) {
      service.status = 'active'
      service.lastStarted = new Date()
      service.lastStopped = undefined
    }
  }

  /**
   * 停止指定服务
   */
  async stopService(serviceName: string): Promise<void> {
    const service = this.services.find(s => s.name === serviceName)
    if (service) {
      service.status = 'inactive'
      service.lastStopped = new Date()
    }
  }

  /**
   * 启动所有服务
   */
  async startAllServices(): Promise<void> {
    for (const service of this.services) {
      service.status = 'active'
      service.lastStarted = new Date()
      service.lastStopped = undefined
    }
  }

  /**
   * 停止所有服务
   */
  async stopAllServices(): Promise<void> {
    for (const service of this.services) {
      service.status = 'inactive'
      service.lastStopped = new Date()
    }
  }

  /**
   * 刷新服务状态
   */
  async refreshServices(): Promise<ServiceInfo[]> {
    // 模拟刷新服务状态
    for (const service of this.services) {
      if (service.status === 'error') {
        // 随机修复一些错误服务
        if (Math.random() > 0.7) {
          service.status = 'active'
          service.lastStarted = new Date()
        }
      }
    }
    return this.services
  }
}

export const serviceScannerService = new ServiceScannerService()
