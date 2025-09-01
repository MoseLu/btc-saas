<template>
  <div class="mock-manager">




    <!-- 搜索和过滤 -->
    <MockFilters 
      @update="handleFiltersUpdate"
      @refresh="refreshMocks"
    />

    <!-- 树形菜单+表格组合UI -->
    <div class="mock-container">
      <!-- 左侧树形菜单 -->
      <MockTree 
        :api-data="apiData"
        @node-click="handleNodeClick"
        @add-mock="addMock"
      />

      <!-- 右侧表格展示 -->
      <MockTable 
        :endpoints="currentEndpoints"
        :current-service="currentService"
        :mock-status="mockStatus"
        @toggle-all="toggleAllMocks"
        @toggle-mock="toggleMock"
        @view-details="viewDetails"
        @test-endpoint="testEndpoint"
        @row-click="handleRowClick"
      />
    </div>

    <!-- Mock配置 -->
    <div class="config-section">
      <div class="section-header">
        <h3 class="section-title">Mock配置</h3>
      </div>
      
      <el-form :model="mockConfig" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="全局延迟">
              <el-input-number 
                v-model="mockConfig.globalDelay" 
                :min="0" 
                :max="10000"
                :step="100"
              />
              <span style="margin-left: 8px;">ms</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="错误率">
              <el-input-number 
                v-model="mockConfig.errorRate" 
                :min="0" 
                :max="100"
                :step="5"
              />
              <span style="margin-left: 8px;">%</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="启用Mock">
              <el-switch v-model="mockConfig.enabled" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="自动刷新">
              <el-switch v-model="mockConfig.autoRefresh" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 系统信息 -->
    <div class="info-section">
      <div class="section-header">
        <h3 class="section-title">系统信息</h3>
      </div>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Mock状态">
          <el-tag :type="mockConfig.enabled ? 'success' : 'danger'">
            {{ mockConfig.enabled ? '已启用' : '已禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="环境">
          <el-tag :type="btc.env?.NODE_ENV === 'production' ? 'danger' : 'success'">
            {{ btc.env?.NODE_ENV || 'development' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Mock版本">
          <el-tag type="warning">v1.0.0</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ new Date().toLocaleString() }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 对话框组件 -->
    <MockDialogs
      v-model:show-mock-detail="showMockDetail"
      v-model:show-test-dialog="showTestDialog"
      v-model:selected-mock="selectedMock"
      v-model:selected-endpoint="selectedEndpoint"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { ElMessage } from "element-plus";

// 导入子组件
import MockStats from '../components/MockStats.vue'
import MockFilters from '../components/MockFilters.vue'
import MockTree from '../components/MockTree.vue'
import MockTable from '../components/MockTable.vue'
import MockDialogs from '../components/MockDialogs.vue'

// 导入统一的数据源
import { apiData, getMockStats, type ApiService, type ApiEndpoint } from '../data/apiData'

// 响应式数据
const mockStatus = reactive<Record<string, boolean>>({})
const mockConfig = reactive({
  globalDelay: 200,
  errorRate: 0,
  enabled: true,
  autoRefresh: true
})

// 搜索和过滤
const filters = reactive({
  searchQuery: '',
  selectedMethod: '',
  selectedStatus: ''
})

// 当前选中的服务
const currentService = ref<ApiService | null>(null)

// 对话框状态
const showMockDetail = ref(false)
const showTestDialog = ref(false)
const selectedMock = ref<ApiEndpoint | null>(null)
const selectedEndpoint = ref<ApiEndpoint | null>(null)

// 计算属性 - 使用统一数据源
const mockStats = computed(() => getMockStats())

// 当前显示的端点
const currentEndpoints = computed(() => {
  // 防护措施：确保apiData存在
  if (!apiData || !Array.isArray(apiData)) {
    return []
  }
  
  let endpoints = currentService.value 
    ? currentService.value.children 
    : apiData.flatMap(service => service.children || [])

  // 搜索过滤
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase()
    endpoints = endpoints.filter(endpoint => 
      endpoint.name.toLowerCase().includes(query) ||
      endpoint.path.toLowerCase().includes(query) ||
      endpoint.description?.toLowerCase().includes(query)
    )
  }

  // 方法过滤
  if (filters.selectedMethod) {
    endpoints = endpoints.filter(endpoint => endpoint.method === filters.selectedMethod)
  }

  // 状态过滤
  if (filters.selectedStatus) {
    if (filters.selectedStatus === 'enabled') {
      endpoints = endpoints.filter(endpoint => mockStatus[endpoint.id])
    } else if (filters.selectedStatus === 'disabled') {
      endpoints = endpoints.filter(endpoint => !mockStatus[endpoint.id])
    } else if (filters.selectedStatus === 'inactive') {
      endpoints = endpoints.filter(endpoint => endpoint.status === 'inactive')
    }
  }

  return endpoints
})

// 获取所有Mock端点
const getAllMockEndpoints = computed(() => {
  if (!apiData || !Array.isArray(apiData)) {
    return []
  }
  return apiData.flatMap(service => service.children || [])
})

// 初始化状态
const initStatus = () => {
  getAllMockEndpoints.value.forEach(endpoint => {
    if (!(endpoint.id in mockStatus)) {
      mockStatus[endpoint.id] = endpoint.mockEnabled || false
    }
  })
}

// 方法
const refreshMocks = () => {
  initStatus()
  ElMessage.success('Mock列表已刷新')
}

const handleFiltersUpdate = (newFilters: any) => {
  Object.assign(filters, newFilters)
}

const handleNodeClick = (data: any) => {
  if (data.type === 'service') {
    currentService.value = data
  } else if (data.type === 'endpoint') {
    const service = apiData.find(s => s.children.some(e => e.id === data.id))
    if (service) {
      currentService.value = service
    }
  }
}

const handleRowClick = (row: ApiEndpoint) => {
  // 行点击处理
}

const toggleMock = (endpointId: string) => {
  const endpoint = getAllMockEndpoints.value.find(ep => ep.id === endpointId)
  if (endpoint) {
    const status = mockStatus[endpointId] ? '启用' : '禁用'
    ElMessage.success(`Mock "${endpoint.name}" 已${status}`)
  }
}

const toggleAllMocks = (enabled: boolean) => {
  currentEndpoints.value.forEach(endpoint => {
    if (endpoint.status !== 'inactive') {
      mockStatus[endpoint.id] = enabled
    }
  })
  const status = enabled ? '启用' : '禁用'
  ElMessage.success(`已${status}所有Mock接口`)
}

const addMock = () => {
  ElMessage.info('添加Mock接口功能')
}

const viewDetails = (endpoint: ApiEndpoint) => {
  selectedMock.value = endpoint
  showMockDetail.value = true
}

const testEndpoint = (endpoint: ApiEndpoint) => {
  selectedEndpoint.value = endpoint
  showTestDialog.value = true
}

// 全局环境变量
const btc = {
  env: {
    NODE_ENV: import.meta.env.MODE
  }
}

// 初始化
initStatus()
</script>

<style lang="scss" scoped>
@use '../../../assets/styles/variables.scss' as *;

.page-header {
  margin-bottom: $spacing-lg;
  
  h2 {
    margin: 0 0 $spacing-sm 0;
    color: var(--el-text-color-primary);
    font-size: $font-size-extra-large;
    font-weight: $font-weight-semibold;
  }
  
  p {
    margin: 0;
    color: var(--el-text-color-secondary);
    font-size: $font-size-base;
  }
}

/* 树形菜单+表格组合UI */
.mock-container {
  display: flex;
  gap: $spacing-lg;
  min-height: 500px;
  margin-bottom: $spacing-lg;
}

.config-section,
.info-section {
  margin-bottom: $spacing-lg;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
