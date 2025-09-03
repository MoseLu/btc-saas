<template>
  <div class="tree-panel">
    <div class="tree-header">
      <h3>服务列表</h3>
      <el-button size="small" @click="$emit('addMock')">
        <el-icon><Plus /></el-icon>
        添加Mock
      </el-button>
    </div>
    <el-tree
      :data="treeData"
      :props="treeProps"
      node-key="id"
      :default-expanded-keys="expandedKeys"
      :highlight-current="true"
      @node-click="handleNodeClick"
      class="mock-tree"
    >
      <template #default="{ node, data }">
        <div class="tree-node">
          <el-icon v-if="data.type === 'service'" class="service-icon">
            <Setting />
          </el-icon>
          <el-icon v-else-if="data.type === 'endpoint'" class="endpoint-icon">
            <Link />
          </el-icon>
          <span class="node-label">{{ node.label }}</span>
          <div class="node-meta">
            <el-tag 
              v-if="data.type === 'endpoint'"
              :type="getMethodType(data.method)" 
              size="small"
            >
              {{ data.method }}
            </el-tag>
            <el-tag 
              v-if="data.type === 'endpoint'"
              :type="data.mockEnabled ? 'success' : 'info'" 
              size="small"
            >
              {{ data.mockEnabled ? '启用' : '禁用' }}
            </el-tag>
          </div>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Setting, Link } from '@element-plus/icons-vue'
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

interface TreeNode {
  id: string
  label: string
  type: 'service' | 'endpoint'
  method?: string
  mockEnabled?: boolean
  children?: TreeNode[]
}

interface Props {
  apiData: ApiService[]
}

interface Emits {
  nodeClick: [data: TreeNode]
  addMock: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const treeData = computed(() => {
  return props.apiData.map(service => ({
    label: service.name,
    type: 'service' as const,
    ...service,
    children: service.children.map((endpoint: ApiEndpoint) => ({
      label: endpoint.name,
      type: 'endpoint' as const,
      ...endpoint
    }))
  }))
})

const treeProps = {
  children: 'children',
  label: 'label'
}

const expandedKeys = computed(() => {
  return props.apiData.map(service => service.id)
})

const handleNodeClick = (data: TreeNode) => {
  emit('nodeClick', data)
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
</script>

<style lang="scss" scoped>
@use '../../../assets/styles/variables.scss' as *;

.tree-panel {
  /* 移除固定宽度，使用响应式宽度 */
  width: 100%;
  min-width: 280px;
  max-width: 400px;
  height: 600px;              /* 固定高度 */
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;            /* 隐藏外层溢出 */
  display: flex;
  flex-direction: column;      /* 垂直布局 */
  position: relative;          /* 相对定位，确保边框正确显示 */
  /* 确保组件能够正确收缩 */
  flex-shrink: 0;
}

.tree-header {
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

.mock-tree {
  padding: $spacing-md;
  background: var(--el-bg-color);
  flex: 1;                     /* 占据剩余空间 */
  overflow-y: auto;            /* 垂直滚动 */
  overflow-x: hidden;          /* 隐藏水平滚动 */
  
  /* 应用统一的cool-scrollbar系统 */
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,.35) transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
    background: transparent;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
    box-shadow: none;
    border: none;
  }
  
  &::-webkit-scrollbar-button {
    display: none;
    width: 0;
    height: 0;
  }
  
  &::-webkit-scrollbar-corner {
    background: transparent;
  }
  
  &::-webkit-resizer {
    background: transparent;
  }
  
  /* 仅拇指可见：默认无感，交互时淡入 */
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0,0,0,0);
    border-radius: 999px;
    border: 2px solid transparent;
    background-clip: padding-box;
    transition: background-color .18s ease, opacity .18s ease;
    opacity: 0;
  }
  
  /* 悬停滚动区域时，出现椭圆拇指 */
  &:hover::-webkit-scrollbar-thumb {
    background-color: rgba(0,0,0,.28);
    opacity: 1;
  }
  
  /* 真正滚动/拖拽时更清晰 */
  &::-webkit-scrollbar-thumb:hover,
  &::-webkit-scrollbar-thumb:active {
    background-color: rgba(0,0,0,.45);
    opacity: 1;
  }
}

.tree-node {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: 4px 0;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--el-fill-color-light);
  }
}

.node-label {
  flex: 1;
  color: var(--el-text-color-primary);
  font-weight: 500;
  transition: color 0.3s ease;
}

.node-meta {
  display: flex;
  gap: 4px;
  
  /* 自定义树状菜单中的标签样式，提高暗色模式对比度 */
  .el-tag {
    font-size: 11px;
    font-weight: 600;
    border-radius: 3px;
    
    /* GET请求 - 绿色 */
    &.el-tag--success {
      background-color: #67c23a;
      border-color: #67c23a;
      color: #ffffff;
    }
    
    /* POST请求 - 蓝色 */
    &.el-tag--primary {
      background-color: #409eff;
      border-color: #409eff;
      color: #ffffff;
    }
    
    /* PUT请求 - 橙色 */
    &.el-tag--warning {
      background-color: #e6a23c;
      border-color: #e6a23c;
      color: #ffffff;
    }
    
    /* DELETE请求 - 红色 */
    &.el-tag--danger {
      background-color: #f56c6c;
      border-color: #f56c6c;
      color: #ffffff;
    }
    
    /* 其他请求 - 灰色 */
    &.el-tag--info {
      background-color: #909399;
      border-color: #909399;
      color: #ffffff;
    }
  }
}

.service-icon {
  color: var(--el-color-primary);
  font-size: 16px;
}

.endpoint-icon {
  color: var(--el-color-success);
  font-size: 16px;
}

/* 暗色模式适配 */
html.dark {
  .tree-panel {
    background: var(--el-bg-color);
    border-color: var(--el-border-color);
  }
  
  .tree-header {
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
  }
  
  .mock-tree {
    background: var(--el-bg-color);
  }
  
  .mock-tree .el-tree-node__content {
    color: var(--el-text-color-primary);
    background: transparent;
    border-radius: 4px;
    transition: all 0.3s ease;
  }
  
  .mock-tree .el-tree-node__content:hover {
    background: var(--el-fill-color-light);
  }
  
  .mock-tree .el-tree-node.is-current > .el-tree-node__content {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-weight: 600;
  }
  
  .tree-node {
    color: var(--el-text-color-primary);
  }
  
  .tree-node:hover {
    background: var(--el-fill-color-light);
  }
  
  .node-label {
    color: var(--el-text-color-primary);
  }
  
  .mock-tree .el-tree-node.is-current .node-label {
    color: var(--el-color-primary);
    font-weight: 600;
  }
  
  /* 暗色主题滚动条 */
  .mock-tree {
    scrollbar-color: rgba(255,255,255,.35) transparent;
    
    &::-webkit-scrollbar-thumb {
      background-color: rgba(255,255,255,0);
    }
    
    &:hover::-webkit-scrollbar-thumb {
      background-color: rgba(255,255,255,.22);
    }
    
    &::-webkit-scrollbar-thumb:hover,
    &::-webkit-scrollbar-thumb:active {
      background-color: rgba(255,255,255,.38);
    }
  }
}
</style>
