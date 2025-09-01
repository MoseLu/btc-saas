export class FormatUtils {
  /**
   * 格式化TypeScript代码
   */
  static formatTypeScript(code: string): string {
    // 基本的TypeScript格式化
    let formatted = code

    // 移除多余的空行
    formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n')

    // 确保import语句之间有适当的空行
    formatted = formatted.replace(/(import.*?;)\n(import)/g, '$1\n\n$2')

    // 确保export语句之间有适当的空行
    formatted = formatted.replace(/(export.*?;)\n(export)/g, '$1\n\n$2')

    // 确保类和方法之间有适当的空行
    formatted = formatted.replace(/(})\n(class|interface|type)/g, '$1\n\n$2')

    // 确保方法之间有适当的空行
    formatted = formatted.replace(/(}\s*)\n(\s*\/\*\*)/g, '$1\n\n$2')

    // 移除行尾空格
    formatted = formatted.replace(/[ \t]+$/gm, '')

    // 确保文件末尾有一个换行符
    if (!formatted.endsWith('\n')) {
      formatted += '\n'
    }

    return formatted
  }

  /**
   * 格式化JSON
   */
  static formatJSON(obj: any): string {
    return JSON.stringify(obj, null, 2)
  }

  /**
   * 转换为PascalCase
   */
  static toPascalCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
      .replace(/^(.)/, c => c.toUpperCase())
  }

  /**
   * 转换为camelCase
   */
  static toCamelCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
      .replace(/^(.)/, c => c.toLowerCase())
  }

  /**
   * 转换为kebab-case
   */
  static toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase()
  }

  /**
   * 转换为snake_case
   */
  static toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase()
  }

  /**
   * 转换为UPPER_SNAKE_CASE
   */
  static toUpperSnakeCase(str: string): string {
    return this.toSnakeCase(str).toUpperCase()
  }

  /**
   * 格式化文件路径
   */
  static formatPath(path: string): string {
    return path.replace(/\\/g, '/').replace(/\/+/g, '/')
  }

  /**
   * 格式化URL
   */
  static formatUrl(url: string): string {
    return url.replace(/\/+/g, '/').replace(/\/$/, '')
  }

  /**
   * 格式化时间戳
   */
  static formatTimestamp(timestamp: number | Date): string {
    const date = new Date(timestamp)
    return date.toISOString()
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`
  }

  /**
   * 格式化持续时间
   */
  static formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  /**
   * 格式化百分比
   */
  static formatPercentage(value: number, total: number): string {
    const percentage = (value / total) * 100
    return `${percentage.toFixed(2)}%`
  }

  /**
   * 格式化数字
   */
  static formatNumber(num: number): string {
    return num.toLocaleString()
  }

  /**
   * 格式化货币
   */
  static formatCurrency(amount: number, currency: string = 'CNY'): string {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency
    }).format(amount)
  }

  /**
   * 格式化日期
   */
  static formatDate(date: Date | string | number): string {
    const d = new Date(date)
    return d.toLocaleDateString('zh-CN')
  }

  /**
   * 格式化日期时间
   */
  static formatDateTime(date: Date | string | number): string {
    const d = new Date(date)
    return d.toLocaleString('zh-CN')
  }

  /**
   * 生成缩进
   */
  static indent(level: number, char: string = '  '): string {
    return char.repeat(level)
  }

  /**
   * 移除缩进
   */
  static removeIndent(text: string): string {
    const lines = text.split('\n')
    const minIndent = Math.min(...lines
      .filter(line => line.trim().length > 0)
      .map(line => line.match(/^\s*/)?.[0].length || 0)
    )

    return lines
      .map(line => line.slice(minIndent))
      .join('\n')
  }

  /**
   * 添加缩进
   */
  static addIndent(text: string, level: number, char: string = '  '): string {
    const indent = this.indent(level, char)
    return text.split('\n').map(line => indent + line).join('\n')
  }

  /**
   * 格式化注释
   */
  static formatComment(comment: string, type: 'single' | 'multi' = 'single'): string {
    if (type === 'multi') {
      return `/**
 * ${comment.split('\n').join('\n * ')}
 */`
    } else {
      return `// ${comment}`
    }
  }

  /**
   * 生成JSDoc注释
   */
  static generateJSDoc(params: {
    description?: string
    params?: Array<{ name: string; type: string; description?: string; required?: boolean }>
    returns?: { type: string; description?: string }
    examples?: string[]
  }): string {
    const lines: string[] = ['/**']

    if (params.description) {
      lines.push(` * ${params.description}`)
      lines.push(' *')
    }

    if (params.params && params.params.length > 0) {
      for (const param of params.params) {
        const required = param.required ? '' : '?'
        const description = param.description ? ` - ${param.description}` : ''
        lines.push(` * @param {${param.type}} ${param.name}${required}${description}`)
      }
      lines.push(' *')
    }

    if (params.returns) {
      const description = params.returns.description ? ` - ${params.returns.description}` : ''
      lines.push(` * @returns {${params.returns.type}}${description}`)
      lines.push(' *')
    }

    if (params.examples && params.examples.length > 0) {
      for (const example of params.examples) {
        lines.push(' * @example')
        lines.push(` * ${example.split('\n').join('\n * ')}`)
        lines.push(' *')
      }
    }

    lines.push(' */')
    return lines.join('\n')
  }

  /**
   * 清理字符串
   */
  static cleanString(str: string): string {
    return str
      .replace(/[^\w\s-]/g, '') // 移除特殊字符
      .replace(/\s+/g, ' ') // 合并多个空格
      .trim()
  }

  /**
   * 生成唯一ID
   */
  static generateId(prefix: string = ''): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `${prefix}${timestamp}${random}`
  }

  /**
   * 生成文件名
   */
  static generateFileName(name: string, extension: string = '.ts'): string {
    const cleanName = this.toKebabCase(this.cleanString(name))
    return `${cleanName}${extension}`
  }

  /**
   * 验证文件名
   */
  static validateFileName(fileName: string): boolean {
    const invalidChars = /[<>:"/\\|?*]/
    return !invalidChars.test(fileName) && fileName.length > 0 && fileName.length <= 255
  }

  /**
   * 转义正则表达式特殊字符
   */
  static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * 转义HTML特殊字符
   */
  static escapeHtml(str: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
    return str.replace(/[&<>"'/]/g, char => htmlEscapes[char])
  }

  /**
   * 反转义HTML特殊字符
   */
  static unescapeHtml(str: string): string {
    const htmlUnescapes: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#x27;': "'",
      '&#x2F;': '/'
    }
    return str.replace(/&amp;|&lt;|&gt;|&quot;|&#x27;|&#x2F;/g, char => htmlUnescapes[char])
  }
}
