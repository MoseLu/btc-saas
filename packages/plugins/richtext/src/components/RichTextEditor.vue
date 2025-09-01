<template>
  <div class="richtext-editor">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>富文本编辑器</span>
          <div class="toolbar">
            <el-button-group>
              <el-button @click="execCommand('bold')" :type="isActive('bold') ? 'primary' : ''">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button @click="execCommand('italic')" :type="isActive('italic') ? 'primary' : ''">
                <el-icon><Document /></el-icon>
              </el-button>
              <el-button @click="execCommand('underline')" :type="isActive('underline') ? 'primary' : ''">
                <el-icon><Link /></el-icon>
              </el-button>
            </el-button-group>
            
            <el-button-group>
              <el-button @click="execCommand('justifyLeft')">
                <el-icon><ArrowLeft /></el-icon>
              </el-button>
              <el-button @click="execCommand('justifyCenter')">
                <el-icon><Sort /></el-icon>
              </el-button>
              <el-button @click="execCommand('justifyRight')">
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </el-button-group>
            
            <el-select v-model="fontSize" @change="setFontSize" style="width: 80px">
              <el-option label="12px" value="12px" />
              <el-option label="14px" value="14px" />
              <el-option label="16px" value="16px" />
              <el-option label="18px" value="18px" />
              <el-option label="20px" value="20px" />
              <el-option label="24px" value="24px" />
            </el-select>
            
            <el-color-picker v-model="textColor" @change="setTextColor" />
          </div>
        </div>
      </template>
      
      <div class="editor-container">
        <div
          ref="editorRef"
          class="editor-content"
          contenteditable="true"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          v-html="content"
        ></div>
      </div>
      
      <div class="editor-footer">
        <el-button @click="clearContent">清空</el-button>
        <el-button @click="getContent">获取内容</el-button>
        <el-button type="primary" @click="saveContent">保存</el-button>
      </div>
    </el-card>
    
    <!-- 内容预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="内容预览"
      width="800px"
    >
      <div v-html="content" class="content-preview"></div>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" @click="copyContent">复制内容</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Edit, Document, Link, ArrowLeft, ArrowRight, Sort } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const editorRef = ref<HTMLElement>();
const content = ref('<p>开始编辑您的文档...</p>');
const fontSize = ref('16px');
const textColor = ref('#000000');
const previewVisible = ref(false);

let isEditorFocused = false;

onMounted(() => {
  if (editorRef.value) {
    editorRef.value.focus();
  }
});

onUnmounted(() => {
  // 清理工作
});

const execCommand = (command: string, value?: string) => {
  document.execCommand(command, false, value);
  if (editorRef.value) {
    editorRef.value.focus();
  }
};

const isActive = (command: string): boolean => {
  return document.queryCommandState(command);
};

const setFontSize = (size: string) => {
  execCommand('fontSize', size);
};

const setTextColor = (color: string) => {
  execCommand('foreColor', color);
};

const handleInput = () => {
  if (editorRef.value) {
    content.value = editorRef.value.innerHTML;
  }
};

const handleFocus = () => {
  isEditorFocused = true;
};

const handleBlur = () => {
  isEditorFocused = false;
};

const clearContent = () => {
  content.value = '<p></p>';
  if (editorRef.value) {
    editorRef.value.innerHTML = content.value;
  }
  ElMessage.success('内容已清空');
};

const getContent = () => {
  previewVisible.value = true;
};

const saveContent = () => {
  // 这里可以实现保存逻辑
  ElMessage.success('内容已保存');
};

const copyContent = () => {
  navigator.clipboard.writeText(content.value).then(() => {
    ElMessage.success('内容已复制到剪贴板');
  }).catch(() => {
    ElMessage.error('复制失败');
  });
};
</script>

<style scoped>
.richtext-editor {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
}

.editor-container {
  margin: 20px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.editor-content {
  min-height: 300px;
  padding: 16px;
  outline: none;
  line-height: 1.6;
}

.editor-content:focus {
  border-color: #409eff;
}

.editor-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 16px;
}

.content-preview {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 4px;
  background: #f9f9f9;
}
</style>
