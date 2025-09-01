// 请求层导出
export * from './request/adapter'
export * from './request/fetch'
export * from './request/msw'
export * from './request/interceptor'
export * from './request/client'

// Mock系统导出
export * from './mock/handler'
export * from './mock/scenarios'

// 缓存工具导出
export * from './cache/memory'

// 默认导出
export { httpClient, http } from './request/client'
export { mockHandlerManager, mock } from './mock/handler'
export { memoryCache, cache } from './cache/memory'

// 工具初始化函数
export function initTools(config?: {
  enableMock?: boolean
  mockScenarios?: boolean
  cacheConfig?: any
}) {
  const {
    enableMock = false,
    mockScenarios = false,
    cacheConfig = {}
  } = config || {}

  // 初始化Mock系统
  if (enableMock) {
    mock.enable()
    // Mock system enabled
    
    if (mockScenarios) {
      // 这里需要导入并设置Mock场景
      // import { setupAllMocks } from './mock/scenarios'
      // setupAllMocks()
      // Mock scenarios ready to be set up
    }
  }

  // 初始化缓存系统
  if (cacheConfig) {
    // 可以在这里配置缓存
    // Cache system initialized
  }

      // BTC Tools initialized successfully
}

// 工具清理函数
export function cleanupTools() {
  // 清理Mock系统
  mock.clear()
  mock.disable()
  
  // 清理缓存系统
  cache.clear()
  
      // BTC Tools cleaned up
}
