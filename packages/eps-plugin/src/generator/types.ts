import { ApiSchema, ApiParameter, ApiResponse } from '../parser/api'

export interface GeneratedType {
  name: string
  content: string
  dependencies: string[]
}

export interface TypeMapping {
  [key: string]: string
}

export class TypeGenerator {
  private typeMappings: TypeMapping = {
    'string': 'string',
    'integer': 'number',
    'number': 'number',
    'boolean': 'boolean',
    'array': 'any[]',
    'object': 'Record<string, any>',
    'file': 'File',
    'date': 'string',
    'date-time': 'string',
    'email': 'string',
    'password': 'string',
    'uuid': 'string'
  }

  private generatedTypes: Map<string, GeneratedType> = new Map()

  generateTypes(schemas: Record<string, ApiSchema>): GeneratedType[] {
    this.generatedTypes.clear()
    const types: GeneratedType[] = []

    for (const [name, schema] of Object.entries(schemas)) {
      const generatedType = this.generateType(name, schema)
      if (generatedType) {
        types.push(generatedType)
        this.generatedTypes.set(name, generatedType)
      }
    }

    return types
  }

  generateParameterTypes(parameters: ApiParameter[]): string {
    const paramTypes: string[] = []

    for (const param of parameters) {
      const type = this.getParameterType(param)
      const optional = param.required ? '' : '?'
      paramTypes.push(`${param.name}${optional}: ${type}`)
    }

    return paramTypes.join(', ')
  }

  generateResponseTypes(responses: ApiResponse[]): string {
    const responseTypes: string[] = []

    for (const response of responses) {
      const type = this.getResponseType(response)
      responseTypes.push(`${response.code}: ${type}`)
    }

    return responseTypes.join(' | ')
  }

  // 公共方法，供其他生成器使用
  getParameterType(param: ApiParameter): string {
    if (param.schema) {
      return this.getSchemaType(param.schema)
    }

    return this.typeMappings[param.type] || 'any'
  }

  getResponseType(response: ApiResponse): string {
    if (response.schema) {
      return this.getSchemaType(response.schema)
    }

    return 'any'
  }

  getSchemaType(schema: ApiSchema): string {
    if (schema.$ref) {
      return this.extractRefName(schema.$ref)
    }

    if (schema.type) {
      return this.typeMappings[schema.type] || 'any'
    }

    return 'any'
  }

  private generateType(name: string, schema: ApiSchema): GeneratedType | null {
    if (schema.$ref) {
      return this.generateRefType(name, schema.$ref)
    }

    const typeName = this.toPascalCase(name)
    let content = ''
    const dependencies: string[] = []

    switch (schema.type) {
      case 'object':
        content = this.generateObjectType(typeName, schema)
        break
      case 'array':
        content = this.generateArrayType(typeName, schema)
        break
      case 'string':
        content = this.generateStringType(typeName, schema)
        break
      case 'integer':
      case 'number':
        content = this.generateNumberType(typeName, schema)
        break
      case 'boolean':
        content = this.generateBooleanType(typeName, schema)
        break
      default:
        content = `export type ${typeName} = any;`
    }

    return {
      name: typeName,
      content,
      dependencies
    }
  }

  private generateObjectType(name: string, schema: ApiSchema): string {
    if (!schema.properties) {
      return `export type ${name} = Record<string, any>;`
    }

    const properties: string[] = []
    const required = schema.required || []

    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const optional = required.includes(propName) ? '' : '?'
      const type = this.getSchemaType(propSchema)
      const comment = propSchema.description ? ` /** ${propSchema.description} */` : ''
      properties.push(`  ${propName}${optional}: ${type};${comment}`)
    }

    return `export interface ${name} {
${properties.join('\n')}
}`
  }

  private generateArrayType(name: string, schema: ApiSchema): string {
    if (!schema.items) {
      return `export type ${name} = any[];`
    }

    const itemType = this.getSchemaType(schema.items)
    return `export type ${name} = ${itemType}[];`
  }

  private generateStringType(name: string, schema: ApiSchema): string {
    if (schema.enum) {
      const enumValues = schema.enum.map(value => `'${value}'`).join(' | ')
      return `export type ${name} = ${enumValues};`
    }

    if (schema.format) {
      const formatType = this.typeMappings[schema.format] || 'string'
      return `export type ${name} = ${formatType};`
    }

    return `export type ${name} = string;`
  }

  private generateNumberType(name: string, schema: ApiSchema): string {
    if (schema.enum) {
      const enumValues = schema.enum.join(' | ')
      return `export type ${name} = ${enumValues};`
    }

    return `export type ${name} = number;`
  }

  private generateBooleanType(name: string, schema: ApiSchema): string {
    return `export type ${name} = boolean;`
  }

  private generateRefType(name: string, ref: string): GeneratedType | null {
    const refName = this.extractRefName(ref)
    const typeName = this.toPascalCase(name)
    
    return {
      name: typeName,
      content: `export type ${typeName} = ${refName};`,
      dependencies: [refName]
    }
  }

  private extractRefName(ref: string): string {
    const parts = ref.split('/')
    return this.toPascalCase(parts[parts.length - 1])
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
      .replace(/^(.)/, c => c.toUpperCase())
  }

  generateApiTypes(endpoints: any[]): string {
    const apiTypes: string[] = []

    for (const endpoint of endpoints) {
      const operationName = this.generateOperationName(endpoint)
      const requestType = this.generateRequestType(endpoint)
      const responseType = this.generateResponseTypes(endpoint.responses)

      apiTypes.push(`
export interface ${operationName}Request {
  ${requestType}
}

export interface ${operationName}Response {
  ${responseType}
}`)
    }

    return apiTypes.join('\n')
  }

  private generateOperationName(endpoint: any): string {
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

  private generateRequestType(endpoint: any): string {
    const params: string[] = []

    // Path parameters
    const pathParams = endpoint.parameters.filter((p: any) => p.in === 'path')
    if (pathParams.length > 0) {
      params.push('  // Path parameters')
      for (const param of pathParams) {
        const optional = param.required ? '' : '?'
        params.push(`  ${param.name}${optional}: ${this.getParameterType(param)};`)
      }
    }

    // Query parameters
    const queryParams = endpoint.parameters.filter((p: any) => p.in === 'query')
    if (queryParams.length > 0) {
      params.push('  // Query parameters')
      for (const param of queryParams) {
        const optional = param.required ? '' : '?'
        params.push(`  ${param.name}${optional}: ${this.getParameterType(param)};`)
      }
    }

    // Body parameters
    const bodyParams = endpoint.parameters.filter((p: any) => p.in === 'body')
    if (bodyParams.length > 0) {
      params.push('  // Request body')
      for (const param of bodyParams) {
        params.push(`  body: ${this.getParameterType(param)};`)
      }
    }

    return params.join('\n')
  }

  generateIndexFile(types: GeneratedType[]): string {
    const imports: string[] = []
    const exports: string[] = []

    for (const type of types) {
      exports.push(`export * from './${type.name.toLowerCase()}'`)
    }

    return `${imports.join('\n')}

${exports.join('\n')}
`
  }
}
