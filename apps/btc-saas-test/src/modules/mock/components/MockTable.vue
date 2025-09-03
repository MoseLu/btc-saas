<template>
  <div class="table-panel">
    <div class="table-header">
      <h3>{{ currentService ? currentService.name : '所有Mock接口' }}</h3>
      <div class="table-actions">
        <el-button size="small" @click="$emit('toggleAll', true)">
          全部启用
        </el-button>
        <el-button size="small" @click="$emit('toggleAll', false)">
          全部禁用
        </el-button>
      </div>
    </div>
    
    <el-table
      :data="endpoints"
      style="width: 100%"
      :row-class-name="getRowClassName"
      @row-click="handleRowClick"
    >
      <el-table-column prop="name" label="接口名称" min-width="200">
        <template #default="{ row }">
          <div class="endpoint-name">
            <span class="name-text">{{ row.name }}</span>
            <el-tag 
              :type="getMethodType(row.method)" 
              size="small"
              class="method-tag"
            >
              {{ row.method }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="path" label="路径" min-width="250">
        <template #default="{ row }">
          <code class="endpoint-path">{{ row.path }}</code>
        </template>
      </el-table-column>
      
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag 
            :type="row.status === 'active' ? 'success' : 'warning'" 
            size="small"
          >
            {{ row.status === 'active' ? '活跃' : '待实现' }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="mockDelay" label="延迟" width="100">
        <template #default="{ row }">
          <el-tag type="warning" size="small">
            {{ row.mockDelay || 0 }}ms
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="Mock开关" width="120">
        <template #default="{ row }">
          <el-switch
            v-model="mockStatus[row.id]"
            @change="handleToggleMock(row.id)"
            size="small"
            :disabled="row.status === 'inactive'"
          />
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button size="small" @click.stop="$emit('viewDetails', row)">
            详情
          </el-button>
          <el-button size="small" type="primary" @click.stop="$emit('testEndpoint', row)">
            测试
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// 本地定义类型，避免导入问题
interface ApiEndpoint {
  id: string
  name: string
  path: string
  method: string
  description?: string
  status: 'active' | 'inactive' | 'deprecated'
  responseTime?: number
  errorRate?: number
}

interface ApiService {
  id: string
  name: string
  description: string
  children: ApiEndpoint[]
}

interface Props {
  endpoints: ApiEndpoint[]
  currentService: ApiService | null
  mockStatus: Record<string, boolean>
}

interface Emits {
  toggleAll: [enabled: boolean]
  toggleMock: [endpointId: string]
  viewDetails: [endpoint: ApiEndpoint]
  testEndpoint: [endpoint: ApiEndpoint]
  rowClick: [row: ApiEndpoint]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleToggleMock = (endpointId: string) => {
  emit('toggleMock', endpointId)
}

const handleRowClick = (row: ApiEndpoint) => {
  emit('rowClick', row)
}

const getMethodType = (method: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    GET: 'success',
    POST: 'primary',
    PUT: 'warning',
    DELETE: 'danger',
    PATCH: 'info'
  }
  return types[method] || 'info'
}

const getRowClassName = ({ row }: { row: ApiEndpoint }) => {
  if (row.status === 'inactive') {
    return 'inactive-row'
  }
  return props.mockStatus[row.id] ? 'enabled-row' : 'disabled-row'
}
</script>

<style lang="scss" scoped>
@use '../../../assets/styles/variables.scss' as *;

.table-panel {
  flex: 1;
  height: 600px;              /* 固定高度 */
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;            /* 隐藏外层溢出 */
  display: flex;
  flex-direction: column;      /* 垂直布局 */
  position: relative;          /* 相对定位，确保边框正确显示 */
}

.table-header {
  padding: $spacing-md;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;              /* 不收缩 */
  
  h3 {
    margin: 0;
    color: var(--el-text-color-primary);
    font-size: 16px;
    font-weight: 600;
  }
}

.table-actions {
  display: flex;
  gap: $spacing-sm;
}

.endpoint-name {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.name-text {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.method-tag {
  font-size: 12px;
  font-weight: 600;
  
  /* 自定义请求类型标签样式，提高暗色模式对比度 */
  &.el-tag--success {
    background-color: #67c23a;
    border-color: #67c23a;
    color: #ffffff;
  }
  
  &.el-tag--primary {
    background-color: #409eff;
    border-color: #409eff;
    color: #ffffff;
  }
  
  &.el-tag--warning {
    background-color: #e6a23c;
    border-color: #e6a23c;
    color: #ffffff;
  }
  
  &.el-tag--danger {
    background-color: #f56c6c;
    border-color: #f56c6c;
    color: #ffffff;
  }
  
  &.el-tag--info {
    background-color: #909399;
    border-color: #909399;
    color: #ffffff;
  }
}

.endpoint-path {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
}

/* 表格容器 */
:deep(.el-table) {
  flex: 1;                     /* 占据剩余空间 */
  overflow: hidden;            /* 隐藏溢出 */
}

/* 表格内容区域滚动条 */
:deep(.el-table__body-wrapper) {
  overflow-y: auto !important; /* 强制垂直滚动 */
  overflow-x: auto !important; /* 水平滚动 */
  
  /* 应用无感滚动条系统 */
  scrollbar-width: thin;
  scrollbar-color: var(--sb-thumb) transparent; /* 贴边、透明轨道 */
  
  &::-webkit-scrollbar {
    width: var(--sb-w-main);
    height: var(--sb-w-main);
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;      /* 轨道透明 = 看起来"没有两侧轨道" */
    border: 0;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--sb-thumb);
    border-radius: 999px;
    border: 0;                    /* 不留缝，贴边 */
    opacity: 0;                   /* 默认不可见 */
    transition: opacity 0.12s ease, background-color 0.12s ease;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--sb-thumb-h);
  }
  
  &::-webkit-scrollbar-thumb:active {
    background: var(--sb-thumb-a);
  }
  
  /* 悬停/键盘聚焦/正在滚动 时淡入拇指 */
  &:is(:hover, :focus-within, .is-scrolling)::-webkit-scrollbar-thumb {
    opacity: 1;
  }
  
  /* 拐角同样透明，保证"无轨道感" */
  &::-webkit-scrollbar-corner {
    background: transparent;
  }
  
  /* 确保内容能够完整显示，包括底部边框 */
  padding-bottom: $spacing-lg; /* 底部额外内边距，确保边框可见 */
}

/* 表格行样式 */
:deep(.enabled-row) {
  background-color: var(--el-color-success-light-9);
}

:deep(.disabled-row) {
  background-color: var(--el-fill-color-light);
}

:deep(.inactive-row) {
  background-color: var(--el-fill-color-lighter);
  opacity: 0.6;
}

/* 暗色模式适配 */
html.dark {
  .table-panel {
    background: var(--el-bg-color);
    border-color: var(--el-border-color);
  }
  
  .table-header {
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
  }
  
  .endpoint-path {
    background: var(--el-bg-color-overlay);
    color: var(--el-text-color-regular);
  }
}
</style>
