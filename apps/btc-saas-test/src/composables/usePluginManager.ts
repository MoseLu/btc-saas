import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { pluginApi, type PluginInfo } from '../services/plugin.api'

/**
 * 插件管理逻辑层
 * 提供数据状态和业务方法
 */
export function usePluginManager() {
  // 响应式数据
  const pluginList = ref<PluginInfo[]>([])
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const isScanning = ref(false)
  const lastScanTime = ref<Date | null>(null)
  const previewVisible = ref(false)
  const currentPlugin = ref<PluginInfo | null>(null)
  const richtextContent = ref('')
  const showLogViewer = ref(false)

  // 计算属性
  const implementedPluginList = computed(() => pluginList.value)
  
  const enabledPluginsCount = computed(() => {
    return implementedPluginList.value.filter(plugin => plugin.enabled).length
  })
  
  const disabledPluginsCount = computed(() => {
    return implementedPluginList.value.filter(plugin => !plugin.enabled).length
  })

  const filteredPluginList = computed(() => {
    let filtered = implementedPluginList.value

    // 按搜索关键词过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(plugin => 
        plugin.name.toLowerCase().includes(query) ||
        plugin.displayName.toLowerCase().includes(query) ||
        plugin.description.toLowerCase().includes(query)
      )
    }

    // 按分类过滤
    if (selectedCategory.value) {
      filtered = filtered.filter(plugin => plugin.category === selectedCategory.value)
    }

    return filtered
  })

  const pluginCategories = computed(() => {
    const categories = new Set(implementedPluginList.value.map(plugin => plugin.category))
    return Array.from(categories)
  })

  // 方法
  const startScan = async () => {
    isScanning.value = true
    try {
      const plugins = await pluginApi.scanPlugins()
      pluginList.value = plugins
      lastScanTime.value = pluginApi.getLastScanTime()
      ElMessage.success(`扫描完成，发现 ${plugins.length} 个插件`)
    } catch (error) {
      ElMessage.error('插件扫描失败')
      console.error('扫描失败:', error)
    } finally {
      isScanning.value = false
    }
  }

  const togglePlugin = (pluginName: string, enabled: boolean) => {
    pluginApi.togglePlugin(pluginName, enabled)
    ElMessage.success(`插件 "${pluginName}" 已${enabled ? '启用' : '禁用'}`)
  }

  const openPluginPreview = (plugin: PluginInfo) => {
    currentPlugin.value = plugin
    previewVisible.value = true
  }

  const enablePluginFromPreview = () => {
    if (currentPlugin.value) {
      togglePlugin(currentPlugin.value.name, true)
      currentPlugin.value.enabled = true
      ElMessage.success(`插件 "${currentPlugin.value.displayName}" 已启用`)
    }
  }

  const closePreview = () => {
    previewVisible.value = false
    currentPlugin.value = null
  }

  const closeLogViewer = () => {
    showLogViewer.value = false
  }

  const clearContent = () => {
    richtextContent.value = ''
    ElMessage.success('内容已清空')
  }

  const saveContent = () => {
    ElMessage.success('内容已保存')
  }

  // 获取状态类型
  const getStatusType = (status: string) => {
    const types: Record<string, string> = {
      active: 'success',
      inactive: 'info',
      error: 'danger',
      warning: 'warning'
    }
    return types[status] || 'info'
  }

  // 获取分类名称
  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      'code-generation': '代码生成',
      'editor': '编辑器',
      'converter': '转换器',
      'ui': 'UI组件',
      'bridge': '桥接服务',
      'logging': '日志系统',
      'development': '开发工具',
      'documentation': '文档管理'
    }
    return categories[category] || category
  }

  // 监听插件状态变更
  const handlePluginStatusChange = (event: CustomEvent) => {
    const { pluginName, enabled } = event.detail
    
    // 更新本地插件列表中的状态
    const plugin = pluginList.value.find(p => p.name === pluginName)
    if (plugin) {
      plugin.enabled = enabled
      plugin.status = enabled ? 'active' : 'inactive'
    }
  }

  // 生命周期
  onMounted(() => {
    // 监听插件状态变更事件
    pluginApi.onStatusChange(handlePluginStatusChange)
    
    // 初始化时自动扫描一次
    startScan()
  })

  onUnmounted(() => {
    // 移除事件监听
    pluginApi.offStatusChange(handlePluginStatusChange)
  })

  return {
    // 状态
    searchQuery,
    selectedCategory,
    isScanning,
    lastScanTime,
    previewVisible,
    currentPlugin,
    richtextContent,
    showLogViewer,

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
    closeLogViewer,
    clearContent,
    saveContent,
    getStatusType,
    getCategoryName
  }
}
