/**
 * 用户模块常量定义
 */

import { UserStatus, UserRole } from '../types/user'

// 用户状态选项
export const USER_STATUS_OPTIONS = [
  { label: '激活', value: UserStatus.ACTIVE },
  { label: '未激活', value: UserStatus.INACTIVE },
  { label: '已暂停', value: UserStatus.SUSPENDED },
  { label: '待审核', value: UserStatus.PENDING }
] as const

// 用户角色选项
export const USER_ROLE_OPTIONS = [
  { label: '管理员', value: UserRole.ADMIN },
  { label: '经理', value: UserRole.MANAGER },
  { label: '普通用户', value: UserRole.USER },
  { label: '访客', value: UserRole.GUEST }
] as const

// 用户状态颜色映射
export const USER_STATUS_COLORS = {
  [UserStatus.ACTIVE]: 'success',
  [UserStatus.INACTIVE]: 'info',
  [UserStatus.SUSPENDED]: 'warning',
  [UserStatus.PENDING]: 'danger'
} as const

// 用户角色颜色映射
export const USER_ROLE_COLORS = {
  [UserRole.ADMIN]: 'danger',
  [UserRole.MANAGER]: 'warning',
  [UserRole.USER]: 'primary',
  [UserRole.GUEST]: 'info'
} as const

// 用户列表分页配置
export const USER_LIST_PAGE_SIZE = 20
export const USER_LIST_PAGE_SIZES = [10, 20, 50, 100]

// 用户表单验证规则
export const USER_FORM_RULES = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
} as const

// 用户权限常量
export const USER_PERMISSIONS = {
  // 用户管理权限
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  USER_DELETE: 'user:delete',
  USER_EXPORT: 'user:export',
  
  // 角色管理权限
  ROLE_READ: 'role:read',
  ROLE_WRITE: 'role:write',
  ROLE_DELETE: 'role:delete',
  
  // 部门管理权限
  DEPARTMENT_READ: 'department:read',
  DEPARTMENT_WRITE: 'department:write',
  DEPARTMENT_DELETE: 'department:delete'
} as const

// 用户操作类型
export const USER_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  ENABLE: 'enable',
  DISABLE: 'disable',
  RESET_PASSWORD: 'reset_password',
  EXPORT: 'export',
  IMPORT: 'import'
} as const

// 用户列表排序字段
export const USER_SORT_FIELDS = {
  ID: 'id',
  USERNAME: 'username',
  NAME: 'name',
  EMAIL: 'email',
  STATUS: 'status',
  ROLE: 'role',
  DEPARTMENT: 'department',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  LAST_LOGIN_AT: 'lastLoginAt'
} as const

// 用户导出格式
export const USER_EXPORT_FORMATS = {
  EXCEL: 'excel',
  CSV: 'csv',
  JSON: 'json'
} as const

// 用户头像默认配置
export const USER_AVATAR_CONFIG = {
  DEFAULT_SIZE: 40,
  LARGE_SIZE: 80,
  SMALL_SIZE: 24,
  DEFAULT_COLOR: '#409EFF'
} as const

// 用户搜索历史最大数量
export const USER_SEARCH_HISTORY_MAX = 10

// 用户操作日志保留天数
export const USER_OPERATION_LOG_RETENTION_DAYS = 90
