import { mock } from './handler'
import type { MockRequest, MockResponse } from './handler'

// 用户数据
const users = [
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-02T00:00:00Z'
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    role: 'user',
    status: 'inactive',
    createdAt: '2024-01-03T00:00:00Z'
  }
]

// 产品数据
const products = [
  {
    id: 1,
    name: '产品A',
    price: 99.99,
    category: 'electronics',
    stock: 100,
    status: 'available'
  },
  {
    id: 2,
    name: '产品B',
    price: 199.99,
    category: 'clothing',
    stock: 50,
    status: 'available'
  },
  {
    id: 3,
    name: '产品C',
    price: 299.99,
    category: 'electronics',
    stock: 0,
    status: 'out_of_stock'
  }
]

// 订单数据
const orders = [
  {
    id: 1,
    userId: 1,
    products: [1, 2],
    total: 299.98,
    status: 'completed',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    userId: 2,
    products: [1],
    total: 99.99,
    status: 'pending',
    createdAt: '2024-01-16T14:30:00Z'
  }
]

// 设置用户相关Mock
export function setupUserMocks(): void {
  // 获取用户列表
  mock.get('/api/users', (req: MockRequest): MockResponse => {
    const { page = 1, limit = 10, search = '' } = req.query
    
    let filteredUsers = users
    
    // 搜索过滤
    if (search) {
      filteredUsers = users.filter(user => 
        user.name.includes(search) || user.email.includes(search)
      )
    }
    
    // 分页
    const start = (Number(page) - 1) * Number(limit)
    const end = start + Number(limit)
    const paginatedUsers = filteredUsers.slice(start, end)
    
    return {
      status: 200,
      body: {
        data: paginatedUsers,
        total: filteredUsers.length,
        page: Number(page),
        limit: Number(limit)
      }
    }
  })

  // 获取单个用户
  mock.get('/api/users/:id', (req: MockRequest): MockResponse => {
    const userId = Number(req.params.id)
    const user = users.find(u => u.id === userId)
    
    if (!user) {
      return {
        status: 404,
        body: { error: 'User not found' }
      }
    }
    
    return {
      status: 200,
      body: { data: user }
    }
  })

  // 创建用户
  mock.post('/api/users', (req: MockRequest): MockResponse => {
    const { name, email, role } = req.body
    
    if (!name || !email) {
      return {
        status: 400,
        body: { error: 'Name and email are required' }
      }
    }
    
    const newUser = {
      id: users.length + 1,
      name,
      email,
      role: role || 'user',
      status: 'active',
      createdAt: new Date().toISOString()
    }
    
    users.push(newUser)
    
    return {
      status: 201,
      body: { data: newUser }
    }
  })

  // 更新用户
  mock.put('/api/users/:id', (req: MockRequest): MockResponse => {
    const userId = Number(req.params.id)
    const userIndex = users.findIndex(u => u.id === userId)
    
    if (userIndex === -1) {
      return {
        status: 404,
        body: { error: 'User not found' }
      }
    }
    
    const updatedUser = { ...users[userIndex], ...req.body }
    users[userIndex] = updatedUser
    
    return {
      status: 200,
      body: { data: updatedUser }
    }
  })

  // 删除用户
  mock.delete('/api/users/:id', (req: MockRequest): MockResponse => {
    const userId = Number(req.params.id)
    const userIndex = users.findIndex(u => u.id === userId)
    
    if (userIndex === -1) {
      return {
        status: 404,
        body: { error: 'User not found' }
      }
    }
    
    users.splice(userIndex, 1)
    
    return {
      status: 204,
      body: null
    }
  })
}

// 设置产品相关Mock
export function setupProductMocks(): void {
  // 获取产品列表
  mock.get('/api/products', (req: MockRequest): MockResponse => {
    const { category, status, search = '' } = req.query
    
    let filteredProducts = products
    
    // 分类过滤
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category)
    }
    
    // 状态过滤
    if (status) {
      filteredProducts = filteredProducts.filter(p => p.status === status)
    }
    
    // 搜索过滤
    if (search) {
      filteredProducts = filteredProducts.filter(p => 
        p.name.includes(search)
      )
    }
    
    return {
      status: 200,
      body: { data: filteredProducts }
    }
  })

  // 获取单个产品
  mock.get('/api/products/:id', (req: MockRequest): MockResponse => {
    const productId = Number(req.params.id)
    const product = products.find(p => p.id === productId)
    
    if (!product) {
      return {
        status: 404,
        body: { error: 'Product not found' }
      }
    }
    
    return {
      status: 200,
      body: { data: product }
    }
  })

  // 创建产品
  mock.post('/api/products', (req: MockRequest): MockResponse => {
    const { name, price, category, stock } = req.body
    
    if (!name || !price || !category) {
      return {
        status: 400,
        body: { error: 'Name, price and category are required' }
      }
    }
    
    const newProduct = {
      id: products.length + 1,
      name,
      price: Number(price),
      category,
      stock: Number(stock) || 0,
      status: Number(stock) > 0 ? 'available' : 'out_of_stock'
    }
    
    products.push(newProduct)
    
    return {
      status: 201,
      body: { data: newProduct }
    }
  })
}

// 设置订单相关Mock
export function setupOrderMocks(): void {
  // 获取订单列表
  mock.get('/api/orders', (req: MockRequest): MockResponse => {
    const { userId, status } = req.query
    
    let filteredOrders = orders
    
    // 用户过滤
    if (userId) {
      filteredOrders = filteredOrders.filter(o => o.userId === Number(userId))
    }
    
    // 状态过滤
    if (status) {
      filteredOrders = filteredOrders.filter(o => o.status === status)
    }
    
    return {
      status: 200,
      body: { data: filteredOrders }
    }
  })

  // 创建订单
  mock.post('/api/orders', (req: MockRequest): MockResponse => {
    const { userId, products: productIds } = req.body
    
    if (!userId || !productIds || !Array.isArray(productIds)) {
      return {
        status: 400,
        body: { error: 'User ID and products array are required' }
      }
    }
    
    // 计算总价
    const total = productIds.reduce((sum, productId) => {
      const product = products.find(p => p.id === productId)
      return sum + (product?.price || 0)
    }, 0)
    
    const newOrder = {
      id: orders.length + 1,
      userId: Number(userId),
      products: productIds,
      total,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    
    orders.push(newOrder)
    
    return {
      status: 201,
      body: { data: newOrder }
    }
  })
}

// 设置通用Mock
export function setupCommonMocks(): void {
  // 健康检查
  mock.get('/api/health', (): MockResponse => ({
    status: 200,
    body: { status: 'ok', timestamp: new Date().toISOString() }
  }))

  // 统计信息
  mock.get('/api/stats', (): MockResponse => ({
    status: 200,
    body: {
      users: users.length,
      products: products.length,
      orders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0)
    }
  }))

  // 上传文件
  mock.post('/api/upload', (req: MockRequest): MockResponse => {
    return {
      status: 200,
      body: {
        url: 'https://example.com/uploads/file.jpg',
        filename: 'file.jpg',
        size: 1024
      }
    }
  })
}

// 设置所有Mock场景
export function setupAllMocks(): void {
  setupUserMocks()
  setupProductMocks()
  setupOrderMocks()
  setupCommonMocks()
  
  console.log('All mock scenarios have been set up')
}

// 清除所有Mock
export function clearAllMocks(): void {
  mock.clear()
  console.log('All mock scenarios have been cleared')
}
