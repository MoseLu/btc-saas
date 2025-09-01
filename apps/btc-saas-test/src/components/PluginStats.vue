<template>
  <el-row :gutter="20" class="stats-row">
    <el-col :span="6">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon plugins">
            <el-icon><Grid /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ implementedCount }}</div>
            <div class="stat-label">已实现插件</div>
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
            <div class="stat-number">{{ enabledCount }}</div>
            <div class="stat-label">已启用</div>
          </div>
        </div>
      </el-card>
    </el-col>
    
    <el-col :span="6">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon inactive">
            <el-icon><Close /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ disabledCount }}</div>
            <div class="stat-label">已禁用</div>
          </div>
        </div>
      </el-card>
    </el-col>
    
    <el-col :span="6">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon scan">
            <el-icon><Refresh /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ lastScanTime ? '已扫描' : '未扫描' }}</div>
            <div class="stat-label">扫描状态</div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { Grid, Check, Close, Refresh } from '@element-plus/icons-vue'

interface Props {
  implementedCount: number
  enabledCount: number
  disabledCount: number
  lastScanTime: Date | null
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;

    &.plugins {
      background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
    }

    &.active {
      background: linear-gradient(135deg, #67c23a 0%, #529b2e 100%);
    }

    &.inactive {
      background: linear-gradient(135deg, #f56c6c 0%, #c45656 100%);
    }

    &.scan {
      background: linear-gradient(135deg, #e6a23c 0%, #b88230 100%);
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
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
