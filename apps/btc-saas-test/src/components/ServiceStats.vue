<template>
  <el-row :gutter="20" class="stats-row">
    <el-col :span="6">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon services">
            <el-icon><Setting /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.total }}</div>
            <div class="stat-label">服务接口</div>
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
            <div class="stat-number">{{ stats.active }}</div>
            <div class="stat-label">运行中</div>
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
            <div class="stat-number">{{ stats.inactive }}</div>
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
            <div class="stat-label">异常</div>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { Setting, Check, Close, Warning } from '@element-plus/icons-vue'
// 本地定义 ServiceStats 类型，避免导入问题
interface ServiceStats {
  total: number
  active: number
  inactive: number
  error: number
}

interface Props {
  stats: ServiceStats
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

    &.services {
      background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
    }

    &.active {
      background: linear-gradient(135deg, #67c23a 0%, #529b2e 100%);
    }

    &.inactive {
      background: linear-gradient(135deg, #f56c6c 0%, #c45656 100%);
    }

    &.error {
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
