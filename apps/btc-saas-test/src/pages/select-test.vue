<template>
  <div class="select-test-page">
    <h1>El-Select 主题切换稳定性测试</h1>
    <p>这个页面用于测试 el-select 组件在主题切换时是否保持稳定</p>
    
    <!-- 主题切换按钮 -->
    <div class="theme-toggle-section">
      <h3>主题切换测试</h3>
      <button @click="toggleTheme" class="theme-btn">
        {{ isDark ? '切换到亮色主题' : '切换到暗色主题' }}
      </button>
      <span class="current-theme">当前主题: {{ currentTheme }}</span>
    </div>

    <!-- 基础选择器测试 -->
    <div class="test-section">
      <h3>基础选择器测试</h3>
      <el-select v-model="value1" placeholder="请选择一个选项" style="width: 300px;">
        <el-option label="选项1" value="1" />
        <el-option label="选项2" value="2" />
        <el-option label="选项3" value="3" />
      </el-select>
    </div>

    <!-- 多选选择器测试 -->
    <div class="test-section">
      <h3>多选选择器测试</h3>
      <el-select v-model="value2" multiple placeholder="请选择多个选项" style="width: 300px;">
        <el-option label="多选1" value="1" />
        <el-option label="多选2" value="2" />
        <el-option label="多选3" value="3" />
        <el-option label="多选4" value="4" />
      </el-select>
    </div>

    <!-- 可搜索选择器测试 -->
    <div class="test-section">
      <h3>可搜索选择器测试</h3>
      <el-select v-model="value3" filterable placeholder="请输入搜索关键词" style="width: 300px;">
        <el-option label="搜索选项1" value="1" />
        <el-option label="搜索选项2" value="2" />
        <el-option label="搜索选项3" value="3" />
        <el-option label="搜索选项4" value="4" />
        <el-option label="搜索选项5" value="5" />
      </el-select>
    </div>

    <!-- 带图标的选择器测试 -->
    <div class="test-section">
      <h3>带图标的选择器测试</h3>
      <el-select v-model="value4" placeholder="选择操作类型" style="width: 300px;">
        <el-option label="编辑" value="edit">
          <span style="float: left">
            <el-icon><Edit /></el-icon>
          </span>
          <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">编辑</span>
        </el-option>
        <el-option label="删除" value="delete">
          <span style="float: left">
            <el-icon><Delete /></el-icon>
          </span>
          <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">删除</span>
        </el-option>
      </el-select>
    </div>

    <!-- 不同尺寸的选择器测试 -->
    <div class="test-section size-demo">
      <h3>不同尺寸的选择器测试</h3>
      <el-select v-model="value5" placeholder="大尺寸" size="large" style="width: 200px; margin-right: 20px;">
        <el-option label="大尺寸选项" value="large" />
      </el-select>
      <el-select v-model="value5" placeholder="默认尺寸" style="width: 200px; margin-right: 20px;">
        <el-option label="默认尺寸选项" value="default" />
      </el-select>
      <el-select v-model="value5" placeholder="小尺寸" size="small" style="width: 200px;">
        <el-option label="小尺寸选项" value="small" />
      </el-select>
    </div>

    <!-- 禁用状态的选择器测试 -->
    <div class="test-section">
      <h3>禁用状态的选择器测试</h3>
      <el-select v-model="value6" disabled placeholder="禁用状态" style="width: 300px;">
        <el-option label="禁用选项" value="disabled" />
      </el-select>
    </div>

    <!-- 加载状态的选择器测试 -->
    <div class="test-section">
      <h3>加载状态的选择器测试</h3>
      <el-select v-model="value7" loading placeholder="加载中..." style="width: 300px;">
        <el-option label="加载选项" value="loading" />
      </el-select>
    </div>

    <!-- 远程搜索选择器测试 -->
    <div class="test-section">
      <h3>远程搜索选择器测试</h3>
      <el-select
        v-model="value8"
        filterable
        remote
        reserve-keyword
        placeholder="请输入关键词"
        :remote-method="remoteMethod"
        :loading="loading"
        style="width: 300px;"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>

    <!-- 测试结果展示 -->
    <div class="test-results">
      <h3>测试结果</h3>
      <div class="result-item">
        <strong>基础选择器值:</strong> {{ value1 || '未选择' }}
      </div>
      <div class="result-item">
        <strong>多选选择器值:</strong> {{ value2.length > 0 ? value2.join(', ') : '未选择' }}
      </div>
      <div class="result-item">
        <strong>可搜索选择器值:</strong> {{ value3 || '未选择' }}
      </div>
      <div class="result-item">
        <strong>带图标选择器值:</strong> {{ value4 || '未选择' }}
      </div>
      <div class="result-item">
        <strong>尺寸测试选择器值:</strong> {{ value5 || '未选择' }}
      </div>
      <div class="result-item">
        <strong>禁用状态选择器值:</strong> {{ value6 || '未选择' }}
      </div>
      <div class="result-item">
        <strong>加载状态选择器值:</strong> {{ value7 || '未选择' }}
      </div>
      <div class="result-item">
        <strong>远程搜索选择器值:</strong> {{ value8 || '未选择' }}
      </div>
    </div>

    <!-- 主题切换历史记录 -->
    <div class="theme-history">
      <h3>主题切换历史</h3>
      <div class="history-list">
        <div v-for="(record, index) in themeHistory" :key="index" class="history-item">
          <span class="timestamp">{{ record.timestamp }}</span>
          <span class="theme-change">{{ record.from }} → {{ record.to }}</span>
          <span class="duration">耗时: {{ record.duration }}ms</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import { useThemeToggle } from '../composables/usePerfectTheme'

// 使用主题切换组合式API
const { isDark, currentTheme, toggle } = useThemeToggle()

// 选择器值
const value1 = ref('')
const value2 = ref<string[]>([])
const value3 = ref('')
const value4 = ref('')
const value5 = ref('')
const value6 = ref('')
const value7 = ref('')
const value8 = ref('')

// 远程搜索相关
const loading = ref(false)
const options = ref<Array<{ value: string; label: string }>>([])

// 主题切换历史记录
const themeHistory = ref<Array<{
  timestamp: string
  from: string
  to: string
  duration: number
}>>([])

// 远程搜索方法
const remoteMethod = (query: string) => {
  if (query !== '') {
    loading.value = true
    setTimeout(() => {
      loading.value = false
      options.value = [
        { value: query + '1', label: query + '选项1' },
        { value: query + '2', label: query + '选项2' },
        { value: query + '3', label: query + '选项3' }
      ]
    }, 200)
  } else {
    options.value = []
  }
}

// 主题切换方法
const toggleTheme = async () => {
  const startTime = Date.now()
  const fromTheme = currentTheme.value
  
  try {
    await toggle()
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    // 记录主题切换历史
    themeHistory.value.unshift({
      timestamp: new Date().toLocaleTimeString(),
      from: fromTheme,
      to: currentTheme.value,
      duration
    })
    
    // 限制历史记录数量
    if (themeHistory.value.length > 10) {
      themeHistory.value = themeHistory.value.slice(0, 10)
    }
  } catch (error) {
    console.error('主题切换失败:', error)
  }
}

// 页面加载时初始化
onMounted(() => {
  // 初始化远程搜索选项
  options.value = [
    { value: 'init1', label: '初始选项1' },
    { value: 'init2', label: '初始选项2' },
    { value: 'init3', label: '初始选项3' }
  ]
})
</script>

<style scoped>
.select-test-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.theme-toggle-section {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;
}

.theme-btn {
  background: var(--el-color-primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  margin-right: 20px;
  transition: background-color 0.3s;
}

.theme-btn:hover {
  background: var(--el-color-primary-hover);
}

.current-theme {
  font-size: 16px;
  color: var(--el-text-color-regular);
}

.test-section {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.test-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--el-text-color-primary);
}

.size-demo .el-select {
  margin-bottom: 10px;
}

.test-results {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.result-item {
  margin-bottom: 10px;
  padding: 8px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}

.result-item strong {
  color: var(--el-text-color-primary);
  margin-right: 10px;
}

.theme-history {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  padding: 20px;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  margin-bottom: 8px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  font-size: 14px;
}

.timestamp {
  color: var(--el-text-color-secondary);
  font-family: monospace;
}

.theme-change {
  color: var(--el-color-primary);
  font-weight: bold;
}

.duration {
  color: var(--el-text-color-regular);
  font-family: monospace;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .select-test-page {
    padding: 15px;
  }
  
  .theme-toggle-section {
    padding: 15px;
  }
  
  .theme-btn {
    display: block;
    width: 100%;
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .size-demo .el-select {
    width: 100% !important;
    margin-right: 0 !important;
  }
  
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>
