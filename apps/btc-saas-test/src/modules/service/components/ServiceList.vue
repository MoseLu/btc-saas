<template>
  <el-card class="service-list">
    <template #header>
      <div class="card-header">
        <span>服务列表</span>
        <div class="header-actions">
          <el-button type="primary" size="small" @click="refreshServices">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
    </template>
    
    <el-table
      :data="services"
      style="width: 100%"
      :row-class-name="getRowClassName"
      v-loading="loading"
    >
      <el-table-column prop="name" label="服务名称" width="200">
        <template #default="{ row }">
          <div class="service-name">
            <el-icon class="service-icon" :class="getStatusClass(row.status)">
              <component :is="getStatusIcon(row.status)" />
            </el-icon>
            <span>{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="port" label="端口" width="100" />
      
      <el-table-column prop="uptime" label="运行时间" width="150">
        <template #default="{ row }">
          <span v-if="row.uptime > 0">{{ formatUptime(row.uptime) }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="memory" label="内存" width="100">
        <template #default="{ row }">
          <span v-if="row.memory > 0">{{ row.memory }}MB</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      
      <el-table-column prop="cpu" label="CPU" width="100">
        <template #default="{ row }">
          <span v-if="row.cpu > 0">{{ row.cpu }}%</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'stopped'"
            type="success"
            size="small"
            @click="startService(row.id)"
            :loading="row.status === 'starting'"
          >
            <el-icon><VideoPlay /></el-icon>
            启动
          </el-button>
          
          <el-button
            v-if="row.status === 'running'"
            type="warning"
            size="small"
            @click="stopService(row.id)"
            :loading="row.status === 'stopping'"
          >
            <el-icon><VideoPause /></el-icon>
            停止
          </el-button>
          
          <el-button
            type="info"
            size="small"
            @click="restartService(row.id)"
          >
            <el-icon><RefreshRight /></el-icon>
            重启
          </el-button>
          
          <el-button
            type="primary"
            size="small"
            @click="viewLogs(row.id)"
          >
            <el-icon><Document /></el-icon>
            日志
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { 
  VideoPlay, 
  VideoPause, 
  Warning, 
  Refresh, 
  RefreshRight, 
  Document 
} from '@element-plus/icons-vue'
import type { ServiceInfo } from '../composables/useServiceManager'

interface Props {
  services: ServiceInfo[]
  loading: boolean
}

interface Emits {
  (e: 'start-service', id: string): void
  (e: 'stop-service', id: string): void
  (e: 'restart-service', id: string): void
  (e: 'view-logs', id: string): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const getStatusClass = (status: string) => {
  switch (status) {
    case 'running': return 'status-running'
    case 'stopped': return 'status-stopped'
    case 'error': return 'status-error'
    case 'starting': return 'status-starting'
    case 'stopping': return 'status-stopping'
    default: return 'status-unknown'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'running': return VideoPlay
    case 'stopped': return VideoPause
    case 'error': return Warning
    case 'starting': return VideoPlay
    case 'stopping': return VideoPause
    default: return Warning
  }
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'running': return 'success'
    case 'stopped': return 'info'
    case 'error': return 'danger'
    case 'starting': return 'warning'
    case 'stopping': return 'warning'
    default: return 'info'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'running': return '运行中'
    case 'stopped': return '已停止'
    case 'error': return '错误'
    case 'starting': return '启动中'
    case 'stopping': return '停止中'
    default: return '未知'
  }
}

const getRowClassName = ({ row }: { row: ServiceInfo }) => {
  switch (row.status) {
    case 'running': return 'row-running'
    case 'error': return 'row-error'
    case 'starting':
    case 'stopping': return 'row-transition'
    default: return ''
  }
}

const formatUptime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

const startService = (id: string) => {
  emit('start-service', id)
}

const stopService = (id: string) => {
  emit('stop-service', id)
}

const restartService = (id: string) => {
  emit('restart-service', id)
}

const viewLogs = (id: string) => {
  emit('view-logs', id)
}

const refreshServices = () => {
  emit('refresh')
}
</script>

<style lang="scss" scoped>
.service-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .service-name {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .service-icon {
      font-size: 16px;
      
      &.status-running {
        color: var(--el-color-success);
      }
      
      &.status-stopped {
        color: var(--el-color-info);
      }
      
      &.status-error {
        color: var(--el-color-danger);
      }
      
      &.status-starting,
      &.status-stopping {
        color: var(--el-color-warning);
      }
    }
  }
}

:deep(.row-running) {
  background-color: var(--el-color-success-light-9);
  
  &:hover {
    background-color: var(--el-color-success-light-8) !important;
  }
}

:deep(.row-error) {
  background-color: var(--el-color-danger-light-9);
  
  &:hover {
    background-color: var(--el-color-danger-light-8) !important;
  }
}

:deep(.row-transition) {
  background-color: var(--el-color-warning-light-9);
  
  &:hover {
    background-color: var(--el-color-warning-light-8) !important;
  }
}
</style>
