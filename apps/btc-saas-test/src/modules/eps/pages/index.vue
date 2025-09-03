<template>
  <div class="eps-demo">
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <div class="header-actions">
            <el-tag type="success">自动生成</el-tag>
            <el-button size="small" @click="refreshApiList">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>



      <!-- 搜索和过滤 -->
      <div class="filters-section">
        <div class="filters-row">
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="搜索API、服务或端点..."
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          
          <el-select
            v-model="selectedMethod"
            placeholder="HTTP方法"
            clearable
            style="width: 120px"
            @change="handleSearch"
          >
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
            <el-option label="PATCH" value="PATCH" />
          </el-select>

          
        </div>
      </div>

      <!-- 树形菜单+表格组合UI -->
      <div class="api-container">
        <!-- 左侧树形菜单 -->
        <div class="tree-panel">
          <div class="tree-header">
            <h3>服务列表</h3>
          </div>
          <el-tree
            :data="treeData"
            :props="treeProps"
            node-key="id"
            :default-expanded-keys="expandedKeys"
            :highlight-current="true"
            @node-click="handleNodeClick"
            class="api-tree"
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
                
              </div>
            </template>
          </el-tree>
        </div>

        <!-- 右侧表格展示 -->
        <div class="table-panel">
          <div class="table-header">
            <h3>{{ currentService ? currentService.name : 'API端点列表' }}</h3>
            <p v-if="currentService" class="service-description">{{ currentService.description }}</p>
          </div>
          
          <el-table
            :data="currentEndpoints"
            v-loading="loading"
            class="api-table"
            stripe
            border
            align="center"
          >
            <el-table-column prop="name" label="名称" min-width="200" align="center">
              <template #default="{ row }">
                <div class="endpoint-name">
                  <el-icon class="endpoint-icon">
                    <Link />
                  </el-icon>
                  <span>{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="path" label="路径" min-width="250" align="center">
              <template #default="{ row }">
                <code class="path-code">{{ row.path }}</code>
              </template>
            </el-table-column>

            <el-table-column prop="method" label="HTTP方法" width="120" align="center">
              <template #default="{ row }">
                <el-tag 
                  :type="getMethodType(row.method)" 
                  size="small"
                  class="method-tag"
                >
                  {{ row.method }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="description" label="描述" min-width="200" align="center">
              <template #default="{ row }">
                <span class="description-text">{{ row.description || '暂无描述' }}</span>
              </template>
            </el-table-column>

            

            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag 
                  :type="row.status === 'active' ? 'success' : 'warning'" 
                  size="small"
                  class="status-tag"
                >
                  {{ row.status === 'active' ? '活跃' : '待实现' }}
                </el-tag>
              </template>
            </el-table-column>

                         <el-table-column label="操作" width="240" align="center" fixed="right">
               <template #default="{ row }">
                 <div class="action-buttons">
                   <el-button 
                     size="small" 
                     @click="testEndpoint(row)"
                   >
                     测试
                   </el-button>
                   <el-button 
                     size="small" 
                     type="primary" 
                     @click="viewDetails(row)"
                   >
                     详情
                   </el-button>
                   <el-button 
                     size="small" 
                     type="info" 
                     @click="copyEndpoint(row)"
                   >
                     复制
                   </el-button>
                 </div>
               </template>
             </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>

    <!-- API详情对话框 -->
    <el-dialog
      v-model="showApiDetail"
      title="API详情"
      width="800px"
      class="api-detail-dialog"
      center
    >
      <div v-if="selectedApi" class="api-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="名称">{{ selectedApi.name }}</el-descriptions-item>
                     <el-descriptions-item v-if="selectedApi.method" label="HTTP方法">
             {{ selectedApi.method }}
           </el-descriptions-item>
          <el-descriptions-item v-if="selectedApi.path" label="路径">
            <code class="path-code">{{ selectedApi.path }}</code>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedApi.status === 'active' ? 'success' : 'warning'" class="status-tag-detail">
              {{ selectedApi.status === 'active' ? '活跃' : '待实现' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ selectedApi.description || '暂无描述' }}
          </el-descriptions-item>
        </el-descriptions>

        

        <div v-if="selectedApi.parameters && selectedApi.parameters.length > 0" class="parameters-section">
          <h4>参数</h4>
          <el-table :data="selectedApi.parameters" border class="params-table">
            <el-table-column prop="name" label="参数名" width="150" align="center" />
            <el-table-column prop="in" label="位置" width="100" align="center" />
            <el-table-column prop="type" label="类型" width="100" align="center" />
            <el-table-column prop="required" label="必填" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                  {{ row.required ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" align="center" />
          </el-table>
        </div>

        <div v-if="selectedApi.responses && selectedApi.responses.length > 0" class="responses-section">
          <h4>响应</h4>
          <el-table :data="selectedApi.responses" border class="responses-table">
            <el-table-column prop="code" label="状态码" width="100" align="center" />
            <el-table-column prop="description" label="描述" align="center" />
            <el-table-column prop="schema" label="数据结构" width="200" align="center">
              <template #default="{ row }">
                <code v-if="row.schema" class="schema-code">{{ row.schema }}</code>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 测试端点对话框 -->
    <el-dialog
      v-model="showTestDialog"
      title="测试API端点"
      width="600px"
      class="test-dialog"
      center
    >
      <div v-if="selectedEndpoint" class="test-endpoint">
        <el-form label-width="100px">
          <el-form-item label="端点">
            <el-input :value="selectedEndpoint.path" readonly />
          </el-form-item>
                     <el-form-item label="方法">
             {{ selectedEndpoint.method }}
           </el-form-item>
          <el-form-item label="请求参数">
            <el-input
              v-model="testParams"
              type="textarea"
              :rows="4"
              placeholder="请输入JSON格式的请求参数"
            />
          </el-form-item>
        </el-form>
        
        <div class="test-result" v-if="testResult">
          <h4>测试结果</h4>
          <el-alert
            :title="testResult.success ? '请求成功' : '请求失败'"
            :type="testResult.success ? 'success' : 'error'"
            :description="testResult.message"
            show-icon
          />
          <div v-if="testResult.data" class="result-data">
            <h5>响应数据:</h5>
            <pre class="result-pre">{{ JSON.stringify(testResult.data, null, 2) }}</pre>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showTestDialog = false">关闭</el-button>
          <el-button type="primary" @click="executeTest" :loading="testing">
            执行测试
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Refresh, 
  Search, 
  Setting, 
  Link
} from '@element-plus/icons-vue'

// 导入统一的数据源
import { apiData, type ApiService, type ApiEndpoint, type ApiParameter, type ApiResponse } from '../data/apiData'

// 响应式数据
const loading = ref(false)
const searchQuery = ref('')
const selectedMethod = ref('')
const showApiDetail = ref(false)
const showTestDialog = ref(false)
const selectedApi = ref<ApiEndpoint | null>(null)
const selectedEndpoint = ref<ApiEndpoint | null>(null)
const testParams = ref('')
const testResult = ref<any>(null)
const testing = ref(false)
const currentService = ref<ApiService | null>(null)

const stats = reactive({
  totalServices: 0,
  totalEndpoints: 0,
  activeEndpoints: 0
})

// 使用统一的数据源
const apiDataRef = ref<ApiService[]>(apiData)

// 计算属性
const treeData = computed(() => {
  return apiDataRef.value.map((service: ApiService) => ({
    label: service.name,
    type: 'service',
    ...service,
    children: service.children.map((endpoint: ApiEndpoint) => ({
      label: endpoint.name,
      type: 'endpoint',
      ...endpoint
    }))
  }))
})

const treeProps = {
  children: 'children',
  label: 'label'
}

const expandedKeys = computed(() => {
  return apiDataRef.value.map((service: ApiService) => service.id)
})

const currentEndpoints = computed(() => {
  if (!currentService.value) {
    return []
  }
  
  let endpoints = currentService.value.children

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    endpoints = endpoints.filter((endpoint: ApiEndpoint) => 
      endpoint.name.toLowerCase().includes(query) ||
      endpoint.path.toLowerCase().includes(query) ||
      endpoint.description?.toLowerCase().includes(query)
    )
  }

  // 方法过滤
  if (selectedMethod.value) {
    endpoints = endpoints.filter((endpoint: ApiEndpoint) => endpoint.method === selectedMethod.value)
  }



  return endpoints
})



// 方法
const refreshApiList = () => {
  loading.value = true
  setTimeout(() => {
    updateStats()
    loading.value = false
    ElMessage.success('API列表已刷新')
  }, 1000)
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const handleNodeClick = (data: any) => {
  if (data.type === 'service') {
    // 点击服务节点，切换到该服务
    currentService.value = data

  } else if (data.type === 'endpoint') {
    // 如果点击的是端点，找到对应的服务并切换
    const service = apiDataRef.value.find((s: ApiService) => s.children.some((e: ApiEndpoint) => e.id === data.id))
    if (service) {
      currentService.value = service

    }
  }
}

const updateStats = () => {
  let totalServices = 0
  let totalEndpoints = 0
  let activeEndpoints = 0

  apiDataRef.value.forEach((service: ApiService) => {
    totalServices++
    totalEndpoints += service.children.length
    activeEndpoints += service.children.filter((child: ApiEndpoint) => child.status === 'active').length
  })

  stats.totalServices = totalServices
  stats.totalEndpoints = totalEndpoints
  stats.activeEndpoints = activeEndpoints
}

const viewDetails = (endpoint: ApiEndpoint) => {
  selectedApi.value = endpoint
  showApiDetail.value = true
}

const testEndpoint = (endpoint: ApiEndpoint) => {
  selectedEndpoint.value = endpoint
  testParams.value = ''
  testResult.value = null
  showTestDialog.value = true
}

const executeTest = async () => {
  if (!selectedEndpoint.value) return

  testing.value = true
  try {
    // 模拟API测试
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    testResult.value = {
      success: true,
      message: '请求成功',
      data: {
        message: '这是模拟的响应数据',
        timestamp: new Date().toISOString(),
        endpoint: selectedEndpoint.value.path,
        method: selectedEndpoint.value.method
      }
    }
    
    ElMessage.success('测试执行成功')
  } catch (error) {
    testResult.value = {
      success: false,
      message: '请求失败: ' + (error as Error).message
    }
    ElMessage.error('测试执行失败')
  } finally {
    testing.value = false
  }
}

const copyEndpoint = (endpoint: ApiEndpoint) => {
  const endpointInfo = `${endpoint.method} ${endpoint.path}`
  navigator.clipboard.writeText(endpointInfo).then(() => {
    ElMessage.success('端点信息已复制到剪贴板')
  })
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

// 生命周期
onMounted(() => {
  updateStats()
  // 默认选择第一个服务
  if (apiDataRef.value.length > 0) {
    currentService.value = apiDataRef.value[0]
  }
})
</script>

<style scoped>
.eps-demo {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.demo-card {
  margin-bottom: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 20px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
}

.stat-content {
  padding: 16px;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: var(--el-color-primary);
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.filters-section {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--el-bg-color-overlay);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.filters-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

/* 树形菜单+表格组合UI */
.api-container {
  display: flex;
  gap: 20px;
  min-height: 500px;
}

.tree-panel {
  width: 300px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
}

.tree-header {
  padding: 16px;
  background: var(--el-bg-color-overlay);
  border-bottom: 1px solid var(--el-border-color-light);
}

.tree-header h3 {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 600;
}

.api-tree {
  padding: 16px;
  background: var(--el-bg-color);
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.tree-node:hover {
  background: var(--el-bg-color-overlay);
}

.node-label {
  flex: 1;
  color: var(--el-text-color-primary);
  font-weight: 500;
  transition: color 0.3s ease;
}

.service-icon {
  color: var(--el-color-primary);
  font-size: 16px;
}

.endpoint-icon {
  color: var(--el-color-success);
  font-size: 16px;
}



.table-panel {
  flex: 1;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  padding: 16px;
  background: var(--el-bg-color-overlay);
  border-bottom: 1px solid var(--el-border-color-light);
}

.table-header h3 {
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 600;
}

.service-description {
  margin: 0;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.api-table {
  width: 100%;
}

.endpoint-name {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.path-code {
  background: var(--el-bg-color-overlay);
  color: var(--el-text-color-primary);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  border: 1px solid var(--el-border-color-light);
}

.description-text {
  color: var(--el-text-color-regular);
  font-size: 14px;
}



.status-tag {
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.api-detail {
  padding: 20px 0;
}

.parameters-section,
.responses-section {
  margin-top: 20px;
}

.parameters-section h4,
.responses-section h4 {
  margin-bottom: 15px;
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 600;
}

.test-endpoint {
  padding: 20px 0;
}

.test-result {
  margin-top: 20px;
  padding: 16px;
  background: var(--el-bg-color-overlay);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.test-result h4 {
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.result-data {
  margin-top: 16px;
}

.result-data h5 {
  margin-bottom: 8px;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.result-pre {
  background: var(--el-bg-color-overlay);
  color: var(--el-text-color-primary);
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
  border: 1px solid var(--el-border-color-light);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.path-code,
.schema-code {
  background: var(--el-bg-color-overlay);
  color: var(--el-text-color-primary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  border: 1px solid var(--el-border-color-light);
}

.status-tag-detail {
  font-weight: 500;
}

.params-table,
.responses-table {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
}

.dialog-footer {
  text-align: center;
}

/* 暗色模式特殊适配 */
html.dark {
  .demo-card {
    background: var(--el-bg-color);
    border-color: var(--el-border-color);
  }
  
  .card-header {
    background: var(--el-bg-color);
  }
  
  .stat-card {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    background: var(--el-bg-color);
    border-color: var(--el-border-color);
  }
  
  .filters-section {
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
  }
  
  .tree-panel,
  .table-panel {
    background: var(--el-bg-color);
    border-color: var(--el-border-color);
  }
  
  .tree-header,
  .table-header {
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
  }
  
  /* 左侧树形菜单暗色主题优化 */
  .api-tree {
    background: var(--el-bg-color);
  }
  
  .api-tree .el-tree-node__content {
    color: var(--el-text-color-primary);
    background: transparent;
    border-radius: 4px;
    transition: all 0.3s ease;
  }
  
  .api-tree .el-tree-node__content:hover {
    background: var(--el-bg-color-overlay);
  }
  
  .api-tree .el-tree-node.is-current > .el-tree-node__content {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-weight: 600;
  }
  
  .api-tree .el-tree-node__expand-icon {
    color: var(--el-text-color-regular);
    transition: color 0.3s ease;
  }
  
  .api-tree .el-tree-node__expand-icon.expanded {
    color: var(--el-color-primary);
  }
  
  .api-tree .el-tree-node__expand-icon:hover {
    color: var(--el-color-primary);
  }
  
  .tree-node {
    color: var(--el-text-color-primary);
  }
  
  .tree-node:hover {
    background: var(--el-bg-color-overlay);
  }
  
  .node-label {
    color: var(--el-text-color-primary);
    transition: color 0.3s ease;
  }
  
  .api-tree .el-tree-node.is-current .node-label {
    color: var(--el-color-primary);
    font-weight: 600;
  }
  
  /* 服务图标暗色主题 */
  .service-icon {
    color: var(--el-color-primary);
  }
  
  .endpoint-icon {
    color: var(--el-color-success);
  }
  
  .test-result {
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
  }
  
  .result-pre {
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
  }
  
  .path-code,
  .schema-code {
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
  }
  
  .params-table,
  .responses-table {
    background: var(--el-bg-color);
    border-color: var(--el-border-color);
  }
  
  /* 提高标签对比度 */
  .el-tag {
    font-weight: 500;
  }
  
  .el-tag--success {
    background-color: rgba(103, 194, 58, 0.2);
    border-color: rgba(103, 194, 58, 0.3);
    color: #67c23a;
  }
  
  .el-tag--warning {
    background-color: rgba(230, 162, 60, 0.2);
    border-color: rgba(230, 162, 60, 0.3);
    color: #e6a23c;
  }
  
  .el-tag--danger {
    background-color: rgba(245, 108, 108, 0.2);
    border-color: rgba(245, 108, 108, 0.3);
    color: #f56c6c;
  }
  
  .el-tag--info {
    background-color: rgba(144, 147, 153, 0.2);
    border-color: rgba(144, 147, 153, 0.3);
    color: #909399;
  }
  
  .el-tag--primary {
    background-color: rgba(64, 158, 255, 0.2);
    border-color: rgba(64, 158, 255, 0.3);
    color: #409eff;
  }
  
  /* 表格暗色主题优化 */
  .api-table .el-table__header {
    background: var(--el-bg-color-overlay);
  }
  
  .api-table .el-table__body tr {
    background: var(--el-bg-color);
  }
  
  .api-table .el-table__body tr:hover {
    background: var(--el-bg-color-overlay);
  }
  
  .api-table .el-table__body tr.el-table__row--striped {
    background: var(--el-bg-color-overlay);
  }
  
  .api-table .el-table__body tr.el-table__row--striped:hover {
    background: var(--el-bg-color-overlay);
  }
}
</style>

