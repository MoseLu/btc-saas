<template>
  <div class="module-manager">


    <!-- 模块列表 -->
    <div class="module-section">
      <div class="section-header">
        <h3 class="section-title">模块列表</h3>
        <el-button type="primary" size="small" @click="refreshModules">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
      
             <el-table v-if="moduleList.length" :data="moduleList" style="width: 100%">
         <el-table-column prop="name" label="模块名称" width="200" />
         <el-table-column prop="path" label="路径" show-overflow-tooltip />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
                         <el-switch
               v-model="moduleStatus[row.name]"
               @change="toggleModule(row.name)"
               size="small"
             />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewModule(row)">
              查看
            </el-button>
            <el-button type="info" size="small" @click="editModule(row)">
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-else description="暂无功能模块" />
    </div>

    <!-- 模块详情 -->
    <div class="detail-section" v-if="selectedModule">
      <div class="section-header">
        <h3 class="section-title">模块详情 - {{ selectedModule.name }}</h3>
      </div>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="模块名称">
          {{ selectedModule.name }}
        </el-descriptions-item>
        <el-descriptions-item label="路径">
          {{ selectedModule.path }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="moduleStatus[selectedModule.name] ? 'success' : 'danger'">
            {{ moduleStatus[selectedModule.name] ? '已启用' : '已禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag type="info">功能模块</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 系统信息 -->
    <div class="info-section">
      <div class="section-header">
        <h3 class="section-title">系统信息</h3>
      </div>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="应用标题">
                      {{ btc.env?.VITE_APP_TITLE || 'BTC Saas' }}
        </el-descriptions-item>
        <el-descriptions-item label="环境">
          <el-tag :type="btc.env?.NODE_ENV === 'production' ? 'danger' : 'success'">
            {{ btc.env?.NODE_ENV || 'development' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="模块版本">
          <el-tag type="warning">v1.0.0</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ new Date().toLocaleString() }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import { ElMessage } from "element-plus";
import {
  Folder,
  Grid,
  Check,
  Location,
  Refresh
} from '@element-plus/icons-vue'

// 模拟数据
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

// 响应式数据
const moduleStatus = reactive<Record<string, boolean>>({})
const selectedModule = ref<any>(null)

// 计算属性
const moduleList = computed(() => {
  if (!mockModules.length) return []
  return mockModules.map(moduleName => {
    // 安全地转换为字符串
    let name: string
    if (typeof moduleName === 'string') {
      name = moduleName
    } else if (moduleName && typeof moduleName === 'object' && 'name' in moduleName) {
      name = String((moduleName as { name: string }).name)
    } else {
      name = 'unknown'
    }
    
    return {
      name,
      path: `src/modules/${name}/index.ts`
    }
  })
})

const totalComponents = computed(() => {
  // 模拟组件数量
  return mockModules.length ? mockModules.length * 3 : 0
})

const activeModuleCount = computed(() => {
  return Object.values(moduleStatus).filter(status => status).length
})

const totalRoutes = computed(() => {
  // 模拟路由数量
  return mockModules.length ? mockModules.length * 2 : 0
})

// 初始化状态
const initStatus = () => {
  if (mockModules) {
    mockModules.forEach(moduleName => {
      // 安全地转换为字符串
      let name: string
      if (typeof moduleName === 'string') {
        name = moduleName
      } else if (moduleName && typeof moduleName === 'object' && 'name' in moduleName) {
        name = String((moduleName as { name: string }).name)
      } else {
        name = 'unknown'
      }
      
      if (!(name in moduleStatus)) {
        moduleStatus[name] = true // 默认启用
      }
    })
  }
}

const refreshModules = () => {
  initStatus()
  ElMessage.success('模块列表已刷新')
}

const toggleModule = (moduleName: string) => {
  const status = moduleStatus[moduleName] ? '启用' : '禁用'
  ElMessage.success(`模块 "${moduleName}" 已${status}`)
}

const viewModule = (module: any) => {
  selectedModule.value = module
  ElMessage.info(`查看模块: ${module.name}`)
}

const editModule = (module: any) => {
  ElMessage.info(`编辑模块: ${module.name}`)
}

// 全局环境变量
const btc = {
  env: {
    NODE_ENV: import.meta.env.MODE,
    VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE
  },
  modules: mockModules
}

// 初始化
initStatus()
</script>

<style lang="scss" scoped>
@use '../../../assets/styles/variables.scss' as *;
@use '../../../assets/styles/mixins.scss' as *;

.module-manager {
  // 移除padding，因为main-content已经有padding了
}

.page-header {
  margin-bottom: $spacing-lg;
}

.page-header h2 {
  margin: 0 0 $spacing-sm 0;
  color: var(--el-text-color-primary);
  font-size: $font-size-extra-large;
  font-weight: $font-weight-semibold;
}

.page-header p {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: $font-size-base;
}

.stats-row {
  margin-bottom: $spacing-lg;
}

.stat-card {
  height: 120px;
}

.stat-content {
  @include flex-center-vertical;
  height: 100%;
}

.stat-icon {
  @include circle(60px);
  @include flex-center;
  margin-right: $spacing-md;
  font-size: $font-size-extra-large;
  color: $white;
}

.stat-icon.modules {
  background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
}

.stat-icon.components {
  background: linear-gradient(135deg, $info-color 0%, $primary-color 100%);
}

.stat-icon.active {
  background: linear-gradient(135deg, $success-color 0%, $primary-color 100%);
}

.stat-icon.routes {
  background: linear-gradient(135deg, $warning-color 0%, $danger-color 100%);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: $font-weight-bold;
  color: var(--el-text-color-primary);
  line-height: 1;
  margin-bottom: $spacing-sm;
}

.stat-label {
  font-size: $font-size-base;
  color: var(--el-text-color-secondary);
}

.module-section,
.detail-section,
.info-section {
  margin-bottom: $spacing-lg;
}

.card-header {
  @include flex-between;
}
</style>
