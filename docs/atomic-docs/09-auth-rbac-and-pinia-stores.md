---
title: 认证 RBAC 与 Pinia 状态管理
category: auth
order: 9
owners: [frontend, auth]
auditable: true
acceptance:
  - [ ] 认证状态管理生效
  - [ ] RBAC 权限控制
  - [ ] 路由守卫联动
  - [ ] 用户信息管理
outputs:
  - packages/bridge/src/stores/auth.ts
  - packages/bridge/src/stores/rbac.ts
  - packages/bridge/src/guards/
related: [02-bridge-sdk-and-topbar, 07-eps-plugin-and-services]
---

# 认证 RBAC 与 Pinia 状态管理

## 背景与目标

实现完整的认证和基于角色的访问控制（RBAC）系统，使用Pinia进行状态管理，支持路由守卫和权限验证。

## 约定

### 权限模型
```typescript
interface User {
  id: string
  name: string
  email: string
  avatar?: string
  roles: Role[]
  permissions: Permission[]
  tenant: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
}

interface Permission {
  id: string
  name: string
  resource: string
  action: string
  conditions?: Record<string, any>
}
```

## 步骤

### 1. 创建认证状态管理
创建`packages/bridge/src/stores/auth.ts`：
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials } from '../types'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isAuthenticated = ref(false)
  const loading = ref(false)

  // 计算属性
  const hasPermission = computed(() => {
    return (permission: string) => {
      if (!user.value) return false
      return user.value.permissions.some(p => p.name === permission)
    }
  })

  const hasRole = computed(() => {
    return (role: string) => {
      if (!user.value) return false
      return user.value.roles.some(r => r.name === role)
    }
  })

  // 方法
  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    try {
      // 调用登录API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        throw new Error('登录失败')
      }

      const data = await response.json()
      token.value = data.token
      user.value = data.user
      isAuthenticated.value = true

      // 存储到本地存储
      localStorage.setItem('btc-token', data.token)
      localStorage.setItem('btc-user', JSON.stringify(data.user))
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    isAuthenticated.value = false
    
    // 清除本地存储
    localStorage.removeItem('btc-token')
    localStorage.removeItem('btc-user')
  }

  const refreshUser = async () => {
    if (!token.value) return

    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token.value}` }
      })

      if (response.ok) {
        const userData = await response.json()
        user.value = userData
        isAuthenticated.value = true
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error)
      logout()
    }
  }

  const initAuth = () => {
    const savedToken = localStorage.getItem('btc-token')
    const savedUser = localStorage.getItem('btc-user')

    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
      isAuthenticated.value = true
    }
  }

  return {
    // 状态
    user: readonly(user),
    token: readonly(token),
    isAuthenticated: readonly(isAuthenticated),
    loading: readonly(loading),

    // 计算属性
    hasPermission,
    hasRole,

    // 方法
    login,
    logout,
    refreshUser,
    initAuth
  }
})
```

### 2. 创建RBAC状态管理
创建`packages/bridge/src/stores/rbac.ts`：
```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Role, Permission } from '../types'

export const useRbacStore = defineStore('rbac', () => {
  // 状态
  const roles = ref<Role[]>([])
  const permissions = ref<Permission[]>([])
  const rolePermissions = ref<Map<string, Permission[]>>(new Map())

  // 计算属性
  const getRolePermissions = computed(() => {
    return (roleId: string) => {
      return rolePermissions.value.get(roleId) || []
    }
  })

  const getAllPermissions = computed(() => {
    return permissions.value
  })

  const getAllRoles = computed(() => {
    return roles.value
  })

  // 方法
  const loadRoles = async () => {
    try {
      const response = await fetch('/api/roles')
      if (response.ok) {
        roles.value = await response.json()
      }
    } catch (error) {
      console.error('加载角色失败:', error)
    }
  }

  const loadPermissions = async () => {
    try {
      const response = await fetch('/api/permissions')
      if (response.ok) {
        permissions.value = await response.json()
      }
    } catch (error) {
      console.error('加载权限失败:', error)
    }
  }

  const assignPermissionToRole = async (roleId: string, permissionId: string) => {
    try {
      const response = await fetch(`/api/roles/${roleId}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissionId })
      })

      if (response.ok) {
        // 更新本地状态
        const role = roles.value.find(r => r.id === roleId)
        const permission = permissions.value.find(p => p.id === permissionId)
        
        if (role && permission) {
          role.permissions.push(permission)
        }
      }
    } catch (error) {
      console.error('分配权限失败:', error)
    }
  }

  const removePermissionFromRole = async (roleId: string, permissionId: string) => {
    try {
      const response = await fetch(`/api/roles/${roleId}/permissions/${permissionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // 更新本地状态
        const role = roles.value.find(r => r.id === roleId)
        if (role) {
          role.permissions = role.permissions.filter(p => p.id !== permissionId)
        }
      }
    } catch (error) {
      console.error('移除权限失败:', error)
    }
  }

  const checkPermission = (userPermissions: Permission[], requiredPermission: string) => {
    return userPermissions.some(p => p.name === requiredPermission)
  }

  const checkResourcePermission = (userPermissions: Permission[], resource: string, action: string) => {
    return userPermissions.some(p => 
      p.resource === resource && p.action === action
    )
  }

  return {
    // 状态
    roles: readonly(roles),
    permissions: readonly(permissions),

    // 计算属性
    getRolePermissions,
    getAllPermissions,
    getAllRoles,

    // 方法
    loadRoles,
    loadPermissions,
    assignPermissionToRole,
    removePermissionFromRole,
    checkPermission,
    checkResourcePermission
  }
})
```

### 3. 创建路由守卫
创建`packages/bridge/src/guards/auth.ts`：
```typescript
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useRbacStore } from '../stores/rbac'

export interface GuardConfig {
  requiresAuth?: boolean
  requiredPermissions?: string[]
  requiredRoles?: string[]
  redirectTo?: string
}

export function createAuthGuard(config: GuardConfig) {
  return async (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const authStore = useAuthStore()
    const rbacStore = useRbacStore()

    // 检查是否需要认证
    if (config.requiresAuth && !authStore.isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }

    // 检查权限
    if (config.requiredPermissions && authStore.user) {
      const hasAllPermissions = config.requiredPermissions.every(permission =>
        rbacStore.checkPermission(authStore.user!.permissions, permission)
      )

      if (!hasAllPermissions) {
        next({ name: 'forbidden' })
        return
      }
    }

    // 检查角色
    if (config.requiredRoles && authStore.user) {
      const hasRequiredRole = config.requiredRoles.some(role =>
        authStore.hasRole(role)
      )

      if (!hasRequiredRole) {
        next({ name: 'forbidden' })
        return
      }
    }

    next()
  }
}

// 预定义的守卫
export const requireAuth = createAuthGuard({ requiresAuth: true })
export const requireAdmin = createAuthGuard({ 
  requiresAuth: true, 
  requiredRoles: ['admin'] 
})
export const requireUser = createAuthGuard({ 
  requiresAuth: true, 
  requiredRoles: ['user', 'admin'] 
})
```

### 4. 创建权限指令
创建`packages/bridge/src/directives/permission.ts`：
```typescript
import type { Directive } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRbacStore } from '../stores/rbac'

export const permission: Directive = {
  mounted(el, binding) {
    const authStore = useAuthStore()
    const rbacStore = useRbacStore()

    const { value } = binding

    if (!authStore.isAuthenticated) {
      el.style.display = 'none'
      return
    }

    if (typeof value === 'string') {
      // 单个权限检查
      const hasPermission = rbacStore.checkPermission(
        authStore.user!.permissions,
        value
      )

      if (!hasPermission) {
        el.style.display = 'none'
      }
    } else if (Array.isArray(value)) {
      // 多个权限检查（AND逻辑）
      const hasAllPermissions = value.every(permission =>
        rbacStore.checkPermission(authStore.user!.permissions, permission)
      )

      if (!hasAllPermissions) {
        el.style.display = 'none'
      }
    } else if (typeof value === 'object') {
      // 复杂权限检查
      const { resource, action, conditions } = value

      if (resource && action) {
        const hasResourcePermission = rbacStore.checkResourcePermission(
          authStore.user!.permissions,
          resource,
          action
        )

        if (!hasResourcePermission) {
          el.style.display = 'none'
        }
      }
    }
  },

  updated(el, binding) {
    // 权限更新时重新检查
    this.mounted(el, binding)
  }
}

export const role: Directive = {
  mounted(el, binding) {
    const authStore = useAuthStore()
    const { value } = binding

    if (!authStore.isAuthenticated) {
      el.style.display = 'none'
      return
    }

    if (typeof value === 'string') {
      // 单个角色检查
      if (!authStore.hasRole(value)) {
        el.style.display = 'none'
      }
    } else if (Array.isArray(value)) {
      // 多个角色检查（OR逻辑）
      const hasAnyRole = value.some(role => authStore.hasRole(role))

      if (!hasAnyRole) {
        el.style.display = 'none'
      }
    }
  },

  updated(el, binding) {
    this.mounted(el, binding)
  }
}
```

### 5. 创建认证服务
创建`packages/bridge/src/services/auth.ts`：
```typescript
import { httpClient } from '@btc/tools/request'
import type { User, LoginCredentials, RegisterData } from '../types'

export interface AuthResponse {
  token: string
  user: User
  expiresIn: number
}

export interface RefreshResponse {
  token: string
  expiresIn: number
}

export class AuthService {
  private static instance: AuthService
  private refreshTimer?: NodeJS.Timeout

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/api/auth/login', credentials)
    this.setupTokenRefresh(response.data.expiresIn)
    return response.data
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/api/auth/register', data)
    this.setupTokenRefresh(response.data.expiresIn)
    return response.data
  }

  async logout(): Promise<void> {
    try {
      await httpClient.post('/api/auth/logout')
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      this.clearTokenRefresh()
    }
  }

  async refreshToken(): Promise<RefreshResponse> {
    const response = await httpClient.post<RefreshResponse>('/api/auth/refresh')
    this.setupTokenRefresh(response.data.expiresIn)
    return response.data
  }

  async getCurrentUser(): Promise<User> {
    const response = await httpClient.get<User>('/api/auth/me')
    return response.data
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await httpClient.put<User>('/api/auth/profile', data)
    return response.data
  }

  async changePassword(data: { oldPassword: string; newPassword: string }): Promise<void> {
    await httpClient.post('/api/auth/change-password', data)
  }

  private setupTokenRefresh(expiresIn: number) {
    // 在token过期前5分钟刷新
    const refreshTime = (expiresIn - 300) * 1000
    
    this.clearTokenRefresh()
    
    this.refreshTimer = setTimeout(async () => {
      try {
        await this.refreshToken()
      } catch (error) {
        console.error('Token刷新失败:', error)
        // 刷新失败，跳转到登录页
        window.location.href = '/login'
      }
    }, refreshTime)
  }

  private clearTokenRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = undefined
    }
  }
}

export const authService = AuthService.getInstance()
```

### 6. 创建权限组合函数
创建`packages/bridge/src/composables/usePermissions.ts`：
```typescript
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRbacStore } from '../stores/rbac'

export function usePermissions() {
  const authStore = useAuthStore()
  const rbacStore = useRbacStore()

  const can = computed(() => {
    return (permission: string) => {
      if (!authStore.isAuthenticated || !authStore.user) {
        return false
      }
      return rbacStore.checkPermission(authStore.user.permissions, permission)
    }
  })

  const canAny = computed(() => {
    return (permissions: string[]) => {
      if (!authStore.isAuthenticated || !authStore.user) {
        return false
      }
      return permissions.some(permission =>
        rbacStore.checkPermission(authStore.user!.permissions, permission)
      )
    }
  })

  const canAll = computed(() => {
    return (permissions: string[]) => {
      if (!authStore.isAuthenticated || !authStore.user) {
        return false
      }
      return permissions.every(permission =>
        rbacStore.checkPermission(authStore.user!.permissions, permission)
      )
    }
  })

  const canResource = computed(() => {
    return (resource: string, action: string) => {
      if (!authStore.isAuthenticated || !authStore.user) {
        return false
      }
      return rbacStore.checkResourcePermission(
        authStore.user!.permissions,
        resource,
        action
      )
    }
  })

  const hasRole = computed(() => {
    return (role: string) => {
      if (!authStore.isAuthenticated) {
        return false
      }
      return authStore.hasRole(role)
    }
  })

  const hasAnyRole = computed(() => {
    return (roles: string[]) => {
      if (!authStore.isAuthenticated) {
        return false
      }
      return roles.some(role => authStore.hasRole(role))
    }
  })

  const hasAllRoles = computed(() => {
    return (roles: string[]) => {
      if (!authStore.isAuthenticated) {
        return false
      }
      return roles.every(role => authStore.hasRole(role))
    }
  })

  return {
    can,
    canAny,
    canAll,
    canResource,
    hasRole,
    hasAnyRole,
    hasAllRoles
  }
}
```

## 产出物

- [x] `packages/bridge/src/stores/auth.ts` - 认证状态管理
- [x] `packages/bridge/src/stores/rbac.ts` - RBAC状态管理
- [x] `packages/bridge/src/guards/auth.ts` - 路由守卫
- [x] `packages/bridge/src/directives/permission.ts` - 权限指令
- [x] `packages/bridge/src/services/auth.ts` - 认证服务
- [x] `packages/bridge/src/composables/usePermissions.ts` - 权限组合函数

## 审计清单

- [ ] 认证状态管理生效
- [ ] RBAC 权限控制
- [ ] 路由守卫联动
- [ ] 用户信息管理
- [ ] 权限指令可用
- [ ] Token 自动刷新
- [ ] 权限组合函数
