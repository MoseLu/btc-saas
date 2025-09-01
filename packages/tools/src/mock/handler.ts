// Mock处理器类型
export interface MockHandler {
  method: string
  path: string
  handler: (req: MockRequest) => MockResponse | Promise<MockResponse>
  delay?: number
  status?: number
}

// Mock请求对象
export interface MockRequest {
  method: string
  url: string
  path: string
  params: Record<string, string>
  query: Record<string, string>
  headers: Record<string, string>
  body: any
  traceId?: string
}

// Mock响应对象
export interface MockResponse {
  status: number
  headers?: Record<string, string>
  body: any
  delay?: number
}

// Mock处理器管理器
export class MockHandlerManager {
  private handlers: MockHandler[] = []
  private enabled: boolean = false

  // 启用Mock
  enable(): void {
    this.enabled = true
  }

  // 禁用Mock
  disable(): void {
    this.enabled = false
  }

  // 检查是否启用
  isEnabled(): boolean {
    return this.enabled
  }

  // 添加处理器
  add(handler: MockHandler): void {
    this.handlers.push(handler)
  }

  // 移除处理器
  remove(method: string, path: string): void {
    const index = this.handlers.findIndex(h => h.method === method && h.path === path)
    if (index > -1) {
      this.handlers.splice(index, 1)
    }
  }

  // 清除所有处理器
  clear(): void {
    this.handlers = []
  }

  // 查找匹配的处理器
  find(method: string, path: string): MockHandler | undefined {
    return this.handlers.find(handler => {
      // 精确匹配
      if (handler.method === method && handler.path === path) {
        return true
      }
      
      // 路径参数匹配
      if (handler.method === method && this.matchPath(handler.path, path)) {
        return true
      }
      
      return false
    })
  }

  // 路径匹配
  private matchPath(pattern: string, path: string): boolean {
    // 简单的路径参数匹配
    const patternParts = pattern.split('/')
    const pathParts = path.split('/')
    
    if (patternParts.length !== pathParts.length) {
      return false
    }
    
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i]
      const pathPart = pathParts[i]
      
      // 如果是参数占位符（以:开头）
      if (patternPart.startsWith(':')) {
        continue
      }
      
      // 否则必须精确匹配
      if (patternPart !== pathPart) {
        return false
      }
    }
    
    return true
  }

  // 处理请求
  async handle(request: MockRequest): Promise<MockResponse | null> {
    if (!this.enabled) {
      return null
    }

    const handler = this.find(request.method, request.path)
    if (!handler) {
      return null
    }

    try {
      // 执行处理器
      const response = await handler.handler(request)
      
      // 应用默认值
      const finalResponse: MockResponse = {
        status: response.status || handler.status || 200,
        headers: {
          'Content-Type': 'application/json',
          ...response.headers
        },
        body: response.body,
        delay: response.delay || handler.delay
      }

      // 应用延迟
      if (finalResponse.delay) {
        await new Promise(resolve => setTimeout(resolve, finalResponse.delay))
      }

      return finalResponse
    } catch (error) {
      console.error('Mock handler error:', error)
      return {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: { error: 'Mock handler error', message: error instanceof Error ? error.message : 'Unknown error' }
      }
    }
  }

  // 获取所有处理器
  getAll(): MockHandler[] {
    return [...this.handlers]
  }

  // 获取处理器数量
  count(): number {
    return this.handlers.length
  }
}

// 创建全局Mock管理器实例
export const mockHandlerManager = new MockHandlerManager()

// 便捷方法
export const mock = {
  // 启用Mock
  enable: () => mockHandlerManager.enable(),
  
  // 禁用Mock
  disable: () => mockHandlerManager.disable(),
  
  // 检查是否启用
  isEnabled: () => mockHandlerManager.isEnabled(),
  
  // 添加GET处理器
  get: (path: string, handler: (req: MockRequest) => MockResponse | Promise<MockResponse>, options?: Partial<MockHandler>) => {
    mockHandlerManager.add({ method: 'GET', path, handler, ...options })
  },
  
  // 添加POST处理器
  post: (path: string, handler: (req: MockRequest) => MockResponse | Promise<MockResponse>, options?: Partial<MockHandler>) => {
    mockHandlerManager.add({ method: 'POST', path, handler, ...options })
  },
  
  // 添加PUT处理器
  put: (path: string, handler: (req: MockRequest) => MockResponse | Promise<MockResponse>, options?: Partial<MockHandler>) => {
    mockHandlerManager.add({ method: 'PUT', path, handler, ...options })
  },
  
  // 添加DELETE处理器
  delete: (path: string, handler: (req: MockRequest) => MockResponse | Promise<MockResponse>, options?: Partial<MockHandler>) => {
    mockHandlerManager.add({ method: 'DELETE', path, handler, ...options })
  },
  
  // 添加PATCH处理器
  patch: (path: string, handler: (req: MockRequest) => MockResponse | Promise<MockResponse>, options?: Partial<MockHandler>) => {
    mockHandlerManager.add({ method: 'PATCH', path, handler, ...options })
  },
  
  // 移除处理器
  remove: (method: string, path: string) => mockHandlerManager.remove(method, path),
  
  // 清除所有处理器
  clear: () => mockHandlerManager.clear(),
  
  // 获取所有处理器
  getAll: () => mockHandlerManager.getAll(),
  
  // 获取处理器数量
  count: () => mockHandlerManager.count()
}
