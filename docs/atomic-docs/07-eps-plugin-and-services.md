---
title: EPS 插件与服务生成
category: eps
order: 7
owners: [frontend, backend]
auditable: true
acceptance:
  - [ ] EPS 插件自动生成 service
  - [ ] 类型定义生成正确
  - [ ] 权限校验联动
  - [ ] CRUD 操作完整
outputs:
  - packages/eps-plugin/src/
  - packages/eps-plugin/dist/
  - src/services/auto/
related: [05-tools-conventions-and-request-mock, 09-auth-rbac-and-pinia-stores]
---

# EPS 插件与服务生成

## 背景与目标

开发EPS插件，自动从Mock或真实API生成service和d.ts文件，实现权限校验与CRUD、路由守卫联动，提供完整的类型安全。

## 约定

### EPS插件目录结构
```
packages/eps-plugin/
├── src/
│   ├── generator/      # 代码生成器
│   │   ├── service.ts  # Service生成器
│   │   ├── types.ts    # 类型生成器
│   │   └── crud.ts     # CRUD生成器
│   ├── parser/         # 解析器
│   │   ├── api.ts      # API解析器
│   │   ├── schema.ts   # 模式解析器
│   │   └── mock.ts     # Mock解析器
│   ├── templates/      # 模板文件
│   │   ├── service.tpl # Service模板
│   │   ├── types.tpl   # 类型模板
│   │   └── crud.tpl    # CRUD模板
│   └── utils/          # 工具函数
│       ├── fs.ts       # 文件系统
│       ├── http.ts     # HTTP工具
│       └── format.ts   # 格式化工具
├── dist/               # 构建产物
└── templates/          # 模板文件
```

### 生成的文件结构
```
src/services/auto/
├── index.ts           # 自动生成的入口文件
├── types.ts           # 类型定义
├── api.ts             # API接口
├── crud.ts            # CRUD操作
└── guards.ts          # 权限守卫
```

## 步骤

### 1. 创建EPS插件基础结构
创建`packages/eps-plugin/package.json`：
```json
{
  "name": "@btc/eps-plugin",
  "version": "1.0.0",
  "description": "EPS API服务生成插件",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "generate": "node dist/cli.js"
  },
  "dependencies": {
    "axios": "^1.4.0",
    "swagger-parser": "^10.1.0",
    "handlebars": "^4.7.7"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 2. 创建API解析器
创建`packages/eps-plugin/src/parser/api.ts`：
```typescript
import axios from 'axios'
import SwaggerParser from 'swagger-parser'

export interface ApiEndpoint {
  path: string
  method: string
  summary?: string
  description?: string
  parameters: ApiParameter[]
  responses: ApiResponse[]
  tags: string[]
  security?: string[]
}

export interface ApiParameter {
  name: string
  in: 'path' | 'query' | 'header' | 'body'
  required: boolean
  type: string
  description?: string
  schema?: any
}

export interface ApiResponse {
  code: string
  description: string
  schema?: any
}

export interface ApiSchema {
  type: string
  properties?: Record<string, any>
  required?: string[]
  items?: any
  $ref?: string
}

export class ApiParser {
  private swaggerDoc: any = null

  async parseFromUrl(url: string): Promise<ApiEndpoint[]> {
    try {
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
      this.swaggerDoc = await SwaggerParser.parse(filePath)
      return this.parseEndpoints()
    } catch (error) {
      console.error('Failed to parse API from file:', error)
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
          const endpoint: ApiEndpoint = {
            path,
            method: method.toUpperCase(),
            summary: operation.summary,
            description: operation.description,
            parameters: this.parseParameters(operation.parameters || []),
            responses: this.parseResponses(operation.responses || {}),
            tags: operation.tags || [],
            security: operation.security ? Object.keys(operation.security[0] || {}) : []
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
      schema: param.schema
    }))
  }

  private parseResponses(responses: any): ApiResponse[] {
    return Object.entries(responses).map(([code, response]: [string, any]) => ({
      code,
      description: response.description || '',
      schema: response.schema
    }))
  }

  getSchemas(): Record<string, ApiSchema> {
    return this.swaggerDoc?.definitions || this.swaggerDoc?.components?.schemas || {}
  }
}
```

### 3. 创建Mock解析器
创建`packages/eps-plugin/src/parser/mock.ts`：
```typescript
import type { ApiEndpoint } from './api'

export interface MockEndpoint {
  path: string
  method: string
  response: any
  delay?: number
  errorRate?: number
}

export interface MockSchema {
  type: string
  properties: Record<string, any>
  required: string[]
}

export class MockParser {
  private mockData: Record<string, any> = {}

  async parseFromDirectory(dirPath: string): Promise<MockEndpoint[]> {
    // 这里实现从目录读取Mock文件的逻辑
    // 可以使用glob模式匹配所有mock文件
    return []
  }

  async parseFromFile(filePath: string): Promise<MockEndpoint[]> {
    try {
      const mockModule = await import(filePath)
      return this.parseMockModule(mockModule)
    } catch (error) {
      console.error('Failed to parse mock file:', error)
      return []
    }
  }

  private parseMockModule(mockModule: any): MockEndpoint[] {
    const endpoints: MockEndpoint[] = []

    for (const [key, value] of Object.entries(mockModule)) {
      if (this.isMockEndpoint(value)) {
        endpoints.push(value as MockEndpoint)
      }
    }

    return endpoints
  }

  private isMockEndpoint(value: any): boolean {
    return value && 
           typeof value === 'object' && 
           'path' in value && 
           'method' in value && 
           'response' in value
  }

  generateMockSchema(endpoint: MockEndpoint): MockSchema {
    // 根据Mock响应生成Schema
    return {
      type: 'object',
      properties: this.inferProperties(endpoint.response),
      required: []
    }
  }

  private inferProperties(data: any): Record<string, any> {
    if (Array.isArray(data)) {
      return {
        items: this.inferProperties(data[0] || {})
      }
    }

    if (typeof data === 'object' && data !== null) {
      const properties: Record<string, any> = {}
      
      for (const [key, value] of Object.entries(data)) {
        properties[key] = {
          type: this.getType(value),
          ...(typeof value === 'object' && value !== null && !Array.isArray(value) 
            ? { properties: this.inferProperties(value) }
            : {})
        }
      }

      return properties
    }

    return { type: this.getType(data) }
  }

  private getType(value: any): string {
    if (Array.isArray(value)) return 'array'
    if (value === null) return 'null'
    return typeof value
  }
}
```

### 4. 创建Service生成器
创建`packages/eps-plugin/src/generator/service.ts`：
```typescript
import type { ApiEndpoint } from '../parser/api'
import { readTemplate, writeFile } from '../utils/fs'

export interface ServiceConfig {
  baseURL: string
  timeout: number
  headers: Record<string, string>
  interceptors: boolean
}

export class ServiceGenerator {
  private config: ServiceConfig

  constructor(config: ServiceConfig) {
    this.config = config
  }

  async generateService(endpoints: ApiEndpoint[], outputPath: string): Promise<void> {
    const template = await readTemplate('service.tpl')
    const serviceCode = this.generateServiceCode(endpoints, template)
    
    await writeFile(outputPath, serviceCode)
  }

  private generateServiceCode(endpoints: ApiEndpoint[], template: string): string {
    const imports = this.generateImports()
    const methods = this.generateMethods(endpoints)
    const types = this.generateTypes(endpoints)

    return template
      .replace('{{IMPORTS}}', imports)
      .replace('{{TYPES}}', types)
      .replace('{{METHODS}}', methods)
      .replace('{{CONFIG}}', JSON.stringify(this.config, null, 2))
  }

  private generateImports(): string {
    return `
import { httpClient } from '@btc/tools/request'
import type { ApiResponse } from './types'
`
  }

  private generateTypes(endpoints: ApiEndpoint[]): string {
    const types: string[] = []

    for (const endpoint of endpoints) {
      const methodName = this.generateMethodName(endpoint)
      const requestType = this.generateRequestType(endpoint)
      const responseType = this.generateResponseType(endpoint)

      types.push(`
export interface ${requestType} {
  ${endpoint.parameters
    .filter(p => p.in === 'body')
    .map(p => `${p.name}${p.required ? '' : '?'}: ${this.mapType(p.type)}`)
    .join('\n  ')}
}

export interface ${responseType} {
  ${this.generateResponseProperties(endpoint)}
}
`)
    }

    return types.join('\n')
  }

  private generateMethods(endpoints: ApiEndpoint[]): string {
    const methods: string[] = []

    for (const endpoint of endpoints) {
      const methodName = this.generateMethodName(endpoint)
      const requestType = this.generateRequestType(endpoint)
      const responseType = this.generateResponseType(endpoint)
      const params = this.generateMethodParams(endpoint)

      methods.push(`
  async ${methodName}(${params}): Promise<ApiResponse<${responseType}>> {
    return httpClient.${endpoint.method.toLowerCase()}('${endpoint.path}', ${this.generateMethodBody(endpoint)})
  }
`)
    }

    return methods.join('\n')
  }

  private generateMethodName(endpoint: ApiEndpoint): string {
    const pathParts = endpoint.path.split('/').filter(Boolean)
    const lastPart = pathParts[pathParts.length - 1]
    
    // 根据HTTP方法生成方法名
    const methodPrefix = {
      'GET': 'get',
      'POST': 'create',
      'PUT': 'update',
      'DELETE': 'delete',
      'PATCH': 'patch'
    }[endpoint.method] || 'request'

    return `${methodPrefix}${this.capitalize(lastPart)}`
  }

  private generateRequestType(endpoint: ApiEndpoint): string {
    const methodName = this.generateMethodName(endpoint)
    return `${this.capitalize(methodName)}Request`
  }

  private generateResponseType(endpoint: ApiEndpoint): string {
    const methodName = this.generateMethodName(endpoint)
    return `${this.capitalize(methodName)}Response`
  }

  private generateMethodParams(endpoint: ApiEndpoint): string {
    const params: string[] = []

    // 路径参数
    const pathParams = endpoint.parameters.filter(p => p.in === 'path')
    if (pathParams.length > 0) {
      params.push(`params: { ${pathParams.map(p => `${p.name}: string`).join(', ')} }`)
    }

    // 查询参数
    const queryParams = endpoint.parameters.filter(p => p.in === 'query')
    if (queryParams.length > 0) {
      params.push(`query: { ${queryParams.map(p => `${p.name}${p.required ? '' : '?'}: ${this.mapType(p.type)}`).join(', ')} }`)
    }

    // 请求体
    const bodyParams = endpoint.parameters.filter(p => p.in === 'body')
    if (bodyParams.length > 0) {
      const requestType = this.generateRequestType(endpoint)
      params.push(`data: ${requestType}`)
    }

    return params.join(', ')
  }

  private generateMethodBody(endpoint: ApiEndpoint): string {
    const parts: string[] = []

    // 添加查询参数
    const queryParams = endpoint.parameters.filter(p => p.in === 'query')
    if (queryParams.length > 0) {
      parts.push('query')
    }

    // 添加请求体
    const bodyParams = endpoint.parameters.filter(p => p.in === 'body')
    if (bodyParams.length > 0) {
      parts.push('data')
    }

    return parts.join(', ')
  }

  private generateResponseProperties(endpoint: ApiEndpoint): string {
    // 这里应该根据实际的响应模式生成属性
    return '// 根据API响应模式生成'
  }

  private mapType(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'integer': 'number',
      'boolean': 'boolean',
      'array': 'any[]',
      'object': 'Record<string, any>'
    }
    return typeMap[type] || 'any'
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}
```

### 5. 创建CRUD生成器
创建`packages/eps-plugin/src/generator/crud.ts`：
```typescript
import type { ApiEndpoint } from '../parser/api'

export interface CrudConfig {
  entity: string
  basePath: string
  permissions: string[]
}

export class CrudGenerator {
  async generateCrud(endpoints: ApiEndpoint[], config: CrudConfig, outputPath: string): Promise<void> {
    const crudCode = this.generateCrudCode(endpoints, config)
    await writeFile(outputPath, crudCode)
  }

  private generateCrudCode(endpoints: ApiEndpoint[], config: CrudConfig): string {
    return `
import { ref, computed } from 'vue'
import { useAuthStore } from '@btc/bridge/stores/auth'
import { log } from '@btc/logs'
import * as api from './api'

export interface ${config.entity} {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface ${config.entity}Query {
  page?: number
  size?: number
  keyword?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ${config.entity}Create {
  name: string
  description?: string
}

export interface ${config.entity}Update {
  name?: string
  description?: string
}

export function use${config.entity}Crud() {
  const authStore = useAuthStore()
  
  // 状态
  const loading = ref(false)
  const list = ref<${config.entity}[]>([])
  const total = ref(0)
  const currentItem = ref<${config.entity} | null>(null)
  const query = ref<${config.entity}Query>({
    page: 1,
    size: 10
  })

  // 计算属性
  const hasPermission = computed(() => {
    return config.permissions.every(permission => 
      authStore.permissions.includes(permission)
    )
  })

  // 获取列表
  const getList = async () => {
    if (!hasPermission.value) {
      throw new Error('权限不足')
    }

    loading.value = true
    try {
      const response = await api.get${config.entity}List(query.value)
      list.value = response.data.items
      total.value = response.data.total
      
      log.crud('获取${config.entity}列表成功', { 
        query: query.value, 
        count: list.value.length 
      })
    } catch (error) {
      log.error('crud', '获取${config.entity}列表失败', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 获取详情
  const getDetail = async (id: string) => {
    if (!hasPermission.value) {
      throw new Error('权限不足')
    }

    loading.value = true
    try {
      const response = await api.get${config.entity}Detail({ id })
      currentItem.value = response.data
      
      log.crud('获取${config.entity}详情成功', { id })
    } catch (error) {
      log.error('crud', '获取${config.entity}详情失败', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 创建
  const create = async (data: ${config.entity}Create) => {
    if (!hasPermission.value) {
      throw new Error('权限不足')
    }

    loading.value = true
    try {
      const response = await api.create${config.entity}(data)
      
      log.crud('创建${config.entity}成功', { data, result: response.data })
      return response.data
    } catch (error) {
      log.error('crud', '创建${config.entity}失败', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 更新
  const update = async (id: string, data: ${config.entity}Update) => {
    if (!hasPermission.value) {
      throw new Error('权限不足')
    }

    loading.value = true
    try {
      const response = await api.update${config.entity}({ id }, data)
      
      log.crud('更新${config.entity}成功', { id, data, result: response.data })
      return response.data
    } catch (error) {
      log.error('crud', '更新${config.entity}失败', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 删除
  const remove = async (id: string) => {
    if (!hasPermission.value) {
      throw new Error('权限不足')
    }

    loading.value = true
    try {
      await api.delete${config.entity}({ id })
      
      log.crud('删除${config.entity}成功', { id })
    } catch (error) {
      log.error('crud', '删除${config.entity}失败', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 批量删除
  const batchRemove = async (ids: string[]) => {
    if (!hasPermission.value) {
      throw new Error('权限不足')
    }

    loading.value = true
    try {
      await Promise.all(ids.map(id => api.delete${config.entity}({ id })))
      
      log.crud('批量删除${config.entity}成功', { ids })
    } catch (error) {
      log.error('crud', '批量删除${config.entity}失败', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 重置查询
  const resetQuery = () => {
    query.value = {
      page: 1,
      size: 10
    }
  }

  // 重置状态
  const reset = () => {
    loading.value = false
    list.value = []
    total.value = 0
    currentItem.value = null
    resetQuery()
  }

  return {
    // 状态
    loading: readonly(loading),
    list: readonly(list),
    total: readonly(total),
    currentItem: readonly(currentItem),
    query,
    hasPermission,

    // 方法
    getList,
    getDetail,
    create,
    update,
    remove,
    batchRemove,
    resetQuery,
    reset
  }
}
`
  }
}
```

### 6. 创建权限守卫生成器
创建`packages/eps-plugin/src/generator/guards.ts`：
```typescript
import type { ApiEndpoint } from '../parser/api'

export interface GuardConfig {
  entity: string
  permissions: string[]
  roles: string[]
}

export class GuardGenerator {
  async generateGuards(endpoints: ApiEndpoint[], config: GuardConfig, outputPath: string): Promise<void> {
    const guardCode = this.generateGuardCode(endpoints, config)
    await writeFile(outputPath, guardCode)
  }

  private generateGuardCode(endpoints: ApiEndpoint[], config: GuardConfig): string {
    return `
import { useAuthStore } from '@btc/bridge/stores/auth'
import { log } from '@btc/logs'

export interface GuardResult {
  allowed: boolean
  reason?: string
}

// 权限检查函数
export function check${config.entity}Permission(action: string): GuardResult {
  const authStore = useAuthStore()
  
  // 检查用户是否已认证
  if (!authStore.isAuthenticated) {
    return {
      allowed: false,
      reason: '用户未登录'
    }
  }

  // 检查角色权限
  const hasRole = config.roles.some(role => 
    authStore.user?.roles.includes(role)
  )
  
  if (!hasRole) {
    return {
      allowed: false,
      reason: '角色权限不足'
    }
  }

  // 检查具体权限
  const requiredPermission = \`${config.entity.toLowerCase()}:\${action}\`
  const hasPermission = authStore.permissions.includes(requiredPermission)
  
  if (!hasPermission) {
    return {
      allowed: false,
      reason: \`缺少权限: \${requiredPermission}\`
    }
  }

  return { allowed: true }
}

// 路由守卫
export function create${config.entity}Guard(action: string) {
  return () => {
    const result = check${config.entity}Permission(action)
    
    if (!result.allowed) {
      log.auth('访问被拒绝', { 
        action, 
        reason: result.reason,
        user: authStore.user?.id 
      })
      
      // 可以重定向到错误页面或显示提示
      throw new Error(result.reason)
    }
    
    log.auth('访问通过', { action, user: authStore.user?.id })
  }
}

// 组件级权限检查
export function use${config.entity}Guard() {
  const authStore = useAuthStore()
  
  const canView = computed(() => 
    check${config.entity}Permission('view').allowed
  )
  
  const canCreate = computed(() => 
    check${config.entity}Permission('create').allowed
  )
  
  const canEdit = computed(() => 
    check${config.entity}Permission('edit').allowed
  )
  
  const canDelete = computed(() => 
    check${config.entity}Permission('delete').allowed
  )
  
  const canExport = computed(() => 
    check${config.entity}Permission('export').allowed
  )

  return {
    canView,
    canCreate,
    canEdit,
    canDelete,
    canExport
  }
}

// 指令
export const ${config.entity.toLowerCase()}Permission = {
  mounted(el: HTMLElement, binding: any) {
    const action = binding.value
    const result = check${config.entity}Permission(action)
    
    if (!result.allowed) {
      el.style.display = 'none'
    }
  }
}
`
  }
}
```

### 7. 创建CLI工具
创建`packages/eps-plugin/src/cli.ts`：
```typescript
#!/usr/bin/env node

import { Command } from 'commander'
import { ApiParser } from './parser/api'
import { MockParser } from './parser/mock'
import { ServiceGenerator } from './generator/service'
import { CrudGenerator } from './generator/crud'
import { GuardGenerator } from './generator/guards'
import { ensureDir, writeFile } from './utils/fs'

const program = new Command()

program
  .name('eps-generator')
  .description('EPS API服务生成器')
  .version('1.0.0')

program
  .command('generate')
  .description('生成API服务')
  .option('-s, --source <source>', 'API源 (url或文件路径)')
  .option('-m, --mock <mock>', 'Mock文件路径')
  .option('-o, --output <output>', '输出目录', 'src/services/auto')
  .option('-c, --config <config>', '配置文件路径')
  .action(async (options) => {
    try {
      await generateServices(options)
      console.log('✅ 服务生成完成')
    } catch (error) {
      console.error('❌ 服务生成失败:', error)
      process.exit(1)
    }
  })

async function generateServices(options: any) {
  const { source, mock, output, config } = options
  
  // 确保输出目录存在
  await ensureDir(output)
  
  // 解析API
  const apiParser = new ApiParser()
  let endpoints: any[] = []
  
  if (source) {
    if (source.startsWith('http')) {
      endpoints = await apiParser.parseFromUrl(source)
    } else {
      endpoints = await apiParser.parseFromFile(source)
    }
  }
  
  // 解析Mock
  if (mock) {
    const mockParser = new MockParser()
    const mockEndpoints = await mockParser.parseFromFile(mock)
    // 合并或替换endpoints
    endpoints = [...endpoints, ...mockEndpoints]
  }
  
  // 生成服务
  const serviceGenerator = new ServiceGenerator({
    baseURL: '/api',
    timeout: 30000,
    headers: {},
    interceptors: true
  })
  
  await serviceGenerator.generateService(
    endpoints,
    `${output}/api.ts`
  )
  
  // 生成类型
  const schemas = apiParser.getSchemas()
  await writeFile(
    `${output}/types.ts`,
    generateTypes(schemas)
  )
  
  // 生成CRUD（如果配置了实体）
  if (config) {
    const configData = JSON.parse(await readFile(config))
    
    for (const entityConfig of configData.entities || []) {
      const crudGenerator = new CrudGenerator()
      await crudGenerator.generateCrud(
        endpoints.filter(e => e.path.includes(entityConfig.basePath)),
        entityConfig,
        `${output}/${entityConfig.entity.toLowerCase()}-crud.ts`
      )
      
      const guardGenerator = new GuardGenerator()
      await guardGenerator.generateGuards(
        endpoints.filter(e => e.path.includes(entityConfig.basePath)),
        entityConfig,
        `${output}/${entityConfig.entity.toLowerCase()}-guards.ts`
      )
    }
  }
  
  // 生成入口文件
  await writeFile(
    `${output}/index.ts`,
    generateIndex(configData?.entities || [])
  )
}

function generateTypes(schemas: Record<string, any>): string {
  // 根据schemas生成TypeScript类型定义
  return `
// 自动生成的类型定义
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

${Object.entries(schemas).map(([name, schema]) => `
export interface ${name} {
  ${Object.entries(schema.properties || {}).map(([prop, def]: [string, any]) => 
    `${prop}${schema.required?.includes(prop) ? '' : '?'}: ${mapSchemaType(def)}`
  ).join('\n  ')}
}
`).join('\n')}
`
}

function generateIndex(entities: any[]): string {
  return `
// 自动生成的服务入口文件
export * from './types'
export * from './api'

${entities.map(entity => `
export * from './${entity.entity.toLowerCase()}-crud'
export * from './${entity.entity.toLowerCase()}-guards'
`).join('\n')}
`
}

function mapSchemaType(schema: any): string {
  if (schema.$ref) {
    return schema.$ref.split('/').pop()
  }
  
  switch (schema.type) {
    case 'string':
      return schema.enum ? schema.enum.map((e: string) => `'${e}'`).join(' | ') : 'string'
    case 'number':
    case 'integer':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'array':
      return `${mapSchemaType(schema.items)}[]`
    case 'object':
      return 'Record<string, any>'
    default:
      return 'any'
  }
}

program.parse()
```

## 产出物

- [x] `packages/eps-plugin/src/parser/` - API和Mock解析器
- [x] `packages/eps-plugin/src/generator/` - 代码生成器
- [x] `packages/eps-plugin/src/templates/` - 模板文件
- [x] `packages/eps-plugin/src/utils/` - 工具函数
- [x] `packages/eps-plugin/src/cli.ts` - CLI工具
- [x] `src/services/auto/` - 自动生成的服务文件

## 审计清单

- [ ] EPS 插件自动生成 service
- [ ] 类型定义生成正确
- [ ] 权限校验联动
- [ ] CRUD 操作完整
- [ ] 路由守卫生效
- [ ] Mock 数据支持
- [ ] CLI 工具可用
- [ ] 模板系统完整
