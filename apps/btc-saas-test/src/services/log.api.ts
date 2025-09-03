// 暂时注释掉，使用模拟数据
// import { memoryTransport } from '@btc/logs'

// 模拟内存传输器
const memoryTransport = {
  dump: () => [],
  clear: () => {}
}

/**
 * 日志条目接口
 */
export interface LogEntry {
  ts: number
  level: string
  scope: string
  msg: string
  ctx?: Record<string, any>
}

/**
 * 日志管理API服务
 * 封装所有日志相关的API调用
 */
export const logApi = {
  /**
   * 获取所有日志
   */
  getLogs(): LogEntry[] {
    return memoryTransport.dump()
  },

  /**
   * 清空日志
   */
  clearLogs(): void {
    memoryTransport.clear()
  },

  /**
   * 获取可用的日志级别
   */
  getLogLevels(): string[] {
    const logs = this.getLogs()
    const levels = new Set(logs.map(log => log.level))
    return Array.from(levels).sort()
  },

  /**
   * 获取可用的作用域
   */
  getScopes(): string[] {
    const logs = this.getLogs()
    const scopes = new Set(logs.map(log => log.scope))
    return Array.from(scopes).sort()
  },

  /**
   * 过滤日志
   */
  filterLogs(options: {
    level?: string
    scope?: string
    searchQuery?: string
  }): LogEntry[] {
    let logs = this.getLogs()

    // 按级别过滤
    if (options.level) {
      logs = logs.filter(log => log.level === options.level)
    }

    // 按作用域过滤
    if (options.scope) {
      logs = logs.filter(log => log.scope === options.scope)
    }

    // 按搜索关键词过滤
    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase()
      logs = logs.filter(log => 
        log.msg.toLowerCase().includes(query) ||
        log.scope.toLowerCase().includes(query) ||
        (log.ctx && JSON.stringify(log.ctx).toLowerCase().includes(query))
      )
    }

    return logs
  },

  /**
   * 导出日志
   */
  exportLogs(logs: LogEntry[]): void {
    const data = JSON.stringify(logs, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}


