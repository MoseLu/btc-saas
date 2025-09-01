import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import type {
  GetProductsRequest,
  GetProductsResponse,
  PostProductsRequest,
  PostProductsResponse,
} from './types'

export class 产品管理Service {
  private baseURL: string
  private timeout: number
  private headers: Record<string, string>
  private withCredentials: boolean

  constructor(config: {
    baseURL?: string
    timeout?: number
    headers?: Record<string, string>
    withCredentials?: boolean
  } = {}) {
    this.baseURL = config.baseURL || '/api'
    this.timeout = config.timeout || 30000
    this.headers = config.headers || {}
    this.withCredentials = config.withCredentials || false
  }

  private async request<T = any>(
    method: string,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const axiosConfig: AxiosRequestConfig = {
      method,
      url: `${this.baseURL}${url}`,
      timeout: this.timeout,
      headers: {
        ...this.headers,
        ...config?.headers
      },
      withCredentials: this.withCredentials,
      ...config
    }

    if (data) {
      if (method.toLowerCase() === 'get') {
        axiosConfig.params = data
      } else {
        axiosConfig.data = data
      }
    }

    try {
      return await axios(axiosConfig)
    } catch (error) {
      console.error(`API请求失败: ${method} ${url}`, error)
      throw error
    }
  }


  /**
   * 获取产品列表
   */
  async getProducts(queryParams?: { page?: number, pageSize?: number, category?: string }, config?: AxiosRequestConfig): Promise<AxiosResponse<GetProductsResponse>> {
    const data = queryParams || {}
    const requestConfig: AxiosRequestConfig = {
      ...config
    }

    return this.request<GetProductsResponse>('GET', '/products', data, requestConfig)

  }


  /**
   * 创建产品
   */
  async postProducts(body: CreateProductRequest, config?: AxiosRequestConfig): Promise<AxiosResponse<PostProductsResponse>> {
    const data = body
    const requestConfig: AxiosRequestConfig = {
      ...config
    }

    return this.request<PostProductsResponse>('POST', '/products', data, requestConfig)

  }
}

export default 产品管理Service
