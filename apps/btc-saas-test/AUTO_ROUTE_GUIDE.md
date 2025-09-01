# 自动路由发现系统使用指南

## 概述

BTC SaaS 平台实现了自动路由发现系统，能够自动扫描和注册新的插件、应用和模块路由，无需手动配置即可在统一测试平台中展示。

## 系统特性

### ✅ 自动发现
- **插件路由**: 自动扫描 `packages/plugins/*/routes.ts`
- **应用路由**: 自动扫描 `apps/*/src/routes.ts`
- **模块路由**: 自动扫描 `src/modules/*/index.ts`

### ✅ 多级路由支持
- 支持无限层级的嵌套路由
- 自动生成面包屑导航
- 支持路由参数和动态路由

### ✅ 智能分类
- 系统功能 (`system`)
- 插件中心 (`plugin`)
- 应用中心 (`app`)
- 业务模块 (`user`, `order`, `product` 等)

### ✅ 自动菜单生成
- 根据路由分类自动生成菜单结构
- 支持图标、排序、隐藏等配置
- 响应式菜单布局

## 使用方法

### 1. 为插件添加路由

在插件目录下创建 `routes.ts` 文件：

```typescript
// packages/plugins/pdf2png/routes.ts
import type { PluginRouteConfig } from '../../../apps/btc-saas/src/utils/route-discovery'

export const routes: PluginRouteConfig = {
  name: 'pdf2png',
  path: '/pdf2png',
  component: () => import('./Pdf2PngDemo.vue'),
  meta: {
    title: 'PDF转PNG',
    icon: 'Document',
    category: 'plugin',
    order: 1,
    description: '将PDF文件转换为PNG图片',
    tags: ['pdf', 'png', 'converter']
  },
  children: [
    {
      name: 'upload',
      path: 'upload',
      component: () => import('./components/UploadDemo.vue'),
      meta: {
        title: '文件上传',
        icon: 'Upload',
        breadcrumb: ['PDF转PNG', '文件上传']
      }
    }
  ]
}

export default routes
```

### 2. 为应用添加路由

在应用目录下创建 `routes.ts` 文件：

```typescript
// apps/purchase/src/routes.ts
import type { AppRouteConfig } from '../../btc-saas/src/utils/route-discovery'

export const routes: AppRouteConfig = {
  name: 'purchase',
  path: '/purchase',
  component: () => import('./PurchaseApp.vue'),
  meta: {
    title: '采购管理',
    icon: 'ShoppingCart',
    category: 'app',
    order: 1,
    description: '采购订单和供应商管理系统',
    tags: ['purchase', 'order', 'supplier']
  },
  children: [
    {
      name: 'orders',
      path: 'orders',
      component: () => import('./views/OrderList.vue'),
      meta: {
        title: '采购订单',
        icon: 'Document',
        breadcrumb: ['采购管理', '采购订单']
      }
    }
  ]
}

export default routes
```

### 3. 为模块添加路由

在模块的 `index.ts` 文件中导出路由配置：

```typescript
// src/modules/user/index.ts
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
      }
    ]
  }
]

// 导出路由配置
export const routes = userRoutes
```

## 路由元数据配置

### 基础配置

```typescript
meta: {
  title: '页面标题',           // 必填：页面标题
  icon: 'IconName',           // 可选：图标名称
  category: 'plugin',         // 可选：分类
  order: 1,                   // 可选：排序
  hidden: false,              // 可选：是否在菜单中隐藏
  requiresAuth: true,         // 可选：是否需要认证
  roles: ['admin'],           // 可选：所需角色
  description: '描述',        // 可选：功能描述
  tags: ['tag1', 'tag2']      // 可选：标签
}
```

### 面包屑配置

```typescript
meta: {
  breadcrumb: ['父级', '当前页面']  // 面包屑导航
}
```

### 分类说明

- `system`: 系统功能，显示在"系统管理"菜单下
- `plugin`: 插件功能，显示在"插件中心"菜单下
- `app`: 应用功能，显示在"应用中心"菜单下
- `user`, `order`, `product` 等: 业务模块，显示在对应的业务菜单下

## 路由管理页面

访问 `/routes` 路径可以查看路由管理页面，功能包括：

### 📊 路由统计
- 总路由数
- 插件路由数
- 应用路由数
- 模块路由数

### 🔍 路由浏览
- 按分类查看路由
- 搜索和筛选
- 路由详情查看

### ⚙️ 路由操作
- 刷新路由发现
- 导出路由配置
- 复制路由路径
- 跳转到路由

## 开发流程

### 1. 创建新插件

```bash
# 1. 在 packages/plugins 下创建插件目录
mkdir packages/plugins/my-plugin

# 2. 创建路由配置文件
touch packages/plugins/my-plugin/routes.ts

# 3. 创建组件文件
mkdir packages/plugins/my-plugin/components
touch packages/plugins/my-plugin/MyPluginDemo.vue
```

### 2. 创建新应用

```bash
# 1. 在 apps 下创建应用目录
mkdir apps/my-app

# 2. 创建路由配置文件
touch apps/my-app/src/routes.ts

# 3. 创建应用组件
touch apps/my-app/src/MyApp.vue
```

### 3. 创建新模块

```bash
# 1. 在 src/modules 下创建模块目录
mkdir src/modules/my-module

# 2. 创建模块入口文件
touch src/modules/my-module/index.ts

# 3. 创建模块组件
mkdir src/modules/my-module/views
touch src/modules/my-module/views/MyModuleList.vue
```

## 最佳实践

### 1. 路由命名规范

```typescript
// 使用 kebab-case 命名路径
path: '/user-management'  // ✅ 推荐
path: '/userManagement'   // ❌ 不推荐

// 使用 PascalCase 命名组件
name: 'UserManagement'    // ✅ 推荐
name: 'user-management'   // ❌ 不推荐
```

### 2. 组件懒加载

```typescript
// 使用动态导入实现懒加载
component: () => import('./MyComponent.vue')  // ✅ 推荐
component: MyComponent                         // ❌ 不推荐（会增加初始包大小）
```

### 3. 路由组织

```typescript
// 按功能模块组织路由
children: [
  {
    path: 'list',      // 列表页面
    name: 'UserList',
    component: () => import('./views/UserList.vue')
  },
  {
    path: 'create',    // 创建页面
    name: 'UserCreate',
    component: () => import('./views/UserCreate.vue')
  },
  {
    path: 'detail/:id', // 详情页面
    name: 'UserDetail',
    component: () => import('./views/UserDetail.vue'),
    meta: { hidden: true } // 隐藏详情页面
  }
]
```

### 4. 元数据配置

```typescript
meta: {
  title: '用户管理',
  icon: 'User',
  category: 'user',
  order: 1,
  description: '用户信息管理功能',
  tags: ['user', 'management', 'admin'],
  breadcrumb: ['系统管理', '用户管理'],
  requiresAuth: true,
  roles: ['admin', 'manager']
}
```

## 故障排除

### 1. 路由未显示

检查以下几点：
- 路由配置文件是否正确导出
- 文件路径是否正确
- 组件文件是否存在
- 路由元数据是否完整

### 2. 菜单分类错误

确保 `meta.category` 配置正确：
- `system`: 系统功能
- `plugin`: 插件功能
- `app`: 应用功能
- 其他: 业务模块

### 3. 组件加载失败

检查组件导入路径：
- 使用相对路径
- 确保文件存在
- 检查文件扩展名

### 4. 路由冲突

避免路由路径冲突：
- 使用唯一的路径前缀
- 检查现有路由配置
- 使用路由管理页面查看所有路由

## 扩展功能

### 1. 自定义路由发现

可以扩展 `RouteDiscovery` 类来支持更多路由源：

```typescript
// 添加新的路由发现方法
private async discoverCustomRoutes(): Promise<RouteRecordRaw[]> {
  // 自定义路由发现逻辑
}
```

### 2. 路由权限控制

在路由守卫中添加权限检查：

```typescript
router.beforeEach((to, from, next) => {
  if (to.meta?.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})
```

### 3. 路由缓存

实现路由缓存机制：

```typescript
// 缓存路由配置
const routeCache = new Map<string, RouteRecordRaw>()
```

## 总结

自动路由发现系统大大简化了路由管理，让新功能的集成变得简单高效。通过遵循规范化的配置方式，可以快速将新功能集成到统一测试平台中，实现真正的即插即用。
