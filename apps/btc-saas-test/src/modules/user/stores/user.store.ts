/**
 * 用户模块状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserListParams, UserStats } from '../types/user'
import { userApi } from '../services/user.api'

export const useUserStore = defineStore('user', () => {
  // 状态
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const userStats = ref<UserStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 分页状态
  const pagination = ref({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0
  })
  
  // 筛选状态
  const filters = ref<UserListParams>({
    keyword: '',
    status: undefined,
    role: undefined,
    department: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // 计算属性
  const activeUsers = computed(() => 
    users.value.filter(user => user.status === 'active')
  )
  
  const inactiveUsers = computed(() => 
    users.value.filter(user => user.status === 'inactive')
  )
  
  const suspendedUsers = computed(() => 
    users.value.filter(user => user.status === 'suspended')
  )
  
  const pendingUsers = computed(() => 
    users.value.filter(user => user.status === 'pending')
  )
  
  const hasUsers = computed(() => users.value.length > 0)
  
  const isLoading = computed(() => loading.value)
  
  const hasError = computed(() => error.value !== null)

  // 获取用户列表
  const fetchUsers = async (params?: UserListParams) => {
    try {
      loading.value = true
      error.value = null
      
      const queryParams = {
        ...filters.value,
        ...params,
        page: pagination.value.page,
        size: pagination.value.size
      }
      
      const response = await userApi.getUsers(queryParams)
      
      users.value = response.data
      pagination.value = {
        page: response.page,
        size: response.size,
        total: response.total,
        totalPages: response.totalPages
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取用户列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取用户详情
  const fetchUser = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      
      const user = await userApi.getUser(id)
      currentUser.value = user
      
      return user
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取用户详情失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 创建用户
  const createUser = async (userData: any) => {
    try {
      loading.value = true
      error.value = null
      
      const newUser = await userApi.createUser(userData)
      users.value.unshift(newUser)
      
      // 更新统计信息
      await fetchUserStats()
      
      return newUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建用户失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 更新用户
  const updateUser = async (userData: any) => {
    try {
      loading.value = true
      error.value = null
      
      const updatedUser = await userApi.updateUser(userData)
      
      // 更新列表中的用户
      const index = users.value.findIndex(user => user.id === updatedUser.id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      
      // 更新当前用户
      if (currentUser.value?.id === updatedUser.id) {
        currentUser.value = updatedUser
      }
      
      return updatedUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新用户失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 删除用户
  const deleteUser = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      
      await userApi.deleteUser(id)
      
      // 从列表中移除
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value.splice(index, 1)
      }
      
      // 如果删除的是当前用户，清空当前用户
      if (currentUser.value?.id === id) {
        currentUser.value = null
      }
      
      // 更新统计信息
      await fetchUserStats()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除用户失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 批量删除用户
  const batchDeleteUsers = async (ids: number[]) => {
    try {
      loading.value = true
      error.value = null
      
      await userApi.batchDeleteUsers(ids)
      
      // 从列表中移除
      users.value = users.value.filter(user => !ids.includes(user.id))
      
      // 更新统计信息
      await fetchUserStats()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '批量删除用户失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 启用用户
  const enableUser = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      
      const updatedUser = await userApi.enableUser(id)
      
      // 更新列表中的用户
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      
      return updatedUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : '启用用户失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 禁用用户
  const disableUser = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      
      const updatedUser = await userApi.disableUser(id)
      
      // 更新列表中的用户
      const index = users.value.findIndex(user => user.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      
      return updatedUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : '禁用用户失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 重置用户密码
  const resetUserPassword = async (id: number) => {
    try {
      loading.value = true
      error.value = null
      
      const result = await userApi.resetUserPassword(id)
      
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : '重置用户密码失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取用户统计信息
  const fetchUserStats = async () => {
    try {
      const stats = await userApi.getUserStats()
      userStats.value = stats
      return stats
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取用户统计信息失败'
      throw err
    }
  }

  // 更新筛选条件
  const updateFilters = (newFilters: Partial<UserListParams>) => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1 // 重置到第一页
  }

  // 更新分页
  const updatePagination = (page: number, size?: number) => {
    pagination.value.page = page
    if (size) {
      pagination.value.size = size
    }
  }

  // 清空错误
  const clearError = () => {
    error.value = null
  }

  // 重置状态
  const reset = () => {
    users.value = []
    currentUser.value = null
    userStats.value = null
    loading.value = false
    error.value = null
    pagination.value = {
      page: 1,
      size: 20,
      total: 0,
      totalPages: 0
    }
    filters.value = {
      keyword: '',
      status: undefined,
      role: undefined,
      department: '',
      startDate: '',
      endDate: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
  }

  return {
    // 状态
    users,
    currentUser,
    userStats,
    loading,
    error,
    pagination,
    filters,
    
    // 计算属性
    activeUsers,
    inactiveUsers,
    suspendedUsers,
    pendingUsers,
    hasUsers,
    isLoading,
    hasError,
    
    // 方法
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    batchDeleteUsers,
    enableUser,
    disableUser,
    resetUserPassword,
    fetchUserStats,
    updateFilters,
    updatePagination,
    clearError,
    reset
  }
})
