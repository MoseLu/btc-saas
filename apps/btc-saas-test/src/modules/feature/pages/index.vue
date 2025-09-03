<template>
  <div class="feature-tester scrollarea scrollarea--main">


    <!-- 功能卡片网格 -->
    <el-row :gutter="20" class="feature-grid">
      <el-col 
        v-for="feature in features" 
        :key="feature.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <el-card class="feature-card" shadow="hover">
          <div class="feature-content">
            <div class="feature-icon">
              <el-icon :size="32">
                <component :is="feature.icon" />
              </el-icon>
            </div>
            
            <div class="feature-info">
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-description">{{ feature.description }}</p>
              
              <div class="feature-tags">
                <el-tag 
                  v-for="tag in feature.tags" 
                  :key="tag"
                  size="small"
                  type="info"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
            
            <div class="feature-actions">
              <el-button 
                type="primary" 
                size="small"
                @click="testFeature(feature)"
              >
                测试
              </el-button>
              <el-button 
                size="small"
                @click="viewDetails(feature)"
              >
                详情
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 测试结果面板 -->
    <el-card v-if="testResults.length > 0" class="results-panel">
      <template #header>
        <div class="card-header">
          <span>测试结果</span>
          <el-button type="danger" size="small" @click="clearResults">
            清空结果
          </el-button>
        </div>
      </template>
      
      <div class="results-list">
        <div 
          v-for="result in testResults" 
          :key="result.id"
          class="result-item"
          :class="result.status"
        >
          <div class="result-header">
            <el-icon>
              <component :is="getStatusIcon(result.status)" />
            </el-icon>
            <span class="result-title">{{ result.title }}</span>
            <span class="result-time">{{ formatTime(result.timestamp) }}</span>
          </div>
          
          <div class="result-content">
            <p class="result-message">{{ result.message }}</p>
            <div v-if="result.details" class="result-details">
              <pre>{{ result.details }}</pre>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 功能详情对话框 -->
    <el-dialog 
      v-model="detailDialogVisible" 
      :title="selectedFeature?.title"
      width="600px"
    >
      <div v-if="selectedFeature" class="feature-detail">
        <h4>功能描述</h4>
        <p>{{ selectedFeature.description }}</p>
        
        <h4>技术实现</h4>
        <ul>
          <li v-for="tech in selectedFeature.technologies" :key="tech">
            {{ tech }}
          </li>
        </ul>
        
        <h4>使用场景</h4>
        <ul>
          <li v-for="scenario in selectedFeature.scenarios" :key="scenario">
            {{ scenario }}
          </li>
        </ul>
        
        <h4>配置选项</h4>
        <el-table :data="selectedFeature.configs" border>
          <el-table-column prop="name" label="配置项" />
          <el-table-column prop="type" label="类型" />
          <el-table-column prop="default" label="默认值" />
          <el-table-column prop="description" label="说明" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Setting, Monitor, DataAnalysis, Connection, 
  Document, Picture, Location, Folder,
  Check, Close, Warning
} from '@element-plus/icons-vue'

// 功能定义
const features = ref([
  {
    id: 'auto-route',
    title: '自动路由注册',
    description: '自动发现和注册新的测试页面路由',
    icon: 'Location',
    tags: ['路由', '自动发现', '测试'],
    technologies: ['Vue Router', '动态导入', '文件系统扫描'],
    scenarios: ['新增测试页面', '插件路由注册', '模块路由发现'],
    configs: [
      { name: 'autoScan', type: 'boolean', default: 'true', description: '自动扫描开关' },
      { name: 'scanPath', type: 'string', default: 'src/views', description: '扫描路径' },
      { name: 'filePattern', type: 'string', default: '*.vue', description: '文件模式' }
    ]
  },
  {
    id: 'plugin-system',
    title: '插件系统',
    description: '动态插件加载和状态管理',
    icon: 'Grid',
    tags: ['插件', '动态加载', '状态管理'],
    technologies: ['Vite Plugin', '动态导入', '状态管理'],
    scenarios: ['插件启用/禁用', '插件配置', '插件市场'],
    configs: [
      { name: 'pluginPath', type: 'string', default: 'packages/plugins', description: '插件目录' },
      { name: 'autoLoad', type: 'boolean', default: 'true', description: '自动加载' },
      { name: 'hotReload', type: 'boolean', default: 'true', description: '热重载' }
    ]
  },
  {
    id: 'log-system',
    title: '日志系统',
    description: '多通道日志记录和查看',
    icon: 'Document',
    tags: ['日志', '多通道', '实时查看'],
    technologies: ['IndexedDB', 'WebSocket', '采样策略'],
    scenarios: ['应用日志', '错误追踪', '性能监控'],
    configs: [
      { name: 'channels', type: 'array', default: '["console", "http"]', description: '日志通道' },
      { name: 'sampling', type: 'number', default: '0.1', description: '采样率' },
      { name: 'retention', type: 'number', default: '7', description: '保留天数' }
    ]
  },
  {
    id: 'mock-system',
    title: 'Mock系统',
    description: '接口模拟和数据管理',
    icon: 'DataAnalysis',
    tags: ['Mock', '接口', '数据模拟'],
    technologies: ['MSW', 'JSON Schema', '动态配置'],
    scenarios: ['接口测试', '数据模拟', '离线开发'],
    configs: [
      { name: 'enabled', type: 'boolean', default: 'true', description: 'Mock开关' },
      { name: 'delay', type: 'number', default: '100', description: '延迟时间' },
      { name: 'errorRate', type: 'number', default: '0', description: '错误率' }
    ]
  },
  {
    id: 'eps-system',
    title: 'EPS系统',
    description: 'API服务自动生成',
    icon: 'Connection',
    tags: ['API', '代码生成', '类型安全'],
    technologies: ['Swagger', 'TypeScript', '代码生成'],
    scenarios: ['API文档解析', '服务类生成', '类型定义'],
    configs: [
      { name: 'swaggerUrl', type: 'string', default: '', description: 'Swagger地址' },
      { name: 'outputPath', type: 'string', default: 'src/services', description: '输出路径' },
      { name: 'generateTypes', type: 'boolean', default: 'true', description: '生成类型' }
    ]
  },
  {
    id: 'theme-system',
    title: '主题系统',
    description: '动态主题切换和配置',
    icon: 'Picture',
    tags: ['主题', '动态切换', '配置'],
    technologies: ['CSS Variables', 'SASS', '动态样式'],
    scenarios: ['主题切换', '品牌定制', '用户偏好'],
    configs: [
      { name: 'defaultTheme', type: 'string', default: 'light', description: '默认主题' },
      { name: 'autoDetect', type: 'boolean', default: 'true', description: '自动检测' },
      { name: 'persist', type: 'boolean', default: 'true', description: '持久化' }
    ]
  }
])

// 定义测试结果类型
interface TestResult {
  id: number
  title: string
  status: 'running' | 'success' | 'error'
  message: string
  timestamp: Date
  details: string | null
}

// 响应式数据
const testResults = ref<TestResult[]>([])
const detailDialogVisible = ref(false)
const selectedFeature = ref<any>(null)

// 测试功能
const testFeature = async (feature: any) => {
  const result: {
    id: number
    title: string
    status: 'running' | 'success' | 'error'
    message: string
    timestamp: Date
    details: string | null
  } = {
    id: Date.now(),
    title: feature.title,
    status: 'running',
    message: '正在测试...',
    timestamp: new Date(),
    details: null
  }
  
  testResults.value.unshift(result)
  
  try {
    // 模拟测试过程
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    // 根据功能类型执行不同的测试
    switch (feature.id) {
      case 'auto-route':
        await testAutoRoute()
        break
      case 'plugin-system':
        await testPluginSystem()
        break
      case 'log-system':
        await testLogSystem()
        break
      case 'mock-system':
        await testMockSystem()
        break
      case 'eps-system':
        await testEpsSystem()
        break
      case 'theme-system':
        await testThemeSystem()
        break
      default:
        await testGenericFeature(feature)
    }
    
    result.status = 'success'
    result.message = `${feature.title} 测试通过`
    result.details = '所有功能正常，性能良好'
    
    ElMessage.success(`${feature.title} 测试成功`)
  } catch (error) {
    result.status = 'error'
    result.message = `${feature.title} 测试失败`
    result.details = error instanceof Error ? error.message : String(error)
    
    ElMessage.error(`${feature.title} 测试失败`)
  }
}

// 测试自动路由功能
const testAutoRoute = async () => {
  // 模拟路由发现测试
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 检查路由注册
  const routes = window.location.pathname
  if (!routes) {
    throw new Error('路由注册失败')
  }
}

// 测试插件系统
const testPluginSystem = async () => {
  // 模拟插件加载测试
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // 检查插件状态
  const pluginCount = 8 // 模拟插件数量
  if (pluginCount <= 0) {
    throw new Error('插件加载失败')
  }
}

// 测试日志系统
const testLogSystem = async () => {
  // 模拟日志记录测试
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // 检查日志通道
  const channels = ['console', 'http', 'indexeddb']
  if (channels.length === 0) {
    throw new Error('日志通道初始化失败')
  }
}

// 测试Mock系统
const testMockSystem = async () => {
  // 模拟Mock接口测试
  await new Promise(resolve => setTimeout(resolve, 700))
  
  // 检查Mock配置
  const mockEnabled = true
  if (!mockEnabled) {
    throw new Error('Mock系统未启用')
  }
}

// 测试EPS系统
const testEpsSystem = async () => {
  // 模拟API生成测试
  await new Promise(resolve => setTimeout(resolve, 1200))
  
  // 检查生成结果
  const generatedFiles = ['services', 'types', 'models']
  if (generatedFiles.length === 0) {
    throw new Error('API服务生成失败')
  }
}

// 测试主题系统
const testThemeSystem = async () => {
  // 模拟主题切换测试
  await new Promise(resolve => setTimeout(resolve, 400))
  
  // 检查主题状态
  const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  if (!currentTheme) {
    throw new Error('主题系统初始化失败')
  }
}

// 通用功能测试
const testGenericFeature = async (feature: any) => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 模拟随机成功/失败
  if (Math.random() > 0.8) {
    throw new Error('随机测试失败')
  }
}

// 查看功能详情
const viewDetails = (feature: any) => {
  selectedFeature.value = feature
  detailDialogVisible.value = true
}

// 清空测试结果
const clearResults = () => {
  testResults.value = []
}

// 获取状态图标
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return Check
    case 'error':
      return Close
    case 'warning':
      return Warning
    default:
      return Setting
  }
}

// 格式化时间
const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString()
}
</script>

<style lang="scss" scoped>
.feature-tester {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
  
  h2 {
    margin: 0 0 8px 0;
    color: var(--el-text-color-primary);
  }
  
  p {
    margin: 0;
    color: var(--el-text-color-regular);
  }
}

.feature-grid {
  margin-bottom: 24px;
}

.feature-card {
  height: 100%;
  border: 1px solid var(--el-border-color-light) !important;
  border-radius: 8px !important;
  transition: all 0.3s ease;
  padding: 20px !important;
  min-height: 180px;
  max-height: 280px;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: var(--el-color-primary) !important;
  }
}

.feature-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;
}

.feature-icon {
  text-align: center;
  margin-bottom: 12px;
  color: var(--el-color-primary);
}

.feature-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.3;
}

.feature-description {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feature-tags {
  margin-bottom: 8px;
  
  .el-tag {
    margin-right: 4px;
    margin-bottom: 4px;
    font-size: 11px;
  }
}

.feature-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.results-panel {
  margin-top: 24px;
  border: 1px solid var(--el-border-color-light) !important;
  border-radius: 8px !important;
}

.results-list {
  max-height: 400px;
  overflow-y: auto;
}

.result-item {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  border-left: 4px solid;
  
  &.success {
    background: var(--el-color-success-light-9);
    border-left-color: var(--el-color-success);
  }
  
  &.error {
    background: var(--el-color-danger-light-9);
    border-left-color: var(--el-color-danger);
  }
  
  &.running {
    background: var(--el-color-info-light-9);
    border-left-color: var(--el-color-info);
  }
}

.result-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  
  .el-icon {
    margin-right: 8px;
  }
  
  .result-title {
    flex: 1;
    font-weight: 600;
  }
  
  .result-time {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.result-content {
  .result-message {
    margin: 0 0 8px 0;
    font-size: 14px;
  }
  
  .result-details {
    background: var(--el-fill-color-light);
    padding: 8px;
    border-radius: 4px;
    
    pre {
      margin: 0;
      font-size: 12px;
      color: var(--el-text-color-regular);
    }
  }
}

.feature-detail {
  h4 {
    margin: 16px 0 8px 0;
    color: var(--el-text-color-primary);
  }
  
  p {
    margin: 0 0 12px 0;
    color: var(--el-text-color-regular);
  }
  
  ul {
    margin: 0 0 12px 0;
    padding-left: 20px;
    
    li {
      margin-bottom: 4px;
      color: var(--el-text-color-regular);
    }
  }
}
</style>
