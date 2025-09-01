import axios from 'axios'

export interface ApiEndpoint {
  path: string
  method: string
  summary?: string
  description?: string
  parameters: ApiParameter[]
  responses: ApiResponse[]
  tags: string[]
  security?: string[]
  operationId?: string
}

export interface ApiParameter {
  name: string
  in: 'path' | 'query' | 'header' | 'body'
  required: boolean
  type: string
  description?: string
  schema?: any
  format?: string
}

export interface ApiResponse {
  code: string
  description: string
  schema?: any
  headers?: Record<string, any>
}

export interface ApiSchema {
  type: string
  properties?: Record<string, any>
  required?: string[]
  items?: any
  $ref?: string
  format?: string
  enum?: any[]
  default?: any
}

export interface ApiDefinition {
  info: {
    title: string
    version: string
    description?: string
  }
  paths: Record<string, any>
  definitions?: Record<string, any>
  components?: {
    schemas?: Record<string, any>
    securitySchemes?: Record<string, any>
  }
}

export class ApiParser {
  private swaggerDoc: ApiDefinition | null = null

  async parseFromUrl(url: string): Promise<ApiEndpoint[]> {
    try {
      console.log(`正在从URL解析API: ${url}`)
      const response = await axios.get(url)
      this.swaggerDoc = response.data
      return this.parseEndpoints()
    } catch (error) {
      console.error('Failed to parse API from URL:', error)
      throw error
    }
  }

  async parseFromFile(filePath: string): Promise<ApiEndpoint[]> {
    try {
      console.log(`正在从文件解析API: ${filePath}`)
      // 使用动态导入来避免类型问题
      const SwaggerParser = await import('swagger-parser')
      this.swaggerDoc = await (SwaggerParser as any).default.parse(filePath)
      return this.parseEndpoints()
    } catch (error) {
      console.error('Failed to parse API from file:', error)
      throw error
    }
  }

  async parseFromMock(mockData: any): Promise<ApiEndpoint[]> {
    try {
      console.log('正在从Mock数据解析API')
      this.swaggerDoc = mockData
      return this.parseEndpoints()
    } catch (error) {
      console.error('Failed to parse API from mock data:', error)
      throw error
    }
  }

  private parseEndpoints(): ApiEndpoint[] {
    if (!this.swaggerDoc || !this.swaggerDoc.paths) {
      return []
    }

    const endpoints: ApiEndpoint[] = []

    for (const [path, methods] of Object.entries(this.swaggerDoc.paths)) {
      for (const [method, operation] of Object.entries(methods as any)) {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
          const op = operation as any
          const endpoint: ApiEndpoint = {
            path,
            method: method.toUpperCase(),
            summary: op.summary,
            description: op.description,
            parameters: this.parseParameters(op.parameters || []),
            responses: this.parseResponses(op.responses || {}),
            tags: op.tags || [],
            security: op.security ? Object.keys(op.security[0] || {}) : [],
            operationId: op.operationId
          }
          endpoints.push(endpoint)
        }
      }
    }

    return endpoints
  }

  private parseParameters(parameters: any[]): ApiParameter[] {
    return parameters.map(param => ({
      name: param.name,
      in: param.in,
      required: param.required || false,
      type: param.type || 'object',
      description: param.description,
      schema: param.schema,
      format: param.format
    }))
  }

  private parseResponses(responses: any): ApiResponse[] {
    return Object.entries(responses).map(([code, response]: [string, any]) => ({
      code,
      description: response.description || '',
      schema: response.schema,
      headers: response.headers
    }))
  }

  getSchemas(): Record<string, ApiSchema> {
    if (!this.swaggerDoc) {
      return {}
    }

    // 支持OpenAPI 3.0的components.schemas
    if (this.swaggerDoc.components?.schemas) {
      return this.swaggerDoc.components.schemas
    }

    // 支持Swagger 2.0的definitions
    if (this.swaggerDoc.definitions) {
      return this.swaggerDoc.definitions
    }

    return {}
  }

  getSecuritySchemes(): Record<string, any> {
    if (!this.swaggerDoc?.components?.securitySchemes) {
      return {}
    }
    return this.swaggerDoc.components.securitySchemes
  }

  getApiInfo() {
    if (!this.swaggerDoc?.info) {
      return null
    }
    return this.swaggerDoc.info
  }

  // 根据标签分组端点
  groupEndpointsByTag(endpoints: ApiEndpoint[]): Record<string, ApiEndpoint[]> {
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

  // 验证API文档
  validateApiDocument(): boolean {
    if (!this.swaggerDoc) {
      return false
    }

    const requiredFields = ['info', 'paths']
    return requiredFields.every(field => this.swaggerDoc && field in this.swaggerDoc)
  }
}
