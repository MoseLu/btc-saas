import { ApiEndpoint } from '../parser/api'
import { TypeGenerator } from './types'

export interface ServiceConfig {
  baseURL: string
  timeout: number
  headers?: Record<string, string>
  withCredentials?: boolean
}

export interface GeneratedService {
  name: string
  content: string
  methods: string[]
}

export class ServiceGenerator {
  private typeGenerator: TypeGenerator

  constructor() {
    this.typeGenerator = new TypeGenerator()
  }

  generateServices(
    endpoints: ApiEndpoint[],
    config: ServiceConfig,
    types: any[]
  ): GeneratedService[] {
    const groupedEndpoints = this.groupEndpointsByTag(endpoints)
    const services: GeneratedService[] = []

    for (const [tag, tagEndpoints] of Object.entries(groupedEndpoints)) {
      const service = this.generateService(tag, tagEndpoints, config, types)
      if (service) {
        services.push(service)
      }
    }

    return services
  }

  private generateService(
    tag: string,
    endpoints: ApiEndpoint[],
    config: ServiceConfig,
    types: any[]
  ): GeneratedService {
    const serviceName = this.toPascalCase(tag) + 'Service'
    const methods: string[] = []
    const imports: string[] = []

    // 添加基础导入
    imports.push("import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'")
    imports.push("import type {")
    
    // 添加类型导入
    for (const endpoint of endpoints) {
      const operationName = this.generateOperationName(endpoint)
      imports.push(`  ${operationName}Request,`)
      imports.push(`  ${operationName}Response,`)
    }
    
    imports.push("} from './types'")

    // 生成方法
    for (const endpoint of endpoints) {
      const method = this.generateMethod(endpoint)
      methods.push(method)
    }

    const content = `${imports.join('\n')}

export class ${serviceName} {
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
    this.baseURL = config.baseURL || '${config.baseURL}'
    this.timeout = config.timeout || ${config.timeout}
    this.headers = config.headers || ${JSON.stringify(config.headers || {})}
    this.withCredentials = config.withCredentials || ${config.withCredentials || false}
  }

  private async request<T = any>(
    method: string,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const axiosConfig: AxiosRequestConfig = {
      method,
      url: \`\${this.baseURL}\${url}\`,
      timeout: this.timeout,
      headers: {
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
      return await axios(axiosConfig)
    } catch (error) {
      console.error(\`API请求失败: \${method} \${url}\`, error)
      throw error
    }
  }

${methods.join('\n\n')}
}

export default ${serviceName}
`

    return {
      name: serviceName,
      content,
      methods: endpoints.map(e => this.generateOperationName(e))
    }
  }

  private generateMethod(endpoint: ApiEndpoint): string {
    const operationName = this.generateOperationName(endpoint)
    const methodName = this.toCamelCase(operationName)
    const method = endpoint.method.toLowerCase()
    const path = endpoint.path

    // 解析路径参数
    const pathParams = endpoint.parameters.filter(p => p.in === 'path')
    const queryParams = endpoint.parameters.filter(p => p.in === 'query')
    const bodyParams = endpoint.parameters.filter(p => p.in === 'body')

    const methodSignature = this.generateMethodSignature(endpoint)
    const methodBody = this.generateMethodBody(endpoint, pathParams, queryParams, bodyParams)

    return `  /**
   * ${endpoint.summary || endpoint.description || `${method.toUpperCase()} ${path}`}
   */
  async ${methodName}(${methodSignature}): Promise<AxiosResponse<${operationName}Response>> {
${methodBody}
  }`
  }

  private generateMethodSignature(endpoint: ApiEndpoint): string {
    const params: string[] = []

    // 路径参数
    const pathParams = endpoint.parameters.filter(p => p.in === 'path')
    if (pathParams.length > 0) {
      const pathParamTypes = pathParams.map(p => {
        const optional = p.required ? '' : '?'
        return `${p.name}${optional}: ${this.typeGenerator.getParameterType(p)}`
      }).join(', ')
      params.push(`pathParams: { ${pathParamTypes} }`)
    }

    // 查询参数
    const queryParams = endpoint.parameters.filter(p => p.in === 'query')
    if (queryParams.length > 0) {
      const queryParamTypes = queryParams.map(p => {
        const optional = p.required ? '' : '?'
        return `${p.name}${optional}: ${this.typeGenerator.getParameterType(p)}`
      }).join(', ')
      params.push(`queryParams?: { ${queryParamTypes} }`)
    }

    // 请求体
    const bodyParams = endpoint.parameters.filter(p => p.in === 'body')
    if (bodyParams.length > 0) {
      const bodyParam = bodyParams[0]
      params.push(`body: ${this.typeGenerator.getParameterType(bodyParam)}`)
    }

    // 配置参数
    params.push('config?: AxiosRequestConfig')

    return params.join(', ')
  }

  private generateMethodBody(
    endpoint: ApiEndpoint,
    pathParams: any[],
    queryParams: any[],
    bodyParams: any[]
  ): string {
    const method = endpoint.method.toLowerCase()
    let path = endpoint.path

    // 替换路径参数
    for (const param of pathParams) {
      path = path.replace(`{${param.name}}`, `\${pathParams.${param.name}}`)
    }

    const lines: string[] = []

    // 构建请求数据
    if (method === 'get' && queryParams.length > 0) {
      lines.push('    const data = queryParams || {}')
    } else if (bodyParams.length > 0) {
      lines.push('    const data = body')
    } else {
      lines.push('    const data = undefined')
    }

    // 构建请求配置
    lines.push('    const requestConfig: AxiosRequestConfig = {')
    if (queryParams.length > 0 && method !== 'get') {
      lines.push('      params: queryParams,')
    }
    lines.push('      ...config')
    lines.push('    }')

    // 返回请求
    lines.push('')
    lines.push(`    return this.request<${this.generateOperationName(endpoint)}Response>('${method.toUpperCase()}', '${path}', data, requestConfig)`)
    lines.push('')

    return lines.join('\n')
  }

  private generateOperationName(endpoint: ApiEndpoint): string {
    if (endpoint.operationId) {
      return this.toPascalCase(endpoint.operationId)
    }

    const method = endpoint.method.toLowerCase()
    const path = endpoint.path
      .replace(/[{}]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')

    return `${this.toPascalCase(method)}${this.toPascalCase(path)}`
  }

  private groupEndpointsByTag(endpoints: ApiEndpoint[]): Record<string, ApiEndpoint[]> {
    const grouped: Record<string, ApiEndpoint[]> = {}
    
    endpoints.forEach(endpoint => {
      if (endpoint.tags.length === 0) {
        const defaultTag = 'default'
        if (!grouped[defaultTag]) {
          grouped[defaultTag] = []
        }
        grouped[defaultTag].push(endpoint)
      } else {
        endpoint.tags.forEach(tag => {
          if (!grouped[tag]) {
            grouped[tag] = []
          }
          grouped[tag].push(endpoint)
        })
      }
    })

    return grouped
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
      .replace(/^(.)/, c => c.toUpperCase())
  }

  private toCamelCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
      .replace(/^(.)/, c => c.toLowerCase())
  }

  generateIndexFile(services: GeneratedService[]): string {
    const imports: string[] = []
    const exports: string[] = []

    for (const service of services) {
      imports.push(`import { ${service.name} } from './${service.name.toLowerCase()}'`)
      exports.push(`export { ${service.name} }`)
    }

    exports.push('')
    exports.push('// 默认导出所有服务')
    exports.push('export const services = {')
    for (const service of services) {
      exports.push(`  ${service.name}: ${service.name},`)
    }
    exports.push('}')

    return `${imports.join('\n')}

${exports.join('\n')}
`
  }
}
