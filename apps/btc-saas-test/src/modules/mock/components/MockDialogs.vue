<template>
  <!-- Mock详情对话框 -->
  <el-dialog
    v-model="showMockDetail"
    title="Mock接口详情"
    width="600px"
  >
    <div v-if="selectedMock" class="mock-detail">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="接口名称">
          {{ selectedMock.name }}
        </el-descriptions-item>
        <el-descriptions-item label="请求路径">
          <code>{{ selectedMock.path }}</code>
        </el-descriptions-item>
        <el-descriptions-item label="HTTP方法">
          <el-tag :type="getMethodType(selectedMock.method)">
            {{ selectedMock.method }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="描述">
          {{ selectedMock.description }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="selectedMock.status === 'active' ? 'success' : 'warning'">
            {{ selectedMock.status === 'active' ? '活跃' : '待实现' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Mock延迟">
          {{ selectedMock.mockDelay || 0 }}ms
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </el-dialog>

  <!-- 测试对话框 -->
  <el-dialog
    v-model="showTestDialog"
    title="测试Mock接口"
    width="600px"
  >
    <div v-if="selectedEndpoint" class="test-dialog">
      <el-form :model="testForm" label-width="100px">
        <el-form-item label="接口">
          <div class="endpoint-info">
            <el-tag :type="getMethodType(selectedEndpoint.method)">
              {{ selectedEndpoint.method }}
            </el-tag>
            <code>{{ selectedEndpoint.path }}</code>
          </div>
        </el-form-item>
        
        <el-form-item label="请求参数">
          <el-input
            v-model="testForm.params"
            type="textarea"
            :rows="4"
            placeholder="请输入JSON格式的请求参数"
          />
        </el-form-item>
        
        <el-form-item label="请求头">
          <el-input
            v-model="testForm.headers"
            type="textarea"
            :rows="3"
            placeholder="请输入JSON格式的请求头"
          />
        </el-form-item>
      </el-form>
      
      <div v-if="testResult" class="test-result">
        <h4>测试结果</h4>
        <el-alert
          :title="testResult.success ? '请求成功' : '请求失败'"
          :type="testResult.success ? 'success' : 'error'"
          show-icon
        />
        <div class="result-content">
          <pre>{{ JSON.stringify(testResult.data, null, 2) }}</pre>
        </div>
      </div>
    </div>
    
    <template #footer>
      <el-button @click="showTestDialog = false">取消</el-button>
      <el-button type="primary" @click="executeTest" :loading="testing">
        执行测试
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { ApiEndpoint } from '../../data/apiData'

interface Props {
  showMockDetail: boolean
  showTestDialog: boolean
  selectedMock: ApiEndpoint | null
  selectedEndpoint: ApiEndpoint | null
}

interface Emits {
  'update:showMockDetail': [value: boolean]
  'update:showTestDialog': [value: boolean]
  'update:selectedMock': [value: ApiEndpoint | null]
  'update:selectedEndpoint': [value: ApiEndpoint | null]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 使用computed来处理v-model
const showMockDetail = computed({
  get: () => props.showMockDetail,
  set: (value) => emit('update:showMockDetail', value)
})

const showTestDialog = computed({
  get: () => props.showTestDialog,
  set: (value) => emit('update:showTestDialog', value)
})

const testForm = reactive({
  params: '',
  headers: ''
})

const testResult = ref<any>(null)
const testing = ref(false)

const getMethodType = (method: string) => {
  const types: Record<string, string> = {
    GET: 'success',
    POST: 'primary',
    PUT: 'warning',
    DELETE: 'danger',
    PATCH: 'info'
  }
  return types[method] || 'info'
}

const executeTest = async () => {
  if (!props.selectedEndpoint) return

  testing.value = true
  try {
    // 模拟API测试
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    testResult.value = {
      success: true,
      data: {
        message: 'Mock接口测试成功',
        endpoint: props.selectedEndpoint.name,
        method: props.selectedEndpoint.method,
        path: props.selectedEndpoint.path,
        timestamp: new Date().toISOString(),
        mockData: {
          id: 1,
          name: '测试数据',
          status: 'success'
        }
      }
    }
    
    ElMessage.success('测试完成')
  } catch (error) {
    testResult.value = {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }
    ElMessage.error('测试失败')
  } finally {
    testing.value = false
  }
}

// 监听props变化，重置表单
const resetTestForm = () => {
  if (props.selectedEndpoint) {
    testForm.params = ''
    testForm.headers = ''
    testResult.value = null
  }
}

// 监听selectedEndpoint变化
import { watch } from 'vue'
watch(() => props.selectedEndpoint, resetTestForm)
</script>

<style lang="scss" scoped>
@use '../../../assets/styles/variables.scss' as *;

.mock-detail {
  .el-descriptions {
    margin-top: $spacing-md;
  }
}

.test-dialog {
  .endpoint-info {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    
    code {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 13px;
      color: var(--el-text-color-regular);
      background: var(--el-fill-color-light);
      padding: 4px 8px;
      border-radius: 4px;
    }
  }
  
  .test-result {
    margin-top: $spacing-lg;
    
    h4 {
      margin: 0 0 $spacing-sm 0;
      color: var(--el-text-color-primary);
    }
    
    .result-content {
      margin-top: $spacing-sm;
      
      pre {
        background: var(--el-fill-color-light);
        padding: $spacing-md;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 12px;
        overflow-x: auto;
        color: var(--el-text-color-regular);
      }
    }
  }
}

/* 暗色模式适配 */
html.dark {
  .test-dialog .endpoint-info code {
    background: var(--el-bg-color-overlay);
    color: var(--el-text-color-regular);
  }
  
  .test-dialog .result-content pre {
    background: var(--el-bg-color-overlay);
    color: var(--el-text-color-regular);
  }
}
</style>
