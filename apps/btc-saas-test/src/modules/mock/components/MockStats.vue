<template>
  <el-row :gutter="20" class="stats-row">
    <el-col :span="6">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon mocks">
            <el-icon><DataAnalysis /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalEndpoints }}</div>
            <div class="stat-label">Mock接口</div>
          </div>
        </div>
      </el-card>
    </el-col>
    
    <el-col :span="6">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon active">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.enabledEndpoints }}</div>
            <div class="stat-label">已启用</div>
          </div>
        </div>
      </el-card>
    </el-col>
    
    <el-col :span="6">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon delay">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalDelay }}ms</div>
            <div class="stat-label">总延迟</div>
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
            <div class="stat-number">{{ stats.services }}</div>
            <div class="stat-label">服务数</div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { DataAnalysis, Check, Timer, Warning } from '@element-plus/icons-vue'

interface MockStats {
  totalEndpoints: number
  enabledEndpoints: number
  totalDelay: number
  services: number
}

defineProps<{
  stats: MockStats
}>()
</script>

<style lang="scss" scoped>
@use '../../../assets/styles/variables.scss' as *;
@use '../assets/styles/mixins.scss' as *;

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
  font-size: 24px;
  
  &.mocks {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
  
  &.active {
    background: var(--el-color-success-light-9);
    color: var(--el-color-success);
  }
  
  &.delay {
    background: var(--el-color-warning-light-9);
    color: var(--el-color-warning);
  }
  
  &.error {
    background: var(--el-color-danger-light-9);
    color: var(--el-color-danger);
  }
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
</style>
