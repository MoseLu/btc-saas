// 插件系统类型定义

import type { App } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import type { Store } from 'pinia';

/**
 * 插件基础接口
 */
export interface Plugin {
  name: string;
  version: string;
  description: string;
  author: string;
  dependencies?: string[];
  setup: (app: App) => void;
  routes?: RouteRecordRaw[];
  stores?: Store[];
  provides?: Record<string, any>;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onUpdate?: (config: any) => void;
}

/**
 * 插件配置接口
 */
export interface PluginConfig {
  enabled: boolean;
  settings: Record<string, any>;
}

/**
 * 插件设置接口
 */
export interface PluginSettings {
  [pluginName: string]: {
    enabled: boolean;
    settings: Record<string, any>;
  };
}

/**
 * 插件元数据接口
 */
export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  dependencies?: string[];
  tags?: string[];
  category?: string;
  icon?: string;
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
}

/**
 * 插件状态枚举
 */
export enum PluginStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  ERROR = 'error',
  LOADING = 'loading'
}

/**
 * 插件事件类型
 */
export type PluginEventType = 
  | 'activate'
  | 'deactivate'
  | 'update'
  | 'error'
  | 'load'
  | 'unload';

/**
 * 插件事件接口
 */
export interface PluginEvent {
  type: PluginEventType;
  pluginName: string;
  timestamp: number;
  data?: any;
  error?: Error;
}

/**
 * 插件管理器选项
 */
export interface PluginManagerOptions {
  autoLoad?: boolean;
  enableHotReload?: boolean;
  configStorage?: 'localStorage' | 'sessionStorage' | 'memory';
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * 插件加载结果
 */
export interface PluginLoadResult {
  success: boolean;
  plugin?: Plugin;
  error?: Error;
  warnings?: string[];
}

/**
 * 插件验证结果
 */
export interface PluginValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 插件依赖检查结果
 */
export interface PluginDependencyResult {
  missing: string[];
  circular: string[];
  conflicts: string[];
}

/**
 * 插件配置更新事件
 */
export interface PluginConfigUpdateEvent {
  pluginName: string;
  oldConfig: PluginConfig;
  newConfig: PluginConfig;
  timestamp: number;
}

/**
 * 插件生命周期钩子
 */
export interface PluginLifecycleHooks {
  beforeActivate?: () => Promise<void> | void;
  afterActivate?: () => Promise<void> | void;
  beforeDeactivate?: () => Promise<void> | void;
  afterDeactivate?: () => Promise<void> | void;
  beforeUpdate?: (config: any) => Promise<void> | void;
  afterUpdate?: (config: any) => Promise<void> | void;
}

/**
 * 插件API接口
 */
export interface PluginAPI {
  getConfig: (pluginName: string) => PluginConfig | undefined;
  updateConfig: (pluginName: string, config: Partial<PluginConfig>) => void;
  enablePlugin: (pluginName: string) => void;
  disablePlugin: (pluginName: string) => void;
  getPlugin: (pluginName: string) => Plugin | undefined;
  getPlugins: () => Array<{ name: string; plugin: Plugin; config: PluginConfig }>;
  hasPlugin: (pluginName: string) => boolean;
  reloadPlugins: () => Promise<void>;
}

/**
 * 插件管理器状态
 */
export interface PluginManagerState {
  plugins: Map<string, Plugin>;
  configs: Map<string, PluginConfig>;
  status: Map<string, PluginStatus>;
  events: PluginEvent[];
  options: PluginManagerOptions;
}
