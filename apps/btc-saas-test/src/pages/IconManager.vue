<template>
  <div class="icon-manager">
    <div class="page-header">
      <h2>图标管理系统</h2>
      <p>按需加载的图标组件管理系统，支持动态导入和缓存</p>
    </div>

    <!-- 缓存统计 -->
    <el-card class="stats-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>缓存统计</span>
          <el-button size="small" @click="refreshStats">刷新</el-button>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-number">{{ stats.cached }}</div>
            <div class="stat-label">已缓存</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-number">{{ stats.loading }}</div>
            <div class="stat-label">加载中</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-number">{{ stats.total }}</div>
            <div class="stat-label">总计</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-number">{{ cacheHitRate }}%</div>
            <div class="stat-label">命中率</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 图标操作 -->
    <el-card class="actions-card" shadow="never">
      <template #header>
        <span>图标操作</span>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="iconName"
            placeholder="输入图标名称"
            clearable
            @keyup.enter="loadSingleIcon"
          >
            <template #append>
              <el-button @click="loadSingleIcon" :loading="singleLoading">
                加载
              </el-button>
            </template>
          </el-input>
        </el-col>
        
        <el-col :span="8">
          <el-button 
            type="primary" 
            @click="preloadCommonIcons"
            :loading="preloadLoading"
          >
            预加载常用图标
          </el-button>
        </el-col>
        
        <el-col :span="8">
          <el-button type="warning" @click="clearCache">
            清除缓存
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 图标预览 -->
    <el-card class="preview-card" shadow="never">
      <template #header>
        <span>图标预览</span>
      </template>
      
      <div class="icon-grid">
        <div 
          v-for="icon in previewIcons" 
          :key="icon.name"
          class="icon-item"
          :class="{ 'is-loaded': icon.loaded, 'is-loading': icon.loading }"
        >
          <div class="icon-display">
            <AsyncIcon 
              :name="icon.name" 
              :size="32"
              :show-loading="true"
              :show-error="true"
            />
          </div>
          <div class="icon-name">{{ icon.name }}</div>
          <div class="icon-status">
            <el-tag 
              :type="icon.loaded ? 'success' : icon.loading ? 'warning' : 'info'"
              size="small"
            >
              {{ icon.loaded ? '已加载' : icon.loading ? '加载中' : '未加载' }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 批量操作 -->
    <el-card class="batch-card" shadow="never">
      <template #header>
        <span>批量操作</span>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input
            v-model="batchIcons"
            type="textarea"
            :rows="4"
            placeholder="输入图标名称，每行一个"
          />
        </el-col>
        
        <el-col :span="12">
          <div class="batch-actions">
            <el-button 
              type="primary" 
              @click="batchPreload"
              :loading="batchLoading"
            >
              批量预加载
            </el-button>
            
            <el-button @click="loadDemoIcons">
              加载演示图标
            </el-button>
          </div>
          
          <div class="batch-info">
            <p>支持批量预加载多个图标，减少加载延迟</p>
            <p>格式：每行一个图标名称</p>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import AsyncIcon from '../components/AsyncIcon.vue'
import { 
  iconManager, 
  preloadIcons, 
  loadIcon, 
  isIconLoaded 
} from '../utils/icon-manager'

// 响应式数据
const iconName = ref('')
const singleLoading = ref(false)
const preloadLoading = ref(false)
const batchLoading = ref(false)
const batchIcons = ref('')

// 预览图标列表
const previewIcons = ref([
  { name: 'Setting', loaded: false, loading: false },
  { name: 'Grid', loaded: false, loading: false },
  { name: 'Monitor', loaded: false, loading: false },
  { name: 'User', loaded: false, loading: false },
  { name: 'Sunny', loaded: false, loading: false },
  { name: 'Moon', loaded: false, loading: false },
  { name: 'Document', loaded: false, loading: false },
  { name: 'Location', loaded: false, loading: false },
  { name: 'Folder', loaded: false, loading: false },
  { name: 'DataAnalysis', loaded: false, loading: false },
  { name: 'Picture', loaded: false, loading: false },
  { name: 'Connection', loaded: false, loading: false }
])

// 计算属性
const stats = computed(() => iconManager.getCacheStats())

const cacheHitRate = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.cached / stats.value.total) * 100)
})

// 方法
const refreshStats = () => {
  // 更新预览图标状态
  previewIcons.value.forEach(icon => {
    icon.loaded = isIconLoaded(icon.name)
    icon.loading = false
  })
}

const loadSingleIcon = async () => {
  if (!iconName.value.trim()) {
    ElMessage.warning('请输入图标名称')
    return
  }

  singleLoading.value = true
  try {
    await loadIcon(iconName.value.trim())
    ElMessage.success(`图标 ${iconName.value} 加载成功`)
    refreshStats()
  } catch (error) {
    ElMessage.error(`图标 ${iconName.value} 加载失败`)
  } finally {
    singleLoading.value = false
  }
}

const preloadCommonIcons = async () => {
  preloadLoading.value = true
  try {
    await iconManager.preloadCommonIcons()
    ElMessage.success('常用图标预加载完成')
    refreshStats()
  } catch (error) {
    ElMessage.error('常用图标预加载失败')
  } finally {
    preloadLoading.value = false
  }
}

const clearCache = () => {
  iconManager.clearCache()
  ElMessage.success('图标缓存已清除')
  refreshStats()
}

const batchPreload = async () => {
  if (!batchIcons.value.trim()) {
    ElMessage.warning('请输入要预加载的图标名称')
    return
  }

  const iconNames = batchIcons.value
    .split('\n')
    .map(name => name.trim())
    .filter(name => name)

  if (iconNames.length === 0) {
    ElMessage.warning('没有有效的图标名称')
    return
  }

  batchLoading.value = true
  try {
    await preloadIcons(iconNames)
    ElMessage.success(`成功预加载 ${iconNames.length} 个图标`)
    refreshStats()
  } catch (error) {
    ElMessage.error('批量预加载失败')
  } finally {
    batchLoading.value = false
  }
}

const loadDemoIcons = () => {
  const demoIcons = [
    'Setting', 'Grid', 'Monitor', 'User', 'Sunny', 'Moon',
    'Document', 'Location', 'Folder', 'DataAnalysis', 'Picture', 'Connection'
  ]
  batchIcons.value = demoIcons.join('\n')
}

// 生命周期
onMounted(() => {
  refreshStats()
})
</script>

<style scoped lang="scss">
.icon-manager {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
  
  h2 {
    margin: 0 0 8px 0;
    color: var(--el-text-color-primary);
    font-size: 24px;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }
}

.stats-card,
.actions-card,
.preview-card,
.batch-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-item {
  text-align: center;
  padding: 16px;
  
  .stat-number {
    font-size: 32px;
    font-weight: 600;
    color: var(--el-color-primary);
    margin-bottom: 8px;
  }
  
  .stat-label {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &.is-loaded {
    border-color: var(--el-color-success);
    background-color: var(--el-color-success-light-9);
  }
  
  &.is-loading {
    border-color: var(--el-color-warning);
    background-color: var(--el-color-warning-light-9);
  }
}

.icon-display {
  margin-bottom: 8px;
}

.icon-name {
  font-size: 12px;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
  text-align: center;
  word-break: break-all;
}

.icon-status {
  text-align: center;
}

.batch-actions {
  margin-bottom: 16px;
  
  .el-button {
    margin-right: 12px;
    margin-bottom: 8px;
  }
}

.batch-info {
  p {
    margin: 4px 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
