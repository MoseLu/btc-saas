// 插件系统工具函数

/**
 * 验证插件配置
 */
export function validatePluginConfig(config: any): boolean {
  if (!config || typeof config !== 'object') {
    return false;
  }
  
  const requiredFields = ['name', 'version', 'description', 'author'];
  return requiredFields.every(field => field in config);
}

/**
 * 生成插件ID
 */
export function generatePluginId(name: string, version: string): string {
  return `${name}@${version}`;
}

/**
 * 解析插件ID
 */
export function parsePluginId(id: string): { name: string; version: string } | null {
  const match = id.match(/^(.+)@(.+)$/);
  if (!match) {
    return null;
  }
  
  return {
    name: match[1],
    version: match[2]
  };
}

/**
 * 检查插件依赖
 */
export function checkPluginDependencies(
  plugin: any,
  availablePlugins: Map<string, any>
): { missing: string[]; circular: string[] } {
  const missing: string[] = [];
  const circular: string[] = [];
  
  if (!plugin.dependencies) {
    return { missing, circular };
  }
  
  for (const dep of plugin.dependencies) {
    if (!availablePlugins.has(dep)) {
      missing.push(dep);
    }
  }
  
  return { missing, circular };
}

/**
 * 深度合并对象
 */
export function deepMerge(target: any, source: any): any {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 生成唯一ID
 */
export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 检查是否为有效的URL
 */
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * 安全的JSON解析
 */
export function safeJsonParse(str: string, fallback: any = null): any {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}
