import { ApiEndpoint } from '../parser/api'
import { TypeGenerator } from './types'

export interface CrudConfig {
  entityName: string
  basePath: string
  idField: string
  listEndpoint?: string
  createEndpoint?: string
  updateEndpoint?: string
  deleteEndpoint?: string
  detailEndpoint?: string
}

export interface GeneratedCrud {
  name: string
  content: string
  methods: string[]
}

export class CrudGenerator {
  private typeGenerator: TypeGenerator

  constructor() {
    this.typeGenerator = new TypeGenerator()
  }

  generateCrud(
    endpoints: ApiEndpoint[],
    config: CrudConfig,
    types: any[]
  ): GeneratedCrud {
    const entityName = this.toPascalCase(config.entityName)
    const crudName = `${entityName}Crud`
    
    const methods = this.generateCrudMethods(endpoints, config)
    const imports = this.generateImports(config, types)

    const content = `${imports}

export interface ${entityName} {
  ${config.idField}: string | number
  [key: string]: any
}

export interface ${entityName}ListParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, any>
}

export interface ${entityName}ListResponse {
  data: ${entityName}[]
  total: number
  page: number
  pageSize: number
}

export interface ${entityName}CreateParams {
  data: Omit<${entityName}, '${config.idField}'>
}

export interface ${entityName}UpdateParams {
  ${config.idField}: string | number
  data: Partial<${entityName}>
}

export interface ${entityName}DeleteParams {
  ${config.idField}: string | number
}

export interface ${entityName}DetailParams {
  ${config.idField}: string | number
}

export class ${crudName} {
  private baseURL: string
  private timeout: number
  private headers: Record<string, string>
  private withCredentials: boolean

  constructor(config: {
    baseURL?: string
    timeout?: number
    headers?: Record<string, string>
    withCredentials?: boolean
  } = {}) {
    this.baseURL = config.baseURL || '/api'
    this.timeout = config.timeout || 30000
    this.headers = config.headers || {}
    this.withCredentials = config.withCredentials || false
  }

  private async request<T = any>(
    method: string,
    url: string,
    data?: any,
    config?: any
  ): Promise<T> {
    const axiosConfig = {
      method,
      url: \`\${this.baseURL}\${url}\`,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
        ...config?.headers
      },
      withCredentials: this.withCredentials,
      ...config
    }

    if (data) {
      if (method.toLowerCase() === 'get') {
        axiosConfig.params = data
      } else {
        axiosConfig.data = data
      }
    }

    try {
      const response = await fetch(axiosConfig.url, {
        method: axiosConfig.method,
        headers: axiosConfig.headers,
        body: method.toLowerCase() !== 'get' ? JSON.stringify(data) : undefined,
        credentials: this.withCredentials ? 'include' : 'same-origin'
      })

      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`)
      }

      return await response.json()
    } catch (error) {
      console.error(\`CRUD操作失败: \${method} \${url}\`, error)
      throw error
    }
  }

${methods.join('\n\n')}

  /**
   * 批量操作
   */
  async batchDelete(ids: (string | number)[]): Promise<void> {
    await this.request('POST', '${config.basePath}/batch-delete', { ids })
  }

  async batchUpdate(items: Array<{ ${config.idField}: string | number, data: Partial<${entityName}> }>): Promise<${entityName}[]> {
    return this.request('POST', '${config.basePath}/batch-update', { items })
  }

  /**
   * 导入导出
   */
  async export(params: ${entityName}ListParams = {}): Promise<Blob> {
    const response = await fetch(\`\${this.baseURL}${config.basePath}/export?\${new URLSearchParams(params as any)}\`, {
      method: 'GET',
      headers: this.headers,
      credentials: this.withCredentials ? 'include' : 'same-origin'
    })

    if (!response.ok) {
      throw new Error(\`导出失败: \${response.status}\`)
    }

    return response.blob()
  }

  async import(file: File): Promise<{ success: number, failed: number, errors: string[] }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(\`\${this.baseURL}${config.basePath}/import\`, {
      method: 'POST',
      headers: {
        ...this.headers
      },
      body: formData,
      credentials: this.withCredentials ? 'include' : 'same-origin'
    })

    if (!response.ok) {
      throw new Error(\`导入失败: \${response.status}\`)
    }

    return response.json()
  }

  /**
   * 统计信息
   */
  async getStats(): Promise<{
    total: number
    active: number
    inactive: number
    todayCreated: number
    thisWeekCreated: number
  }> {
    return this.request('GET', '${config.basePath}/stats')
  }
}

export default ${crudName}
`

    return {
      name: crudName,
      content,
      methods: ['list', 'create', 'update', 'delete', 'detail', 'batchDelete', 'batchUpdate', 'export', 'import', 'getStats']
    }
  }

  private generateImports(config: CrudConfig, types: any[]): string {
    return `// ${this.toPascalCase(config.entityName)} CRUD 操作
// 自动生成于 ${new Date().toISOString()}
// 基础路径: ${config.basePath}
// ID字段: ${config.idField}

import type { AxiosRequestConfig } from 'axios'`
  }

  private generateCrudMethods(endpoints: ApiEndpoint[], config: CrudConfig): string[] {
    const methods: string[] = []
    const entityName = this.toPascalCase(config.entityName)

    // 生成列表方法
    methods.push(this.generateListMethod(config, entityName))

    // 生成创建方法
    methods.push(this.generateCreateMethod(config, entityName))

    // 生成更新方法
    methods.push(this.generateUpdateMethod(config, entityName))

    // 生成删除方法
    methods.push(this.generateDeleteMethod(config, entityName))

    // 生成详情方法
    methods.push(this.generateDetailMethod(config, entityName))

    return methods
  }

  private generateListMethod(config: CrudConfig, entityName: string): string {
    return `  /**
   * 获取${entityName}列表
   */
  async list(params: ${entityName}ListParams = {}): Promise<${entityName}ListResponse> {
    const { page = 1, pageSize = 20, sortBy, sortOrder, search, filters, ...rest } = params
    
    const queryParams = {
      page,
      pageSize,
      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder }),
      ...(search && { search }),
      ...(filters && { filters: JSON.stringify(filters) }),
      ...rest
    }

    return this.request<${entityName}ListResponse>('GET', '${config.basePath}', queryParams)
  }`
  }

  private generateCreateMethod(config: CrudConfig, entityName: string): string {
    return `  /**
   * 创建${entityName}
   */
  async create(params: ${entityName}CreateParams): Promise<${entityName}> {
    return this.request<${entityName}>('POST', '${config.basePath}', params.data)
  }`
  }

  private generateUpdateMethod(config: CrudConfig, entityName: string): string {
    return `  /**
   * 更新${entityName}
   */
  async update(params: ${entityName}UpdateParams): Promise<${entityName}> {
    const { ${config.idField}, data } = params
    return this.request<${entityName}>('PUT', \`${config.basePath}/\${${config.idField}}\`, data)
  }`
  }

  private generateDeleteMethod(config: CrudConfig, entityName: string): string {
    return `  /**
   * 删除${entityName}
   */
  async delete(params: ${entityName}DeleteParams): Promise<void> {
    const { ${config.idField} } = params
    await this.request('DELETE', \`${config.basePath}/\${${config.idField}}\`)
  }`
  }

  private generateDetailMethod(config: CrudConfig, entityName: string): string {
    return `  /**
   * 获取${entityName}详情
   */
  async detail(params: ${entityName}DetailParams): Promise<${entityName}> {
    const { ${config.idField} } = params
    return this.request<${entityName}>('GET', \`${config.basePath}/\${${config.idField}}\`)
  }`
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
      .replace(/^(.)/, c => c.toUpperCase())
  }

  generateIndexFile(cruds: GeneratedCrud[]): string {
    const imports: string[] = []
    const exports: string[] = []

    for (const crud of cruds) {
      imports.push(`import { ${crud.name} } from './${crud.name.toLowerCase()}'`)
      exports.push(`export { ${crud.name} }`)
    }

    exports.push('')
    exports.push('// 默认导出所有CRUD')
    exports.push('export const cruds = {')
    for (const crud of cruds) {
      exports.push(`  ${crud.name}: ${crud.name},`)
    }
    exports.push('}')

    return `${imports.join('\n')}

${exports.join('\n')}
`
  }
}
