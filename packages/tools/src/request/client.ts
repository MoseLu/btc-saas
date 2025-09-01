import type { HttpAdapter, RequestConfig, Response } from './adapter'
import { FetchAdapter } from './fetch'
import { MSWAdapter } from './msw'
import { InterceptorManager, interceptors } from './interceptor'

// 适配器类型
export type AdapterType = 'fetch' | 'msw'

// 客户端配置
export interface ClientConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  adapter?: AdapterType
  withCredentials?: boolean
}

// 统一HTTP客户端
export class HttpClient {
  private adapter: HttpAdapter
  private interceptorManager: InterceptorManager
  private config: ClientConfig

  constructor(config: ClientConfig = {}) {
    this.config = {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      },
      adapter: 'fetch',
      withCredentials: false,
      ...config
    }

    // 创建适配器
    this.adapter = this.createAdapter()
    
    // 创建拦截器管理器
    this.interceptorManager = new InterceptorManager()
    
    // 添加默认拦截器
    this.setupDefaultInterceptors()
  }

  // 创建适配器
  private createAdapter(): HttpAdapter {
    const adapterConfig = {
      timeout: this.config.timeout,
      headers: this.config.headers,
      withCredentials: this.config.withCredentials
    }

    switch (this.config.adapter) {
      case 'msw':
        return new MSWAdapter(this.config.baseURL, adapterConfig)
      case 'fetch':
      default:
        return new FetchAdapter(this.config.baseURL, adapterConfig)
    }
  }

  // 设置默认拦截器
  private setupDefaultInterceptors(): void {
    // 添加TraceId拦截器
    this.interceptorManager.use(interceptors.traceId())
    
    // 添加日志拦截器
    this.interceptorManager.use(interceptors.logger())
  }

  // 切换适配器
  switchAdapter(adapterType: AdapterType): void {
    this.config.adapter = adapterType
    this.adapter = this.createAdapter()
  }

  // 获取当前适配器类型
  getCurrentAdapter(): AdapterType {
    return this.config.adapter || 'fetch'
  }

  // 添加拦截器
  addInterceptor(interceptor: any): () => void {
    return this.interceptorManager.use(interceptor)
  }

  // 移除拦截器
  removeInterceptor(interceptor: any): void {
    this.interceptorManager.eject(interceptor)
  }

  // 清除所有拦截器
  clearInterceptors(): void {
    this.interceptorManager.clear()
  }

  // 执行请求
  async request<T = any>(config: RequestConfig): Promise<Response<T>> {
    try {
      // 执行请求拦截器
      const interceptedConfig = await this.interceptorManager.executeRequestInterceptors(config)
      
      // 发送请求
      const response = await this.adapter.request<T>(interceptedConfig)
      
      // 执行响应拦截器
      const interceptedResponse = await this.interceptorManager.executeResponseInterceptors(response)
      
      return interceptedResponse
    } catch (error) {
      // 执行错误拦截器
      const interceptedError = await this.interceptorManager.executeErrorInterceptors(error)
      throw interceptedError
    }
  }

  // GET请求
  async get<T = any>(url: string, config?: Partial<RequestConfig>): Promise<Response<T>> {
    return this.request<T>({ ...config, url, method: 'GET' })
  }

  // POST请求
  async post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<Response<T>> {
    return this.request<T>({ ...config, url, method: 'POST', data })
  }

  // PUT请求
  async put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<Response<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', data })
  }

  // DELETE请求
  async delete<T = any>(url: string, config?: Partial<RequestConfig>): Promise<Response<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' })
  }

  // PATCH请求
  async patch<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<Response<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', data })
  }

  // 设置认证token
  setAuthToken(getToken: () => string | null): void {
    this.addInterceptor(interceptors.auth(getToken))
  }

  // 设置重试策略
  setRetryStrategy(maxRetries: number = 3, delay: number = 1000): void {
    this.addInterceptor(interceptors.retry(maxRetries, delay))
  }

  // 获取配置
  getConfig(): ClientConfig {
    return { ...this.config }
  }

  // 更新配置
  updateConfig(newConfig: Partial<ClientConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // 如果适配器类型改变，重新创建适配器
    if (newConfig.adapter && newConfig.adapter !== this.config.adapter) {
      this.adapter = this.createAdapter()
    }
  }
}

// 创建默认客户端实例
export const httpClient = new HttpClient()

// 导出便捷方法
export const http = {
  get: <T = any>(url: string, config?: Partial<RequestConfig>) => httpClient.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: Partial<RequestConfig>) => httpClient.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: Partial<RequestConfig>) => httpClient.put<T>(url, data, config),
  delete: <T = any>(url: string, config?: Partial<RequestConfig>) => httpClient.delete<T>(url, config),
  patch: <T = any>(url: string, data?: any, config?: Partial<RequestConfig>) => httpClient.patch<T>(url, data, config),
  request: <T = any>(config: RequestConfig) => httpClient.request<T>(config),
  switchAdapter: (adapterType: AdapterType) => httpClient.switchAdapter(adapterType),
  getCurrentAdapter: () => httpClient.getCurrentAdapter(),
  setAuthToken: (getToken: () => string | null) => httpClient.setAuthToken(getToken),
  setRetryStrategy: (maxRetries: number, delay: number) => httpClient.setRetryStrategy(maxRetries, delay)
}
