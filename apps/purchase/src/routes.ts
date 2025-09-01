/**
 * 采购应用路由配置
 */

import type { AppRouteConfig } from '../../btc-saas-test/src/utils/route-discovery'

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
      },
      children: [
        {
          name: 'order-list',
          path: 'list',
          component: () => import('./views/orders/OrderList.vue'),
          meta: {
            title: '订单列表',
            icon: 'List',
            breadcrumb: ['采购管理', '采购订单', '订单列表']
          }
        },
        {
          name: 'order-create',
          path: 'create',
          component: () => import('./views/orders/OrderCreate.vue'),
          meta: {
            title: '创建订单',
            icon: 'Plus',
            breadcrumb: ['采购管理', '采购订单', '创建订单']
          }
        },
        {
          name: 'order-detail',
          path: 'detail/:id',
          component: () => import('./views/orders/OrderDetail.vue'),
          meta: {
            title: '订单详情',
            icon: 'View',
            breadcrumb: ['采购管理', '采购订单', '订单详情'],
            hidden: true
          }
        }
      ]
    },
    {
      name: 'suppliers',
      path: 'suppliers',
      component: () => import('./views/SupplierList.vue'),
      meta: {
        title: '供应商管理',
        icon: 'User',
        breadcrumb: ['采购管理', '供应商管理']
      },
      children: [
        {
          name: 'supplier-list',
          path: 'list',
          component: () => import('./views/suppliers/SupplierList.vue'),
          meta: {
            title: '供应商列表',
            icon: 'List',
            breadcrumb: ['采购管理', '供应商管理', '供应商列表']
          }
        },
        {
          name: 'supplier-create',
          path: 'create',
          component: () => import('./views/suppliers/SupplierCreate.vue'),
          meta: {
            title: '添加供应商',
            icon: 'Plus',
            breadcrumb: ['采购管理', '供应商管理', '添加供应商']
          }
        },
        {
          name: 'supplier-detail',
          path: 'detail/:id',
          component: () => import('./views/suppliers/SupplierDetail.vue'),
          meta: {
            title: '供应商详情',
            icon: 'View',
            breadcrumb: ['采购管理', '供应商管理', '供应商详情'],
            hidden: true
          }
        }
      ]
    },
    {
      name: 'reports',
      path: 'reports',
      component: () => import('./views/ReportList.vue'),
      meta: {
        title: '采购报表',
        icon: 'DataAnalysis',
        breadcrumb: ['采购管理', '采购报表']
      },
      children: [
        {
          name: 'order-report',
          path: 'orders',
          component: () => import('./views/reports/OrderReport.vue'),
          meta: {
            title: '订单报表',
            icon: 'Document',
            breadcrumb: ['采购管理', '采购报表', '订单报表']
          }
        },
        {
          name: 'supplier-report',
          path: 'suppliers',
          component: () => import('./views/reports/SupplierReport.vue'),
          meta: {
            title: '供应商报表',
            icon: 'User',
            breadcrumb: ['采购管理', '采购报表', '供应商报表']
          }
        },
        {
          name: 'cost-report',
          path: 'costs',
          component: () => import('./views/reports/CostReport.vue'),
          meta: {
            title: '成本分析',
            icon: 'Money',
            breadcrumb: ['采购管理', '采购报表', '成本分析']
          }
        }
      ]
    }
  ]
}

export default routes
