export const routes = [
  '/api/users',
  '/api/users/:id'
]

export const GET_users = () => ({
  code: 200,
  message: 'success',
  data: {
    list: [
      { id: 1, name: '张三', email: 'zhangsan@example.com', createdAt: '2024-01-01T00:00:00.000Z' },
      { id: 2, name: '李四', email: 'lisi@example.com', createdAt: '2024-01-02T00:00:00.000Z' },
      { id: 3, name: '王五', email: 'wangwu@example.com', createdAt: '2024-01-03T00:00:00.000Z' }
    ],
    total: 3,
    page: 1,
    size: 10
  }
})

export const POST_users = () => ({
  code: 200,
  message: 'created',
  data: {
    id: Date.now(),
    name: '新用户',
    email: 'newuser@example.com',
    createdAt: new Date().toISOString()
  }
})

export const PUT_users_id = () => ({
  code: 200,
  message: 'updated',
  data: {
    id: 1,
    name: '更新用户',
    email: 'updated@example.com',
    updatedAt: new Date().toISOString()
  }
})

export const DELETE_users_id = () => ({
  code: 200,
  message: 'deleted',
  data: { id: 1 }
})
