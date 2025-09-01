import type { App } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import type { Store } from 'pinia';

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

export interface PluginConfig {
  enabled: boolean;
  settings: Record<string, any>;
}

export class PluginManager {
  private plugins = new Map<string, Plugin>();
  private configs = new Map<string, PluginConfig>();
  private app: App | null = null;
  private router: any = null;
  private pinia: any = null;

  constructor() {
    this.loadPlugins();
  }

  // 设置应用实例和依赖
  setApp(app: App, router?: any, pinia?: any) {
    this.app = app;
    this.router = router;
    this.pinia = pinia;
  }

  // 自动发现插件
  private async loadPlugins() {
    try {
      const pluginModules = import.meta.glob('../*/index.ts', { eager: true });
      
      for (const [path, module] of Object.entries(pluginModules)) {
        const pluginName = path.split('/')[2]; // 获取插件名
        const plugin = (module as any).default as Plugin;
        
        if (plugin && this.validatePlugin(plugin)) {
          this.plugins.set(pluginName, plugin);
          this.configs.set(pluginName, {
            enabled: true,
            settings: {}
          });
          console.log(`Plugin ${pluginName} loaded successfully`);
        } else {
          console.warn(`Invalid plugin at ${path}`);
        }
      }
    } catch (error) {
      console.error('Failed to load plugins:', error);
    }
  }

  // 验证插件
  private validatePlugin(plugin: Plugin): boolean {
    const required = ['name', 'version', 'description', 'author', 'setup'];
    return required.every(key => key in plugin);
  }

  // 安装插件
  install(app: App, router?: any, pinia?: any) {
    this.setApp(app, router, pinia);
    
    for (const [name, plugin] of this.plugins) {
      const config = this.configs.get(name);
      if (config?.enabled) {
        this.activatePlugin(name, plugin);
      }
    }
  }

  // 激活插件
  private activatePlugin(name: string, plugin: Plugin) {
    try {
      // 检查依赖
      if (plugin.dependencies) {
        const missingDeps = plugin.dependencies.filter(dep => !this.plugins.has(dep));
        if (missingDeps.length > 0) {
          console.warn(`Plugin ${name} missing dependencies:`, missingDeps);
          return;
        }
      }

      // 安装插件
      if (this.app) {
        plugin.setup(this.app);
      }

      // 注册路由
      if (plugin.routes && this.router) {
        plugin.routes.forEach(route => {
          this.router.addRoute(route);
        });
      }

      // 注册状态管理
      if (plugin.stores && this.pinia) {
        plugin.stores.forEach(store => {
          // 这里可以根据需要注册store
          console.log(`Store registered for plugin ${name}`);
        });
      }

      // 依赖注入
      if (plugin.provides && this.app) {
        Object.entries(plugin.provides).forEach(([key, value]) => {
          this.app!.provide(key, value);
        });
      }

      // 调用激活回调
      if (plugin.onActivate) {
        plugin.onActivate();
      }

      console.log(`Plugin ${name} activated successfully`);
    } catch (error) {
      console.error(`Failed to activate plugin ${name}:`, error);
    }
  }

  // 停用插件
  deactivatePlugin(name: string) {
    const plugin = this.plugins.get(name);
    if (plugin && plugin.onDeactivate) {
      try {
        plugin.onDeactivate();
        console.log(`Plugin ${name} deactivated successfully`);
      } catch (error) {
        console.error(`Failed to deactivate plugin ${name}:`, error);
      }
    }
  }

  // 更新插件配置
  updatePluginConfig(name: string, config: Partial<PluginConfig>) {
    const currentConfig = this.configs.get(name);
    if (currentConfig) {
      const newConfig = { ...currentConfig, ...config };
      this.configs.set(name, newConfig);
      
      const plugin = this.plugins.get(name);
      if (plugin && plugin.onUpdate) {
        try {
          plugin.onUpdate(newConfig);
          console.log(`Plugin ${name} config updated`);
        } catch (error) {
          console.error(`Failed to update plugin ${name} config:`, error);
        }
      }
    }
  }

  // 获取插件列表
  getPlugins(): Array<{ name: string; plugin: Plugin; config: PluginConfig }> {
    return Array.from(this.plugins.entries()).map(([name, plugin]) => ({
      name,
      plugin,
      config: this.configs.get(name)!
    }));
  }

  // 获取插件
  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  // 检查插件是否已安装
  hasPlugin(name: string): boolean {
    return this.plugins.has(name);
  }

  // 获取插件配置
  getPluginConfig(name: string): PluginConfig | undefined {
    return this.configs.get(name);
  }

  // 重新加载插件
  async reloadPlugins() {
    this.plugins.clear();
    this.configs.clear();
    await this.loadPlugins();
  }
}

export const pluginManager = new PluginManager();
