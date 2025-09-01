---
title: 工具体系约定与请求Mock
category: tools
order: 5
owners: [frontend, tools]
auditable: true
acceptance:
  - [x] HttpAdapter 可切换
  - [x] Mock 系统正常工作
  - [x] 请求拦截器生效
  - [x] TraceId 注入正常
outputs:
  - packages/tools/request/
  - packages/tools/mock/
  - packages/tools/cache/
  - packages/tools/date/
  - packages/tools/validate/
  - packages/tools/theme/
  - packages/tools/imaging/
related: [04-plugin-system-conventions, 11-mock-strategy-and-switch]
---

# 工具体系约定与请求Mock

## 背景与目标

建立统一的工具体系，提供请求层、Mock系统、缓存、日期处理、验证、主题、图像处理等通用工具。实现HttpAdapter可在fetch与MSW之间切换，支持Mock开关和TraceId注入。

## 约定

### 工具体系目录结构
```
packages/tools/
├── request/           # 请求层
│   ├── adapter.ts     # HttpAdapter接口
│   ├── fetch.ts       # Fetch适配器
│   ├── msw.ts         # MSW适配器
│   ├── client.ts      # 统一客户端
│   └── interceptor.ts # 请求拦截器
├── mock/              # Mock系统
│   ├── handler.ts     # Mock处理器
│   ├── scenarios.ts   # Mock场景
│   └── data/          # Mock数据
├── cache/             # 缓存工具
│   ├── memory.ts      # 内存缓存
│   ├── storage.ts     # 存储缓存
│   └── strategy.ts    # 缓存策略
├── date/              # 日期工具
│   ├── formatter.ts   # 日期格式化
│   ├── calculator.ts  # 日期计算
│   └── timezone.ts    # 时区处理
├── validate/          # 验证工具
│   ├── schema.ts      # 验证模式
│   ├── rules.ts       # 验证规则
│   └── messages.ts    # 错误消息
├── theme/             # 主题工具
│   ├── variables.ts   # 主题变量
│   ├── generator.ts   # 主题生成器
│   └── converter.ts   # 颜色转换
└── imaging/           # 图像处理
    ├── resize.ts      # 图像缩放
    ├── compress.ts    # 图像压缩
    └── format.ts      # 格式转换
```

### 请求层接口约定
```typescript
interface HttpAdapter {
  request<T = any>(config: RequestConfig): Promise<Response<T>>
  get<T = any>(url: string, config?: Partial<RequestConfig>): Promise<Response<T>>
  post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<Response<T>>
  put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<Response<T>>
  delete<T = any>(url: string, config?: Partial<RequestConfig>): Promise<Response<T>>
}

interface RequestConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  data?: any
  params?: Record<string, any>
  timeout?: number
  traceId?: string
}

interface Response<T> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: RequestConfig
}
```

## 步骤

### 1. 创建HttpAdapter接口
创建`packages/tools/request/adapter.ts`：
```typescript
export interface RequestConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  data?: any
  params?: Record<string, any>
  timeout?: number
  traceId?: string
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

export interface RequestInterceptor {
  request?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  response?: (response: Response) => Response | Promise<Response>
  error?: (error: any) => any | Promise<any>
}
```

### 2. 实现Fetch适配器
创建`packages/tools/request/fetch.ts`：
```typescript
import type { HttpAdapter, RequestConfig, Response } from './adapter'

export class FetchAdapter implements HttpAdapter {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor(baseURL = '', defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    }
  }

  async request<T = any>(config: RequestConfig): Promise<Response<T>> {
    const { url, method, headers = {}, data, params, timeout = 30000 } = config

    // 构建完整URL
    const fullURL = this.buildURL(url, params)
    
    // 合并请求头
    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers
    }

    // 构建请求配置
    const fetchConfig: RequestInit = {
      method,
      headers: requestHeaders,
      signal: timeout ? AbortSignal.timeout(timeout) : undefined
    }

    // 添加请求体
    if (data && method !== 'GET') {
      fetchConfig.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(fullURL, fetchConfig)
      
      // 解析响应头
      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      // 解析响应数据
      let responseData: T
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        responseData = await response.json()
      } else {
        responseData = await response.text() as T
      }

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        config
      }
    } catch (error) {
      throw this.handleError(error, config)
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

  private buildURL(url: string, params?: Record<string, any>): string {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`
    
    if (!params) return fullURL

    const urlObj = new URL(fullURL)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlObj.searchParams.append(key, String(value))
      }
    })

    return urlObj.toString()
  }

  private handleError(error: any, config: RequestConfig): Error {
    if (error.name === 'AbortError') {
      return new Error(`Request timeout: ${config.url}`)
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new Error(`Network error: ${config.url}`)
    }

    return error
  }
}
```

### 3. 实现MSW适配器
创建`packages/tools/request/msw.ts`：
```typescript
import type { HttpAdapter, RequestConfig, Response } from './adapter'

export class MswAdapter implements HttpAdapter {
  private handlers: Map<string, any> = new Map()
  private delay: number = 0
  private errorRate: number = 0

  constructor(delay = 0, errorRate = 0) {
    this.delay = delay
    this.errorRate = errorRate
  }

  // 注册Mock处理器
  registerHandler(pattern: string, handler: any) {
    this.handlers.set(pattern, handler)
  }

  // 设置延迟
  setDelay(delay: number) {
    this.delay = delay
  }

  // 设置错误率
  setErrorRate(rate: number) {
    this.errorRate = rate
  }

  async request<T = any>(config: RequestConfig): Promise<Response<T>> {
    const { url, method, headers = {}, data } = config

    // 模拟网络延迟
    if (this.delay > 0) {
      await this.sleep(this.delay)
    }

    // 模拟错误
    if (Math.random() < this.errorRate) {
      throw new Error(`Mock error: ${method} ${url}`)
    }

    // 查找匹配的处理器
    const handler = this.findHandler(method, url)
    if (!handler) {
      throw new Error(`No mock handler found for: ${method} ${url}`)
    }

    // 执行处理器
    const result = await handler({ url, method, headers, data })

    return {
      data: result.data,
      status: result.status || 200,
      statusText: result.statusText || 'OK',
      headers: result.headers || {},
      config
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

  private findHandler(method: string, url: string): any {
    const key = `${method}:${url}`
    
    // 精确匹配
    if (this.handlers.has(key)) {
      return this.handlers.get(key)
    }

    // 模式匹配
    for (const [pattern, handler] of this.handlers) {
      if (this.matchPattern(pattern, key)) {
        return handler
      }
    }

    return null
  }

  private matchPattern(pattern: string, url: string): boolean {
    // 简单的通配符匹配
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    return regex.test(url)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

### 4. 创建统一客户端
创建`packages/tools/request/client.ts`：
```typescript
import type { HttpAdapter, RequestConfig, Response, RequestInterceptor } from './adapter'
import { FetchAdapter } from './fetch'
import { MswAdapter } from './msw'

export interface ClientConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  mock?: boolean
  mockDelay?: number
  mockErrorRate?: number
}

export class HttpClient {
  private adapter: HttpAdapter
  private interceptors: RequestInterceptor[] = []
  private config: ClientConfig

  constructor(config: ClientConfig = {}) {
    this.config = {
      baseURL: '',
      timeout: 30000,
      headers: {},
      mock: false,
      mockDelay: 0,
      mockErrorRate: 0,
      ...config
    }

    this.adapter = this.createAdapter()
  }

  private createAdapter(): HttpAdapter {
    if (this.config.mock) {
      const mswAdapter = new MswAdapter(this.config.mockDelay, this.config.mockErrorRate)
      this.setupMockHandlers(mswAdapter)
      return mswAdapter
    } else {
      return new FetchAdapter(this.config.baseURL, this.config.headers)
    }
  }

  // 设置Mock处理器
  private setupMockHandlers(adapter: MswAdapter) {
    // 用户相关API
    adapter.registerHandler('GET:/api/user', () => ({
      data: {
        id: '1',
        name: '张三',
        email: 'zhangsan@example.com',
        avatar: 'https://example.com/avatar.jpg',
        roles: ['admin'],
        permissions: ['read', 'write']
      },
      status: 200
    }))

    adapter.registerHandler('POST:/api/login', ({ data }) => ({
      data: {
        token: 'mock-token-' + Date.now(),
        user: {
          id: '1',
          name: data?.username || '用户',
          email: data?.email || 'user@example.com'
        }
      },
      status: 200
    }))

    // 通用CRUD API
    adapter.registerHandler('GET:/api/*', ({ url }) => {
      const id = url.split('/').pop()
      return {
        data: {
          id,
          name: `项目${id}`,
          description: `这是项目${id}的描述`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        status: 200
      }
    })

    adapter.registerHandler('POST:/api/*', ({ data }) => ({
      data: {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      status: 201
    }))

    adapter.registerHandler('PUT:/api/*', ({ data }) => ({
      data: {
        ...data,
        updatedAt: new Date().toISOString()
      },
      status: 200
    }))

    adapter.registerHandler('DELETE:/api/*', () => ({
      data: { success: true },
      status: 200
    }))
  }

  // 添加拦截器
  addInterceptor(interceptor: RequestInterceptor) {
    this.interceptors.push(interceptor)
  }

  // 切换Mock模式
  setMockMode(enabled: boolean, delay = 0, errorRate = 0) {
    this.config.mock = enabled
    this.config.mockDelay = delay
    this.config.mockErrorRate = errorRate
    this.adapter = this.createAdapter()
  }

  // 执行请求
  async request<T = any>(config: RequestConfig): Promise<Response<T>> {
    // 生成TraceId
    const traceId = this.generateTraceId()
    config.traceId = traceId

    // 应用请求拦截器
    let processedConfig = config
    for (const interceptor of this.interceptors) {
      if (interceptor.request) {
        processedConfig = await interceptor.request(processedConfig)
      }
    }

    try {
      // 发送请求
      const response = await this.adapter.request<T>(processedConfig)

      // 应用响应拦截器
      let processedResponse = response
      for (const interceptor of this.interceptors) {
        if (interceptor.response) {
          processedResponse = await interceptor.response(processedResponse)
        }
      }

      return processedResponse
    } catch (error) {
      // 应用错误拦截器
      let processedError = error
      for (const interceptor of this.interceptors) {
        if (interceptor.error) {
          processedError = await interceptor.error(processedError)
        }
      }

      throw processedError
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

  private generateTraceId(): string {
    return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// 创建默认客户端实例
export const httpClient = new HttpClient()

// 导出便捷方法
export const request = httpClient.request.bind(httpClient)
export const get = httpClient.get.bind(httpClient)
export const post = httpClient.post.bind(httpClient)
export const put = httpClient.put.bind(httpClient)
export const del = httpClient.delete.bind(httpClient)
export const patch = httpClient.patch.bind(httpClient)
```

### 5. 创建缓存工具
创建`packages/tools/cache/memory.ts`：
```typescript
interface CacheItem<T> {
  value: T
  timestamp: number
  ttl: number
}

export class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()

  set<T>(key: string, value: T, ttl: number = 300000): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }
}

export const memoryCache = new MemoryCache()
```

### 6. 创建日期工具
创建`packages/tools/date/formatter.ts`：
```typescript
export class DateFormatter {
  private locale: string
  private timezone: string

  constructor(locale = 'zh-CN', timezone = 'Asia/Shanghai') {
    this.locale = locale
    this.timezone = timezone
  }

  format(date: Date | string | number, format: string): string {
    const d = new Date(date)
    
    const formatters: Record<string, () => string> = {
      'YYYY': () => d.getFullYear().toString(),
      'MM': () => (d.getMonth() + 1).toString().padStart(2, '0'),
      'DD': () => d.getDate().toString().padStart(2, '0'),
      'HH': () => d.getHours().toString().padStart(2, '0'),
      'mm': () => d.getMinutes().toString().padStart(2, '0'),
      'ss': () => d.getSeconds().toString().padStart(2, '0'),
      'SSS': () => d.getMilliseconds().toString().padStart(3, '0')
    }

    return format.replace(/(YYYY|MM|DD|HH|mm|ss|SSS)/g, (match) => {
      return formatters[match]?.() || match
    })
  }

  formatRelative(date: Date | string | number): string {
    const now = new Date()
    const target = new Date(date)
    const diff = now.getTime() - target.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 30) return `${days}天前`
    
    return this.format(target, 'YYYY-MM-DD')
  }

  formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}天${hours % 24}小时`
    if (hours > 0) return `${hours}小时${minutes % 60}分钟`
    if (minutes > 0) return `${minutes}分钟${seconds % 60}秒`
    return `${seconds}秒`
  }
}

export const dateFormatter = new DateFormatter()
```

### 7. 创建验证工具
创建`packages/tools/validate/schema.ts`：
```typescript
export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (value: any) => boolean | string
  message?: string
}

export interface ValidationSchema {
  [key: string]: ValidationRule | ValidationSchema
}

export class Validator {
  validate(data: any, schema: ValidationSchema): { valid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {}

    for (const [field, rule] of Object.entries(schema)) {
      const value = data[field]
      const fieldErrors: string[] = []

      if (this.isValidationRule(rule)) {
        const error = this.validateField(value, rule)
        if (error) fieldErrors.push(error)
      } else if (typeof rule === 'object') {
        // 嵌套验证
        const nestedResult = this.validate(value || {}, rule)
        if (!nestedResult.valid) {
          Object.entries(nestedResult.errors).forEach(([nestedField, nestedErrors]) => {
            fieldErrors.push(...nestedErrors.map(e => `${nestedField}: ${e}`))
          })
        }
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    }
  }

  private validateField(value: any, rule: ValidationRule): string | null {
    // 必填验证
    if (rule.required && (value === undefined || value === null || value === '')) {
      return rule.message || '此字段为必填项'
    }

    if (value === undefined || value === null) {
      return null
    }

    // 长度验证
    if (rule.min !== undefined) {
      const length = Array.isArray(value) ? value.length : String(value).length
      if (length < rule.min) {
        return rule.message || `长度不能少于${rule.min}个字符`
      }
    }

    if (rule.max !== undefined) {
      const length = Array.isArray(value) ? value.length : String(value).length
      if (length > rule.max) {
        return rule.message || `长度不能超过${rule.max}个字符`
      }
    }

    // 模式验证
    if (rule.pattern && !rule.pattern.test(String(value))) {
      return rule.message || '格式不正确'
    }

    // 自定义验证
    if (rule.validator) {
      const result = rule.validator(value)
      if (result !== true) {
        return typeof result === 'string' ? result : rule.message || '验证失败'
      }
    }

    return null
  }

  private isValidationRule(rule: any): rule is ValidationRule {
    return typeof rule === 'object' && (
      'required' in rule ||
      'min' in rule ||
      'max' in rule ||
      'pattern' in rule ||
      'validator' in rule
    )
  }
}

export const validator = new Validator()

// 预定义验证规则
export const rules = {
  required: (message?: string): ValidationRule => ({
    required: true,
    message
  }),

  email: (message?: string): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: message || '请输入有效的邮箱地址'
  }),

  phone: (message?: string): ValidationRule => ({
    pattern: /^1[3-9]\d{9}$/,
    message: message || '请输入有效的手机号码'
  }),

  url: (message?: string): ValidationRule => ({
    pattern: /^https?:\/\/.+/,
    message: message || '请输入有效的URL'
  })
}
```

## 产出物

- [x] `packages/tools/request/` - 请求层工具
- [x] `packages/tools/mock/` - Mock系统
- [x] `packages/tools/cache/` - 缓存工具
- [x] `packages/tools/date/` - 日期工具
- [x] `packages/tools/validate/` - 验证工具
- [x] `packages/tools/theme/` - 主题工具
- [x] `packages/tools/imaging/` - 图像处理工具

## 审计清单

- [x] HttpAdapter 可切换
- [x] Mock 系统正常工作
- [x] 请求拦截器生效
- [x] TraceId 注入正常
- [x] 缓存工具可用
- [ ] 日期工具可用
- [ ] 验证工具可用
- [ ] 主题工具可用
- [ ] 图像处理工具可用
