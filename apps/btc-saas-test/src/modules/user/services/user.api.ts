/**
 * 用户模块 API 服务
 */

import type { 
  User, 
  UserListParams, 
  UserListResponse, 
  CreateUserParams, 
  UpdateUserParams,
  UserStats 
} from '../types/user'

// 用户 API 基础路径
const USER_API_BASE = '/api/users'

/**
 * 用户 API 服务类
 */
export class UserApi {
  /**
   * 获取用户列表
   */
  static async getUsers(params: UserListParams = {}): Promise<UserListResponse> {
    const searchParams = new URLSearchParams()
    
    if (params.page) searchParams.append('page', params.page.toString())
    if (params.size) searchParams.append('size', params.size.toString())
    if (params.keyword) searchParams.append('keyword', params.keyword)
    if (params.status) searchParams.append('status', params.status)
    if (params.role) searchParams.append('role', params.role)
    if (params.department) searchParams.append('department', params.department)
    if (params.startDate) searchParams.append('startDate', params.startDate)
    if (params.endDate) searchParams.append('endDate', params.endDate)
    if (params.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder)

    const response = await fetch(`${USER_API_BASE}?${searchParams.toString()}`)
    
    if (!response.ok) {
      throw new Error(`获取用户列表失败: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * 获取用户详情
   */
  static async getUser(id: number): Promise<User> {
    const response = await fetch(`${USER_API_BASE}/${id}`)
    
    if (!response.ok) {
      throw new Error(`获取用户详情失败: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * 创建用户
   */
  static async createUser(params: CreateUserParams): Promise<User> {
    const response = await fetch(USER_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      throw new Error(`创建用户失败: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * 更新用户
   */
  static async updateUser(params: UpdateUserParams): Promise<User> {
    const { id, ...updateData } = params
    
    const response = await fetch(`${USER_API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      throw new Error(`更新用户失败: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * 删除用户
   */
  static async deleteUser(id: number): Promise<void> {
    const response = await fetch(`${USER_API_BASE}/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error(`删除用户失败: ${response.statusText}`)
    }
  }

  /**
   * 批量删除用户
   */
  static async batchDeleteUsers(ids: number[]): Promise<void> {
    const response = await fetch(`${USER_API_BASE}/batch`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ids })
    })

    if (!response.ok) {
      throw new Error(`批量删除用户失败: ${response.statusText}`)
    }
  }

  /**
   * 启用用户
   */
  static async enableUser(id: number): Promise<User> {
    const response = await fetch(`${USER_API_BASE}/${id}/enable`, {
      method: 'PATCH'
    })

    if (!response.ok) {
      throw new Error(`启用用户失败: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * 禁用用户
   */
  static async disableUser(id: number): Promise<User> {
    const response = await fetch(`${USER_API_BASE}/${id}/disable`, {
      method: 'PATCH'
    })

    if (!response.ok) {
      throw new Error(`禁用用户失败: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * 重置用户密码
   */
  static async resetUserPassword(id: number): Promise<{ newPassword: string }> {
    const response = await fetch(`${USER_API_BASE}/${id}/reset-password`, {
      method: 'POST'
    })

    if (!response.ok) {
      throw new Error(`重置用户密码失败: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * 获取用户统计信息
   */
  static async getUserStats(): Promise<UserStats> {
    const response = await fetch(`${USER_API_BASE}/stats`)
    
    if (!response.ok) {
      throw new Error(`获取用户统计信息失败: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * 导出用户数据
   */
  static async exportUsers(params: UserListParams & { format: 'excel' | 'csv' | 'json' }): Promise<Blob> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(`${USER_API_BASE}/export?${searchParams.toString()}`)
    
    if (!response.ok) {
      throw new Error(`导出用户数据失败: ${response.statusText}`)
    }

    return response.blob()
  }

  /**
   * 导入用户数据
   */
  static async importUsers(file: File): Promise<{ success: number; failed: number; errors: string[] }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${USER_API_BASE}/import`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`导入用户数据失败: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * 检查用户名是否可用
   */
  static async checkUsernameAvailable(username: string): Promise<{ available: boolean }> {
    const response = await fetch(`${USER_API_BASE}/check-username?username=${encodeURIComponent(username)}`)
    
    if (!response.ok) {
      throw new Error(`检查用户名可用性失败: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * 检查邮箱是否可用
   */
  static async checkEmailAvailable(email: string): Promise<{ available: boolean }> {
    const response = await fetch(`${USER_API_BASE}/check-email?email=${encodeURIComponent(email)}`)
    
    if (!response.ok) {
      throw new Error(`检查邮箱可用性失败: ${response.statusText}`)
    }

    return response.json()
  }
}

// 导出默认实例
export const userApi = UserApi
