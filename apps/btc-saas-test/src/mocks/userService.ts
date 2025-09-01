import type { User, CreateUserRequest, UpdateUserRequest, UserListResponse } from '../types/user'

// Mock数据
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    firstName: '管理员',
    lastName: '系统',
    phone: '13800138000',
    avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
    status: 'active',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastLoginAt: '2024-01-20T14:20:00Z',
    profile: {
      bio: '系统管理员，负责系统维护和用户管理',
      location: '北京',
      website: 'https://admin.example.com',
      socialLinks: {
        github: 'https://github.com/admin'
      }
    },
    preferences: {
      theme: 'dark',
      language: 'zh-CN',
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    }
  },
  {
    id: '2',
    username: 'user001',
    email: 'user001@example.com',
    firstName: '张三',
    lastName: '李',
    phone: '13800138001',
    avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
    status: 'active',
    role: 'user',
    createdAt: '2024-01-05T09:15:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    lastLoginAt: '2024-01-19T11:30:00Z',
    profile: {
      bio: '普通用户，喜欢编程和新技术',
      location: '上海',
      socialLinks: {
        github: 'https://github.com/user001',
        twitter: 'https://twitter.com/user001'
      }
    },
    preferences: {
      theme: 'light',
      language: 'zh-CN',
      notifications: {
        email: true,
        push: false,
        sms: true
      }
    }
  },
  {
    id: '3',
    username: 'moderator',
    email: 'moderator@example.com',
    firstName: '王',
    lastName: '版主',
    phone: '13800138002',
    avatar: 'https://avatars.githubusercontent.com/u/3?v=4',
    status: 'active',
    role: 'moderator',
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-16T13:10:00Z',
    lastLoginAt: '2024-01-20T09:15:00Z',
    profile: {
      bio: '社区版主，负责内容审核和用户指导',
      location: '广州',
      website: 'https://moderator.example.com'
    },
    preferences: {
      theme: 'auto',
      language: 'zh-CN',
      notifications: {
        email: true,
        push: true,
        sms: true
      }
    }
  },
  {
    id: '4',
    username: 'inactive_user',
    email: 'inactive@example.com',
    firstName: '赵',
    lastName: '非活跃',
    phone: '13800138003',
    status: 'inactive',
    role: 'user',
    createdAt: '2024-01-02T11:30:00Z',
    updatedAt: '2024-01-10T15:20:00Z',
    lastLoginAt: '2024-01-10T15:20:00Z',
    preferences: {
      theme: 'light',
      language: 'zh-CN',
      notifications: {
        email: false,
        push: false,
        sms: false
      }
    }
  },
  {
    id: '5',
    username: 'pending_user',
    email: 'pending@example.com',
    firstName: '钱',
    lastName: '待审核',
    phone: '13800138004',
    status: 'pending',
    role: 'user',
    createdAt: '2024-01-20T08:45:00Z',
    updatedAt: '2024-01-20T08:45:00Z',
    preferences: {
      theme: 'light',
      language: 'zh-CN',
      notifications: {
        email: true,
        push: false,
        sms: false
      }
    }
  }
]

let nextId = 6

// 模拟延迟
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock用户服务类
export class MockUserService {
  private users: User[] = [...mockUsers]

  async getUsers(params?: {
    page?: number
    size?: number
    keyword?: string
    status?: string
  }): Promise<UserListResponse> {
    await delay()
    
    let filteredUsers = [...this.users]
    
    // 关键词过滤
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase()
      filteredUsers = filteredUsers.filter(user => 
        user.username.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.firstName?.toLowerCase().includes(keyword) ||
        user.lastName?.toLowerCase().includes(keyword)
      )
    }
    
    // 状态过滤
    if (params?.status) {
      filteredUsers = filteredUsers.filter(user => user.status === params.status)
    }
    
    // 分页
    const page = params?.page || 1
    const size = params?.size || 20
    const start = (page - 1) * size
    const end = start + size
    const paginatedUsers = filteredUsers.slice(start, end)
    
    return {
      data: paginatedUsers,
      pagination: {
        page,
        size,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / size)
      }
    }
  }

  async getUserById(id: string): Promise<User> {
    await delay()
    const user = this.users.find(u => u.id === id)
    if (!user) {
      throw new Error('用户不存在')
    }
    return user
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    await delay()
    
    // 检查用户名和邮箱是否已存在
    if (this.users.some(u => u.username === data.username)) {
      throw new Error('用户名已存在')
    }
    if (this.users.some(u => u.email === data.email)) {
      throw new Error('邮箱已存在')
    }
    
    const newUser: User = {
      id: String(nextId++),
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      status: data.status || 'active',
      role: data.role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: data.profile,
      preferences: data.preferences || {
        theme: 'light',
        language: 'zh-CN',
        notifications: {
          email: true,
          push: false,
          sms: false
        }
      }
    }
    
    this.users.push(newUser)
    return newUser
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    await delay()
    
    const userIndex = this.users.findIndex(u => u.id === id)
    if (userIndex === -1) {
      throw new Error('用户不存在')
    }
    
    // 检查用户名和邮箱唯一性
    if (data.username && this.users.some(u => u.id !== id && u.username === data.username)) {
      throw new Error('用户名已存在')
    }
    if (data.email && this.users.some(u => u.id !== id && u.email === data.email)) {
      throw new Error('邮箱已存在')
    }
    
    const updatedUser = {
      ...this.users[userIndex],
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    this.users[userIndex] = updatedUser
    return updatedUser
  }

  async deleteUser(id: string): Promise<void> {
    await delay()
    
    const userIndex = this.users.findIndex(u => u.id === id)
    if (userIndex === -1) {
      throw new Error('用户不存在')
    }
    
    this.users.splice(userIndex, 1)
  }

  async batchDeleteUsers(ids: string[]): Promise<void> {
    await delay()
    
    for (const id of ids) {
      const userIndex = this.users.findIndex(u => u.id === id)
      if (userIndex !== -1) {
        this.users.splice(userIndex, 1)
      }
    }
  }

  async getUserStats(): Promise<{
    total: number
    active: number
    inactive: number
  }> {
    await delay()
    
    const total = this.users.length
    const active = this.users.filter(u => u.status === 'active').length
    const inactive = this.users.filter(u => u.status === 'inactive').length
    
    return { total, active, inactive }
  }
}

// 导出默认实例
export const mockUserService = new MockUserService()
