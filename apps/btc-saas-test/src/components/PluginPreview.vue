<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :title="`${plugin?.displayName || '插件'} - 功能预览`"
    width="80%"
    :close-on-click-modal="false"
    class="plugin-preview-dialog"
    @close="$emit('close')"
  >
    <div v-if="plugin" class="preview-content">
      <!-- PDF转PNG插件预览 -->
      <div v-if="plugin.name === 'pdf2png'" class="pdf2png-preview">
        <div class="preview-description">
          <p>将PDF文档转换为PNG图片格式，支持批量转换和自定义分辨率。</p>
        </div>
        
        <div class="preview-demo">
          <el-upload
            class="upload-demo"
            drag
            :auto-upload="false"
            accept=".pdf"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将PDF文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                只能上传PDF文件
              </div>
            </template>
          </el-upload>
        </div>
      </div>

      <!-- 富文本编辑器插件预览 -->
      <div v-else-if="plugin.name === 'richtext'" class="richtext-preview">
        <div class="preview-description">
          <p>功能强大的富文本编辑器，支持多种格式和实时预览。</p>
        </div>
        
        <div class="preview-demo">
          <div class="editor-toolbar">
            <el-button size="small" type="primary">加粗</el-button>
            <el-button size="small" type="primary">斜体</el-button>
            <el-button size="small" type="primary">下划线</el-button>
            <el-button size="small" type="primary">链接</el-button>
          </div>
          
          <el-input
            :model-value="richtextContent"
            @update:model-value="$emit('update:richtextContent', $event)"
            type="textarea"
            :rows="8"
            placeholder="开始编辑内容..."
          />
          
          <div class="editor-actions">
            <el-button size="small" @click="$emit('clear')">清空</el-button>
            <el-button size="small" type="primary" @click="$emit('save')">保存</el-button>
          </div>
        </div>
      </div>

      <!-- 默认预览 -->
      <div v-else class="default-preview">
        <p>该插件的功能预览正在开发中...</p>
        <el-button type="primary" @click="$emit('enable')">
          启用插件
        </el-button>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('close')">关闭</el-button>
        <el-button 
          v-if="plugin && !plugin.enabled" 
          type="primary" 
          @click="$emit('enable')"
        >
          启用插件
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue'
// 本地定义 PluginInfo 类型，避免导入问题
interface PluginInfo {
  name: string
  displayName: string
  description: string
  version: string
  author: string
  category: string
  icon: string
  features: string[]
  path: string
  status: 'active' | 'inactive' | 'error'
  enabled: boolean
  lastModified: Date
  dependencies?: string[]
}

interface Props {
  visible: boolean
  plugin: PluginInfo | null
  richtextContent: string
}

defineProps<Props>()

defineEmits<{
  close: []
  enable: []
  clear: []
  save: []
  'update:richtextContent': [value: string]
  'update:visible': [value: boolean]
}>()
</script>

<style lang="scss" scoped>
.plugin-preview-dialog {
  .preview-content {
    min-height: 400px;
  }

  .preview-description {
    margin-bottom: 24px;

    p {
      margin: 0;
      color: var(--el-text-color-secondary);
      font-size: 14px;
      line-height: 1.6;
    }
  }

  .preview-demo {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .upload-demo {
    width: 100%;
  }

  .editor-toolbar {
    display: flex;
    gap: 4px;
    padding: 8px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
  }

  .editor-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .default-preview {
    text-align: center;
    padding: 40px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>
