import type { Plugin } from 'vite'
import path from 'path'
import fg from 'fast-glob'
import { promises as fs } from 'fs'

export interface BTCMeta {
  displayName?: string
  category?: string
  status?: 'draft' | 'active' | 'deprecated'
  routes?: string[]
  capabilities?: string[]
  icon?: string
  description?: string
  author?: string
  features?: string[]
}

export interface BTCPlugin {
  name: string
  version: string
  displayName: string
  category: string
  status: string
  routes?: string[]
  capabilities?: string[]
  icon?: string
  description?: string
  author?: string
  features?: string[]
  path: string
}

export default function btcPlugins(): Plugin {
  const VIRTUAL_ID = 'virtual:btc-plugins'
  const RESOLVED = '\0' + VIRTUAL_ID
  let root = process.cwd()

  async function buildCode(): Promise<string> {
    try {
      // 尝试多种路径模式
      const pathPatterns = [
        'packages/plugins/*/',
        '../../packages/plugins/*/',
        '../packages/plugins/*/',
        './packages/plugins/*/'
      ]
      
      let pluginDirs: string[] = []
      
      for (const pattern of pathPatterns) {
        try {
          const dirs = await fg([pattern], { 
            cwd: root, 
            absolute: true,
            onlyDirectories: true 
          })
          if (dirs.length > 0) {
            pluginDirs = dirs
            break
          }
        } catch (error) {
          // 路径模式失败，继续尝试下一个
        }
      }
      
      // 如果所有相对路径都失败，尝试绝对路径
      if (pluginDirs.length === 0) {
        const possibleRoots = [
          root,
          path.resolve(root, '../..'),
          path.resolve(root, '..'),
          path.resolve(root, '../../..')
        ]
        
        for (const possibleRoot of possibleRoots) {
          try {
            const absolutePattern = path.join(possibleRoot, 'packages/plugins/*/')
            
            const dirs = await fg([absolutePattern], { 
              absolute: true,
              onlyDirectories: true 
            })
            if (dirs.length > 0) {
              pluginDirs = dirs
              root = possibleRoot
              break
            }
          } catch (error) {
            // 绝对路径失败，继续尝试下一个
          }
        }
      }
      
      // 过滤掉非插件目录
      const validPluginDirs = pluginDirs.filter(dir => {
        const dirName = path.basename(dir)
        // 排除这些非插件目录
        const excludeDirs = ['node_modules', 'src', '.turbo', 'dist', 'build', 'coverage', 'test', 'tests', '__tests__']
        return !excludeDirs.includes(dirName) && !dirName.startsWith('.')
      })
      
      const items: BTCPlugin[] = []
      
      for (const pluginDir of validPluginDirs) {
        const pluginName = path.basename(pluginDir)
        
        const pkgJsonPath = path.join(pluginDir, 'package.json')
        const indexPath = path.join(pluginDir, 'index.ts')
        
        try {
          // 检查package.json
          let pkgData: any = {}
          try {
            const pkgContent = await fs.readFile(pkgJsonPath, 'utf8')
            pkgData = JSON.parse(pkgContent)
          } catch (error) {
            // 如果没有package.json，使用默认值
            pkgData = {
              name: pluginName,
              version: '1.0.0',
              description: `${pluginName} plugin`,
              author: 'BTC Team'
            }
          }
          
          // 检查index.ts文件
          let hasIndexFile = false
          try {
            await fs.access(indexPath)
            hasIndexFile = true
          } catch (error) {
            // index.ts文件不存在
          }
          
          // 如果index.ts存在，尝试读取插件信息
          let pluginMeta: BTCMeta = {}
          if (hasIndexFile) {
            try {
              const indexContent = await fs.readFile(indexPath, 'utf8')
              // 简单的元数据提取（可以根据需要改进）
              const displayNameMatch = indexContent.match(/displayName\s*[:=]\s*['"`]([^'"`]+)['"`]/)
              const descriptionMatch = indexContent.match(/description\s*[:=]\s*['"`]([^'"`]+)['"`]/)
              const authorMatch = indexContent.match(/author\s*[:=]\s*['"`]([^'"`]+)['"`]/)
              
              if (displayNameMatch) pluginMeta.displayName = displayNameMatch[1]
              if (descriptionMatch) pluginMeta.description = descriptionMatch[1]
              if (authorMatch) pluginMeta.author = authorMatch[1]
            } catch (error) {
              // 读取失败，使用默认值
            }
          }
          
          // 根据插件名称映射默认信息
          const defaultMeta = getDefaultPluginMeta(pluginName)
          
          const pluginItem = {
            name: pluginName,
            version: pkgData.version || '1.0.0',
            displayName: pluginMeta.displayName || pkgData.displayName || defaultMeta.displayName || pluginName,
            category: pkgData.category || defaultMeta.category || 'other',
            status: hasIndexFile ? 'active' : 'draft',
            routes: pluginMeta.routes || defaultMeta.routes,
            capabilities: pluginMeta.capabilities || defaultMeta.capabilities,
            icon: pluginMeta.icon || defaultMeta.icon || 'Setting',
            description: pluginMeta.description || pkgData.description || defaultMeta.description || `${pluginName} plugin`,
            author: pluginMeta.author || pkgData.author || defaultMeta.author || 'BTC Team',
            features: pluginMeta.features || defaultMeta.features || ['基础功能'],
            path: path.relative(root, pluginDir)
          }
          
          items.push(pluginItem)
          
        } catch (error) {
          // 处理插件失败，继续下一个
        }
      }
      
      return `export const plugins = ${JSON.stringify(items, null, 2)};`
    } catch (error) {
      return `export const plugins = [];`
    }
  }
  
  function getDefaultPluginMeta(pluginName: string): BTCMeta {
    const metaMap: Record<string, BTCMeta> = {
      'pdf2png': {
        displayName: 'PDF转PNG',
        category: 'converter',
        icon: 'Picture',
        description: '将PDF文档转换为PNG图片格式，支持批量转换和自定义分辨率',
        author: 'BTC Team',
        features: ['PDF转换', '批量处理', '自定义分辨率', '图片导出']
      },
      'richtext': {
        displayName: '富文本编辑器',
        category: 'editor',
        icon: 'Edit',
        description: '提供富文本编辑功能，支持格式化文本、图片插入、表格等高级编辑功能',
        author: 'BTC Team',
        features: ['文本编辑', '格式化', '图片插入', '表格支持']
      },
      'eps-plugin': {
        displayName: 'EPS插件',
        category: 'code-generation',
        icon: 'Cpu',
        description: 'API解析和代码生成插件，支持从OpenAPI规范生成TypeScript代码',
        author: 'BTC Team',
        features: ['API解析', '类型生成', '服务生成', 'CRUD操作', 'CLI工具']
      }
    }
    
    return metaMap[pluginName] || {
      displayName: pluginName,
      category: 'other',
      icon: 'Setting',
      description: `${pluginName} plugin`,
      author: 'BTC Team',
      features: ['基础功能']
    }
  }

  return {
    name: 'vite:btc-plugins-virtual',
    enforce: 'pre',
    resolveId(id: string) {
      if (id === VIRTUAL_ID) return RESOLVED
    },
    async load(id: string) {
      if (id === RESOLVED) return await buildCode()
    },
    async handleHotUpdate(ctx: any) {
      // 监听插件相关文件变化，热更虚拟模块
      const isPluginFile = ctx.file.includes(path.join('packages', 'plugins')) ||
                          ctx.file.endsWith('package.json') ||
                          ctx.file.endsWith('index.ts')
      
      if (isPluginFile) {
        const mod = ctx.server.moduleGraph.getModuleById(RESOLVED)
        if (mod) {
          ctx.server.moduleGraph.invalidateModule(mod)
          return [mod]
        }
      }
    }
  }
}
