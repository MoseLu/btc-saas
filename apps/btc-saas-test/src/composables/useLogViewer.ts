import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { logApi, type LogEntry } from '@/services/log.api'

/**
 * 日志查看器逻辑层
 * 提供数据状态和业务方法
 */
export function useLogViewer() {
  // 响应式数据
  const searchQuery = ref('')
  const selectedLevel = ref('')
  const selectedScope = ref('')
  const isLoading = ref(false)
  const expandedContexts = ref<number[]>([])
  const logList = ref<HTMLElement>()

  // 计算属性
  const totalLogs = computed(() => logApi.getLogs())
  
  const availableScopes = computed(() => logApi.getScopes())
  
  const availableLevels = computed(() => logApi.getLogLevels())

  const filteredLogs = computed(() => {
    return logApi.filterLogs({
      level: selectedLevel.value,
      scope: selectedScope.value,
      searchQuery: searchQuery.value
    })
  })

  // 方法
  const refreshLogs = () => {
    isLoading.value = true
    setTimeout(() => {
      isLoading.value = false
      scrollToBottom()
    }, 100)
  }

  const clearLogs = () => {
    logApi.clearLogs()
    expandedContexts.value = []
    ElMessage.success('日志已清空')
  }

  const exportLogs = () => {
    logApi.exportLogs(filteredLogs.value)
    ElMessage.success('日志已导出')
  }

  const toggleContext = (ts: number) => {
    const index = expandedContexts.value.indexOf(ts)
    if (index > -1) {
      expandedContexts.value.splice(index, 1)
    } else {
      expandedContexts.value.push(ts)
    }
  }

  const scrollToBottom = async () => {
    await nextTick()
    if (logList.value) {
      logList.value.scrollTop = logList.value.scrollHeight
    }
  }

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleString()
  }

  // 生命周期
  onMounted(() => {
    scrollToBottom()
  })

  return {
    // 状态
    searchQuery,
    selectedLevel,
    selectedScope,
    isLoading,
    expandedContexts,
    logList,

    // 计算属性
    totalLogs,
    availableScopes,
    availableLevels,
    filteredLogs,

    // 方法
    refreshLogs,
    clearLogs,
    exportLogs,
    toggleContext,
    scrollToBottom,
    formatTimestamp
  }
}
