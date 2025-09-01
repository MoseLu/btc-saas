<template>
  <div class="user-list-page">
    <!-- 操作按钮区域 -->
    <div class="header-actions">
      <el-button type="primary" @click="handleCreateUser">
        <el-icon><Plus /></el-icon>
        新增用户
      </el-button>
      <el-button @click="handleRefresh" :loading="userStore.isLoading">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
      <el-button @click="handleExportUsers">
        <el-icon><Download /></el-icon>
        导出
      </el-button>
    </div>



    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <div class="section-header">
        <h3 class="section-title">搜索筛选</h3>
        <el-button text @click="handleReset">重置</el-button>
      </div>
      
      <div class="filter-form">
        <el-row :gutter="16">
          <el-col :span="6">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索用户名、姓名、邮箱..."
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-select v-model="selectedStatus" placeholder="用户状态" clearable>
              <el-option
                v-for="option in USER_STATUS_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="selectedRole" placeholder="用户角色" clearable>
              <el-option
                v-for="option in USER_ROLE_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="selectedDepartment" placeholder="所属部门" clearable>
              <el-option
                v-for="dept in availableDepartments"
                :key="dept"
                :label="dept"
                :value="dept"
              />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-col>
        </el-row>
        
        <div class="filter-actions">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="user-section">
      <div class="section-header">
        <h3 class="section-title">用户列表</h3>
        <span class="user-count">共 {{ userStore.pagination.total }} 个用户</span>
      </div>
      
      <!-- 批量操作 -->
      <div class="batch-actions" v-if="hasSelectedUsers">
        <el-button type="danger" @click="handleBatchDelete">
          批量删除 ({{ selectedUsers.length }})
        </el-button>
      </div>

      <!-- 用户表格 -->
      <el-table
        :data="filteredUsers"
        v-loading="userStore.isLoading"
        @selection-change="handleSelectionChange"
        @sort-change="handleSort"
        stripe
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="id" label="ID" width="80" sortable="custom" />
        
        <el-table-column label="用户信息" min-width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.avatar">
                {{ row.name.charAt(0) }}
              </el-avatar>
              <div class="user-details">
                <div class="user-name">{{ row.name }}</div>
                <div class="user-username">@{{ row.username }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="email" label="邮箱" min-width="200" />
        
        <el-table-column prop="phone" label="手机号" width="120" />
        
        <el-table-column prop="department" label="部门" width="120" />
        
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="160" sortable="custom">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="lastLoginAt" label="最后登录" width="160">
          <template #default="{ row }">
            {{ row.lastLoginAt ? formatDate(row.lastLoginAt) : '-' }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEditUser(row)">编辑</el-button>
            <el-button 
              size="small" 
              :type="row.status === 'active' ? 'warning' : 'success'"
              @click="row.status === 'active' ? handleDisableUser(row) : handleEnableUser(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" @click="handleResetPassword(row)">重置密码</el-button>
            <el-button size="small" type="danger" @click="handleDeleteUser(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="userStore.pagination.page"
          v-model:page-size="userStore.pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="userStore.pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="showDeleteConfirm"
      title="删除确认"
      width="400px"
    >
      <p>确定要删除用户 "{{ userToDelete?.name }}" 吗？此操作不可恢复。</p>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDeleteConfirm = false">取消</el-button>
          <el-button type="danger" @click="confirmDeleteUser">确定删除</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus, Refresh, Download, Search } from '@element-plus/icons-vue'
import { useUserList } from '../composables/useUserList'
import { useUserStore } from '../stores/user.store'
import { USER_STATUS_COLORS, USER_ROLE_COLORS } from '../constants/user.constants'

// 使用用户列表逻辑
const {
  selectedUsers,
  showDeleteConfirm,
  userToDelete,
  searchKeyword,
  selectedStatus,
  selectedRole,
  selectedDepartment,
  dateRange,
  filteredUsers,
  availableDepartments,
  hasSelectedUsers,
  USER_STATUS_OPTIONS,
  USER_ROLE_OPTIONS,
  handleSearch,
  handleReset,
  handleSort,
  handlePageChange,
  handleSizeChange,
  handleSelectionChange,
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
} = useUserList()

// 使用用户状态管理
const userStore = useUserStore()

// 工具方法
const getStatusLabel = (status: string) => {
  const option = USER_STATUS_OPTIONS.find(opt => opt.value === status)
  return option?.label || status
}

const getRoleLabel = (role: string) => {
  const option = USER_ROLE_OPTIONS.find(opt => opt.value === role)
  return option?.label || role
}

const getStatusTagType = (status: string) => {
  return USER_STATUS_COLORS[status as keyof typeof USER_STATUS_COLORS] || 'info'
}

const getRoleTagType = (role: string) => {
  return USER_ROLE_COLORS[role as keyof typeof USER_ROLE_COLORS] || 'info'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style lang="scss" scoped>
.user-list-page {
  padding: 20px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
      color: #303133;
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
  
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
    
    .stat-card {
      .stat-content {
        text-align: center;
        
        .stat-number {
          font-size: 32px;
          font-weight: bold;
          color: #409EFF;
          
          &.success { color: #67C23A; }
          &.warning { color: #E6A23C; }
          &.danger { color: #F56C6C; }
        }
        
        .stat-label {
          margin-top: 8px;
          color: #606266;
          font-size: 14px;
        }
      }
    }
  }
  
  .filter-section {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .filter-form {
      .filter-actions {
        margin-top: 16px;
        text-align: right;
      }
    }
  }
  
  .user-section {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .user-count {
        color: #909399;
        font-size: 14px;
      }
    }
    
    .batch-actions {
      margin-bottom: 16px;
      padding: 12px;
      background-color: #f5f7fa;
      border-radius: 4px;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .user-details {
        .user-name {
          font-weight: 500;
          color: #303133;
        }
        
        .user-username {
          font-size: 12px;
          color: #909399;
        }
      }
    }
    
    .pagination-wrapper {
      margin-top: 20px;
      text-align: right;
    }
  }
  
  .dialog-footer {
    text-align: right;
  }
}
</style>
