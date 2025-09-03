<template>
  <BasePage>
    <div class="plugin-manager">


    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="scan-controls">
        <el-button 
          type="primary" 
          :loading="isScanning" 
          @click="startScan"
          :disabled="isScanning"
        >
          <el-icon><Refresh /></el-icon>
          {{ isScanning ? '扫描中...' : '开始扫描' }}
        </el-button>
        
        <el-button 
          type="info" 
          @click="refreshPlugins"
          :disabled="isScanning"
        >
          <el-icon><RefreshRight /></el-icon>
          刷新列表
        </el-button>
      </div>

      <div class="search-controls">
        <el-input
          v-model="searchQuery"
          placeholder="搜索插件..."
          clearable
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="selectedCategory"
          placeholder="选择分类"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="category in pluginCategories"
            :key="category.value"
            :label="category.label"
            :value="category.value"
          />
        </el-select>
      </div>
    </div>



    <!-- 插件列表 -->
    <div class="plugins-section">
      <div class="section-header">
        <h2>插件列表</h2>
        <div class="last-scan" v-if="lastScanTime">
          <el-icon><Clock /></el-icon>
          最后扫描: {{ lastScanTime.toLocaleString() }}
        </div>
      </div>

      <div v-if="filteredPluginList && filteredPluginList.length > 0" class="plugins-grid">
        <el-card 
          v-for="plugin in filteredPluginList" 
          :key="plugin.name"
          class="plugin-card"
          :class="{ 'enabled': plugin.enabled }"
        >
          <div class="plugin-header">
            <div class="plugin-icon">
              <el-icon><component :is="plugin.icon" /></el-icon>
            </div>
            <div class="plugin-info">
              <h3 class="plugin-name">{{ plugin.displayName }}</h3>
              <div class="plugin-meta">
                <el-tag size="small" type="info">{{ plugin.category }}</el-tag>
                <el-tag size="small" type="success">v{{ plugin.version }}</el-tag>
                <el-tag 
                  size="small" 
                  :type="plugin.enabled ? 'success' : 'warning'"
                >
                  {{ plugin.enabled ? '已启用' : '已禁用' }}
                </el-tag>
              </div>
            </div>
          </div>

          <div class="plugin-description">
            <p>{{ plugin.description }}</p>
          </div>

          <div class="plugin-features" v-if="plugin.features && plugin.features.length > 0">
            <div class="features-title">功能特性:</div>
            <div class="features-list">
              <el-tag 
                v-for="feature in plugin.features" 
                :key="feature"
                size="small" 
                type="info"
                class="feature-tag"
              >
                {{ feature }}
              </el-tag>
            </div>
          </div>

          <div class="plugin-footer">
            <div class="plugin-author">
              <small>作者: {{ plugin.author }}</small>
            </div>
            <div class="plugin-path">
              <small>路径: {{ plugin.path }}</small>
            </div>
          </div>

          <div class="plugin-actions">
            <el-button 
              size="small" 
              type="primary" 
              @click="openPluginPreview(plugin)"
            >
              <el-icon><View /></el-icon>
              预览
            </el-button>
            
            <el-switch 
              v-model="plugin.enabled" 
              @change="(enabled: string | number | boolean) => togglePlugin(plugin.name, enabled === true)"
              size="small"
              :loading="isScanning"
            />
          </div>
        </el-card>
      </div>

      <el-empty 
        v-else 
        description="没有找到匹配的插件"
        :image-size="200"
      >
        <el-button type="primary" @click="startScan">
          开始扫描插件
        </el-button>
      </el-empty>
    </div>

    <!-- 插件预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="插件预览"
      width="600px"
      :before-close="closePreview"
    >
      <div v-if="currentPlugin" class="plugin-preview">
        <div class="preview-header">
          <h3>{{ currentPlugin.displayName }}</h3>
          <el-tag :type="currentPlugin.enabled ? 'success' : 'warning'">
            {{ currentPlugin.enabled ? '已启用' : '已禁用' }}
          </el-tag>
        </div>
        
        <div class="preview-content">
          <p><strong>描述:</strong> {{ currentPlugin.description }}</p>
          <p><strong>版本:</strong> {{ currentPlugin.version }}</p>
          <p><strong>作者:</strong> {{ currentPlugin.author }}</p>
          <p><strong>分类:</strong> {{ getCategoryName(currentPlugin.category) }}</p>
          <p><strong>路径:</strong> {{ currentPlugin.path }}</p>
          
          <div v-if="currentPlugin.features && currentPlugin.features.length > 0">
            <p><strong>功能特性:</strong></p>
            <ul>
              <li v-for="feature in currentPlugin.features" :key="feature">
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closePreview">关闭</el-button>
          <el-button 
            v-if="currentPlugin && !currentPlugin.enabled"
            type="primary" 
            @click="enablePluginFromPreview"
          >
            启用插件
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
  </BasePage>
</template>

<script setup lang="ts">
import { 
  Refresh, 
  RefreshRight, 
  Search, 
  Clock, 
  View,
  Grid,
  Setting,
  Edit,
  Picture,
  Document,
  Cpu
} from '@element-plus/icons-vue'
import BasePage from '../../../components/BasePage.vue'
import { usePluginManager } from '../composables/usePluginManager'

// 使用插件管理逻辑
const {
  // 状态
  searchQuery,
  selectedCategory,
  isScanning,
  lastScanTime,
  previewVisible,
  currentPlugin,

  // 计算属性
  implementedPluginList,
  enabledPluginsCount,
  disabledPluginsCount,
  filteredPluginList,
  pluginCategories,

  // 方法
  startScan,
  togglePlugin,
  openPluginPreview,
  enablePluginFromPreview,
  closePreview,
  getStatusType,
  getCategoryName
} = usePluginManager()

// 刷新插件列表
const refreshPlugins = () => {
  startScan()
}
</script>

<style lang="scss" scoped>
@use '../../../assets/styles/variables.scss' as *;
@use '../../../assets/styles/mixins.scss' as *;

.plugin-manager {
  padding: 20px;
  background: var(--el-bg-color-page);
  
  .control-panel {
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    
    .scan-controls {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .search-controls {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }
  
  .plugins-section {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
      h2 {
        margin: 0;
        color: var(--el-text-color-primary);
        font-size: 18px;
        font-weight: 600;
      }
      
      .last-scan {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--el-text-color-secondary);
        font-size: 14px;
      }
    }
  }
  
  .plugins-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 20px;
  }
  
  .plugin-card {
    border: 1px solid var(--el-border-color-light) !important;
    border-radius: 8px !important;
    transition: all 0.3s ease;
    padding: 20px !important;
    height: auto;
    min-height: 200px;
    max-height: 300px;
    overflow: hidden;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      border-color: var(--el-color-primary) !important;
    }
    
    &.enabled {
      border-color: var(--el-color-success) !important;
      box-shadow: 0 0 0 1px var(--el-color-success-light-7);
    }
    
    .plugin-header {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      
      .plugin-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
        color: white;
        font-size: 20px;
        flex-shrink: 0;
      }
      
      .plugin-info {
        flex: 1;
        min-width: 0;
        
        .plugin-name {
          margin: 0 0 8px 0;
          color: var(--el-text-color-primary);
          font-size: 16px;
          font-weight: 600;
          word-break: break-word;
          line-height: 1.3;
        }
        
        .plugin-meta {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
      }
    }
    
    .plugin-description {
      margin-bottom: 12px;
      
      p {
        margin: 0;
        color: var(--el-text-color-regular);
        line-height: 1.5;
        font-size: 14px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    
    .plugin-features {
      margin-bottom: 12px;
      
      .features-title {
        font-weight: 600;
        margin-bottom: 6px;
        color: var(--el-text-color-primary);
        font-size: 13px;
      }
      
      .features-list {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
        
        .feature-tag {
          margin: 0;
          font-size: 11px;
        }
      }
    }
    
    .plugin-footer {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 11px;
      color: var(--el-text-color-secondary);
      
      .plugin-author,
      .plugin-path {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .plugin-path {
        text-align: right;
      }
    }
    
    .plugin-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }
  }
  
  .plugin-preview {
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      h3 {
        margin: 0;
        color: var(--el-text-color-primary);
      }
    }
    
    .preview-content {
      p {
        margin-bottom: 8px;
        color: var(--el-text-color-regular);
      }
      
      ul {
        margin: 8px 0;
        padding-left: 20px;
        
        li {
          margin-bottom: 4px;
          color: var(--el-text-color-regular);
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
