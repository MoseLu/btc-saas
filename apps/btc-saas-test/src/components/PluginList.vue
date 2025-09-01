<template>
  <div class="plugin-list">
    <div v-if="plugins.length > 0" class="plugins-grid">
      <el-card 
        v-for="plugin in plugins" 
        :key="plugin.name" 
        class="plugin-card"
        :class="{ 'enabled': plugin.enabled }"
        shadow="hover"
      >
        <div class="plugin-header">
          <div class="plugin-icon">
            <el-icon><Grid /></el-icon>
          </div>
          <div class="plugin-info">
            <h3 class="plugin-name">{{ plugin.displayName }}</h3>
            <div class="plugin-meta">
              <el-tag size="small" class="plugin-version">v{{ plugin.version }}</el-tag>
              <el-tag size="small" type="info" class="plugin-category">{{ plugin.category }}</el-tag>
              <el-tag 
                size="small" 
                :type="plugin.enabled ? 'success' : 'warning'"
              >
                {{ plugin.enabled ? '已启用' : '已禁用' }}
              </el-tag>
            </div>
            <div class="plugin-path">{{ plugin.path }}</div>
          </div>
        </div>
        
        <div class="plugin-description">
          <p>{{ plugin.description }}</p>
        </div>
        
        <div class="plugin-features" v-if="plugin.features.length > 0">
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
          <div class="plugin-modified">
            <small>修改时间: {{ plugin.lastModified.toLocaleDateString() }}</small>
          </div>
        </div>
        
        <div class="plugin-actions">
          <el-button 
            size="small" 
            type="primary" 
            @click="$emit('preview', plugin)"
          >
            <el-icon><View /></el-icon>
            预览
          </el-button>
          <el-switch 
            v-model="plugin.enabled" 
            @change="(enabled) => $emit('toggle', plugin.name, enabled)"
            size="small"
          />
        </div>
      </el-card>
    </div>
    
    <el-empty v-else description="没有找到匹配的插件" />
  </div>
</template>

<script setup lang="ts">
import { Grid, View } from '@element-plus/icons-vue'
import type { PluginInfo } from '@/services/plugin.api'

interface Props {
  plugins: PluginInfo[]
}

defineProps<Props>()

defineEmits<{
  preview: [plugin: PluginInfo]
  toggle: [pluginName: string, enabled: boolean]
}>()
</script>

<style lang="scss" scoped>
.plugin-list {
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
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
      border-color: var(--el-color-primary) !important;
    }

    &.enabled {
      border-color: var(--el-color-success) !important;
      box-shadow: 0 0 0 1px var(--el-color-success-light-7);
    }
  }

  .plugin-header {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
  }

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
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
      flex-wrap: wrap;

      .plugin-version {
        color: var(--el-text-color-secondary);
        font-size: 11px;
      }

      .plugin-category {
        font-size: 11px;
      }
    }

    .plugin-path {
      color: var(--el-text-color-secondary);
      font-size: 11px;
      word-break: break-all;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .plugin-description {
    p {
      margin: 0;
      color: var(--el-text-color-secondary);
      font-size: 14px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .plugin-features {
    margin: 12px 0;

    .features-title {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-bottom: 6px;
      font-weight: 500;
    }

    .features-list {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;

      .feature-tag {
        font-size: 11px;
      }
    }
  }

  .plugin-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-lighter);

    .plugin-author,
    .plugin-modified {
      color: var(--el-text-color-secondary);
      font-size: 11px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .plugin-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 12px;

    .el-button {
      min-width: 60px;
      padding: 6px 12px;
    }

    .el-switch {
      margin-left: 4px;
    }
  }
}
</style>
