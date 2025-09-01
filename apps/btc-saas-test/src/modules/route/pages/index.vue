<template>
  <div class="route-manager">
    <!-- 操作按钮区域 -->
    <div class="header-actions">
      <el-button @click="refreshRoutes" :loading="loading">
        <el-icon><Refresh /></el-icon>
        刷新路由
      </el-button>
      <el-button @click="exportRoutes">
        <el-icon><Download /></el-icon>
        导出配置
      </el-button>
    </div>



    <!-- 路由分类标签 -->
    <div class="filter-section">
      <h3 class="section-title">路由分类</h3>
      
      <div class="category-tabs">
        <el-tabs v-model="activeCategory" @tab-click="handleCategoryChange">
          <el-tab-pane label="全部路由" name="all">
            <div class="route-list">
              <div 
                v-for="route in filteredRoutes" 
                :key="route.path"
                class="route-item"
                :class="{ 'is-active': activeRoute?.path === route.path }"
                @click="selectRoute(route)"
              >
                <div class="route-info">
                  <div class="route-title">
                    <el-icon class="route-icon">
                      <component :is="route.meta?.icon" />
                    </el-icon>
                    <span>{{ route.meta?.title || route.name }}</span>
                    <el-tag 
                      v-if="route.meta?.category" 
                      :type="getCategoryTagType(route.meta.category)"
                      size="small"
                    >
                      {{ getCategoryLabel(route.meta.category) }}
                    </el-tag>
                  </div>
                  <div class="route-path">{{ route.path }}</div>
                  <div class="route-meta">
                    <span v-if="route.meta?.description">{{ route.meta.description }}</span>
                    <span v-if="route.meta?.tags" class="route-tags">
                      <el-tag 
                        v-for="tag in route.meta.tags" 
                        :key="tag"
                        size="small"
                        type="info"
                      >
                        {{ tag }}
                      </el-tag>
                    </span>
                  </div>
                </div>
                <div class="route-actions">
                  <el-button size="small" @click.stop="previewRoute(route)">
                    预览
                  </el-button>
                  <el-button size="small" @click.stop="copyRoutePath(route)">
                    复制路径
                  </el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="插件路由" name="plugin">
            <div class="route-list">
              <div 
                v-for="route in pluginRoutes" 
                :key="route.path"
                class="route-item"
                @click="selectRoute(route)"
              >
                <div class="route-info">
                  <div class="route-title">
                    <el-icon class="route-icon">
                      <component :is="route.meta?.icon" />
                    </el-icon>
                    <span>{{ route.meta?.title || route.name }}</span>
                    <el-tag type="success" size="small">插件</el-tag>
                  </div>
                  <div class="route-path">{{ route.path }}</div>
                  <div class="route-meta">
                    <span v-if="route.meta?.description">{{ route.meta.description }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="应用路由" name="app">
            <div class="route-list">
              <div 
                v-for="route in appRoutes" 
                :key="route.path"
                class="route-item"
                @click="selectRoute(route)"
              >
                <div class="route-info">
                  <div class="route-title">
                    <el-icon class="route-icon">
                      <component :is="route.meta?.icon" />
                    </el-icon>
                    <span>{{ route.meta?.title || route.name }}</span>
                    <el-tag type="warning" size="small">应用</el-tag>
                  </div>
                  <div class="route-path">{{ route.path }}</div>
                  <div class="route-meta">
                    <span v-if="route.meta?.description">{{ route.meta.description }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="模块路由" name="module">
            <div class="route-list">
              <div 
                v-for="route in moduleRoutes" 
                :key="route.path"
                class="route-item"
                @click="selectRoute(route)"
              >
                <div class="route-info">
                  <div class="route-title">
                    <el-icon class="route-icon">
                      <component :is="route.meta?.icon" />
                    </el-icon>
                    <span>{{ route.meta?.title || route.name }}</span>
                    <el-tag type="info" size="small">模块</el-tag>
                  </div>
                  <div class="route-path">{{ route.path }}</div>
                  <div class="route-meta">
                    <span v-if="route.meta?.description">{{ route.meta.description }}</span>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 路由详情 -->
    <div v-if="activeRoute" class="route-detail">
      <div class="detail-header">
        <h3 class="section-title">路由详情</h3>
        <el-button size="small" @click="activeRoute = null">关闭</el-button>
      </div>
      
      <div class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="路由名称">
            {{ activeRoute.name }}
          </el-descriptions-item>
          <el-descriptions-item label="路由路径">
            {{ activeRoute.path }}
          </el-descriptions-item>
          <el-descriptions-item label="页面标题">
            {{ activeRoute.meta?.title }}
          </el-descriptions-item>
          <el-descriptions-item label="分类">
            {{ getCategoryLabel(activeRoute.meta?.category) }}
          </el-descriptions-item>
          <el-descriptions-item label="描述">
            {{ activeRoute.meta?.description || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="排序">
            {{ activeRoute.meta?.order || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="是否隐藏">
            {{ activeRoute.meta?.hidden ? '是' : '否' }}
          </el-descriptions-item>
          <el-descriptions-item label="需要认证">
            {{ activeRoute.meta?.requiresAuth ? '是' : '否' }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div v-if="activeRoute.meta?.tags" class="tags-section">
          <h4>标签</h4>
          <div class="tags-list">
            <el-tag 
              v-for="tag in activeRoute.meta.tags" 
              :key="tag"
              size="small"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
        
        <div v-if="activeRoute.meta?.breadcrumb" class="breadcrumb-section">
          <h4>面包屑</h4>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item 
              v-for="(item, index) in activeRoute.meta.breadcrumb" 
              :key="index"
            >
              {{ item }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="route-actions">
          <el-button type="primary" @click="navigateToRoute(activeRoute)">
            跳转到此路由
          </el-button>
          <el-button @click="copyRouteConfig(activeRoute)">
            复制配置
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh, Download } from '@element-plus/icons-vue'
import { getAllRoutes, getRoutesByCategory } from '../router'
import type { RouteRecordRaw } from 'vue-router'

// 响应式数据
const loading = ref(false)
const activeCategory = ref('all')
const activeRoute = ref<RouteRecordRaw | null>(null)

// 路由相关
const router = useRouter()

// 计算属性
const allRoutes = computed(() => getAllRoutes())

const totalRoutes = computed(() => allRoutes.value.length)

const pluginRoutes = computed(() => getRoutesByCategory('plugin'))

const appRoutes = computed(() => getRoutesByCategory('app'))

const moduleRoutes = computed(() => 
  allRoutes.value.filter(route => 
    route.meta?.category && 
    !['plugin', 'app', 'system'].includes(route.meta.category)
  )
)

const filteredRoutes = computed(() => {
  switch (activeCategory.value) {
    case 'plugin':
      return pluginRoutes.value
    case 'app':
      return appRoutes.value
    case 'module':
      return moduleRoutes.value
    default:
      return allRoutes.value
  }
})

// 方法
const refreshRoutes = async () => {
  loading.value = true
  try {
    // 这里可以调用路由刷新逻辑
    ElMessage.success('路由刷新成功')
  } catch (error) {
    ElMessage.error('路由刷新失败')
  } finally {
    loading.value = false
  }
}

const exportRoutes = () => {
  const routesData = {
    total: totalRoutes.value,
    plugins: pluginRoutes.value.length,
    apps: appRoutes.value.length,
    modules: moduleRoutes.value.length,
    routes: allRoutes.value.map(route => ({
      name: route.name,
      path: route.path,
      meta: route.meta
    }))
  }
  
  const dataStr = JSON.stringify(routesData, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `routes-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  ElMessage.success('路由配置已导出')
}

const handleCategoryChange = () => {
  activeRoute.value = null
}

const selectRoute = (route: RouteRecordRaw) => {
  activeRoute.value = route
}

const previewRoute = (route: RouteRecordRaw) => {
  if (route.path) {
    window.open(route.path, '_blank')
  }
}

const copyRoutePath = (route: RouteRecordRaw) => {
  navigator.clipboard.writeText(route.path).then(() => {
    ElMessage.success('路由路径已复制')
  })
}

const navigateToRoute = (route: RouteRecordRaw) => {
  if (route.path) {
    router.push(route.path)
  }
}

const copyRouteConfig = (route: RouteRecordRaw) => {
  const config = {
    name: route.name,
    path: route.path,
    meta: route.meta
  }
  
  navigator.clipboard.writeText(JSON.stringify(config, null, 2)).then(() => {
    ElMessage.success('路由配置已复制')
  })
}

const getCategoryTagType = (category: string): string => {
  const typeMap: Record<string, string> = {
    'plugin': 'success',
    'app': 'warning',
    'module': 'info',
    'system': 'danger'
  }
  return typeMap[category] || 'info'
}

const getCategoryLabel = (category: string): string => {
  const labelMap: Record<string, string> = {
    'plugin': '插件',
    'app': '应用',
    'module': '模块',
    'system': '系统',
    'user': '用户管理',
    'order': '订单管理',
    'product': '产品管理',
    'report': '报表中心'
  }
  return labelMap[category] || category
}

// 组件挂载时初始化
onMounted(() => {
  // 初始化逻辑
})
</script>

<style lang="scss" scoped>
@use '../../../assets/styles/variables.scss' as *;

.route-manager {
  padding: 20px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
      color: var(--el-text-color-primary);
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
          color: var(--el-color-primary);
          
          &.success { color: var(--el-color-success); }
          &.warning { color: var(--el-color-warning); }
          &.info { color: var(--el-color-info); }
        }
        
        .stat-label {
          margin-top: 8px;
          color: var(--el-text-color-secondary);
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
    
    .route-list {
      .route-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border: 1px solid var(--el-border-color-light);
        border-radius: 8px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        background: var(--el-bg-color);
        
        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
        }
        
        &.is-active {
          border-color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }
        
        .route-info {
          flex: 1;
          
          .route-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            
            .route-icon {
              color: var(--el-color-primary);
            }
            
            span {
              font-weight: 500;
              color: var(--el-text-color-primary);
            }
          }
          
          .route-path {
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 12px;
            color: var(--el-text-color-secondary);
            margin-bottom: 8px;
          }
          
          .route-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            
            span {
              font-size: 12px;
              color: var(--el-text-color-regular);
            }
            
            .route-tags {
              display: flex;
              gap: 4px;
            }
          }
        }
        
        .route-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }
  
  .route-detail {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .detail-content {
      .tags-section,
      .breadcrumb-section {
        margin-top: 20px;
        
        h4 {
          margin-bottom: 12px;
          color: var(--el-text-color-primary);
        }
        
        .tags-list {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
      }
      
      .route-actions {
        margin-top: 20px;
        display: flex;
        gap: 12px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .route-manager {
    padding: 16px;
    
    .page-header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
      
      .header-actions {
        justify-content: center;
      }
    }
    
    .stats-cards {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .route-item {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      
      .route-actions {
        justify-content: center;
      }
    }
  }
}
</style>
