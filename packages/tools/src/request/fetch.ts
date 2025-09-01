import type { HttpAdapter, RequestConfig, Response } from './adapter'
import { RequestError } from './adapter'

// 工具函数：构建URL参数
function buildUrl(url: string, params?: Record<string, any>): string {
  if (!params) return url
  
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `${url}${url.includes('?') ? '&' : '?'}${queryString}` : url
}

// 工具函数：处理响应
async function handleResponse<T>(response: globalThis.Response, config: RequestConfig): Promise<Response<T>> {
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
    config
  }
}

// Fetch适配器实现
export class FetchAdapter implements HttpAdapter {
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
      const urlWithParams = buildUrl(fullUrl, config.params)
      
      // 准备请求配置
      const fetchConfig: RequestInit = {
        method: config.method,
        headers: config.headers,
        credentials: config.withCredentials ? 'include' : 'same-origin'
      }

      // 添加请求体
      if (config.data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
        if (typeof config.data === 'object' && !(config.data instanceof FormData)) {
          fetchConfig.body = JSON.stringify(config.data)
        } else {
          fetchConfig.body = config.data
        }
      }

      // 创建AbortController用于超时控制
      const controller = new AbortController()
      if (config.timeout) {
        setTimeout(() => controller.abort(), config.timeout)
      }
      fetchConfig.signal = controller.signal

      // 发送请求
      const response = await fetch(urlWithParams, fetchConfig)
      
      // 处理HTTP错误
      if (!response.ok) {
        throw new RequestError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response.statusText,
          finalConfig
        )
      }

      return await handleResponse<T>(response, finalConfig)
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
