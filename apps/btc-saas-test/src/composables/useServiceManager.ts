import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { serviceApi, type ServiceInfo, type ServiceStats } from '../services/service.api'

/**
 * 服务管理逻辑层
 * 提供数据状态和业务方法
 */
export function useServiceManager() {
  // 响应式数据
  const serviceList = ref<ServiceInfo[]>([])
  const searchQuery = ref('')
  const selectedStatus = ref('')
  const isRefreshing = ref(false)

  // 计算属性
  const serviceStats = computed((): ServiceStats => {
    const total = serviceList.value.length
    const active = serviceList.value.filter(s => s.status === 'active').length
    const inactive = serviceList.value.filter(s => s.status === 'inactive').length
    const error = serviceList.value.filter(s => s.status === 'error').length
    
    return { total, active, inactive, error }
  })

  const filteredServiceList = computed(() => {
    let filtered = serviceList.value

    // 按搜索关键词过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(query) ||
        service.displayName.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
      )
    }

    // 按状态过滤
    if (selectedStatus.value) {
      filtered = filtered.filter(service => service.status === selectedStatus.value)
    }

    return filtered
  })

  const serviceStatuses = computed(() => {
    const statuses = new Set(serviceList.value.map(service => service.status))
    return Array.from(statuses)
  })

  // 方法
  const loadServices = async () => {
    try {
      const services = await serviceApi.getServices()
      serviceList.value = services
    } catch (error) {
      ElMessage.error('加载服务列表失败')
      console.error('加载服务失败:', error)
    }
  }

  const refreshServices = async () => {
    isRefreshing.value = true
    try {
      const services = await serviceApi.refreshServices()
      serviceList.value = services
      ElMessage.success('服务状态已刷新')
    } catch (error) {
      ElMessage.error('刷新服务状态失败')
      console.error('刷新服务失败:', error)
    } finally {
      isRefreshing.value = false
    }
  }

  const startService = async (serviceName: string) => {
    try {
      await serviceApi.startService(serviceName)
      await loadServices() // 重新加载服务列表以获取最新状态
      ElMessage.success(`服务 "${serviceName}" 已启动`)
    } catch (error) {
      ElMessage.error(`启动服务 "${serviceName}" 失败`)
      console.error('启动服务失败:', error)
    }
  }

  const stopService = async (serviceName: string) => {
    try {
      await serviceApi.stopService(serviceName)
      await loadServices() // 重新加载服务列表以获取最新状态
      ElMessage.success(`服务 "${serviceName}" 已停止`)
    } catch (error) {
      ElMessage.error(`停止服务 "${serviceName}" 失败`)
      console.error('停止服务失败:', error)
    }
  }

  const startAllServices = async () => {
    try {
      await serviceApi.startAllServices()
      await loadServices() // 重新加载服务列表以获取最新状态
      ElMessage.success('所有服务已启动')
    } catch (error) {
      ElMessage.error('启动所有服务失败')
      console.error('启动所有服务失败:', error)
    }
  }

  const stopAllServices = async () => {
    try {
      await serviceApi.stopAllServices()
      await loadServices() // 重新加载服务列表以获取最新状态
      ElMessage.success('所有服务已停止')
    } catch (error) {
      ElMessage.error('停止所有服务失败')
      console.error('停止所有服务失败:', error)
    }
  }

  // 获取状态文本
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      active: '运行中',
      inactive: '已停止',
      error: '异常'
    }
    return statusMap[status] || status
  }

  // 获取状态类型
  const getStatusType = (status: string) => {
    const typeMap: Record<string, string> = {
      active: 'success',
      inactive: 'info',
      error: 'danger'
    }
    return typeMap[status] || 'info'
  }

  return {
    // 状态
    serviceList,
    searchQuery,
    selectedStatus,
    isRefreshing,

    // 计算属性
    serviceStats,
    filteredServiceList,
    serviceStatuses,

    // 方法
    loadServices,
    refreshServices,
    startService,
    stopService,
    startAllServices,
    stopAllServices,
    getStatusText,
    getStatusType
  }
}
