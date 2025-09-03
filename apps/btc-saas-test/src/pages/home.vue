<template>
  <BasePage>
    <div class="home-dashboard">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <h1>BTC SaaS 管理平台</h1>
      <p>欢迎使用BTC SaaS管理平台，这里是您的工作台</p>
    </div>

    <!-- 系统概览统计 -->
    <div class="overview-section">
      <h2>系统概览</h2>
      <el-row :gutter="20" class="stats-grid">
        <!-- 路由统计 -->
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon routes">
                <el-icon><Connection /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ totalRoutes }}</div>
                <div class="stat-label">总路由数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 插件统计 -->
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon plugins">
                <el-icon><Grid /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ totalPlugins }}</div>
                <div class="stat-label">插件数量</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 模块统计 -->
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon modules">
                <el-icon><Folder /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ totalModules }}</div>
                <div class="stat-label">功能模块</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 用户统计 -->
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon users">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ totalUsers }}</div>
                <div class="stat-label">用户数量</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <h2>快速操作</h2>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="action-card" @click="$router.push('/route')">
            <div class="action-content">
              <el-icon class="action-icon"><Connection /></el-icon>
              <h3>路由管理</h3>
              <p>管理系统路由配置</p>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="action-card" @click="$router.push('/plugin')">
            <div class="action-content">
              <el-icon class="action-icon"><Grid /></el-icon>
              <h3>插件中心</h3>
              <p>管理系统插件</p>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card class="action-card" @click="$router.push('/user')">
            <div class="action-content">
              <el-icon class="action-icon"><User /></el-icon>
              <h3>用户管理</h3>
              <p>管理系统用户</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 测试滚动条的长内容区域 -->
    <div class="scroll-test-section">
      <h2>滚动条测试区域</h2>
      <p>这个区域包含足够的内容来测试无感滚动条的效果</p>
      
      <div class="test-content">
        <div v-for="i in 50" :key="i" class="test-item">
          <h3>测试项目 {{ i }}</h3>
          <p>这是第 {{ i }} 个测试项目，用来测试滚动条在内容滚动时的显示效果。</p>
          <p>当您滚动这个区域时，应该能看到滚动条从透明变为可见，然后在一定时间后再次隐藏。</p>
        </div>
      </div>
    </div>
  </div>
  </BasePage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Connection, Grid, Folder, User } from '@element-plus/icons-vue'
import BasePage from '../components/BasePage.vue'

const router = useRouter()

// 统计数据
const totalRoutes = ref(0)
const totalPlugins = ref(0)
const totalModules = ref(0)
const totalUsers = ref(0)

// 加载统计数据
onMounted(async () => {
  // 这里可以调用各个模块的API获取统计数据
  // 暂时使用模拟数据
  totalRoutes.value = 45
  totalPlugins.value = 12
  totalModules.value = 8
  totalUsers.value = 156
})
</script>

<style scoped lang="scss">
.home-dashboard {
  padding: 0;
  
  .welcome-section {
    background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-primary-light-8) 100%);
    padding: 32px;
    border-radius: 12px;
    margin-bottom: 24px;
    text-align: center;
    
    h1 {
      margin: 0 0 8px 0;
      color: var(--el-color-primary);
      font-size: 28px;
      font-weight: 600;
    }
    
    p {
      margin: 0;
      color: var(--el-text-color-regular);
      font-size: 16px;
    }
  }
  
  .overview-section,
  .quick-actions {
    margin-bottom: 32px;
    
    h2 {
      margin: 0 0 16px 0;
      color: var(--el-text-color-primary);
      font-size: 20px;
      font-weight: 600;
    }
  }
  
  .stats-grid {
    margin-bottom: 24px;
  }
  
  .stat-card {
    cursor: default;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        
        &.routes {
          background: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
        }
        
        &.plugins {
          background: var(--el-color-success-light-9);
          color: var(--el-color-success);
        }
        
        &.modules {
          background: var(--el-color-warning-light-9);
          color: var(--el-color-warning);
        }
        
        &.users {
          background: var(--el-color-info-light-9);
          color: var(--el-color-info);
        }
      }
      
      .stat-info {
        flex: 1;
        
        .stat-number {
          font-size: 24px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 14px;
          color: var(--el-text-color-regular);
        }
      }
    }
  }
  
  .action-card {
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      border-color: var(--el-color-primary-light-7);
    }
    
    .action-content {
      text-align: center;
      padding: 16px;
      
      .action-icon {
        font-size: 32px;
        color: var(--el-color-primary);
        margin-bottom: 12px;
      }
      
      h3 {
        margin: 0 0 8px 0;
        color: var(--el-text-color-primary);
        font-size: 16px;
        font-weight: 600;
      }
      
      p {
        margin: 0;
        color: var(--el-text-color-regular);
        font-size: 14px;
      }
    }
  }
  
  /* 滚动条测试区域样式 */
  .scroll-test-section {
    margin-top: 32px;
    
    h2 {
      margin: 0 0 16px 0;
      color: var(--el-text-color-primary);
      font-size: 20px;
      font-weight: 600;
    }
    
    > p {
      margin: 0 0 24px 0;
      color: var(--el-text-color-regular);
      font-size: 16px;
    }
    
    .test-content {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid var(--el-border-color-light);
      border-radius: 8px;
      padding: 16px;
      background: var(--el-bg-color-page);
      
      .test-item {
        margin-bottom: 20px;
        padding: 16px;
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 6px;
        background: var(--el-bg-color);
        
        &:last-child {
          margin-bottom: 0;
        }
        
        h3 {
          margin: 0 0 8px 0;
          color: var(--el-text-color-primary);
          font-size: 16px;
          font-weight: 600;
        }
        
        p {
          margin: 0 0 8px 0;
          color: var(--el-text-color-regular);
          font-size: 14px;
          line-height: 1.5;
          
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }
}

// 暗色主题适配
html.dark {
  .home-dashboard {
    .welcome-section {
      background: linear-gradient(135deg, var(--el-color-primary-dark-2) 0%, var(--el-bg-color) 100%);
    }
    
    .stat-card,
    .action-card {
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
    }
    
    .action-card:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }
  }
}
</style>
