import type { HttpAdapter, RequestConfig, Response } from './adapter'
import { RequestError } from './adapter'

// MSW适配器实现
export class MSWAdapter implements HttpAdapter {
  private baseURL?: string
  private defaultConfig: Partial<RequestConfig>

  constructor(baseURL?: string, defaultConfig: Partial<RequestConfig> = {}) {
    this.baseURL = baseURL
    this.defaultConfig = defaultConfig
  }

  async request<T = any>(config: RequestConfig): Promise<Response<T>> {
    try {
      // 合并配置
      const finalConfig = { ...this.defaultConfig, ...config }
      
      // 构建完整URL
      const fullUrl = this.baseURL ? `${this.baseURL}${config.url}` : config.url
      
      // 构建URL参数
      let urlWithParams = fullUrl
      if (config.params) {
        const searchParams = new URLSearchParams()
        Object.entries(config.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value))
          }
        })
        const queryString = searchParams.toString()
        if (queryString) {
          urlWithParams = `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}${queryString}`
        }
      }

      // 创建请求对象
      const request = new Request(urlWithParams, {
        method: config.method,
        headers: config.headers,
        body: config.data ? JSON.stringify(config.data) : undefined
      })

      // 使用MSW处理请求
      // 注意：这里需要MSW已经在运行时环境中设置
      const response = await fetch(request)
      
      // 处理HTTP错误
      if (!response.ok) {
        throw new RequestError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response.statusText,
          finalConfig
        )
      }

      // 处理响应
      const headers: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        headers[key] = value
      })

      let data: T
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else if (contentType?.includes('text/')) {
        data = await response.text() as T
      } else {
        data = await response.blob() as T
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers,
        config: finalConfig
      }
    } catch (error) {
      if (error instanceof RequestError) {
        throw error
      }
      
      if (error instanceof Error) {
        throw new RequestError(
          error.message,
          undefined,
          undefined,
          config
        )
      }
      
      throw new RequestError('Unknown error', undefined, undefined, config)
    }
  }

  async get<T = any>(url: string, config?: Partial<RequestConfig>): Promise<Response<T>> {
    return this.request<T>({ ...config, url, method: 'GET' })
  }

  async post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<Response<T>> {
    return this.request<T>({ ...config, url, method: 'POST', data })
  }

  async put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<Response<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', data })
  }

  async delete<T = any>(url: string, config?: Partial<RequestConfig>): Promise<Response<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' })
  }

  async patch<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<Response<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', data })
  }
}
