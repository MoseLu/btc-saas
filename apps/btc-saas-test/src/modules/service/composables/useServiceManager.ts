import { ref, reactive, computed } from 'vue'

export interface ServiceInfo {
  id: string
  name: string
  status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping'
  port: number
  url: string
  description: string
  uptime: number
  memory: number
  cpu: number
  logs: string[]
}

export function useServiceManager() {
  const services = ref<ServiceInfo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const runningServices = computed(() => 
    services.value.filter(s => s.status === 'running')
  )

  const stoppedServices = computed(() => 
    services.value.filter(s => s.status === 'stopped')
  )

  const errorServices = computed(() => 
    services.value.filter(s => s.status === 'error')
  )

  const loadServices = async () => {
    loading.value = true
    error.value = null
    
    try {
      // 模拟加载服务列表
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      services.value = [
        {
          id: 'user-service',
          name: '用户服务',
          status: 'running',
          port: 8311,
          url: 'http://localhost:8311',
          description: '用户管理相关服务',
          uptime: 3600,
          memory: 128,
          cpu: 5.2,
          logs: ['服务启动成功', '处理用户登录请求', '数据库连接正常']
        },
        {
          id: 'order-service',
          name: '订单服务',
          status: 'running',
          port: 8312,
          url: 'http://localhost:8312',
          description: '订单管理相关服务',
          uptime: 1800,
          memory: 256,
          cpu: 8.1,
          logs: ['服务启动成功', '处理订单创建请求', '支付接口调用成功']
        },
        {
          id: 'notification-service',
          name: '通知服务',
          status: 'stopped',
          port: 8313,
          url: 'http://localhost:8313',
          description: '消息通知相关服务',
          uptime: 0,
          memory: 0,
          cpu: 0,
          logs: ['服务已停止']
        }
      ]
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载服务失败'
    } finally {
      loading.value = false
    }
  }

  const startService = async (serviceId: string) => {
    const service = services.value.find(s => s.id === serviceId)
    if (service) {
      service.status = 'starting'
      await new Promise(resolve => setTimeout(resolve, 2000))
      service.status = 'running'
      service.uptime = 0
      service.logs.unshift('服务启动成功')
    }
  }

  const stopService = async (serviceId: string) => {
    const service = services.value.find(s => s.id === serviceId)
    if (service) {
      service.status = 'stopping'
      await new Promise(resolve => setTimeout(resolve, 1000))
      service.status = 'stopped'
      service.uptime = 0
      service.memory = 0
      service.cpu = 0
      service.logs.unshift('服务已停止')
    }
  }

  const restartService = async (serviceId: string) => {
    await stopService(serviceId)
    await new Promise(resolve => setTimeout(resolve, 500))
    await startService(serviceId)
  }

  const getServiceLogs = async (serviceId: string) => {
    const service = services.value.find(s => s.id === serviceId)
    if (service) {
      // 模拟获取最新日志
      const newLogs = [
        `[${new Date().toLocaleTimeString()}] 处理请求`,
        `[${new Date().toLocaleTimeString()}] 数据库查询完成`,
        `[${new Date().toLocaleTimeString()}] 响应发送成功`
      ]
      service.logs.push(...newLogs)
      return service.logs
    }
    return []
  }

  // 搜索和过滤相关
  const searchQuery = ref('')
  const selectedStatus = ref('')
  const isRefreshing = ref(false)

  // 计算属性
  const serviceStats = computed(() => ({
    running: runningServices.value.length,
    stopped: stoppedServices.value.length,
    error: errorServices.value.length,
    total: services.value.length
  }))

  const serviceStatuses = computed(() => ['running', 'stopped', 'error', 'starting', 'stopping'])

  const filteredServiceList = computed(() => {
    let filtered = services.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
      )
    }

    if (selectedStatus.value) {
      filtered = filtered.filter(service => service.status === selectedStatus.value)
    }

    return filtered
  })

  const refreshServices = async () => {
    isRefreshing.value = true
    await loadServices()
    isRefreshing.value = false
  }

  const startAllServices = async () => {
    const stoppedServices = services.value.filter(s => s.status === 'stopped')
    for (const service of stoppedServices) {
      await startService(service.id)
    }
  }

  const stopAllServices = async () => {
    const runningServices = services.value.filter(s => s.status === 'running')
    for (const service of runningServices) {
      await stopService(service.id)
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      running: '运行中',
      stopped: '已停止',
      error: '错误',
      starting: '启动中',
      stopping: '停止中'
    }
    return statusMap[status] || '未知'
  }

  return {
    // 状态
    services,
    loading,
    error,
    searchQuery,
    selectedStatus,
    isRefreshing,

    // 计算属性
    runningServices,
    stoppedServices,
    errorServices,
    serviceStats,
    serviceStatuses,
    filteredServiceList,

    // 方法
    loadServices,
    refreshServices,
    startService,
    stopService,
    restartService,
    startAllServices,
    stopAllServices,
    getServiceLogs,
    getStatusText
  }
}
