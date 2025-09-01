// 导出插件管理器
export { pluginManager, PluginManager } from './src/manager';
export type { Plugin, PluginConfig } from './src/manager';

// 导出配置管理器
export { pluginConfigManager } from './src/config';
export type { PluginSettings } from './src/config';

// 导出插件管理界面组件
export { default as PluginManagerComponent } from './src/components/PluginManager.vue';

// 导出插件系统工具函数
export * from './src/utils';

// 导出插件系统类型定义
export * from './src/types';
