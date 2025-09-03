<template>
  <div class="plugin-manager">
    <div class="header">
      <h2>插件管理系统</h2>
      <p>动态插件扫描和状态管理</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="12" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-number">{{ mockPlugins.length }}</div>
          <div class="stat-label">插件数量</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-number">{{ mockModules.length }}</div>
          <div class="stat-label">模块数量</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-number">{{ Object.keys(mockServices).length }}</div>
          <div class="stat-label">服务数量</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-number">{{ mockMocks.length }}</div>
          <div class="stat-label">Mock接口</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 插件列表 -->
    <div v-if="mockPlugins.length" class="plugin-section">
      <h3 class="section-title">插件列表</h3>
      <el-row :gutter="12" class="plugin-grid">
        <el-col 
          v-for="plugin in mockPlugins"
          :key="plugin.name"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="4"
        >
          <el-card 
            class="plugin-card"
            :class="{ 'enabled': plugin.enabled }"
            shadow="hover"
          >
            <div class="plugin-header">
              <h3>{{ plugin.displayName }}</h3>
              <el-tag :type="plugin.enabled ? 'success' : 'info'" size="small">
                {{ plugin.enabled ? '已启用' : '已禁用' }}
              </el-tag>
            </div>
            <p class="plugin-description">{{ plugin.description }}</p>
            <div class="plugin-meta">
              <span>版本: {{ plugin.version }}</span>
              <span>作者: {{ plugin.author }}</span>
              <span>分类: {{ plugin.category }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 模块列表 -->
    <div v-if="mockModules.length" class="module-section">
      <h3 class="section-title">模块列表</h3>
      <el-row :gutter="12" class="module-grid">
        <el-col 
          v-for="module in mockModules"
          :key="module"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="4"
        >
          <el-card class="module-card" shadow="hover">
            <div class="module-header">
              <h3>{{ module }}</h3>
              <el-tag type="success" size="small">已加载</el-tag>
            </div>
            <p class="module-description">{{ module }} 模块已成功加载</p>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 服务列表 -->
    <div v-if="Object.keys(mockServices).length" class="service-section">
      <h3 class="section-title">服务列表</h3>
      <el-row :gutter="12" class="service-grid">
        <el-col 
          v-for="(service, name) in mockServices"
          :key="name"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="4"
        >
          <el-card class="service-card" shadow="hover">
            <div class="service-header">
              <h3>{{ name }}</h3>
              <el-tag type="primary" size="small">服务</el-tag>
            </div>
            <p class="service-description">{{ service.description }}</p>
            <div class="service-methods">
              <span>方法: {{ getServiceMethods(service).join(', ') }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- Mock列表 -->
    <div v-if="mockMocks.length" class="mock-section">
      <h3 class="section-title">Mock列表</h3>
      <el-row :gutter="12" class="mock-grid">
        <el-col 
          v-for="mock in mockMocks"
          :key="mock"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="4"
        >
          <el-card class="mock-card" shadow="hover">
            <div class="mock-header">
              <h3>{{ mock }}</h3>
              <el-tag type="warning" size="small">Mock</el-tag>
            </div>
            <p class="mock-description">{{ mock }} 接口模拟</p>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 环境信息 -->
    <el-card class="env-info">
      <template #header>
        <span>环境信息</span>
      </template>
      <el-row :gutter="16" class="info-grid">
        <el-col :span="12">
          <div class="info-item">
            <span class="info-label">应用标题:</span>
            <span class="info-value">{{ mockEnv.VITE_APP_TITLE }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <span class="info-label">API地址:</span>
            <span class="info-value">{{ mockEnv.VITE_API_BASE_URL }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <span class="info-label">环境:</span>
            <span class="info-value">{{ mockEnv.NODE_ENV }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <span class="info-label">主题色:</span>
            <span class="info-value color-preview" :style="{ backgroundColor: mockTheme.primary }">
              {{ mockTheme.primary }}
            </span>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Grid,
  Check,
  Close,
  Refresh,
  Search,
  Setting
} from '@element-plus/icons-vue'

// 模拟插件数据
const mockPlugins = [
  {
    name: 'pdf2png',
    displayName: 'PDF转PNG',
    description: '将PDF文件转换为PNG图片',
    version: '1.0.0',
    author: 'BTC Team',
    category: 'converter',
    enabled: true
  },
  {
    name: 'richtext',
    displayName: '富文本编辑器',
    description: '功能强大的富文本编辑器',
    version: '1.0.0',
    author: 'BTC Team',
    category: 'editor',
    enabled: true
  },
  {
    name: 'chart',
    displayName: '图表组件',
    description: '数据可视化图表组件',
    version: '1.0.0',
    author: 'BTC Team',
    category: 'visualization',
    enabled: false
  },
  {
    name: 'table',
    displayName: '数据表格',
    description: '高性能数据表格组件',
    version: '1.0.0',
    author: 'BTC Team',
    category: 'data',
    enabled: true
  },
  {
    name: 'upload',
    displayName: '文件上传',
    description: '文件上传和管理组件',
    version: '1.0.0',
    author: 'BTC Team',
    category: 'file',
    enabled: true
  },
  {
    name: 'collaborative',
    displayName: '协作编辑',
    description: '实时协作编辑功能',
    version: '1.0.0',
    author: 'BTC Team',
    category: 'collaboration',
    enabled: false
  },
  {
    name: 'templates',
    displayName: '模板管理',
    description: '文档模板管理系统',
    version: '1.0.0',
    author: 'BTC Team',
    category: 'template',
    enabled: true
  },
  {
    name: 'advanced',
    displayName: '高级编辑器',
    description: '高级文本编辑功能',
    version: '1.0.0',
    author: 'BTC Team',
    category: 'editor',
    enabled: false
  }
]

// 模拟模块数据
const mockModules = [
  'user',
  'order', 
  'product',
  'auth',
  'file',
  'notification',
  'report',
  'analytics'
]

// 模拟服务数据
const mockServices = {
  userService: {
    description: '用户管理服务',
    getUsers: () => {},
    createUser: () => {},
    updateUser: () => {},
    deleteUser: () => {}
  },
  productService: {
    description: '产品管理服务',
    getProducts: () => {},
    createProduct: () => {},
    updateProduct: () => {},
    deleteProduct: () => {}
  },
  orderService: {
    description: '订单管理服务',
    getOrders: () => {},
    createOrder: () => {},
    updateOrder: () => {},
    deleteOrder: () => {}
  }
}

// 模拟Mock数据
const mockMocks = [
  'user-api',
  'product-api', 
  'order-api',
  'auth-api',
  'file-api',
  'notification-api'
]

// 模拟环境数据
const mockEnv = {
  VITE_APP_TITLE: 'BTC SaaS Test',
  VITE_API_BASE_URL: '/api',
  NODE_ENV: 'development'
}

// 模拟主题数据
const mockTheme = {
  primary: '#1890ff'
}

const getServiceMethods = (service: any): string[] => {
  if (!service || typeof service !== 'object') return []
  return Object.keys(service).filter(key => typeof service[key] === 'function')
}
</script>

<style lang="scss" scoped>
@use '../../assets/styles/variables.scss' as *;
@use '../../assets/styles/mixins.scss' as *;

.plugin-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.header {
  text-align: center;
  margin-bottom: 24px; /* 减少间距 */
}

.header h2 {
  margin: 0 0 $spacing-sm 0;
  color: var(--el-text-color-primary);
  font-size: $font-size-extra-large * 1.2; /* 减小字体 */
  font-weight: $font-weight-bold;
}

.header p {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: $font-size-base; /* 减小字体 */
}

.stats-cards {
  margin-bottom: 24px; /* 减少间距 */
}

.stat-card {
  text-align: center;
  border: 1px solid var(--el-border-color-light) !important;
  border-radius: 8px !important;
  transition: all 0.3s ease;
  height: 80px; /* 减少高度 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: var(--el-color-primary) !important;
  }
}

.stat-number {
  font-size: 1.8rem; /* 减小字体 */
  font-weight: $font-weight-bold;
  color: $primary-color;
  margin-bottom: $spacing-xs; /* 减少间距 */
}

.stat-label {
  color: var(--el-text-color-secondary);
  font-size: $font-size-small;
  font-weight: $font-weight-medium;
}

.plugin-section,
.module-section,
.service-section,
.mock-section {
  margin-bottom: 24px; /* 减少间距 */
}

.section-title {
  margin: 0 0 $spacing-md 0; /* 减少间距 */
  color: var(--el-text-color-primary);
  font-size: $font-size-base; /* 减小字体 */
  font-weight: $font-weight-semibold;
}

.plugin-grid,
.module-grid,
.service-grid,
.mock-grid {
  margin-bottom: $spacing-md; /* 减少间距 */
}

.plugin-card,
.module-card,
.service-card,
.mock-card {
  height: 140px; /* 固定高度 */
  border: 1px solid var(--el-border-color-light) !important;
  border-radius: 8px !important;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: var(--el-color-primary) !important;
  }
  
  &.enabled {
    border-color: var(--el-color-success) !important;
    box-shadow: 0 0 0 1px var(--el-color-success-light-7);
  }
}

.plugin-header,
.module-header,
.service-header,
.mock-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-xs; /* 减少间距 */
  
  h3 {
    margin: 0;
    color: var(--el-text-color-primary);
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    line-height: 1.3;
  }
}

.plugin-description,
.module-description,
.service-description,
.mock-description {
  margin: 0 0 $spacing-xs 0; /* 减少间距 */
  color: var(--el-text-color-regular);
  font-size: $font-size-small;
  line-height: 1.4;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 限制为2行 */
  -webkit-box-orient: vertical;
}

.plugin-meta {
  display: flex;
  flex-direction: column;
  gap: 2px; /* 减少间距 */
  font-size: $font-size-extra-small;
  color: var(--el-text-color-secondary);
  
  span {
    display: block;
  }
}

.service-methods {
  font-size: $font-size-extra-small;
  color: var(--el-text-color-secondary);
}

.env-info {
  border: 1px solid var(--el-border-color-light) !important;
  border-radius: 8px !important;
  margin-bottom: 24px; /* 减少间距 */
}

.info-grid {
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px; /* 减少内边距 */
    background: var(--el-fill-color-light);
    border-radius: 6px;
    margin-bottom: 6px; /* 减少间距 */
  }
}

.info-label {
  font-weight: $font-weight-medium;
  color: var(--el-text-color-primary);
  font-size: $font-size-small; /* 减小字体 */
}

.info-value {
  color: var(--el-text-color-secondary);
  font-family: $font-family-monospace;
  font-size: $font-size-small; /* 减小字体 */
}

.color-preview {
  padding: 2px 6px; /* 减少内边距 */
  border-radius: 4px;
  color: white;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-size: $font-size-small; /* 减小字体 */
}
</style>
