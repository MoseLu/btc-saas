// 缓存项接口
export interface CacheItem<T = any> {
  key: string
  value: T
  timestamp: number
  ttl: number // 生存时间（毫秒）
  accessCount: number
  lastAccess: number
}

// 缓存配置
export interface CacheConfig {
  maxSize?: number // 最大缓存项数量
  defaultTTL?: number // 默认生存时间（毫秒）
  cleanupInterval?: number // 清理间隔（毫秒）
}

// 内存缓存类
export class MemoryCache {
  private cache = new Map<string, CacheItem>()
  private config: Required<CacheConfig>
  private cleanupTimer?: NodeJS.Timeout

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: 1000,
      defaultTTL: 5 * 60 * 1000, // 5分钟
      cleanupInterval: 60 * 1000, // 1分钟
      ...config
    }

    // 启动清理定时器
    this.startCleanup()
  }

  // 设置缓存
  set<T>(key: string, value: T, ttl?: number): void {
    const now = Date.now()
    const itemTTL = ttl ?? this.config.defaultTTL

    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, {
      key,
      value,
      timestamp: now,
      ttl: itemTTL,
      accessCount: 0,
      lastAccess: now
    })
  }

  // 获取缓存
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    const now = Date.now()

    // 检查是否过期
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    // 更新访问信息
    item.accessCount++
    item.lastAccess = now

    return item.value as T
  }

  // 检查是否存在
  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }

    // 检查是否过期
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  // 删除缓存
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // 清空缓存
  clear(): void {
    this.cache.clear()
  }

  // 获取缓存大小
  size(): number {
    return this.cache.size
  }

  // 获取所有键
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  // 获取缓存统计信息
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
    totalHits: number
    totalMisses: number
  } {
    const totalHits = Array.from(this.cache.values()).reduce((sum, item) => sum + item.accessCount, 0)
    const totalMisses = this.totalMisses || 0
    const hitRate = totalHits + totalMisses > 0 ? totalHits / (totalHits + totalMisses) : 0

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate,
      totalHits,
      totalMisses
    }
  }

  // 驱逐最旧的项
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccess < oldestTime) {
        oldestTime = item.lastAccess
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  // 清理过期项
  private cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key))

    if (expiredKeys.length > 0) {
      console.log(`Cleaned up ${expiredKeys.length} expired cache items`)
    }
  }

  // 启动清理定时器
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  // 停止清理定时器
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
  }

  // 销毁缓存
  destroy(): void {
    this.stopCleanup()
    this.clear()
  }

  // 私有属性用于统计
  private totalMisses = 0

  // 记录未命中
  private recordMiss(): void {
    this.totalMisses++
  }
}

// 创建默认缓存实例
export const memoryCache = new MemoryCache()

// 便捷方法
export const cache = {
  set: <T>(key: string, value: T, ttl?: number) => memoryCache.set(key, value, ttl),
  get: <T>(key: string) => memoryCache.get<T>(key),
  has: (key: string) => memoryCache.has(key),
  delete: (key: string) => memoryCache.delete(key),
  clear: () => memoryCache.clear(),
  size: () => memoryCache.size(),
  keys: () => memoryCache.keys(),
  stats: () => memoryCache.getStats()
}
