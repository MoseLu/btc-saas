// 测试虚拟模块
async function testVirtualModule() {
  try {
    const { plugins } = await import('virtual:btc-plugins')

    return plugins
  } catch (error) {
    console.error('虚拟模块加载失败:', error)
    return []
  }
}

export { testVirtualModule }
