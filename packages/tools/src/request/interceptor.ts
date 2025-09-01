import type { RequestConfig, Response, RequestInterceptor } from './adapter'

// 拦截器管理器
export class InterceptorManager {
  private interceptors: RequestInterceptor[] = []

  // 添加拦截器
  use(interceptor: RequestInterceptor): () => void {
    this.interceptors.push(interceptor)
    
    // 返回移除函数
    return () => {
      const index = this.interceptors.indexOf(interceptor)
      if (index > -1) {
        this.interceptors.splice(index, 1)
      }
    }
  }

  // 移除拦截器
  eject(interceptor: RequestInterceptor): void {
    const index = this.interceptors.indexOf(interceptor)
    if (index > -1) {
      this.interceptors.splice(index, 1)
    }
  }

  // 清除所有拦截器
  clear(): void {
    this.interceptors = []
  }

  // 获取所有拦截器
  getAll(): RequestInterceptor[] {
    return [...this.interceptors]
  }

  // 执行请求拦截器
  async executeRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let finalConfig = { ...config }
    
    for (const interceptor of this.interceptors) {
      if (interceptor.onRequest) {
        finalConfig = await interceptor.onRequest(finalConfig)
      }
    }
    
    return finalConfig
  }

  // 执行响应拦截器
  async executeResponseInterceptors<T>(response: Response<T>): Promise<Response<T>> {
    let finalResponse = { ...response }
    
    for (const interceptor of this.interceptors) {
      if (interceptor.onResponse) {
        finalResponse = await interceptor.onResponse(finalResponse)
      }
    }
    
    return finalResponse
  }

  // 执行错误拦截器
  async executeErrorInterceptors(error: any): Promise<any> {
    let finalError = error
    
    for (const interceptor of this.interceptors) {
      if (interceptor.onError) {
        finalError = await interceptor.onError(finalError)
      }
    }
    
    return finalError
  }
}

// 预定义的拦截器
export const interceptors = {
  // TraceId拦截器
  traceId: (): RequestInterceptor => ({
    onRequest: (config) => {
      if (!config.traceId) {
        config.traceId = generateTraceId()
      }
      
      // 添加TraceId到请求头
      config.headers = {
        ...config.headers,
        'X-Trace-Id': config.traceId
      }
      
      return config
    }
  }),

  // 认证拦截器
  auth: (getToken: () => string | null): RequestInterceptor => ({
    onRequest: (config) => {
      const token = getToken()
      if (token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`
        }
      }
      return config
    }
  }),

  // 日志拦截器
  logger: (): RequestInterceptor => ({
    onRequest: (config) => {
      console.log(`[Request] ${config.method} ${config.url}`, {
        headers: config.headers,
        data: config.data,
        params: config.params
      })
      return config
    },
    onResponse: (response) => {
      console.log(`[Response] ${response.status} ${response.config.url}`, {
        data: response.data,
        headers: response.headers
      })
      return response
    },
    onError: (error) => {
      console.error(`[Error] ${error.message}`, {
        status: error.status,
        config: error.config
      })
      return error
    }
  }),

  // 重试拦截器
  retry: (maxRetries: number = 3, delay: number = 1000): RequestInterceptor => ({
    onError: async (error) => {
      const config = error.config
      const retryCount = (config as any).retryCount || 0
      
      if (retryCount < maxRetries && error.status >= 500) {
        // 等待延迟时间
        await new Promise(resolve => setTimeout(resolve, delay * (retryCount + 1)))
        
        // 标记重试次数
        ;(config as any).retryCount = retryCount + 1
        
        // 重新发送请求
        // 这里需要重新调用原始的请求方法
        throw new Error('Retry request')
      }
      
      return error
    }
  })
}

// 生成TraceId
function generateTraceId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
