<template>
  <div class="icon-manager">


    <!-- 图标网格 -->
    <div class="icon-section">
      <div class="section-header">
        <h3 class="section-title">图标列表</h3>
        <el-button type="primary" size="small" @click="refreshIcons">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
      
      <el-row :gutter="20">
        <el-col 
          v-for="icon in availableIcons" 
          :key="icon.name"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <el-card class="icon-card" shadow="hover">
            <div class="icon-content">
              <div class="icon-preview">
                <el-image 
                  :src="icon.href" 
                  :alt="icon.name"
                  :preview-src-list="[icon.href]"
                  :initial-index="0"
                  fit="contain"
                  class="icon-image"
                  @error="handleImageError"
                  preview-teleported
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div class="preview-hint">点击图片预览</div>
              </div>
              
              <div class="icon-info">
                <h4 class="icon-name">{{ icon.name }}</h4>
                <div class="icon-details">
                  <el-tag size="small" type="info">{{ icon.sizes || '默认' }}</el-tag>
                  <el-tag size="small" type="warning">{{ icon.type }}</el-tag>
                </div>
                <div class="icon-path">{{ icon.href }}</div>
              </div>
              
              <div class="icon-actions">
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh,
  Picture
} from '@element-plus/icons-vue'

interface IconConfig {
  name: string
  sizes: string
  type: string
  href: string
}

// 计算属性
const availableIcons = computed(() => {
  const defaultIcons: IconConfig[] = [
    {
      name: 'favicon.ico',
      sizes: '',
      type: 'image/x-icon',
      href: '/favicon.ico'
    },
    {
      name: 'favicon-16x16.png',
      sizes: '16x16',
      type: 'image/png',
      href: '/favicon-16x16.png'
    },
    {
      name: 'favicon-32x32.png',
      sizes: '32x32',
      type: 'image/png',
      href: '/favicon-32x32.png'
    },
    {
      name: 'apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
      href: '/apple-touch-icon.png'
    },
    {
      name: 'android-chrome-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      href: '/android-chrome-192x192.png'
    },
    {
      name: 'android-chrome-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      href: '/android-chrome-512x512.png'
    }
  ]
  
  return defaultIcons
})

// 方法
const handleImageError = () => {
  // 图片加载失败的处理
}

const refreshIcons = () => {
  ElMessage.success('图标列表已刷新')
}
</script>

<style lang="scss" scoped>
@use '../../../assets/styles/variables.scss' as *;
@use '../../../assets/styles/mixins.scss' as *;

.icon-manager {
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

.icon-section,
.config-section,
.actions-section {
  margin-bottom: $spacing-lg;
}

.card-header {
  @include flex-between;
}

.icon-card {
  margin-bottom: $spacing-md;
  border: 1px solid var(--el-border-color-light) !important;
  border-radius: 8px !important;
  transition: all 0.3s ease;
  padding: 16px !important;
  height: auto;
  min-height: 120px;
  max-height: 200px;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: var(--el-color-primary) !important;
  }
}

.icon-content {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  height: 100%;
}

.icon-preview {
  @include flex-center;
  flex-direction: column;
  height: 80px;
  background: $bg-color;
  border-radius: $border-radius-lg;
  border: 1px solid $border-color-light;
  position: relative;
}

.preview-hint {
  font-size: $font-size-extra-small;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  text-align: center;
}

.icon-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: $border-radius-base;
}

.image-error {
  @include flex-center;
  width: 100%;
  height: 100%;
  color: $text-placeholder;
  font-size: $font-size-extra-large;
}

.icon-info {
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.icon-name {
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  line-height: 1.3;
}

.icon-details {
  @include flex-center;
  gap: $spacing-sm;
  margin-bottom: 4px;
}

.icon-path {
  font-size: $font-size-extra-small;
  color: var(--el-text-color-secondary);
  font-family: $font-family-monospace;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.icon-actions {
  @include flex-center;
  gap: $spacing-sm;
  margin-top: auto;
}

.actions {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
}

.dialog-footer {
  @include flex-center;
  justify-content: flex-end;
  gap: $spacing-sm;
}
</style>
