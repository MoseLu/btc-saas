<template>
  <div class="service-list">
    <div v-if="services.length > 0" class="services-grid">
      <div 
        v-for="service in services" 
        :key="service.name" 
        class="service-card"
      >
        <div class="service-header">
          <div class="service-icon">
            <el-icon><Setting /></el-icon>
          </div>
          <div class="service-info">
            <h3 class="service-name">{{ service.displayName }}</h3>
            <div class="service-meta">
              <el-tag size="small" class="service-version">v{{ service.version }}</el-tag>
              <el-tag size="small" type="info" class="service-type">{{ service.type || '未知' }}</el-tag>
              <el-tag 
                size="small" 
                :type="getStatusType(service.status)"
                class="service-status"
              >
                {{ getStatusText(service.status) }}
              </el-tag>
            </div>
            <div class="service-endpoint">{{ service.endpoint || service.path }}</div>
          </div>
        </div>
        
        <div class="service-description">
          <p>{{ service.description }}</p>
        </div>
        
        <div class="service-metrics" v-if="service.metrics">
          <div class="metrics-title">性能指标:</div>
          <div class="metrics-grid">
            <div class="metric-item">
              <span class="metric-label">响应时间:</span>
              <span class="metric-value">{{ service.metrics.responseTime }}ms</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">请求数:</span>
              <span class="metric-value">{{ service.metrics.requests }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">错误率:</span>
              <span class="metric-value">{{ service.metrics.errorRate.toFixed(2) }}%</span>
            </div>
          </div>
        </div>
        
        <div class="service-footer">
          <div class="service-uptime">
            <small>运行时间: {{ service.uptime || '未知' }}</small>
          </div>
          <div class="service-modified">
            <small>修改时间: {{ service.lastModified?.toLocaleDateString() || '未知' }}</small>
          </div>
        </div>
        
        <div class="service-actions">
          <el-button 
            v-if="service.status === 'inactive'"
            size="small" 
            type="success" 
            @click="$emit('start', service.name)"
          >
            <el-icon><VideoPlay /></el-icon>
            启动
          </el-button>
          <el-button 
            v-else
            size="small" 
            type="warning" 
            @click="$emit('stop', service.name)"
          >
            <el-icon><VideoPause /></el-icon>
            停止
          </el-button>
          <el-button 
            size="small" 
            type="primary" 
            @click="$emit('view', service)"
          >
            <el-icon><View /></el-icon>
            查看
          </el-button>
        </div>
      </div>
    </div>
    
    <el-empty v-else description="没有找到匹配的服务" />
  </div>
</template>

<script setup lang="ts">
import { Setting, VideoPlay, VideoPause, View } from '@element-plus/icons-vue'
import type { ServiceInfo } from '@/services/service.api'

interface Props {
  services: ServiceInfo[]
}

defineProps<Props>()

defineEmits<{
  start: [serviceName: string]
  stop: [serviceName: string]
  view: [service: ServiceInfo]
}>()

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'active': return 'success'
    case 'inactive': return 'danger'
    case 'error': return 'warning'
    default: return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return '运行中'
    case 'inactive': return '已停止'
    case 'error': return '异常'
    default: return '未知'
  }
}
</script>

<style lang="scss" scoped>
.service-list {
  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 20px;
  }

  .service-card {
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    padding: 20px;
    background: var(--el-bg-color);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
  }

  .service-header {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
  }

  .service-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
    color: white;
    font-size: 24px;
    flex-shrink: 0;
  }

  .service-info {
    flex: 1;
    min-width: 0;

    .service-name {
      margin: 0 0 8px 0;
      color: var(--el-text-color-primary);
      font-size: 18px;
      font-weight: 600;
      word-break: break-word;
    }

    .service-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
      flex-wrap: wrap;

      .service-version {
        color: var(--el-text-color-secondary);
        font-size: 12px;
      }

      .service-type {
        font-size: 12px;
      }

      .service-status {
        font-size: 12px;
      }
    }

    .service-endpoint {
      color: var(--el-text-color-secondary);
      font-size: 12px;
      word-break: break-all;
    }
  }

  .service-description {
    p {
      margin: 0;
      color: var(--el-text-color-secondary);
      font-size: 14px;
      line-height: 1.6;
    }
  }

  .service-metrics {
    margin: 16px 0;

    .metrics-title {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-bottom: 8px;
      font-weight: 500;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;

      .metric-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 8px;
        background: var(--el-fill-color-lighter);
        border-radius: 4px;

        .metric-label {
          font-size: 10px;
          color: var(--el-text-color-secondary);
          margin-bottom: 2px;
        }

        .metric-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }
    }
  }

  .service-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);

    .service-uptime,
    .service-modified {
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }
  }

  .service-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 16px;

    .el-button {
      min-width: 60px;
      padding: 6px 12px;
    }
  }
}
</style>
