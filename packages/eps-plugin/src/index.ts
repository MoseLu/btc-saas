import { ApiParser } from './parser/api'
import { TypeGenerator } from './generator/types'
import { ServiceGenerator } from './generator/service'
import { CrudGenerator } from './generator/crud'
import { FileUtils } from './utils/fs'
import { FormatUtils } from './utils/format'

export interface EpsConfig {
  baseURL: string
  timeout: number
  headers?: Record<string, string>
  withCredentials?: boolean
  outputDir: string
  generateTypes?: boolean
  generateServices?: boolean
  generateCrud?: boolean
  crudConfigs?: Array<{
    entityName: string
    basePath: string
    idField: string
  }>
}

export interface GenerationResult {
  success: boolean
  files: string[]
  errors: string[]
  warnings: string[]
  stats: {
    endpoints: number
    types: number
    services: number
    cruds: number
  }
}

export class EpsGenerator {
  private apiParser: ApiParser
  private typeGenerator: TypeGenerator
  private serviceGenerator: ServiceGenerator
  private crudGenerator: CrudGenerator

  constructor() {
    this.apiParser = new ApiParser()
    this.typeGenerator = new TypeGenerator()
    this.serviceGenerator = new ServiceGenerator()
    this.crudGenerator = new CrudGenerator()
  }

  /**
   * 从URL生成EPS服务
   */
  async generateFromUrl(url: string, config: EpsConfig): Promise<GenerationResult> {
    try {
      console.log(`开始从URL生成EPS服务: ${url}`)
      
      // 解析API
      const endpoints = await this.apiParser.parseFromUrl(url)
      if (endpoints.length === 0) {
        throw new Error('未找到任何API端点')
      }

      return await this.generateFromEndpoints(endpoints, config)
    } catch (error) {
      console.error('从URL生成EPS服务失败:', error)
      return {
        success: false,
        files: [],
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: [],
        stats: { endpoints: 0, types: 0, services: 0, cruds: 0 }
      }
    }
  }

  /**
   * 从文件生成EPS服务
   */
  async generateFromFile(filePath: string, config: EpsConfig): Promise<GenerationResult> {
    try {
      console.log(`开始从文件生成EPS服务: ${filePath}`)
      
      // 解析API
      const endpoints = await this.apiParser.parseFromFile(filePath)
      if (endpoints.length === 0) {
        throw new Error('未找到任何API端点')
      }

      return await this.generateFromEndpoints(endpoints, config)
    } catch (error) {
      console.error('从文件生成EPS服务失败:', error)
      return {
        success: false,
        files: [],
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: [],
        stats: { endpoints: 0, types: 0, services: 0, cruds: 0 }
      }
    }
  }

  /**
   * 从Mock数据生成EPS服务
   */
  async generateFromMock(mockData: any, config: EpsConfig): Promise<GenerationResult> {
    try {
      console.log('开始从Mock数据生成EPS服务')
      
      // 解析API
      const endpoints = await this.apiParser.parseFromMock(mockData)
      if (endpoints.length === 0) {
        throw new Error('未找到任何API端点')
      }

      return await this.generateFromEndpoints(endpoints, config)
    } catch (error) {
      console.error('从Mock数据生成EPS服务失败:', error)
      return {
        success: false,
        files: [],
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: [],
        stats: { endpoints: 0, types: 0, services: 0, cruds: 0 }
      }
    }
  }

  /**
   * 从端点生成EPS服务
   */
  private async generateFromEndpoints(endpoints: any[], config: EpsConfig): Promise<GenerationResult> {
    const result: GenerationResult = {
      success: true,
      files: [],
      errors: [],
      warnings: [],
      stats: {
        endpoints: endpoints.length,
        types: 0,
        services: 0,
        cruds: 0
      }
    }

    try {
      // 确保输出目录存在
      await FileUtils.ensureDir(config.outputDir)

      // 生成类型定义
      if (config.generateTypes !== false) {
        const typesResult = await this.generateTypes(endpoints, config)
        result.files.push(...typesResult.files)
        result.stats.types = typesResult.count
        result.warnings.push(...typesResult.warnings)
      }

      // 生成服务类
      if (config.generateServices !== false) {
        const servicesResult = await this.generateServices(endpoints, config)
        result.files.push(...servicesResult.files)
        result.stats.services = servicesResult.count
        result.warnings.push(...servicesResult.warnings)
      }

      // 生成CRUD操作
      if (config.generateCrud && config.crudConfigs) {
        const crudResult = await this.generateCruds(endpoints, config)
        result.files.push(...crudResult.files)
        result.stats.cruds = crudResult.count
        result.warnings.push(...crudResult.warnings)
      }

      // 生成索引文件
      const indexFile = await this.generateIndexFile(config)
      if (indexFile) {
        result.files.push(indexFile)
      }

      console.log(`EPS服务生成完成: ${result.files.length} 个文件`)
      console.log(`统计信息: ${result.stats.endpoints} 个端点, ${result.stats.types} 个类型, ${result.stats.services} 个服务, ${result.stats.cruds} 个CRUD`)

    } catch (error) {
      result.success = false
      result.errors.push(error instanceof Error ? error.message : String(error))
    }

    return result
  }

  /**
   * 生成类型定义
   */
  private async generateTypes(endpoints: any[], config: EpsConfig): Promise<{ files: string[], count: number, warnings: string[] }> {
    const files: string[] = []
    const warnings: string[] = []
    let count = 0

    try {
      // 获取schemas
      const schemas = this.apiParser.getSchemas()
      
      // 生成类型
      const types = this.typeGenerator.generateTypes(schemas)
      count = types.length

      // 写入类型文件
      const typesDir = FileUtils.join(config.outputDir, 'types')
      await FileUtils.ensureDir(typesDir)

      for (const type of types) {
        const fileName = FormatUtils.generateFileName(type.name, '.ts')
        const filePath = FileUtils.join(typesDir, fileName)
        const content = FormatUtils.formatTypeScript(type.content)
        
        await FileUtils.writeFile(filePath, content)
        files.push(filePath)
      }

      // 生成类型索引文件
      const typesIndexPath = FileUtils.join(typesDir, 'index.ts')
      const typesIndexContent = this.typeGenerator.generateIndexFile(types)
      await FileUtils.writeFile(typesIndexPath, FormatUtils.formatTypeScript(typesIndexContent))
      files.push(typesIndexPath)

    } catch (error) {
      warnings.push(`生成类型定义失败: ${error instanceof Error ? error.message : String(error)}`)
    }

    return { files, count, warnings }
  }

  /**
   * 生成服务类
   */
  private async generateServices(endpoints: any[], config: EpsConfig): Promise<{ files: string[], count: number, warnings: string[] }> {
    const files: string[] = []
    const warnings: string[] = []
    let count = 0

    try {
      // 生成服务
      const services = this.serviceGenerator.generateServices(endpoints, {
        baseURL: config.baseURL,
        timeout: config.timeout,
        headers: config.headers,
        withCredentials: config.withCredentials
      }, [])

      count = services.length

      // 写入服务文件
      const servicesDir = FileUtils.join(config.outputDir, 'services')
      await FileUtils.ensureDir(servicesDir)

      for (const service of services) {
        const fileName = FormatUtils.generateFileName(service.name, '.ts')
        const filePath = FileUtils.join(servicesDir, fileName)
        const content = FormatUtils.formatTypeScript(service.content)
        
        await FileUtils.writeFile(filePath, content)
        files.push(filePath)
      }

      // 生成服务索引文件
      const servicesIndexPath = FileUtils.join(servicesDir, 'index.ts')
      const servicesIndexContent = this.serviceGenerator.generateIndexFile(services)
      await FileUtils.writeFile(servicesIndexPath, FormatUtils.formatTypeScript(servicesIndexContent))
      files.push(servicesIndexPath)

    } catch (error) {
      warnings.push(`生成服务类失败: ${error instanceof Error ? error.message : String(error)}`)
    }

    return { files, count, warnings }
  }

  /**
   * 生成CRUD操作
   */
  private async generateCruds(endpoints: any[], config: EpsConfig): Promise<{ files: string[], count: number, warnings: string[] }> {
    const files: string[] = []
    const warnings: string[] = []
    let count = 0

    try {
      if (!config.crudConfigs) {
        return { files, count, warnings }
      }

      // 生成CRUD
      const cruds: any[] = []
      
      for (const crudConfig of config.crudConfigs) {
        const crud = this.crudGenerator.generateCrud(endpoints, crudConfig, [])
        cruds.push(crud)
      }

      count = cruds.length

      // 写入CRUD文件
      const crudsDir = FileUtils.join(config.outputDir, 'cruds')
      await FileUtils.ensureDir(crudsDir)

      for (const crud of cruds) {
        const fileName = FormatUtils.generateFileName(crud.name, '.ts')
        const filePath = FileUtils.join(crudsDir, fileName)
        const content = FormatUtils.formatTypeScript(crud.content)
        
        await FileUtils.writeFile(filePath, content)
        files.push(filePath)
      }

      // 生成CRUD索引文件
      const crudsIndexPath = FileUtils.join(crudsDir, 'index.ts')
      const crudsIndexContent = this.crudGenerator.generateIndexFile(cruds)
      await FileUtils.writeFile(crudsIndexPath, FormatUtils.formatTypeScript(crudsIndexContent))
      files.push(crudsIndexPath)

    } catch (error) {
      warnings.push(`生成CRUD操作失败: ${error instanceof Error ? error.message : String(error)}`)
    }

    return { files, count, warnings }
  }

  /**
   * 生成索引文件
   */
  private async generateIndexFile(config: EpsConfig): Promise<string | null> {
    try {
      const indexPath = FileUtils.join(config.outputDir, 'index.ts')
      const content = `// EPS 自动生成的服务
// 生成时间: ${new Date().toISOString()}
// 基础URL: ${config.baseURL}

${config.generateTypes !== false ? "export * from './types'" : ''}
${config.generateServices !== false ? "export * from './services'" : ''}
${config.generateCrud && config.crudConfigs ? "export * from './cruds'" : ''}

// 配置信息
export const epsConfig = {
  baseURL: '${config.baseURL}',
  timeout: ${config.timeout},
  headers: ${JSON.stringify(config.headers || {})},
  withCredentials: ${config.withCredentials || false}
}

// 版本信息
export const epsVersion = '1.0.0'
export const epsGeneratedAt = '${new Date().toISOString()}'
`

      await FileUtils.writeFile(indexPath, FormatUtils.formatTypeScript(content))
      return indexPath
    } catch (error) {
      console.error('生成索引文件失败:', error)
      return null
    }
  }

  /**
   * 验证配置
   */
  validateConfig(config: EpsConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!config.baseURL) {
      errors.push('baseURL 是必需的')
    }

    if (!config.outputDir) {
      errors.push('outputDir 是必需的')
    }

    if (config.timeout && config.timeout <= 0) {
      errors.push('timeout 必须大于0')
    }

    if (config.generateCrud && (!config.crudConfigs || config.crudConfigs.length === 0)) {
      errors.push('启用CRUD生成时必须提供crudConfigs')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// 导出所有相关类型和类
export * from './parser/api'
export * from './generator/types'
export * from './generator/service'
export * from './generator/crud'
export * from './utils/fs'
export * from './utils/format'

// 默认导出
export default EpsGenerator
