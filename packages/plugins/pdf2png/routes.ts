/**
 * PDF转PNG插件路由配置
 */

import type { PluginRouteConfig } from '../../../apps/btc-saas-test/src/utils/route-discovery'

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
    },
    {
      name: 'batch',
      path: 'batch',
      component: () => import('./components/BatchDemo.vue'),
      meta: {
        title: '批量转换',
        icon: 'Files',
        breadcrumb: ['PDF转PNG', '批量转换']
      }
    },
    {
      name: 'settings',
      path: 'settings',
      component: () => import('./components/SettingsDemo.vue'),
      meta: {
        title: '转换设置',
        icon: 'Setting',
        breadcrumb: ['PDF转PNG', '转换设置']
      }
    }
  ]
}

export default routes
