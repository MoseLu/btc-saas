import { ref, reactive, computed } from 'vue'

export interface PluginInfo {
  id: string
  name: string
  version: string
  description: string
  status: 'active' | 'inactive' | 'error'
  enabled: boolean
  config?: Record<string, any>
}

export function usePluginManager() {
  // 状态
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const isScanning = ref(false)
  const lastScanTime = ref<Date | null>(null)
  const previewVisible = ref(false)
  const currentPlugin = ref<any>(null)

  // 模拟插件数据
  const implementedPluginList = ref([
    {
      name: 'pdf2png',
      displayName: 'PDF转PNG',
      version: '1.0.0',
      description: '将PDF文件转换为PNG图片',
      category: 'converter',
      enabled: true,
      author: 'BTC Team',
      path: '/plugins/pdf2png',
      icon: 'Document',
      features: ['PDF转PNG', '批量转换', '高质量输出']
    },
    {
      name: 'richtext',
      displayName: '富文本编辑器',
      version: '1.2.0',
      description: '提供富文本编辑功能',
      category: 'editor',
      enabled: true,
      author: 'BTC Team',
      path: '/plugins/richtext',
      icon: 'Edit',
      features: ['富文本编辑', '图片上传', '表格支持']
    },
    {
      name: 'chart',
      displayName: '图表组件',
      version: '0.9.1',
      description: '数据可视化图表组件',
      category: 'visualization',
      enabled: false,
      author: 'BTC Team',
      path: '/plugins/chart',
      icon: 'Picture',
      features: ['柱状图', '折线图', '饼图']
    },
    {
      name: 'code-highlight',
      displayName: '代码高亮',
      version: '1.1.0',
      description: '代码语法高亮显示',
      category: 'developer',
      enabled: true,
      author: 'BTC Team',
      path: '/plugins/code-highlight',
      icon: 'Cpu',
      features: ['语法高亮', '多语言支持', '主题切换']
    }
  ])

  // 计算属性
  const enabledPluginsCount = computed(() => 
    implementedPluginList.value.filter(p => p.enabled).length
  )

  const disabledPluginsCount = computed(() => 
    implementedPluginList.value.filter(p => !p.enabled).length
  )

  const filteredPluginList = computed(() => {
    let filtered = implementedPluginList.value

    // 搜索过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(plugin => 
        plugin.displayName.toLowerCase().includes(query) ||
        plugin.description.toLowerCase().includes(query) ||
        plugin.author.toLowerCase().includes(query)
      )
    }

    // 分类过滤
    if (selectedCategory.value) {
      filtered = filtered.filter(plugin => plugin.category === selectedCategory.value)
    }

    return filtered
  })

  const pluginCategories = computed(() => {
    const categories = new Set(implementedPluginList.value.map(p => p.category))
    return Array.from(categories).map(category => ({
      value: category,
      label: getCategoryName(category)
    }))
  })

  // 方法
  const startScan = async () => {
    isScanning.value = true
    try {
      // 模拟扫描过程
      await new Promise(resolve => setTimeout(resolve, 2000))
      lastScanTime.value = new Date()
    } finally {
      isScanning.value = false
    }
  }

  const togglePlugin = async (pluginName: string, enabled: boolean) => {
    const plugin = implementedPluginList.value.find(p => p.name === pluginName)
    if (plugin) {
      plugin.enabled = enabled
    }
  }

  const openPluginPreview = (plugin: any) => {
    currentPlugin.value = plugin
    previewVisible.value = true
  }

  const enablePluginFromPreview = () => {
    if (currentPlugin.value) {
      togglePlugin(currentPlugin.value.name, true)
      closePreview()
    }
  }

  const closePreview = () => {
    previewVisible.value = false
    currentPlugin.value = null
  }

  const getStatusType = (enabled: boolean) => {
    return enabled ? 'success' : 'warning'
  }

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      converter: '转换器',
      editor: '编辑器',
      visualization: '可视化',
      developer: '开发工具'
    }
    return names[category] || category
  }

  return {
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
  }
}
