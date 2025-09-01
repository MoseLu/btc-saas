/**
 * 用户管理模块
 * 
 * 提供用户管理相关的所有功能，包括：
 * - 用户列表管理
 * - 用户信息编辑
 * - 用户权限管理
 * - 用户状态管理
 */

// 导出模块组件
export { default as UserList } from './views/UserList.vue'
// export { default as UserForm } from './views/UserForm.vue'
// export { default as UserDetail } from './views/UserDetail.vue'

// 导出模块逻辑
export { useUserList } from './composables/useUserList'
// export { useUserForm } from './composables/useUserForm'
// export { useUserDetail } from './composables/useUserDetail'

// 导出模块服务
export { userApi } from './services/user.api'

// 导出模块状态管理
export { useUserStore } from './stores/user.store'

// 导出模块类型
export * from './types/user'

// 导出模块常量
export * from './constants/user.constants'

// 模块路由配置
export const userRoutes = [
  {
    path: '/user',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { 
      title: '用户管理', 
      icon: 'User',
      category: 'user',
      order: 1
    },
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: () => import('./views/UserList.vue'),
        meta: { 
          title: '用户列表', 
          module: 'user',
          icon: 'List',
          breadcrumb: ['用户管理', '用户列表']
        }
      },
      // {
      //   path: 'form',
      //   name: 'UserForm',
      //   component: () => import('./views/UserForm.vue'),
      //   meta: { 
      //     title: '用户表单', 
      //     module: 'user',
      //     icon: 'Edit',
      //     breadcrumb: ['用户管理', '用户表单']
      //   }
      // },
      // {
      //   path: 'detail/:id',
      //   name: 'UserDetail',
      //   component: () => import('./views/UserDetail.vue'),
      //   meta: { 
      //     title: '用户详情', 
      //     module: 'user',
      //     icon: 'View',
      //     breadcrumb: ['用户管理', '用户详情'],
      //     hidden: true // 在菜单中隐藏，但可以通过路由访问
      //   }
      // }
    ]
  }
]

// 导出路由配置
export const routes = userRoutes
