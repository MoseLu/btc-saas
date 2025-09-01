/**
 * 用户实体类型
 * 由EPS插件自动生成
 */
export interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
  status: 'active' | 'inactive' | 'pending'
  role: 'admin' | 'user' | 'moderator'
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  profile?: {
    bio?: string
    location?: string
    website?: string
    socialLinks?: {
      twitter?: string
      linkedin?: string
      github?: string
    }
  }
  preferences?: {
    theme?: 'light' | 'dark' | 'auto'
    language?: string
    notifications?: {
      email?: boolean
      push?: boolean
      sms?: boolean
    }
  }
}

/**
 * 创建用户请求类型
 */
export interface CreateUserRequest {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
  role?: 'admin' | 'user' | 'moderator'
  status?: 'active' | 'inactive' | 'pending'
  profile?: {
    bio?: string
    location?: string
    website?: string
    socialLinks?: {
      twitter?: string
      linkedin?: string
      github?: string
    }
  }
  preferences?: {
    theme?: 'light' | 'dark' | 'auto'
    language?: string
    notifications?: {
      email?: boolean
      push?: boolean
      sms?: boolean
    }
  }
}

/**
 * 更新用户请求类型
 */
export interface UpdateUserRequest {
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
  role?: 'admin' | 'user' | 'moderator'
  status?: 'active' | 'inactive' | 'pending'
  profile?: {
    bio?: string
    location?: string
    website?: string
    socialLinks?: {
      twitter?: string
      linkedin?: string
      github?: string
    }
  }
  preferences?: {
    theme?: 'light' | 'dark' | 'auto'
    language?: string
    notifications?: {
      email?: boolean
      push?: boolean
      sms?: boolean
    }
  }
}

/**
 * 用户列表响应类型
 */
export interface UserListResponse {
  data: User[]
  pagination: {
    page: number
    size: number
    total: number
    totalPages: number
  }
  filters?: {
    keyword?: string
    status?: string
    role?: string
    dateRange?: {
      start: string
      end: string
    }
  }
}

/**
 * 用户查询参数类型
 */
export interface UserQueryParams {
  page?: number
  size?: number
  keyword?: string
  status?: string
  role?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  dateRange?: {
    start: string
    end: string
  }
}

/**
 * 用户统计信息类型
 */
export interface UserStats {
  total: number
  active: number
  inactive: number
  pending: number
  byRole: {
    admin: number
    user: number
    moderator: number
  }
  byStatus: {
    active: number
    inactive: number
    pending: number
  }
  recentActivity: {
    newUsers: number
    activeUsers: number
    loginCount: number
  }
}

/**
 * 用户导入/导出类型
 */
export interface UserImportData {
  username: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  role?: string
  status?: string
}

export interface UserExportOptions {
  format: 'csv' | 'excel' | 'json'
  fields: string[]
  filters?: UserQueryParams
}
