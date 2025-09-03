<template>
  <div class="log-viewer">
    <div class="log-header">
      <div class="log-controls">
        <el-input
          v-model="searchQuery"
          placeholder="搜索日志..."
          clearable
          @input="handleSearch"
          class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select v-model="selectedLevel" placeholder="日志级别" @change="handleSearch" class="level-select">
          <el-option label="全部" value="" />
          <el-option label="DEBUG" value="DEBUG" />
          <el-option label="INFO" value="INFO" />
          <el-option label="WARN" value="WARN" />
          <el-option label="ERROR" value="ERROR" />
        </el-select>
        
        <el-select v-model="selectedScope" placeholder="作用域" @change="handleSearch" class="scope-select">
          <el-option label="全部" value="" />
          <el-option v-for="scope in availableScopes" :key="scope" :label="scope" :value="scope" />
        </el-select>
        
        <el-button type="primary" @click="refreshLogs" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        
        <el-button @click="clearLogs" type="danger">
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
        
        <el-button @click="exportLogs" type="success">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        
        <!-- 测试 ElMessage 按钮 -->
        <el-button @click="simpleTest" type="info">
          <el-icon><Message /></el-icon>
          测试消息
        </el-button>
      </div>
    </div>

    <div class="log-content">
             <div class="log-stats">
         <el-tag type="info">总数: {{ totalLogs }}</el-tag>
         <el-tag type="success">INFO: {{ levelCounts.INFO }}</el-tag>
         <el-tag type="warning">WARN: {{ levelCounts.WARN }}</el-tag>
         <el-tag type="danger">ERROR: {{ levelCounts.ERROR }}</el-tag>
         <el-tag type="info">DEBUG: {{ levelCounts.DEBUG }}</el-tag>
         
         <!-- 存储信息 -->
         <el-tag 
           :type="getStorageTagType(storageInfo.percentage)" 
           class="storage-tag"
         >
           存储: {{ storageInfo.used }}MB / {{ storageInfo.total }}MB ({{ storageInfo.percentage }}%)
         </el-tag>
         
         <!-- 手动清理按钮 -->
         <el-button 
           type="warning" 
           size="small" 
           @click="manualCleanup"
           :loading="cleanupLoading"
         >
           <el-icon><Delete /></el-icon>
           智能清理
         </el-button>
       </div>

      <el-table
        :data="filteredLogs"
        style="width: 100%"
        :row-class-name="getRowClassName"
        :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)' }"
        :cell-style="{ padding: '12px 0' }"
        stripe
        border
        size="large"
        max-height="calc(100vh - 300px)"
        @row-click="handleRowClick"
      >
        <el-table-column prop="ts" label="时间" width="180" sortable>
          <template #default="{ row }">
            <span class="timestamp">{{ formatTimestamp(row.ts) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="level" label="级别" width="100" sortable>
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)" size="small" effect="dark">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="scope" label="作用域" width="120" sortable>
          <template #default="{ row }">
            <el-tag type="info" size="small" effect="plain">
              {{ row.scope }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="msg" label="消息" min-width="300">
          <template #default="{ row }">
            <div class="message-cell">
              <span class="message-text">{{ row.msg }}</span>
              <el-button
                v-if="row.ctx && Object.keys(row.ctx).length > 0"
                type="text"
                size="small"
                @click.stop="toggleContext(row.ts)"
                style="margin-left: 8px;"
              >
                {{ expandedContexts.has(row.ts) ? '隐藏' : '查看' }} 上下文
              </el-button>
            </div>
            <div v-if="expandedContexts.has(row.ts) && row.ctx" class="context-details">
              <el-card shadow="never" style="margin-top: 8px;">
                <template #header>
                  <span style="font-size: 12px; color: var(--el-text-color-regular);">上下文信息</span>
                </template>
                <pre class="context-json">{{ JSON.stringify(row.ctx, null, 2) }}</pre>
              </el-card>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              type="text"
              size="small"
              @click.stop="copyLog(row)"
            >
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="filteredLogs.length === 0" class="no-logs">
        <el-empty description="暂无日志记录" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete, Download, CopyDocument, Message } from '@element-plus/icons-vue'
// 本地定义 LogRecord 类型，避免导入问题
interface LogRecord {
  id: string
  level: 'error' | 'debug' | 'info' | 'warn'
  message: string
  timestamp: Date
  data?: any
  context?: Record<string, any>
  // 兼容旧版本的字段
  ts?: number
  scope?: string
  msg?: string
  ctx?: Record<string, any>
}

// 响应式数据
const searchQuery = ref('')
const selectedLevel = ref('')
const selectedScope = ref('')
const loading = ref(false)
const cleanupLoading = ref(false)
const logs = ref<LogRecord[]>([])
const filteredLogs = ref<LogRecord[]>([])
const expandedContexts = ref(new Set<number>())
const logListRef = ref<HTMLElement>()
const storageInfo = ref({ used: 0, total: 100, percentage: 0 })

// 统计数据
const totalLogs = computed(() => logs.value.length)
const levelCounts = computed(() => {
  const counts = { DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0 }
  if (Array.isArray(logs.value)) {
    logs.value.forEach(log => {
      if (log && log.level) {
        counts[log.level as keyof typeof counts]++
      }
    })
  }
  return counts
})

const availableScopes = computed(() => {
  const scopes = new Set<string>()
  if (Array.isArray(logs.value)) {
    logs.value.forEach(log => {
      if (log && log.scope) {
        scopes.add(log.scope)
      }
    })
  }
  return Array.from(scopes).sort()
})

// 获取IndexedDB传输器
let idbTransport: any = null

onMounted(async () => {
  await initializeLogViewer()
})

// 页面卸载时清理所有ElMessage
onBeforeUnmount(() => {
  // 清理所有ElMessage实例
  const messageContainers = document.querySelectorAll('.el-message')
  messageContainers.forEach(container => {
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })
  
  // 清理所有ElMessageBox实例
  const messageBoxContainers = document.querySelectorAll('.el-message-box__wrapper')
  messageBoxContainers.forEach(container => {
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })
})



async function initializeLogViewer() {
  try {
    // 动态导入日志传输器
    const { createIDBTransport } = await import('@btc/logs')
    idbTransport = await createIDBTransport()
    await refreshLogs()
  } catch (error) {
    console.error('初始化日志查看器失败:', error)
    ElMessage.error('初始化日志查看器失败')
  }
}

async function refreshLogs() {
  if (!idbTransport) {
    ElMessage.warning('日志传输器未初始化')
    return
  }

  loading.value = true
  try {
    const exportedLogs = await idbTransport.export()
    
    // 确保返回的是数组
    if (Array.isArray(exportedLogs)) {
      logs.value = exportedLogs
    } else {
      console.warn('IndexedDB返回的数据不是数组:', exportedLogs)
      logs.value = []
    }
    
    // 更新存储信息
    await updateStorageInfo()
    
    applyFilters()
    ElMessage.success(`成功加载 ${logs.value.length} 条日志记录`)
  } catch (error) {
    console.error('加载日志失败:', error)
    ElMessage.error('加载日志失败')
    logs.value = []
  } finally {
    loading.value = false
  }
}

// 更新存储信息
async function updateStorageInfo() {
  if (!idbTransport) return
  
  try {
    const info = await idbTransport.getStorageInfo()
    storageInfo.value = info
  } catch (error) {
    console.error('获取存储信息失败:', error)
  }
}

// 手动智能清理
async function manualCleanup() {
  if (!idbTransport) {
    ElMessage.warning('日志传输器未初始化')
    return
  }

  cleanupLoading.value = true
  try {
    const result = await idbTransport.cleanup()
    if (result.removed > 0) {
      ElMessage.success(`智能清理完成: ${result.reason}`)
      await refreshLogs() // 刷新日志列表
    } else {
      ElMessage.info('无需清理，存储状态良好')
    }
  } catch (error) {
    console.error('智能清理失败:', error)
    ElMessage.error('智能清理失败')
  } finally {
    cleanupLoading.value = false
  }
}

async function clearLogs() {
  try {
    await ElMessageBox.confirm('确定要清空所有日志记录吗？此操作不可恢复。', '确认清空', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    if (!idbTransport) {
      ElMessage.warning('日志传输器未初始化')
      return
    }

    await idbTransport.clear()
    logs.value = []
    filteredLogs.value = []
    ElMessage.success('日志已清空')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空日志失败:', error)
      ElMessage.error('清空日志失败')
    }
  }
}

async function exportLogs() {
  try {
    const exportData = {
      timestamp: new Date().toISOString(),
      total: logs.value.length,
      logs: logs.value
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `btc-logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    ElMessage.success('日志导出成功')
  } catch (error) {
    console.error('导出日志失败:', error)
    ElMessage.error('导出日志失败')
  }
}

function handleSearch() {
  applyFilters()
}

function applyFilters() {
  if (!Array.isArray(logs.value)) {
    filteredLogs.value = []
    return
  }

  let filtered = [...logs.value]

  // 按级别过滤
  if (selectedLevel.value) {
    filtered = filtered.filter(log => log && log.level === selectedLevel.value)
  }

  // 按作用域过滤
  if (selectedScope.value) {
    filtered = filtered.filter(log => log && log.scope === selectedScope.value)
  }

  // 按搜索关键词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(log => 
      log && (
        ((log.msg || log.message) && (log.msg || log.message).toLowerCase().includes(query)) ||
        ((log.scope || log.context?.scope) && (log.scope || log.context?.scope).toLowerCase().includes(query)) ||
        ((log.ctx || log.context) && JSON.stringify(log.ctx || log.context).toLowerCase().includes(query))
      )
    )
  }

  // 按时间倒序排列
  filtered.sort((a, b) => (b?.ts || b?.timestamp?.getTime() || 0) - (a?.ts || a?.timestamp?.getTime() || 0))
  
  filteredLogs.value = filtered
}

function toggleContext(timestamp: number) {
  if (expandedContexts.value.has(timestamp)) {
    expandedContexts.value.delete(timestamp)
  } else {
    expandedContexts.value.add(timestamp)
  }
}

function handleRowClick(row: LogRecord) {
  // 点击行时的处理
}

function getRowClassName({ row }: { row: LogRecord }) {
  if (row.level === 'error') {
    return 'error-row'
  } else if (row.level === 'warn') {
    return 'warn-row'
  }
  return ''
}

function copyLog(log: LogRecord) {
  try {
    const logText = `[${formatTimestamp(log.ts || log.timestamp.getTime())}] [${log.level}] [${log.scope || 'unknown'}] ${log.msg || log.message}`
    navigator.clipboard.writeText(logText).then(() => {
      ElMessage.success('日志已复制到剪贴板')
    })
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

function getLevelType(level: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  const types: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    debug: 'info',
    info: 'success',
    warn: 'warning',
    error: 'danger'
  }
  return types[level] || 'info'
}

function getStorageTagType(percentage: number): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  if (percentage >= 80) return 'danger'
  if (percentage >= 60) return 'warning'
  return 'success'
}

function simpleTest() {
  try {
    // 简单的测试消息
    console.log('开始简单测试')
    
    // 测试基本显示
    ElMessage.success('简单测试成功')
    console.log('简单测试成功消息已发送')
    
    // 检查 DOM 中是否有 ElMessage
    setTimeout(() => {
      const messages = document.querySelectorAll('.el-message')
      console.log('DOM 中的 ElMessage 数量:', messages.length)
      messages.forEach((msg, index) => {
        console.log(`消息 ${index + 1}:`, msg)
        console.log('样式:', msg.getAttribute('style'))
        console.log('类名:', msg.className)
      })
    }, 100)
    
  } catch (error) {
    console.error('简单测试失败:', error)
  }
}

// 移除可能干扰的动画强制函数，让 ElMessage 使用原生动画
// 在页面挂载时不再启动动画监听
</script>

<style scoped lang="scss">
.log-viewer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
}

.log-header {
  padding: 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color-page);
  
  h2 {
    margin: 0 0 16px 0;
    color: var(--el-text-color-primary);
  }
  
  .log-controls {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .search-input {
    width: 300px;
    margin-right: 16px;
    
    // 修复双层边框问题
    :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px var(--el-border-color) inset;
      
      &.is-focus {
        box-shadow: 0 0 0 1px var(--el-color-primary) inset;
      }
      
      &:hover {
        box-shadow: 0 0 0 1px var(--el-border-color-hover) inset;
      }
    }
    
    :deep(.el-input__inner) {
      border: none;
      outline: none;
      box-shadow: none;
    }
  }

  .level-select {
    width: 120px;
    margin-right: 16px;
  }

  .scope-select {
    width: 150px;
    margin-right: 16px;
  }
}

.log-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px;
}

.log-stats {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.storage-tag {
  font-weight: 500;
  min-width: 200px;
  text-align: center;
}

.timestamp {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.message-cell {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.message-text {
  flex: 1;
  word-break: break-word;
  line-height: 1.5;
  color: var(--el-text-color-primary);
}

.context-details {
  margin-top: 8px;
}

.context-json {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 11px;
  color: var(--el-text-color-regular);
  white-space: pre-wrap;
  word-break: break-word;
  background: var(--el-fill-color-lighter);
  padding: 8px;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.no-logs {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 表格行样式
:deep(.error-row) {
  background-color: var(--el-color-danger-light-9) !important;
  
  &:hover {
    background-color: var(--el-color-danger-light-8) !important;
  }
}

:deep(.warn-row) {
  background-color: var(--el-color-warning-light-9) !important;
  
  &:hover {
    background-color: var(--el-color-warning-light-8) !important;
  }
}

// 表格样式优化
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-table__header) {
  background: var(--el-fill-color-light);
}

:deep(.el-table__row) {
  transition: background-color 0.2s;
}

:deep(.el-table__row:hover) {
  background-color: var(--el-fill-color-light) !important;
}

  @media (max-width: 768px) {
    .log-controls {
      flex-direction: column;
      align-items: stretch;
      
      .search-input,
      .level-select,
      .scope-select {
        width: 100% !important;
        margin-right: 0 !important;
        margin-bottom: 8px;
      }
    }
    
    .log-content {
      padding: 16px;
    }
  }
</style>
