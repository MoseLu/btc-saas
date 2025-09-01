/**
 * 用户模块类型定义
 */

// 用户基础信息
export interface User {
  id: number
  username: string
  email: string
  name: string
  avatar?: string
  phone?: string
  status: UserStatus
  role: UserRole
  department?: string
  position?: string
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

// 用户角色枚举
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  GUEST = 'guest'
}

// 用户列表查询参数
export interface UserListParams {
  page?: number
  size?: number
  keyword?: string
  status?: UserStatus
  role?: UserRole
  department?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 用户列表响应
export interface UserListResponse {
  data: User[]
  total: number
  page: number
  size: number
  totalPages: number
}

// 创建用户参数
export interface CreateUserParams {
  username: string
  email: string
  name: string
  password: string
  phone?: string
  role: UserRole
  department?: string
  position?: string
}

// 更新用户参数
export interface UpdateUserParams {
  id: number
  email?: string
  name?: string
  phone?: string
  status?: UserStatus
  role?: UserRole
  department?: string
  position?: string
}

// 用户统计信息
export interface UserStats {
  total: number
  active: number
  inactive: number
  suspended: number
  pending: number
  byRole: Record<UserRole, number>
  byDepartment: Record<string, number>
}

// 用户权限
export interface UserPermission {
  id: string
  name: string
  description: string
  resource: string
  action: string
}

// 用户组
export interface UserGroup {
  id: number
  name: string
  description?: string
  users: User[]
  permissions: UserPermission[]
  createdAt: string
  updatedAt: string
}
