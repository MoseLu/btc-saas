import type { Plugin } from '../src/manager';
import Pdf2PngComponent from './src/components/Pdf2PngComponent.vue';

const Pdf2PngPlugin: Plugin = {
  name: 'pdf2png',
  version: '1.0.0',
  description: 'PDF文件转PNG图片工具',
  author: 'BTC Team',
  dependencies: [],
  
  setup(app) {
    // 注册组件
    app.component('Pdf2Png', Pdf2PngComponent);
    
    // 注册工具函数
    app.provide('pdf2png', {
      convert: async (file: File) => {
        // PDF转PNG逻辑
        return new Promise((resolve) => {
          // 实现转换逻辑
          resolve('converted-image.png');
        });
      }
    });
  },
  
  routes: [
    {
      path: '/tools/pdf2png',
      name: 'Pdf2Png',
      component: Pdf2PngComponent,
      meta: {
        title: 'PDF转PNG',
        icon: 'document',
        requiresAuth: true
      }
    }
  ],
  
  onActivate() {
    console.log('PDF2PNG plugin activated');
  },
  
  onDeactivate() {
    console.log('PDF2PNG plugin deactivated');
  },
  
  onUpdate(config) {
    console.log('PDF2PNG plugin config updated:', config);
  }
};

export default Pdf2PngPlugin;
