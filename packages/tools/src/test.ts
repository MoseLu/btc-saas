// 测试工具体系功能
import { http, mock, cache, initTools } from './index'

// 测试HTTP客户端
async function testHttpClient() {
  console.log('=== Testing HTTP Client ===')
  
  try {
    // 测试GET请求
    const response = await http.get('https://jsonplaceholder.typicode.com/posts/1')
    console.log('GET Response:', response.data)
    
    // 测试POST请求
    const postResponse = await http.post('https://jsonplaceholder.typicode.com/posts', {
      title: 'Test Post',
      body: 'This is a test post',
      userId: 1
    })
    console.log('POST Response:', postResponse.data)
    
  } catch (error) {
    console.error('HTTP Client Test Error:', error)
  }
}

// 测试Mock系统
function testMockSystem() {
  console.log('=== Testing Mock System ===')
  
  // 启用Mock
  mock.enable()
  
  // 添加Mock处理器
  mock.get('/api/test', () => ({
    status: 200,
    body: { message: 'Mock response' }
  }))
  
  mock.post('/api/test', (req) => ({
    status: 201,
    body: { received: req.body }
  }))
  
  console.log('Mock handlers added:', mock.count())
  console.log('Mock enabled:', mock.isEnabled())
}

// 测试缓存系统
function testCacheSystem() {
  console.log('=== Testing Cache System ===')
  
  // 设置缓存
  cache.set('test-key', { data: 'test value' }, 5000)
  
  // 获取缓存
  const value = cache.get('test-key')
  console.log('Cached value:', value)
  
  // 检查缓存
  console.log('Has key:', cache.has('test-key'))
  console.log('Cache size:', cache.size())
  
  // 获取统计信息
  const stats = cache.stats()
  console.log('Cache stats:', stats)
}

// 测试适配器切换
async function testAdapterSwitch() {
  console.log('=== Testing Adapter Switch ===')
  
  // 切换到MSW适配器
  http.switchAdapter('msw')
  console.log('Current adapter:', http.getCurrentAdapter())
  
  // 切换回fetch适配器
  http.switchAdapter('fetch')
  console.log('Current adapter:', http.getCurrentAdapter())
}

// 运行所有测试
async function runAllTests() {
      // Starting BTC Tools Tests...
  
  // 初始化工具
  initTools({
    enableMock: true,
    mockScenarios: true
  })
  
  // 运行测试
  testMockSystem()
  testCacheSystem()
  await testAdapterSwitch()
  
  // HTTP测试需要网络连接，可能失败
  try {
    await testHttpClient()
  } catch (error) {
    console.log('HTTP test skipped due to network issues')
  }
  
  console.log('\nAll tests completed!')
}

// 如果直接运行此文件，执行测试
if (import.meta.url.startsWith('file://')) {
  runAllTests()
}

export { runAllTests }
