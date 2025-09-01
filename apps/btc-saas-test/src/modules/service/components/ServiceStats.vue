<template>
  <el-row :gutter="20" class="service-stats">
    <el-col :span="6">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon running">
            <el-icon><VideoPlay /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.running }}</div>
            <div class="stat-label">运行中</div>
          </div>
        </div>
      </el-card>
    </el-col>
    
    <el-col :span="6">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon stopped">
            <el-icon><VideoPause /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.stopped }}</div>
            <div class="stat-label">已停止</div>
          </div>
        </div>
      </el-card>
    </el-col>
    
    <el-col :span="6">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon error">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.error }}</div>
            <div class="stat-label">错误</div>
          </div>
        </div>
      </el-card>
    </el-col>
    
    <el-col :span="6">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon total">
            <el-icon><Monitor /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.total }}</div>
            <div class="stat-label">总计</div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { VideoPlay, VideoPause, Warning, Monitor } from '@element-plus/icons-vue'

interface ServiceStats {
  running: number
  stopped: number
  error: number
  total: number
}

defineProps<{
  stats: ServiceStats
}>()
</script>

<style lang="scss" scoped>
.service-stats {
  margin-bottom: 24px;
}

.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
  }
  
  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
    
    &.running {
      background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
    }
    
    &.stopped {
      background: linear-gradient(135deg, #909399 0%, #c0c4cc 100%);
    }
    
    &.error {
      background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
    }
    
    &.total {
      background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
    }
  }
  
  .stat-info {
    flex: 1;
    
    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: var(--el-text-color-primary);
      margin-bottom: 4px;
    }
    
    .stat-label {
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
  }
}
</style>
