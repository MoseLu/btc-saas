/**
 * 富文本编辑器插件路由配置
 */

import type { PluginRouteConfig } from '../../../apps/btc-saas-test/src/utils/route-discovery'

export const routes: PluginRouteConfig = {
  name: 'richtext',
  path: '/richtext',
  component: () => import('./RichTextDemo.vue'),
  meta: {
    title: '富文本编辑器',
    icon: 'Edit',
    category: 'plugin',
    order: 2,
    description: '功能强大的富文本编辑器',
    tags: ['editor', 'richtext', 'wysiwyg']
  },
  children: [
    {
      name: 'basic',
      path: 'basic',
      component: () => import('./components/BasicEditor.vue'),
      meta: {
        title: '基础编辑器',
        icon: 'Edit',
        breadcrumb: ['富文本编辑器', '基础编辑器']
      }
    },
    {
      name: 'advanced',
      path: 'advanced',
      component: () => import('./components/AdvancedEditor.vue'),
      meta: {
        title: '高级编辑器',
        icon: 'Tools',
        breadcrumb: ['富文本编辑器', '高级编辑器']
      }
    },
    {
      name: 'collaborative',
      path: 'collaborative',
      component: () => import('./components/CollaborativeEditor.vue'),
      meta: {
        title: '协作编辑',
        icon: 'User',
        breadcrumb: ['富文本编辑器', '协作编辑']
      }
    },
    {
      name: 'templates',
      path: 'templates',
      component: () => import('./components/TemplatesDemo.vue'),
      meta: {
        title: '模板管理',
        icon: 'Files',
        breadcrumb: ['富文本编辑器', '模板管理']
      }
    }
  ]
}

export default routes
