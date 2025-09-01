import { ref, reactive } from 'vue';

export interface PluginSettings {
  [pluginName: string]: {
    enabled: boolean;
    settings: Record<string, any>;
  };
}

class PluginConfigManager {
  private settings = reactive<PluginSettings>({});
  private configKey = 'btc-plugin-config';
  private listeners = new Map<string, Set<(config: any) => void>>();

  constructor() {
    this.loadConfig();
  }

  // 加载配置
  private loadConfig() {
    try {
      const saved = localStorage.getItem(this.configKey);
      if (saved) {
        const config = JSON.parse(saved);
        Object.assign(this.settings, config);
        console.log('Plugin config loaded from localStorage');
      }
    } catch (error) {
      console.error('Failed to load plugin config:', error);
    }
  }

  // 保存配置
  private saveConfig() {
    try {
      localStorage.setItem(this.configKey, JSON.stringify(this.settings));
      console.log('Plugin config saved to localStorage');
    } catch (error) {
      console.error('Failed to save plugin config:', error);
    }
  }

  // 获取插件配置
  getPluginConfig(pluginName: string) {
    return this.settings[pluginName] || { enabled: true, settings: {} };
  }

  // 更新插件配置
  updatePluginConfig(pluginName: string, config: Partial<{ enabled: boolean; settings: Record<string, any> }>) {
    if (!this.settings[pluginName]) {
      this.settings[pluginName] = { enabled: true, settings: {} };
    }
    
    const oldConfig = { ...this.settings[pluginName] };
    Object.assign(this.settings[pluginName], config);
    
    this.saveConfig();
    
    // 触发配置变更事件
    this.notifyConfigChange(pluginName, this.settings[pluginName], oldConfig);
  }

  // 启用插件
  enablePlugin(pluginName: string) {
    this.updatePluginConfig(pluginName, { enabled: true });
  }

  // 禁用插件
  disablePlugin(pluginName: string) {
    this.updatePluginConfig(pluginName, { enabled: false });
  }

  // 获取所有配置
  getAllConfig() {
    return this.settings;
  }

  // 重置插件配置
  resetPluginConfig(pluginName: string) {
    if (this.settings[pluginName]) {
      delete this.settings[pluginName];
      this.saveConfig();
      console.log(`Plugin ${pluginName} config reset`);
    }
  }

  // 重置所有配置
  resetAllConfig() {
    this.settings = {};
    this.saveConfig();
    console.log('All plugin configs reset');
  }

  // 监听配置变更
  onConfigChange(pluginName: string, callback: (config: any) => void) {
    if (!this.listeners.has(pluginName)) {
      this.listeners.set(pluginName, new Set());
    }
    this.listeners.get(pluginName)!.add(callback);
  }

  // 移除配置变更监听
  offConfigChange(pluginName: string, callback: (config: any) => void) {
    const listeners = this.listeners.get(pluginName);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  // 通知配置变更
  private notifyConfigChange(pluginName: string, newConfig: any, oldConfig: any) {
    const listeners = this.listeners.get(pluginName);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback({ newConfig, oldConfig });
        } catch (error) {
          console.error(`Error in config change listener for ${pluginName}:`, error);
        }
      });
    }
  }

  // 导出配置
  exportConfig(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  // 导入配置
  importConfig(configJson: string) {
    try {
      const config = JSON.parse(configJson);
      Object.assign(this.settings, config);
      this.saveConfig();
      console.log('Plugin config imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import plugin config:', error);
      return false;
    }
  }

  // 验证配置
  validateConfig(configJson: string): boolean {
    try {
      const config = JSON.parse(configJson);
      return typeof config === 'object' && config !== null;
    } catch {
      return false;
    }
  }
}

export const pluginConfigManager = new PluginConfigManager();
