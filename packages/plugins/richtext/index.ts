import type { Plugin } from '../src/manager';
import RichTextEditor from './src/components/RichTextEditor.vue';

const RichTextPlugin: Plugin = {
  name: 'richtext',
  version: '1.0.0',
  description: '富文本编辑器',
  author: 'BTC Team',
  dependencies: [],
  
  setup(app) {
    app.component('RichTextEditor', RichTextEditor);
    
    app.provide('richtext', {
      createEditor: (config: any) => {
        // 创建编辑器实例
        return {
          getContent: () => '',
          setContent: (content: string) => {},
          destroy: () => {}
        };
      }
    });
  },
  
  routes: [
    {
      path: '/tools/richtext',
      name: 'RichText',
      component: RichTextEditor,
      meta: {
        title: '富文本编辑器',
        icon: 'edit',
        requiresAuth: true
      }
    }
  ],
  
  onActivate() {
    console.log('RichText plugin activated');
  },
  
  onDeactivate() {
    console.log('RichText plugin deactivated');
  }
};

export default RichTextPlugin;
