// HttpAdapter接口定义
export interface RequestConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  data?: any
  params?: Record<string, any>
  timeout?: number
  traceId?: string
  withCredentials?: boolean
}

export interface Response<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: RequestConfig
}

export interface HttpAdapter {
  request<T = any>(config: RequestConfig): Promise<Response<T>>
  get<T = any>(url: string, config?: Partial<RequestConfig>): Promise<Response<T>>
  post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<Response<T>>
  put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<Response<T>>
  delete<T = any>(url: string, config?: Partial<RequestConfig>): Promise<Response<T>>
  patch<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<Response<T>>
}

// 请求拦截器接口
export interface RequestInterceptor {
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  onResponse?: <T>(response: Response<T>) => Response<T> | Promise<Response<T>>
  onError?: (error: any) => any | Promise<any>
}

// 请求错误类型
export class RequestError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string,
    public config?: RequestConfig,
    public response?: Response
  ) {
    super(message)
    this.name = 'RequestError'
  }
}

// 默认配置
export const DEFAULT_CONFIG: Partial<RequestConfig> = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
}
