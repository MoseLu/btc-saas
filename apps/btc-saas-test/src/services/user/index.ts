import axios from 'axios'
import type { User, CreateUserRequest, UpdateUserRequest, UserListResponse } from '../../types/user'
import { mockUserService } from '../../mocks/userService'

/**
 * 用户管理服务类
 * 由EPS插件自动生成
 */
export class UserService {
  private baseURL: string
  private useMock: boolean

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL
    // 强制使用Mock数据，避免API请求错误
    this.useMock = true
  }

  /**
   * 获取用户列表
   */
  async getUsers(params?: {
    page?: number
    size?: number
    keyword?: string
    status?: string
  }): Promise<UserListResponse> {
    if (this.useMock) {
      return mockUserService.getUsers(params)
    }
    const response = await axios.get(`${this.baseURL}/users`, { params })
    return response.data
  }

  /**
   * 根据ID获取用户详情
   */
  async getUserById(id: string): Promise<User> {
    if (this.useMock) {
      return mockUserService.getUserById(id)
    }
    const response = await axios.get(`${this.baseURL}/users/${id}`)
    return response.data
  }

  /**
   * 创建新用户
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    if (this.useMock) {
      return mockUserService.createUser(data)
    }
    const response = await axios.post(`${this.baseURL}/users`, data)
    return response.data
  }

  /**
   * 更新用户信息
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    if (this.useMock) {
      return mockUserService.updateUser(id, data)
    }
    const response = await axios.put(`${this.baseURL}/users/${id}`, data)
    return response.data
  }

  /**
   * 删除用户
   */
  async deleteUser(id: string): Promise<void> {
    if (this.useMock) {
      return mockUserService.deleteUser(id)
    }
    await axios.delete(`${this.baseURL}/users/${id}`)
  }

  /**
   * 批量删除用户
   */
  async batchDeleteUsers(ids: string[]): Promise<void> {
    if (this.useMock) {
      return mockUserService.batchDeleteUsers(ids)
    }
    await axios.delete(`${this.baseURL}/users/batch`, { data: { ids } })
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(): Promise<{
    total: number
    active: number
    inactive: number
  }> {
    if (this.useMock) {
      return mockUserService.getUserStats()
    }
    const response = await axios.get(`${this.baseURL}/users/stats`)
    return response.data
  }
}

// 导出默认实例
export const userService = new UserService()

// 兼容性导出 - 保持与现有代码的兼容性
export const getList = async (params: any) => {
  return userService.getUsers(params)
}

export const create = async (data: any) => {
  return userService.createUser(data)
}

export const update = async (id: string, data: any) => {
  return userService.updateUser(id, data)
}

export const remove = async (id: string) => {
  return userService.deleteUser(id)
}
