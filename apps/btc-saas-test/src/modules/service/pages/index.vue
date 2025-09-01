<template>
  <div class="service-manager">




    <!-- 服务控制面板 -->
    <div class="control-section">
      <div class="section-header">
        <h3 class="section-title">服务控制</h3>
        <div class="header-actions">
            <el-button 
              type="primary" 
              size="small" 
              @click="refreshServices"
              :loading="isRefreshing"
            >
              <el-icon><Refresh /></el-icon>
              刷新状态
            </el-button>
            <el-button type="success" size="small" @click="startAllServices">
              <el-icon><VideoPlay /></el-icon>
              启动所有
            </el-button>
            <el-button type="warning" size="small" @click="stopAllServices">
              <el-icon><VideoPause /></el-icon>
              停止所有
            </el-button>
        </div>
      </div>
      
      <div class="service-info">
        <el-alert
          title="服务管理说明"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <p>服务管理页面允许您监控和控制系统中各个服务的运行状态。</p>
            <p>您可以启动、停止单个服务，或者批量操作所有服务。</p>
          </template>
        </el-alert>
      </div>
    </div>

    <!-- 服务过滤 -->
    <div class="filter-section">
      <div class="section-header">
        <h3 class="section-title">服务过滤</h3>
      </div>
      
      <div class="filter-controls">
        <el-input
          v-model="searchQuery"
          placeholder="搜索服务名称、描述..."
          class="search-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="selectedStatus"
          placeholder="选择状态"
          class="status-select"
          clearable
        >
          <el-option
            v-for="status in serviceStatuses"
            :key="status"
            :label="getStatusText(status)"
            :value="status"
          />
        </el-select>
      </div>
    </div>

    <!-- 服务列表 -->
    <div class="service-section">
      <div class="section-header">
        <h3 class="section-title">服务列表</h3>
        <span class="service-count">共 {{ filteredServiceList.length }} 个服务</span>
      </div>
      
      <ServiceList
        :services="filteredServiceList"
        :loading="isRefreshing"
        @start-service="startService"
        @stop-service="stopService"
        @restart-service="(id) => {}"
        @view-logs="(id) => {}"
        @refresh="refreshServices"
      />
    </div>

    <!-- 系统信息 -->
    <div class="info-section">
      <div class="section-header">
        <h3 class="section-title">系统信息</h3>
      </div>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="服务目录">
          {{ '/packages/services' }}
        </el-descriptions-item>
        <el-descriptions-item label="环境">
          <el-tag :type="btc.env?.NODE_ENV === 'production' ? 'danger' : 'success'">
            {{ btc.env?.NODE_ENV || 'development' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="服务管理器版本">
          <el-tag type="warning">v1.0.0</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最后更新">
          {{ new Date().toLocaleString() }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Refresh, Search, VideoPlay, VideoPause } from '@element-plus/icons-vue'
import { useServiceManager } from '../composables/useServiceManager'
import ServiceStats from '../components/ServiceStats.vue'
import ServiceList from '../components/ServiceList.vue'

// 使用服务管理逻辑
const {
  // 状态
  searchQuery,
  selectedStatus,
  isRefreshing,

  // 计算属性
  serviceStats,
  filteredServiceList,
  serviceStatuses,

  // 方法
  loadServices,
  refreshServices,
  startService,
  stopService,
  startAllServices,
  stopAllServices,
  getStatusText
} = useServiceManager()

// 查看服务详情
const viewService = (service: any) => {
  // 这里可以打开服务详情弹窗
}

// 全局环境变量
const btc = {
  env: {
    NODE_ENV: import.meta.env.MODE
  }
}

// 初始化
onMounted(() => {
  loadServices()
})
</script>
