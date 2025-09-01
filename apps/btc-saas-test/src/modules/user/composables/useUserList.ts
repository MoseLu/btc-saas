/**
 * 用户列表逻辑层
 */

import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../stores/user.store'
import { userApi } from '../services/user.api'
import type { User, UserListParams } from '../types/user'
import { UserStatus, UserRole } from '../types/user'
import { USER_STATUS_OPTIONS, USER_ROLE_OPTIONS } from '../constants/user.constants'

export const useUserList = () => {
  const userStore = useUserStore()
  
  // 本地状态
  const selectedUsers = ref<User[]>([])
  const showCreateDialog = ref(false)
  const showEditDialog = ref(false)
  const showDeleteConfirm = ref(false)
  const userToDelete = ref<User | null>(null)
  
  // 搜索和筛选状态
  const searchKeyword = ref('')
  const selectedStatus = ref<UserStatus | ''>('')
  const selectedRole = ref<UserRole | ''>('')
  const selectedDepartment = ref('')
  const dateRange = ref<[string, string] | null>(null)
  
  // 排序状态
  const sortBy = ref('createdAt')
  const sortOrder = ref<'asc' | 'desc'>('desc')
  
  // 计算属性
  const filteredUsers = computed(() => {
    let users = userStore.users
    
    // 按关键词搜索
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      users = users.filter(user => 
        user.username.toLowerCase().includes(keyword) ||
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.department?.toLowerCase().includes(keyword)
      )
    }
    
    // 按状态筛选
    if (selectedStatus.value) {
      users = users.filter(user => user.status === selectedStatus.value)
    }
    
    // 按角色筛选
    if (selectedRole.value) {
      users = users.filter(user => user.role === selectedRole.value)
    }
    
    // 按部门筛选
    if (selectedDepartment.value) {
      users = users.filter(user => user.department === selectedDepartment.value)
    }
    
    // 按日期范围筛选
    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
      const startDate = new Date(dateRange.value[0])
      const endDate = new Date(dateRange.value[1])
      users = users.filter(user => {
        const userDate = new Date(user.createdAt)
        return userDate >= startDate && userDate <= endDate
      })
    }
    
    return users
  })
  
  const availableDepartments = computed(() => {
    const departments = new Set(userStore.users.map(user => user.department).filter(Boolean))
    return Array.from(departments).sort()
  })
  
  const hasSelectedUsers = computed(() => selectedUsers.value.length > 0)
  
  const isAllSelected = computed(() => {
    return filteredUsers.value.length > 0 && selectedUsers.value.length === filteredUsers.value.length
  })
  
  const isIndeterminate = computed(() => {
    return selectedUsers.value.length > 0 && selectedUsers.value.length < filteredUsers.value.length
  })

  // 方法
  const loadUsers = async () => {
    try {
      await userStore.fetchUsers()
    } catch (error) {
      ElMessage.error('加载用户列表失败')
    }
  }
  
  const loadUserStats = async () => {
    try {
      await userStore.fetchUserStats()
    } catch (error) {
      ElMessage.error('加载用户统计信息失败')
    }
  }
  
  const handleSearch = () => {
    const filters: UserListParams = {
      keyword: searchKeyword.value,
      status: selectedStatus.value || undefined,
      role: selectedRole.value || undefined,
      department: selectedDepartment.value || undefined,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    }
    
    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
      filters.startDate = dateRange.value[0]
      filters.endDate = dateRange.value[1]
    }
    
    userStore.updateFilters(filters)
    userStore.updatePagination(1)
    loadUsers()
  }
  
  const handleReset = () => {
    searchKeyword.value = ''
    selectedStatus.value = '' as UserStatus | ''
    selectedRole.value = '' as UserRole | ''
    selectedDepartment.value = ''
    dateRange.value = null
    sortBy.value = 'createdAt'
    sortOrder.value = 'desc'
    
    userStore.reset()
    loadUsers()
  }
  
  const handleSort = (column: string, order: 'asc' | 'desc') => {
    sortBy.value = column
    sortOrder.value = order
    handleSearch()
  }
  
  const handlePageChange = (page: number) => {
    userStore.updatePagination(page)
    loadUsers()
  }
  
  const handleSizeChange = (size: number) => {
    userStore.updatePagination(1, size)
    loadUsers()
  }
  
  const handleSelectionChange = (users: User[]) => {
    selectedUsers.value = users
  }
  
  const handleSelectAll = (val: boolean) => {
    if (val) {
      selectedUsers.value = [...filteredUsers.value]
    } else {
      selectedUsers.value = []
    }
  }
  
  const handleCreateUser = () => {
    showCreateDialog.value = true
  }
  
  const handleEditUser = (user: User) => {
    userStore.fetchUser(user.id)
    showEditDialog.value = true
  }
  
  const handleDeleteUser = (user: User) => {
    userToDelete.value = user
    showDeleteConfirm.value = true
  }
  
  const confirmDeleteUser = async () => {
    if (!userToDelete.value) return
    
    try {
      await userStore.deleteUser(userToDelete.value.id)
      ElMessage.success('用户删除成功')
      showDeleteConfirm.value = false
      userToDelete.value = null
    } catch (error) {
      ElMessage.error('用户删除失败')
    }
  }
  
  const handleBatchDelete = async () => {
    if (selectedUsers.value.length === 0) {
      ElMessage.warning('请选择要删除的用户')
      return
    }
    
    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`,
        '批量删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      
      const userIds = selectedUsers.value.map(user => user.id)
      await userStore.batchDeleteUsers(userIds)
      
      ElMessage.success('批量删除成功')
      selectedUsers.value = []
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('批量删除失败')
      }
    }
  }
  
  const handleEnableUser = async (user: User) => {
    try {
      await userStore.enableUser(user.id)
      ElMessage.success('用户启用成功')
    } catch (error) {
      ElMessage.error('用户启用失败')
    }
  }
  
  const handleDisableUser = async (user: User) => {
    try {
      await userStore.disableUser(user.id)
      ElMessage.success('用户禁用成功')
    } catch (error) {
      ElMessage.error('用户禁用失败')
    }
  }
  
  const handleResetPassword = async (user: User) => {
    try {
      const result = await userStore.resetUserPassword(user.id)
      ElMessage.success(`密码重置成功，新密码：${result.newPassword}`)
    } catch (error) {
      ElMessage.error('密码重置失败')
    }
  }
  
  const handleExportUsers = async () => {
    try {
      const filters: UserListParams = {
        keyword: searchKeyword.value,
        status: selectedStatus.value || undefined,
        role: selectedRole.value || undefined,
        department: selectedDepartment.value || undefined,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value
      }
      
      if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
        filters.startDate = dateRange.value[0]
        filters.endDate = dateRange.value[1]
      }
      
      const blob = await userApi.exportUsers({ ...filters, format: 'excel' })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      ElMessage.success('用户数据导出成功')
    } catch (error) {
      ElMessage.error('用户数据导出失败')
    }
  }
  
  const handleRefresh = () => {
    loadUsers()
    loadUserStats()
  }
  
  // 监听筛选条件变化
  watch([searchKeyword, selectedStatus, selectedRole, selectedDepartment, dateRange], () => {
    // 可以在这里添加防抖逻辑
  }, { deep: true })
  
  // 组件挂载时加载数据
  onMounted(() => {
    loadUsers()
    loadUserStats()
  })

  return {
    // 状态
    selectedUsers,
    showCreateDialog,
    showEditDialog,
    showDeleteConfirm,
    userToDelete,
    searchKeyword,
    selectedStatus,
    selectedRole,
    selectedDepartment,
    dateRange,
    sortBy,
    sortOrder,
    
    // 计算属性
    filteredUsers,
    availableDepartments,
    hasSelectedUsers,
    isAllSelected,
    isIndeterminate,
    
    // 常量
    USER_STATUS_OPTIONS,
    USER_ROLE_OPTIONS,
    
    // 方法
    loadUsers,
    loadUserStats,
    handleSearch,
    handleReset,
    handleSort,
    handlePageChange,
    handleSizeChange,
    handleSelectionChange,
    handleSelectAll,
    handleCreateUser,
    handleEditUser,
    handleDeleteUser,
    confirmDeleteUser,
    handleBatchDelete,
    handleEnableUser,
    handleDisableUser,
    handleResetPassword,
    handleExportUsers,
    handleRefresh
  }
}
