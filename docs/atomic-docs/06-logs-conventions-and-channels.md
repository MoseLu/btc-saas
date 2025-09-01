---
title: 日志体系约定与通道
category: logs
order: 6
owners: [frontend, logs]
auditable: true
acceptance:
  - [ ] 日志通道自动发现
  - [ ] 日志类型分类正确
  - [ ] 离线补偿机制生效
  - [ ] 隐私剥离策略实施
outputs:
  - packages/logs/channels/
  - packages/logs/core/
  - packages/logs/strategies/
related: [05-tools-conventions-and-request-mock, 17-security-and-tenant-isolation]
---

# 日志体系约定与通道

## 背景与目标

建立统一的日志体系，支持多种日志通道（console、http、IndexedDB），实现日志自动发现、分类管理、离线补偿和隐私保护。

## 约定

### 日志类型约定
```typescript
enum LogType {
  NAVIGATION = 'navigation',    // 导航日志
  SDK = 'sdk',                  // SDK调用日志
  AUTH = 'auth',                // 认证日志
  THEME = 'theme',              // 主题切换日志
  API = 'api',                  // API请求日志
  ERROR = 'error',              // 错误日志
  PLUGIN = 'plugin',            // 插件日志
  SCHEDULE = 'schedule',        // 定时任务日志
  CRUD = 'crud'                 // CRUD操作日志
}
```

### 日志通道目录结构
```
packages/logs/
├── channels/           # 日志通道
│   ├── console.ts     # 控制台通道
│   ├── http.ts        # HTTP通道
│   ├── indexeddb.ts   # IndexedDB通道
│   └── file.ts        # 文件通道
├── core/              # 核心功能
│   ├── logger.ts      # 日志管理器
│   ├── formatter.ts   # 日志格式化
│   └── filter.ts      # 日志过滤
├── strategies/        # 策略
│   ├── sampling.ts    # 采样策略
│   ├── privacy.ts     # 隐私策略
│   └── retry.ts       # 重试策略
└── types/             # 类型定义
    ├── log.ts         # 日志类型
    └── channel.ts     # 通道类型
```

## 步骤

### 1. 创建日志类型定义
创建`packages/logs/types/log.ts`：
```typescript
export enum LogType {
  NAVIGATION = 'navigation',
  SDK = 'sdk',
  AUTH = 'auth',
  THEME = 'theme',
  API = 'api',
  ERROR = 'error',
  PLUGIN = 'plugin',
  SCHEDULE = 'schedule',
  CRUD = 'crud'
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export interface LogEntry {
  id: string
  type: LogType
  level: LogLevel
  message: string
  data?: any
  timestamp: number
  traceId?: string
  userId?: string
  sessionId?: string
  userAgent?: string
  url?: string
  stack?: string
  tags?: Record<string, string>
}

export interface LogContext {
  userId?: string
  sessionId?: string
  traceId?: string
  tenant?: string
  environment?: string
  version?: string
}

export interface LogConfig {
  level: LogLevel
  sampling: number // 采样率 0-1
  maxRetries: number
  batchSize: number
  flushInterval: number
  privacy: PrivacyConfig
}

export interface PrivacyConfig {
  stripPII: boolean // 是否剥离个人身份信息
  maskFields: string[] // 需要掩码的字段
  allowedDomains: string[] // 允许的域名
}
```

### 2. 创建通道接口
创建`packages/logs/types/channel.ts`：
```typescript
import type { LogEntry, LogConfig } from './log'

export interface LogChannel {
  name: string
  enabled: boolean
  config: LogConfig
  
  write(entry: LogEntry): Promise<void>
  writeBatch(entries: LogEntry[]): Promise<void>
  flush(): Promise<void>
  close(): Promise<void>
}

export interface ChannelFactory {
  create(config: LogConfig): LogChannel
  supports(environment: string): boolean
}
```

### 3. 实现控制台通道
创建`packages/logs/channels/console.ts`：
```typescript
import type { LogChannel, LogConfig } from '../types'
import type { LogEntry, LogLevel } from '../types/log'

export class ConsoleChannel implements LogChannel {
  name = 'console'
  enabled = true
  config: LogConfig

  constructor(config: LogConfig) {
    this.config = config
  }

  async write(entry: LogEntry): Promise<void> {
    if (!this.enabled || !this.shouldLog(entry)) {
      return
    }

    const formattedMessage = this.formatMessage(entry)
    const consoleMethod = this.getConsoleMethod(entry.level)

    consoleMethod(formattedMessage, entry.data || '')
  }

  async writeBatch(entries: LogEntry[]): Promise<void> {
    for (const entry of entries) {
      await this.write(entry)
    }
  }

  async flush(): Promise<void> {
    // 控制台通道无需刷新
  }

  async close(): Promise<void> {
    this.enabled = false
  }

  private shouldLog(entry: LogEntry): boolean {
    const levelPriority = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1,
      [LogLevel.WARN]: 2,
      [LogLevel.ERROR]: 3,
      [LogLevel.FATAL]: 4
    }

    return levelPriority[entry.level] >= levelPriority[this.config.level]
  }

  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug
      case LogLevel.INFO:
        return console.info
      case LogLevel.WARN:
        return console.warn
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        return console.error
      default:
        return console.log
    }
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString()
    const tags = entry.tags ? ` [${Object.entries(entry.tags).map(([k, v]) => `${k}=${v}`).join(', ')}]` : ''
    
    return `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.type}]${tags} ${entry.message}`
  }
}
```

### 4. 实现HTTP通道
创建`packages/logs/channels/http.ts`：
```typescript
import type { LogChannel, LogConfig } from '../types'
import type { LogEntry } from '../types/log'

export class HttpChannel implements LogChannel {
  name = 'http'
  enabled = true
  config: LogConfig
  private endpoint: string
  private batchQueue: LogEntry[] = []
  private flushTimer?: NodeJS.Timeout

  constructor(config: LogConfig, endpoint: string) {
    this.config = config
    this.endpoint = endpoint
    this.startFlushTimer()
  }

  async write(entry: LogEntry): Promise<void> {
    if (!this.enabled) return

    // 应用采样
    if (Math.random() > this.config.sampling) {
      return
    }

    // 应用隐私策略
    const sanitizedEntry = this.sanitizeEntry(entry)
    
    this.batchQueue.push(sanitizedEntry)

    if (this.batchQueue.length >= this.config.batchSize) {
      await this.flush()
    }
  }

  async writeBatch(entries: LogEntry[]): Promise<void> {
    for (const entry of entries) {
      await this.write(entry)
    }
  }

  async flush(): Promise<void> {
    if (this.batchQueue.length === 0) return

    const batch = [...this.batchQueue]
    this.batchQueue = []

    let retries = 0
    while (retries < this.config.maxRetries) {
      try {
        await this.sendBatch(batch)
        break
      } catch (error) {
        retries++
        if (retries >= this.config.maxRetries) {
          // 重试失败，将日志重新加入队列
          this.batchQueue.unshift(...batch)
          console.error('Failed to send logs after max retries:', error)
        } else {
          // 指数退避
          await this.sleep(Math.pow(2, retries) * 1000)
        }
      }
    }
  }

  async close(): Promise<void> {
    this.enabled = false
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
    }
    await this.flush()
  }

  private async sendBatch(entries: LogEntry[]): Promise<void> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Log-Batch-Size': entries.length.toString()
      },
      body: JSON.stringify({
        logs: entries,
        timestamp: Date.now(),
        environment: this.config.environment
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }

  private sanitizeEntry(entry: LogEntry): LogEntry {
    if (!this.config.privacy.stripPII) {
      return entry
    }

    const sanitized = { ...entry }

    // 移除个人身份信息
    if (sanitized.data) {
      sanitized.data = this.removePII(sanitized.data)
    }

    // 掩码敏感字段
    if (sanitized.tags) {
      sanitized.tags = this.maskSensitiveFields(sanitized.tags)
    }

    return sanitized
  }

  private removePII(data: any): any {
    if (typeof data === 'object' && data !== null) {
      const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'phone', 'email']
      const cleaned = { ...data }

      for (const field of sensitiveFields) {
        if (field in cleaned) {
          cleaned[field] = '[REDACTED]'
        }
      }

      return cleaned
    }

    return data
  }

  private maskSensitiveFields(tags: Record<string, string>): Record<string, string> {
    const masked = { ...tags }
    
    for (const field of this.config.privacy.maskFields) {
      if (field in masked) {
        masked[field] = this.maskValue(masked[field])
      }
    }

    return masked
  }

  private maskValue(value: string): string {
    if (value.length <= 4) {
      return '*'.repeat(value.length)
    }
    return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2)
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush().catch(console.error)
    }, this.config.flushInterval)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

### 5. 实现IndexedDB通道
创建`packages/logs/channels/indexeddb.ts`：
```typescript
import type { LogChannel, LogConfig } from '../types'
import type { LogEntry } from '../types/log'

export class IndexedDBChannel implements LogChannel {
  name = 'indexeddb'
  enabled = true
  config: LogConfig
  private dbName = 'btc-logs'
  private storeName = 'logs'
  private db?: IDBDatabase

  constructor(config: LogConfig) {
    this.config = config
    this.initDB()
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('type', 'type', { unique: false })
          store.createIndex('level', 'level', { unique: false })
        }
      }
    })
  }

  async write(entry: LogEntry): Promise<void> {
    if (!this.enabled || !this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.add(entry)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async writeBatch(entries: LogEntry[]): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)

      let completed = 0
      const total = entries.length

      for (const entry of entries) {
        const request = store.add(entry)
        request.onsuccess = () => {
          completed++
          if (completed === total) {
            resolve()
          }
        }
        request.onerror = () => {
          reject(request.error)
        }
      }
    })
  }

  async flush(): Promise<void> {
    // IndexedDB通道无需刷新
  }

  async close(): Promise<void> {
    this.enabled = false
    if (this.db) {
      this.db.close()
    }
  }

  // 获取存储的日志
  async getLogs(limit = 100): Promise<LogEntry[]> {
    if (!this.db) return []

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('timestamp')
      const request = index.getAll()

      request.onsuccess = () => {
        const logs = request.result as LogEntry[]
        resolve(logs.slice(-limit))
      }
      request.onerror = () => reject(request.error)
    })
  }

  // 清理过期日志
  async cleanup(maxAge: number): Promise<void> {
    if (!this.db) return

    const cutoff = Date.now() - maxAge

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('timestamp')
      const request = index.openCursor(IDBKeyRange.upperBound(cutoff))

      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }
}
```

### 6. 创建日志管理器
创建`packages/logs/core/logger.ts`：
```typescript
import type { LogEntry, LogType, LogLevel, LogContext, LogConfig } from '../types/log'
import type { LogChannel } from '../types/channel'
import { ConsoleChannel } from '../channels/console'
import { HttpChannel } from '../channels/http'
import { IndexedDBChannel } from '../channels/indexeddb'

export class Logger {
  private channels: Map<string, LogChannel> = new Map()
  private context: LogContext = {}
  private config: LogConfig

  constructor(config: LogConfig) {
    this.config = config
    this.initDefaultChannels()
  }

  private initDefaultChannels(): void {
    // 添加控制台通道
    this.addChannel(new ConsoleChannel(this.config))

    // 添加HTTP通道（如果配置了端点）
    if (this.config.endpoint) {
      this.addChannel(new HttpChannel(this.config, this.config.endpoint))
    }

    // 添加IndexedDB通道（用于离线存储）
    this.addChannel(new IndexedDBChannel(this.config))
  }

  addChannel(channel: LogChannel): void {
    this.channels.set(channel.name, channel)
  }

  removeChannel(name: string): void {
    this.channels.delete(name)
  }

  setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context }
  }

  log(type: LogType, level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      id: this.generateId(),
      type,
      level,
      message,
      data,
      timestamp: Date.now(),
      traceId: this.context.traceId,
      userId: this.context.userId,
      sessionId: this.context.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      tags: {
        tenant: this.context.tenant,
        environment: this.context.environment,
        version: this.context.version
      }
    }

    this.writeToChannels(entry)
  }

  debug(type: LogType, message: string, data?: any): void {
    this.log(type, LogLevel.DEBUG, message, data)
  }

  info(type: LogType, message: string, data?: any): void {
    this.log(type, LogLevel.INFO, message, data)
  }

  warn(type: LogType, message: string, data?: any): void {
    this.log(type, LogLevel.WARN, message, data)
  }

  error(type: LogType, message: string, data?: any): void {
    this.log(type, LogLevel.ERROR, message, data)
  }

  fatal(type: LogType, message: string, data?: any): void {
    this.log(type, LogLevel.FATAL, message, data)
  }

  // 便捷方法
  navigation(message: string, data?: any): void {
    this.info(LogType.NAVIGATION, message, data)
  }

  sdk(message: string, data?: any): void {
    this.info(LogType.SDK, message, data)
  }

  auth(message: string, data?: any): void {
    this.info(LogType.AUTH, message, data)
  }

  theme(message: string, data?: any): void {
    this.info(LogType.THEME, message, data)
  }

  api(message: string, data?: any): void {
    this.info(LogType.API, message, data)
  }

  plugin(message: string, data?: any): void {
    this.info(LogType.PLUGIN, message, data)
  }

  crud(message: string, data?: any): void {
    this.info(LogType.CRUD, message, data)
  }

  private async writeToChannels(entry: LogEntry): Promise<void> {
    const promises = Array.from(this.channels.values()).map(channel => {
      return channel.write(entry).catch(error => {
        console.error(`Failed to write to channel ${channel.name}:`, error)
      })
    })

    await Promise.allSettled(promises)
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  async flush(): Promise<void> {
    const promises = Array.from(this.channels.values()).map(channel => {
      return channel.flush().catch(error => {
        console.error(`Failed to flush channel ${channel.name}:`, error)
      })
    })

    await Promise.allSettled(promises)
  }

  async close(): Promise<void> {
    const promises = Array.from(this.channels.values()).map(channel => {
      return channel.close().catch(error => {
        console.error(`Failed to close channel ${channel.name}:`, error)
      })
    })

    await Promise.allSettled(promises)
  }
}

// 创建默认日志实例
export const logger = new Logger({
  level: LogLevel.INFO,
  sampling: 1.0,
  maxRetries: 3,
  batchSize: 10,
  flushInterval: 5000,
  privacy: {
    stripPII: true,
    maskFields: ['password', 'token', 'secret'],
    allowedDomains: ['localhost', 'btc.com']
  }
})

// 导出便捷方法
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  fatal: logger.fatal.bind(logger),
  navigation: logger.navigation.bind(logger),
  sdk: logger.sdk.bind(logger),
  auth: logger.auth.bind(logger),
  theme: logger.theme.bind(logger),
  api: logger.api.bind(logger),
  plugin: logger.plugin.bind(logger),
  crud: logger.crud.bind(logger)
}
```

### 7. 创建自动发现机制
创建`packages/logs/core/discovery.ts`：
```typescript
import type { LogChannel } from '../types/channel'

export class ChannelDiscovery {
  private static instance: ChannelDiscovery
  private channels: Map<string, LogChannel> = new Map()

  static getInstance(): ChannelDiscovery {
    if (!ChannelDiscovery.instance) {
      ChannelDiscovery.instance = new ChannelDiscovery()
    }
    return ChannelDiscovery.instance
  }

  // 自动发现通道
  async discoverChannels(): Promise<LogChannel[]> {
    const discoveredChannels: LogChannel[] = []

    // 动态导入所有通道
    const channelModules = import.meta.glob('../channels/*.ts', { eager: true })

    for (const [path, module] of Object.entries(channelModules)) {
      const channelName = path.split('/').pop()?.replace('.ts', '')
      if (channelName && channelName !== 'index') {
        try {
          // 这里需要根据实际的模块导出结构来调整
          const ChannelClass = (module as any).default || (module as any)[channelName]
          if (ChannelClass && typeof ChannelClass === 'function') {
            const channel = new ChannelClass()
            discoveredChannels.push(channel)
            this.channels.set(channelName, channel)
          }
        } catch (error) {
          console.error(`Failed to load channel ${channelName}:`, error)
        }
      }
    }

    return discoveredChannels
  }

  // 获取已发现的通道
  getChannels(): LogChannel[] {
    return Array.from(this.channels.values())
  }

  // 获取特定通道
  getChannel(name: string): LogChannel | undefined {
    return this.channels.get(name)
  }
}

export const channelDiscovery = ChannelDiscovery.getInstance()
```

## 产出物

- [x] `packages/logs/types/log.ts` - 日志类型定义
- [x] `packages/logs/types/channel.ts` - 通道类型定义
- [x] `packages/logs/channels/console.ts` - 控制台通道
- [x] `packages/logs/channels/http.ts` - HTTP通道
- [x] `packages/logs/channels/indexeddb.ts` - IndexedDB通道
- [x] `packages/logs/core/logger.ts` - 日志管理器
- [x] `packages/logs/core/discovery.ts` - 通道发现
- [x] `packages/logs/strategies/` - 策略实现

## 审计清单

- [ ] 日志通道自动发现
- [ ] 日志类型分类正确
- [ ] 离线补偿机制生效
- [ ] 隐私剥离策略实施
- [ ] 采样策略正常工作
- [ ] 重试机制生效
- [ ] 批量处理正常
- [ ] 性能监控可用
