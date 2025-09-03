<template>
  <div class="icon-manager">
    <div class="header">
      <h3>图标管理</h3>
      <p>管理系统图标和favicon配置</p>
    </div>

    <el-row :gutter="16" class="icon-grid">
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
              <img 
                :src="icon.href" 
                :alt="icon.name"
                :width="getPreviewSize(icon.sizes)"
                :height="getPreviewSize(icon.sizes)"
                @error="handleImageError"
              />
            </div>
            <div class="icon-info">
              <div class="icon-name">{{ icon.name }}</div>
              <div class="icon-details">
                <span class="icon-size">{{ icon.sizes || '默认' }}</span>
                <span class="icon-type">{{ icon.type }}</span>
              </div>
              <div class="icon-path">{{ icon.href }}</div>
            </div>
            <div class="icon-actions">
              <el-button 
                type="primary" 
                size="small"
                @click="previewIcon(icon)"
              >
                预览
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="config-section">
      <template #header>
        <span>主题配置</span>
      </template>
      <el-row :gutter="16" class="config-form">
        <el-col :span="12">
          <div class="form-group">
            <label>主题色</label>
            <el-color-picker 
              v-model="themeColor" 
              @change="updateTheme"
            />
          </div>
        </el-col>
        <el-col :span="12">
          <div class="form-group">
            <label>磁贴色</label>
            <el-color-picker 
              v-model="tileColor" 
              @change="updateTheme"
            />
          </div>
        </el-col>
      </el-row>
    </el-card>

    <div class="actions">
      <el-button 
        type="primary"
        @click="generateHTML"
      >
        生成HTML代码
      </el-button>
      <el-button 
        type="info"
        @click="exportConfig"
      >
        导出配置
      </el-button>
      <el-button 
        type="success"
        @click="applyConfig"
      >
        应用配置
      </el-button>
    </div>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="showPreview"
      title="图标预览"
      width="500px"
    >
      <div v-if="previewIconData" class="preview-content">
        <el-image 
          :src="previewIconData.href" 
          :alt="previewIconData.name"
          class="preview-image"
          fit="contain"
        />
        <div class="preview-info">
          <p><strong>名称:</strong> {{ previewIconData.name }}</p>
          <p><strong>尺寸:</strong> {{ previewIconData.sizes || '默认' }}</p>
          <p><strong>类型:</strong> {{ previewIconData.type }}</p>
          <p><strong>路径:</strong> {{ previewIconData.href }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { IconConfig, FaviconConfig } from './index'

interface Props {
  config?: Partial<FaviconConfig>
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({})
})

const emit = defineEmits<{
  update: [config: FaviconConfig]
  apply: [config: FaviconConfig]
}>()

// 响应式数据
const themeColor = ref('#1890ff')
const tileColor = ref('#1890ff')
const showPreview = ref(false)
const previewIconData = ref<IconConfig | null>(null)

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
  
  return props.config.icons || defaultIcons
})

// 方法
const getPreviewSize = (sizes: string): number => {
  if (!sizes) return 32
  const size = sizes.split('x')[0]
  const numSize = parseInt(size, 10)
  return isNaN(numSize) ? 32 : Math.min(numSize, 64)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

const previewIcon = (icon: IconConfig) => {
  previewIconData.value = icon
  showPreview.value = true
}

const closePreview = () => {
  showPreview.value = false
  previewIconData.value = null
}

const updateTheme = () => {
  const config: FaviconConfig = {
    themeColor: themeColor.value,
    tileColor: tileColor.value,
    icons: availableIcons.value
  }
  emit('update', config)
}

const generateHTML = () => {
  const config: FaviconConfig = {
    themeColor: themeColor.value,
    tileColor: tileColor.value,
    icons: availableIcons.value
  }
  
  const html = generateFaviconHTML(config)
  
  // 可以显示在模态框中或复制到剪贴板
  alert('HTML代码已生成')
}

const exportConfig = () => {
  const config: FaviconConfig = {
    themeColor: themeColor.value,
    tileColor: tileColor.value,
    icons: availableIcons.value
  }
  
  const configStr = JSON.stringify(config, null, 2)
  const blob = new Blob([configStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = 'icon-config.json'
  a.click()
  
  URL.revokeObjectURL(url)
}

const applyConfig = () => {
  const config: FaviconConfig = {
    themeColor: themeColor.value,
    tileColor: tileColor.value,
    icons: availableIcons.value
  }
  emit('apply', config)
}

const generateFaviconHTML = (config: FaviconConfig): string => {
  const iconTags = config.icons.map(icon => {
    const sizesAttr = icon.sizes ? ` sizes="${icon.sizes}"` : ''
    const rel = icon.name.includes('apple') ? 'apple-touch-icon' : 'icon'
    return `    <link rel="${rel}" type="${icon.type}"${sizesAttr} href="${icon.href}" />`
  }).join('\n')

  return `    <!-- Favicon 配置 -->
${iconTags}
    
    <!-- 主题色 -->
    <meta name="theme-color" content="${config.themeColor}" />
    <meta name="msapplication-TileColor" content="${config.tileColor}" />`
}

// 生命周期
onMounted(() => {
  if (props.config.themeColor) {
    themeColor.value = props.config.themeColor
  }
  if (props.config.tileColor) {
    tileColor.value = props.config.tileColor
  }
})
</script>

<style lang="scss" scoped>
.icon-manager {
  padding: 20px;
}

.header {
  margin-bottom: 24px;
}

.header h3 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 1.5rem;
  font-weight: 600;
}

.header p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.icon-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
}

.icon-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.icon-preview {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.icon-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.icon-info {
  flex: 1;
  min-width: 0;
}

.icon-name {
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
  font-size: 0.9rem;
}

.icon-details {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.icon-size,
.icon-type {
  font-size: 0.8rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}

.icon-path {
  font-size: 0.8rem;
  color: #9ca3af;
  font-family: monospace;
  word-break: break-all;
}

.icon-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-primary:hover {
  background: #096dd9;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 0.7rem;
}

.config-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.config-section h4 {
  margin: 0 0 16px 0;
  color: #374151;
  font-size: 1.1rem;
  font-weight: 600;
}

.config-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.form-control {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-control:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h4 {
  margin: 0;
  color: #374151;
  font-size: 1.2rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #374151;
}

.modal-body {
  padding: 20px;
}

.preview-image {
  max-width: 100%;
  height: auto;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  margin-bottom: 16px;
}

.preview-info p {
  margin: 8px 0;
  color: #374151;
}

.preview-info strong {
  color: #1f2937;
}
</style>
