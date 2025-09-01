// 统一的数据源 - 供Mock管理和EPS演示共同使用
export interface ApiEndpoint {
  id: string
  name: string
  path: string
  method: string
  description?: string
  tags: string[]
  parameters: ApiParameter[]
  responses: ApiResponse[]
  status: 'active' | 'inactive'
  type: 'endpoint'
  mockEnabled?: boolean
  mockDelay?: number
}

export interface ApiService {
  id: string
  name: string
  description?: string
  tags: string[]
  status: 'active' | 'inactive'
  type: 'service'
  children: ApiEndpoint[]
  mockEnabled?: boolean
}

export interface ApiParameter {
  name: string
  in: 'path' | 'query' | 'header' | 'body'
  type: string
  required: boolean
  description?: string
}

export interface ApiResponse {
  code: string
  description: string
  schema?: string
}

// 统一的API数据源
export const apiData: ApiService[] = [
  {
    id: 'user-service',
    name: '用户管理服务',
    description: '提供用户相关的所有API操作，包括用户注册、登录、信息管理等',
    tags: ['用户', '认证', '管理'],
    status: 'active',
    type: 'service',
    mockEnabled: true,
    children: [
      {
        id: 'get-users',
        name: '获取用户列表',
        path: '/api/users',
        method: 'GET',
        description: '分页获取用户列表，支持按条件筛选',
        tags: ['用户', '列表', '查询'],
        parameters: [
          { name: 'page', in: 'query', type: 'integer', required: false, description: '页码，默认为1' },
          { name: 'size', in: 'query', type: 'integer', required: false, description: '每页数量，默认为20' },
          { name: 'keyword', in: 'query', type: 'string', required: false, description: '搜索关键词' }
        ],
        responses: [
          { code: '200', description: '成功获取用户列表', schema: 'UserListResponse' },
          { code: '400', description: '参数错误' },
          { code: '401', description: '未授权' }
        ],
        status: 'active',
        type: 'endpoint',
        mockEnabled: true,
        mockDelay: 200
      },
      {
        id: 'create-user',
        name: '创建用户',
        path: '/api/users',
        method: 'POST',
        description: '创建新用户账户',
        tags: ['用户', '创建', '注册'],
        parameters: [
          { name: 'user', in: 'body', type: 'CreateUserRequest', required: true, description: '用户信息' }
        ],
        responses: [
          { code: '201', description: '用户创建成功', schema: 'User' },
          { code: '400', description: '参数错误或用户已存在' },
          { code: '422', description: '数据验证失败' }
        ],
        status: 'active',
        type: 'endpoint',
        mockEnabled: true,
        mockDelay: 300
      },
      {
        id: 'get-user',
        name: '获取用户详情',
        path: '/api/users/{id}',
        method: 'GET',
        description: '根据用户ID获取用户详细信息',
        tags: ['用户', '详情', '查询'],
        parameters: [
          { name: 'id', in: 'path', type: 'string', required: true, description: '用户ID' }
        ],
        responses: [
          { code: '200', description: '成功获取用户信息', schema: 'User' },
          { code: '404', description: '用户不存在' },
          { code: '401', description: '未授权' }
        ],
        status: 'active',
        type: 'endpoint',
        mockEnabled: true,
        mockDelay: 150
      },
      {
        id: 'update-user',
        name: '更新用户信息',
        path: '/api/users/{id}',
        method: 'PUT',
        description: '更新指定用户的信息',
        tags: ['用户', '更新', '编辑'],
        parameters: [
          { name: 'id', in: 'path', type: 'string', required: true, description: '用户ID' },
          { name: 'user', in: 'body', type: 'UpdateUserRequest', required: true, description: '更新的用户信息' }
        ],
        responses: [
          { code: '200', description: '用户信息更新成功', schema: 'User' },
          { code: '400', description: '参数错误' },
          { code: '404', description: '用户不存在' }
        ],
        status: 'active',
        type: 'endpoint',
        mockEnabled: true,
        mockDelay: 250
      },
      {
        id: 'delete-user',
        name: '删除用户',
        path: '/api/users/{id}',
        method: 'DELETE',
        description: '删除指定用户账户',
        tags: ['用户', '删除'],
        parameters: [
          { name: 'id', in: 'path', type: 'string', required: true, description: '用户ID' }
        ],
        responses: [
          { code: '204', description: '用户删除成功' },
          { code: '404', description: '用户不存在' },
          { code: '403', description: '权限不足' }
        ],
        status: 'inactive',
        type: 'endpoint',
        mockEnabled: false,
        mockDelay: 100
      }
    ]
  },
  {
    id: 'auth-service',
    name: '认证授权服务',
    description: '提供用户认证、授权、会话管理等功能',
    tags: ['认证', '授权', '安全'],
    status: 'active',
    type: 'service',
    mockEnabled: true,
    children: [
      {
        id: 'login',
        name: '用户登录',
        path: '/api/auth/login',
        method: 'POST',
        description: '用户登录认证',
        tags: ['认证', '登录'],
        parameters: [
          { name: 'credentials', in: 'body', type: 'LoginRequest', required: true, description: '登录凭据' }
        ],
        responses: [
          { code: '200', description: '登录成功', schema: 'LoginResponse' },
          { code: '401', description: '用户名或密码错误' },
          { code: '429', description: '登录尝试次数过多' }
        ],
        status: 'active',
        type: 'endpoint',
        mockEnabled: true,
        mockDelay: 500
      },
      {
        id: 'logout',
        name: '用户登出',
        path: '/api/auth/logout',
        method: 'POST',
        description: '用户登出，清除会话',
        tags: ['认证', '登出'],
        parameters: [],
        responses: [
          { code: '200', description: '登出成功' },
          { code: '401', description: '未授权' }
        ],
        status: 'active',
        type: 'endpoint',
        mockEnabled: true,
        mockDelay: 100
      },
      {
        id: 'refresh-token',
        name: '刷新令牌',
        path: '/api/auth/refresh',
        method: 'POST',
        description: '刷新访问令牌',
        tags: ['认证', '令牌'],
        parameters: [
          { name: 'refreshToken', in: 'body', type: 'RefreshTokenRequest', required: true, description: '刷新令牌' }
        ],
        responses: [
          { code: '200', description: '令牌刷新成功', schema: 'TokenResponse' },
          { code: '401', description: '刷新令牌无效' }
        ],
        status: 'active',
        type: 'endpoint',
        mockEnabled: true,
        mockDelay: 200
      }
    ]
  },
  {
    id: 'product-service',
    name: '产品管理服务',
    description: '提供产品相关的所有API操作，包括产品信息管理、库存管理等',
    tags: ['产品', '商品', '库存'],
    status: 'active',
    type: 'service',
    mockEnabled: true,
    children: [
      {
        id: 'get-products',
        name: '获取产品列表',
        path: '/api/products',
        method: 'GET',
        description: '分页获取产品列表，支持分类筛选',
        tags: ['产品', '列表', '查询'],
        parameters: [
          { name: 'category', in: 'query', type: 'string', required: false, description: '产品分类' },
          { name: 'page', in: 'query', type: 'integer', required: false, description: '页码' },
          { name: 'size', in: 'query', type: 'integer', required: false, description: '每页数量' }
        ],
        responses: [
          { code: '200', description: '成功获取产品列表', schema: 'ProductListResponse' },
          { code: '400', description: '参数错误' }
        ],
        status: 'active',
        type: 'endpoint',
        mockEnabled: true,
        mockDelay: 300
      },
      {
        id: 'create-product',
        name: '创建产品',
        path: '/api/products',
        method: 'POST',
        description: '创建新产品',
        tags: ['产品', '创建'],
        parameters: [
          { name: 'product', in: 'body', type: 'CreateProductRequest', required: true, description: '产品信息' }
        ],
        responses: [
          { code: '201', description: '产品创建成功', schema: 'Product' },
          { code: '400', description: '参数错误' },
          { code: '422', description: '数据验证失败' }
        ],
        status: 'active',
        type: 'endpoint',
        mockEnabled: true,
        mockDelay: 400
      },
      {
        id: 'get-product',
        name: '获取产品详情',
        path: '/api/products/{id}',
        method: 'GET',
        description: '根据产品ID获取产品详细信息',
        tags: ['产品', '详情', '查询'],
        parameters: [
          { name: 'id', in: 'path', type: 'string', required: true, description: '产品ID' }
        ],
        responses: [
          { code: '200', description: '成功获取产品信息', schema: 'Product' },
          { code: '404', description: '产品不存在' }
        ],
        status: 'active',
        type: 'endpoint',
        mockEnabled: true,
        mockDelay: 200
      }
    ]
  },
  {
    id: 'order-service',
    name: '订单管理服务',
    description: '提供订单相关的所有API操作，包括订单创建、状态管理等',
    tags: ['订单', '交易', '管理'],
    status: 'active',
    type: 'service',
    mockEnabled: true,
    children: [
      {
        id: 'get-orders',
        name: '获取订单列表',
        path: '/api/orders',
        method: 'GET',
        description: '分页获取订单列表，支持状态筛选',
        tags: ['订单', '列表', '查询'],
        parameters: [
          { name: 'status', in: 'query', type: 'string', required: false, description: '订单状态' },
          { name: 'page', in: 'query', type: 'integer', required: false, description: '页码' },
          { name: 'size', in: 'query', type: 'integer', required: false, description: '每页数量' }
        ],
        responses: [
          { code: '200', description: '成功获取订单列表', schema: 'OrderListResponse' },
          { code: '400', description: '参数错误' }
        ],
        status: 'active',
        type: 'endpoint',
        mockEnabled: true,
        mockDelay: 350
      },
      {
        id: 'create-order',
        name: '创建订单',
        path: '/api/orders',
        method: 'POST',
        description: '创建新订单',
        tags: ['订单', '创建'],
        parameters: [
          { name: 'order', in: 'body', type: 'CreateOrderRequest', required: true, description: '订单信息' }
        ],
        responses: [
          { code: '201', description: '订单创建成功', schema: 'Order' },
          { code: '400', description: '参数错误' },
          { code: '422', description: '数据验证失败' }
        ],
        status: 'active',
        type: 'endpoint',
        mockEnabled: true,
        mockDelay: 500
      }
    ]
  },
  {
    id: 'file-service',
    name: '文件管理服务',
    description: '提供文件上传、下载、管理等API操作',
    tags: ['文件', '上传', '下载'],
    status: 'active',
    type: 'service',
    mockEnabled: true,
    children: [
      {
        id: 'upload-file',
        name: '上传文件',
        path: '/api/files/upload',
        method: 'POST',
        description: '上传文件到服务器',
        tags: ['文件', '上传'],
        parameters: [
          { name: 'file', in: 'body', type: 'file', required: true, description: '文件数据' },
          { name: 'type', in: 'query', type: 'string', required: false, description: '文件类型' }
        ],
        responses: [
          { code: '200', description: '文件上传成功', schema: 'FileUploadResponse' },
          { code: '400', description: '文件格式错误' },
          { code: '413', description: '文件过大' }
        ],
        status: 'active',
        type: 'endpoint',
        mockEnabled: true,
        mockDelay: 1000
      },
      {
        id: 'download-file',
        name: '下载文件',
        path: '/api/files/{id}/download',
        method: 'GET',
        description: '下载指定文件',
        tags: ['文件', '下载'],
        parameters: [
          { name: 'id', in: 'path', type: 'string', required: true, description: '文件ID' }
        ],
        responses: [
          { code: '200', description: '文件下载成功', schema: 'file' },
          { code: '404', description: '文件不存在' }
        ],
        status: 'active',
        type: 'endpoint',
        mockEnabled: true,
        mockDelay: 800
      }
    ]
  },
  {
    id: 'notification-service',
    name: '通知管理服务',
    description: '提供消息通知、推送等API操作',
    tags: ['通知', '消息', '推送'],
    status: 'active',
    type: 'service',
    mockEnabled: true,
    children: [
      {
        id: 'send-notification',
        name: '发送通知',
        path: '/api/notifications/send',
        method: 'POST',
        description: '发送通知消息',
        tags: ['通知', '发送'],
        parameters: [
          { name: 'notification', in: 'body', type: 'SendNotificationRequest', required: true, description: '通知信息' }
        ],
        responses: [
          { code: '200', description: '通知发送成功', schema: 'NotificationResponse' },
          { code: '400', description: '参数错误' }
        ],
        status: 'active',
        type: 'endpoint',
        mockEnabled: true,
        mockDelay: 600
      },
      {
        id: 'get-notifications',
        name: '获取通知列表',
        path: '/api/notifications',
        method: 'GET',
        description: '获取用户的通知列表',
        tags: ['通知', '列表', '查询'],
        parameters: [
          { name: 'page', in: 'query', type: 'integer', required: false, description: '页码' },
          { name: 'size', in: 'query', type: 'integer', required: false, description: '每页数量' }
        ],
        responses: [
          { code: '200', description: '成功获取通知列表', schema: 'NotificationListResponse' },
          { code: '401', description: '未授权' }
        ],
        status: 'active',
        type: 'endpoint',
        mockEnabled: true,
        mockDelay: 250
      }
    ]
  }
]

// 工具函数：获取所有Mock端点
export const getAllMockEndpoints = (): ApiEndpoint[] => {
  return apiData.flatMap(service => service.children)
}

// 工具函数：获取启用的Mock端点
export const getEnabledMockEndpoints = (): ApiEndpoint[] => {
  return apiData.flatMap(service => 
    service.children.filter(endpoint => endpoint.mockEnabled)
  )
}

// 工具函数：获取Mock统计信息
export const getMockStats = () => {
  const allEndpoints = getAllMockEndpoints()
  const enabledEndpoints = getEnabledMockEndpoints()
  
  return {
    totalEndpoints: allEndpoints.length,
    enabledEndpoints: enabledEndpoints.length,
    totalDelay: enabledEndpoints.reduce((sum, endpoint) => sum + (endpoint.mockDelay || 0), 0),
    services: apiData.length,
    activeServices: apiData.filter(service => service.status === 'active').length
  }
}

// 工具函数：根据服务ID获取服务
export const getServiceById = (id: string): ApiService | undefined => {
  return apiData.find(service => service.id === id)
}

// 工具函数：根据端点ID获取端点
export const getEndpointById = (id: string): ApiEndpoint | undefined => {
  for (const service of apiData) {
    const endpoint = service.children.find(endpoint => endpoint.id === id)
    if (endpoint) return endpoint
  }
  return undefined
}
