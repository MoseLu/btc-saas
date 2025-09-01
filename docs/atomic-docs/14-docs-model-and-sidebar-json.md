---
title: 文档模型与侧边栏JSON生成
category: docs-model
order: 14
owners: [frontend, arch]
auditable: true
acceptance:
  - [ ] 文档front-matter解析
  - [ ] 侧边栏JSON自动生成
  - [ ] 审计JSON生成
  - [ ] CI集成检查
outputs:
  - packages/docs-model/src/
  - packages/docs-model/dist/
  - dist/sidebar.json
  - dist/audit.json
related: [01-bootstrap-monorepo, 20-ci-guards-and-audit-json]
---

# 文档模型与侧边栏JSON生成

## 背景与目标

开发文档模型CLI工具，自动扫描docs目录下的Markdown文档，解析front-matter元数据，生成侧边栏导航JSON和审计检查JSON，支持CI集成和文档完成度检查。

## 约定

### 文档front-matter结构
```yaml
---
title: 文档标题
category: 分类
order: 排序
owners: [负责人]
auditable: true/false
acceptance:
  - [ ] 验收项1
  - [ ] 验收项2
outputs:
  - 产出物1
  - 产出物2
related: [相关文档]
---
```

### 生成的文件结构
```
dist/
├── sidebar.json     # 侧边栏导航数据
├── audit.json       # 审计检查数据
└── docs/            # 文档元数据
    ├── index.json   # 文档索引
    └── categories/  # 分类索引
```

## 步骤

### 1. 创建docs-model包基础结构
创建`packages/docs-model/package.json`：
```json
{
  "name": "@btc/docs-model",
  "version": "1.0.0",
  "description": "文档模型与侧边栏生成工具",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "btc-docs": "dist/cli.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "scan": "node dist/cli.js scan",
    "sidebar": "node dist/cli.js sidebar",
    "audit": "node dist/cli.js audit"
  },
  "dependencies": {
    "gray-matter": "^4.0.3",
    "glob": "^10.3.3",
    "commander": "^11.0.0",
    "chalk": "^5.3.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 2. 创建文档解析器
创建`packages/docs-model/src/parser.ts`：
```typescript
import matter from 'gray-matter'
import { readFileSync } from 'fs'
import { glob } from 'glob'

export interface DocFrontMatter {
  title: string
  category: string
  order: number
  owners: string[]
  auditable: boolean
  acceptance: string[]
  outputs: string[]
  related: string[]
}

export interface DocMetadata {
  filename: string
  path: string
  frontMatter: DocFrontMatter
  content: string
  wordCount: number
  lastModified: Date
}

export class DocParser {
  private docsDir: string

  constructor(docsDir: string = 'docs') {
    this.docsDir = docsDir
  }

  async scanDocs(): Promise<DocMetadata[]> {
    const pattern = `${this.docsDir}/**/*.md`
    const files = await glob(pattern)
    
    const docs: DocMetadata[] = []
    
    for (const file of files) {
      try {
        const doc = await this.parseDoc(file)
        if (doc) {
          docs.push(doc)
        }
      } catch (error) {
        console.warn(`Failed to parse ${file}:`, error)
      }
    }
    
    return docs.sort((a, b) => a.frontMatter.order - b.frontMatter.order)
  }

  private async parseDoc(filePath: string): Promise<DocMetadata | null> {
    const content = readFileSync(filePath, 'utf-8')
    const { data, content: markdownContent } = matter(content)
    
    // 验证必需的front-matter字段
    if (!this.validateFrontMatter(data)) {
      console.warn(`Invalid front-matter in ${filePath}`)
      return null
    }
    
    const frontMatter = data as DocFrontMatter
    const filename = filePath.split('/').pop() || ''
    
    return {
      filename,
      path: filePath,
      frontMatter,
      content: markdownContent,
      wordCount: this.countWords(markdownContent),
      lastModified: new Date()
    }
  }

  private validateFrontMatter(data: any): boolean {
    const required = ['title', 'category', 'order', 'owners', 'auditable']
    return required.every(field => data.hasOwnProperty(field))
  }

  private countWords(content: string): number {
    return content.trim().split(/\s+/).length
  }

  groupByCategory(docs: DocMetadata[]): Record<string, DocMetadata[]> {
    return docs.reduce((groups, doc) => {
      const category = doc.frontMatter.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(doc)
      return groups
    }, {} as Record<string, DocMetadata[]>)
  }

  getCategories(docs: DocMetadata[]): string[] {
    return [...new Set(docs.map(doc => doc.frontMatter.category))]
  }
}
```

### 3. 创建侧边栏生成器
创建`packages/docs-model/src/sidebar.ts`：
```typescript
import type { DocMetadata } from './parser'

export interface SidebarItem {
  title: string
  path: string
  order: number
  children?: SidebarItem[]
}

export interface SidebarConfig {
  title: string
  items: SidebarItem[]
}

export class SidebarGenerator {
  generateSidebar(docs: DocMetadata[]): SidebarConfig {
    const groupedDocs = this.groupDocsByCategory(docs)
    const items = this.generateItems(groupedDocs)
    
    return {
      title: 'BTC MES 控制台文档',
      items: items.sort((a, b) => a.order - b.order)
    }
  }

  private groupDocsByCategory(docs: DocMetadata[]): Record<string, DocMetadata[]> {
    return docs.reduce((groups, doc) => {
      const category = doc.frontMatter.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(doc)
      return groups
    }, {} as Record<string, DocMetadata[]>)
  }

  private generateItems(groupedDocs: Record<string, DocMetadata[]>): SidebarItem[] {
    const items: SidebarItem[] = []
    
    for (const [category, docs] of Object.entries(groupedDocs)) {
      const categoryItem: SidebarItem = {
        title: this.getCategoryTitle(category),
        path: `/${category}`,
        order: Math.min(...docs.map(doc => doc.frontMatter.order)),
        children: docs
          .sort((a, b) => a.frontMatter.order - b.frontMatter.order)
          .map(doc => ({
            title: doc.frontMatter.title,
            path: `/${category}/${doc.filename.replace('.md', '')}`,
            order: doc.frontMatter.order
          }))
      }
      
      items.push(categoryItem)
    }
    
    return items
  }

  private getCategoryTitle(category: string): string {
    const titleMap: Record<string, string> = {
      'bootstrap': '项目启动',
      'bridge': '桥接SDK',
      'ui': 'UI组件',
      'plugin': '插件系统',
      'tools': '工具链',
      'logs': '日志系统',
      'eps': 'EPS插件',
      'styles': '样式主题',
      'auth': '认证授权',
      'navigation': '导航菜单',
      'mock': 'Mock策略',
      'config': '环境配置',
      'dev': '开发脚本',
      'quality': '质量系统',
      'docs-model': '文档模型',
      'ci': 'CI/CD',
      'a11y': '无障碍',
      'security': '安全隔离',
      'features': '功能开关',
      'performance': '性能预算'
    }
    
    return titleMap[category] || category
  }
}
```

### 4. 创建审计生成器
创建`packages/docs-model/src/audit.ts`：
```typescript
import type { DocMetadata } from './parser'

export interface AuditItem {
  doc: string
  category: string
  owners: string[]
  acceptance: string[]
  completed: string[]
  pending: string[]
  completionRate: number
  auditable: boolean
}

export interface AuditReport {
  totalDocs: number
  auditableDocs: number
  completedDocs: number
  overallCompletion: number
  items: AuditItem[]
  categories: Record<string, {
    total: number
    completed: number
    completionRate: number
  }>
  owners: Record<string, {
    total: number
    completed: number
    completionRate: number
  }>
}

export class AuditGenerator {
  generateAudit(docs: DocMetadata[]): AuditReport {
    const items = docs.map(doc => this.generateAuditItem(doc))
    const auditableItems = items.filter(item => item.auditable)
    
    const categories = this.aggregateByCategory(items)
    const owners = this.aggregateByOwner(items)
    
    const totalDocs = items.length
    const auditableDocs = auditableItems.length
    const completedDocs = auditableItems.filter(item => item.completionRate === 100).length
    const overallCompletion = auditableDocs > 0 ? (completedDocs / auditableDocs) * 100 : 0
    
    return {
      totalDocs,
      auditableDocs,
      completedDocs,
      overallCompletion,
      items,
      categories,
      owners
    }
  }

  private generateAuditItem(doc: DocMetadata): AuditItem {
    const acceptance = doc.frontMatter.acceptance || []
    const completed = acceptance.filter(item => item.includes('[x]'))
    const pending = acceptance.filter(item => item.includes('[ ]'))
    const completionRate = acceptance.length > 0 ? (completed.length / acceptance.length) * 100 : 0
    
    return {
      doc: doc.filename,
      category: doc.frontMatter.category,
      owners: doc.frontMatter.owners,
      acceptance,
      completed,
      pending,
      completionRate,
      auditable: doc.frontMatter.auditable
    }
  }

  private aggregateByCategory(items: AuditItem[]): Record<string, any> {
    const categories: Record<string, any> = {}
    
    for (const item of items) {
      if (!categories[item.category]) {
        categories[item.category] = { total: 0, completed: 0, completionRate: 0 }
      }
      
      categories[item.category].total++
      if (item.completionRate === 100) {
        categories[item.category].completed++
      }
    }
    
    // 计算完成率
    for (const category of Object.values(categories)) {
      category.completionRate = category.total > 0 ? (category.completed / category.total) * 100 : 0
    }
    
    return categories
  }

  private aggregateByOwner(items: AuditItem[]): Record<string, any> {
    const owners: Record<string, any> = {}
    
    for (const item of items) {
      for (const owner of item.owners) {
        if (!owners[owner]) {
          owners[owner] = { total: 0, completed: 0, completionRate: 0 }
        }
        
        owners[owner].total++
        if (item.completionRate === 100) {
          owners[owner].completed++
        }
      }
    }
    
    // 计算完成率
    for (const owner of Object.values(owners)) {
      owner.completionRate = owner.total > 0 ? (owner.completed / owner.total) * 100 : 0
    }
    
    return owners
  }

  generateMarkdownReport(report: AuditReport): string {
    return `# 文档审计报告

## 总体概览

- **总文档数**: ${report.totalDocs}
- **可审计文档**: ${report.auditableDocs}
- **已完成文档**: ${report.completedDocs}
- **整体完成率**: ${report.overallCompletion.toFixed(1)}%

## 分类完成情况

${Object.entries(report.categories)
  .map(([category, stats]) => 
    `### ${category}\n- 总数: ${stats.total}\n- 已完成: ${stats.completed}\n- 完成率: ${stats.completionRate.toFixed(1)}%`
  )
  .join('\n\n')}

## 负责人完成情况

${Object.entries(report.owners)
  .map(([owner, stats]) => 
    `### ${owner}\n- 总数: ${stats.total}\n- 已完成: ${stats.completed}\n- 完成率: ${stats.completionRate.toFixed(1)}%`
  )
  .join('\n\n')}

## 待完成文档

${report.items
  .filter(item => item.auditable && item.completionRate < 100)
  .map(item => 
    `### ${item.doc}\n- 分类: ${item.category}\n- 负责人: ${item.owners.join(', ')}\n- 完成率: ${item.completionRate.toFixed(1)}%\n- 待完成: ${item.pending.join(', ')}`
  )
  .join('\n\n')}
`
  }
}
```

### 5. 创建CLI工具
创建`packages/docs-model/src/cli.ts`：
```typescript
#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import { writeFileSync, ensureDirSync } from 'fs-extra'
import { DocParser } from './parser'
import { SidebarGenerator } from './sidebar'
import { AuditGenerator } from './audit'

const program = new Command()

program
  .name('btc-docs')
  .description('BTC文档模型工具')
  .version('1.0.0')

program
  .command('scan')
  .description('扫描文档并生成元数据')
  .option('-d, --docs-dir <dir>', '文档目录', 'docs')
  .option('-o, --output <output>', '输出目录', 'dist/docs')
  .action(async (options) => {
    try {
      const parser = new DocParser(options.docsDir)
      const docs = await parser.scanDocs()
      
      ensureDirSync(options.output)
      
      // 生成文档索引
      const indexData = {
        total: docs.length,
        categories: parser.getCategories(docs),
        docs: docs.map(doc => ({
          filename: doc.filename,
          category: doc.frontMatter.category,
          order: doc.frontMatter.order,
          title: doc.frontMatter.title,
          owners: doc.frontMatter.owners
        }))
      }
      
      writeFileSync(
        `${options.output}/index.json`,
        JSON.stringify(indexData, null, 2)
      )
      
      // 生成分类索引
      const groupedDocs = parser.groupByCategory(docs)
      for (const [category, categoryDocs] of Object.entries(groupedDocs)) {
        const categoryData = {
          category,
          total: categoryDocs.length,
          docs: categoryDocs.map(doc => ({
            filename: doc.filename,
            order: doc.frontMatter.order,
            title: doc.frontMatter.title,
            owners: doc.frontMatter.owners
          }))
        }
        
        ensureDirSync(`${options.output}/categories`)
        writeFileSync(
          `${options.output}/categories/${category}.json`,
          JSON.stringify(categoryData, null, 2)
        )
      }
      
      console.log(chalk.green(`✅ 扫描完成，共发现 ${docs.length} 个文档`))
    } catch (error) {
      console.error(chalk.red('❌ 扫描失败:'), error)
      process.exit(1)
    }
  })

program
  .command('sidebar')
  .description('生成侧边栏JSON')
  .option('-d, --docs-dir <dir>', '文档目录', 'docs')
  .option('-o, --output <output>', '输出文件', 'dist/sidebar.json')
  .action(async (options) => {
    try {
      const parser = new DocParser(options.docsDir)
      const docs = await parser.scanDocs()
      
      const sidebarGenerator = new SidebarGenerator()
      const sidebar = sidebarGenerator.generateSidebar(docs)
      
      ensureDirSync(options.output.split('/').slice(0, -1).join('/'))
      writeFileSync(options.output, JSON.stringify(sidebar, null, 2))
      
      console.log(chalk.green(`✅ 侧边栏生成完成: ${options.output}`))
    } catch (error) {
      console.error(chalk.red('❌ 侧边栏生成失败:'), error)
      process.exit(1)
    }
  })

program
  .command('audit')
  .description('生成审计报告')
  .option('-d, --docs-dir <dir>', '文档目录', 'docs')
  .option('-o, --output <output>', '输出目录', 'dist')
  .option('--markdown', '生成Markdown报告')
  .action(async (options) => {
    try {
      const parser = new DocParser(options.docsDir)
      const docs = await parser.scanDocs()
      
      const auditGenerator = new AuditGenerator()
      const audit = auditGenerator.generateAudit(docs)
      
      ensureDirSync(options.output)
      
      // 生成JSON报告
      writeFileSync(
        `${options.output}/audit.json`,
        JSON.stringify(audit, null, 2)
      )
      
      // 生成Markdown报告
      if (options.markdown) {
        const markdownReport = auditGenerator.generateMarkdownReport(audit)
        writeFileSync(
          `${options.output}/audit.md`,
          markdownReport
        )
      }
      
      console.log(chalk.green(`✅ 审计报告生成完成`))
      console.log(chalk.blue(`- 总文档数: ${audit.totalDocs}`))
      console.log(chalk.blue(`- 可审计文档: ${audit.auditableDocs}`))
      console.log(chalk.blue(`- 整体完成率: ${audit.overallCompletion.toFixed(1)}%`))
      
      if (audit.overallCompletion < 100) {
        console.log(chalk.yellow(`⚠️  有 ${audit.auditableDocs - audit.completedDocs} 个文档未完成`))
      }
    } catch (error) {
      console.error(chalk.red('❌ 审计报告生成失败:'), error)
      process.exit(1)
    }
  })

program
  .command('check')
  .description('检查文档完成度')
  .option('-d, --docs-dir <dir>', '文档目录', 'docs')
  .option('--threshold <threshold>', '完成度阈值', '80')
  .action(async (options) => {
    try {
      const parser = new DocParser(options.docsDir)
      const docs = await parser.scanDocs()
      
      const auditGenerator = new AuditGenerator()
      const audit = auditGenerator.generateAudit(docs)
      
      const threshold = parseFloat(options.threshold)
      
      console.log(chalk.blue(`📊 文档完成度检查`))
      console.log(chalk.blue(`- 整体完成率: ${audit.overallCompletion.toFixed(1)}%`))
      console.log(chalk.blue(`- 阈值要求: ${threshold}%`))
      
      if (audit.overallCompletion >= threshold) {
        console.log(chalk.green(`✅ 文档完成度达标`))
        process.exit(0)
      } else {
        console.log(chalk.red(`❌ 文档完成度未达标`))
        
        const incompleteDocs = audit.items.filter(item => 
          item.auditable && item.completionRate < 100
        )
        
        if (incompleteDocs.length > 0) {
          console.log(chalk.yellow(`\n待完成文档:`))
          incompleteDocs.forEach(doc => {
            console.log(chalk.yellow(`- ${doc.doc}: ${doc.completionRate.toFixed(1)}%`))
          })
        }
        
        process.exit(1)
      }
    } catch (error) {
      console.error(chalk.red('❌ 检查失败:'), error)
      process.exit(1)
    }
  })

program.parse()
```

### 6. 创建TypeScript配置
创建`packages/docs-model/tsconfig.json`：
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 7. 更新根目录package.json脚本
在根目录的`package.json`中添加脚本：
```json
{
  "scripts": {
    "docs:scan": "pnpm --filter @btc/docs-model scan",
    "docs:sidebar": "pnpm --filter @btc/docs-model sidebar",
    "docs:audit": "pnpm --filter @btc/docs-model audit",
    "docs:check": "pnpm --filter @btc/docs-model check",
    "docs:build": "pnpm --filter @btc/docs-model build"
  }
}
```

## 产出物

- [x] `packages/docs-model/src/parser.ts` - 文档解析器
- [x] `packages/docs-model/src/sidebar.ts` - 侧边栏生成器
- [x] `packages/docs-model/src/audit.ts` - 审计生成器
- [x] `packages/docs-model/src/cli.ts` - CLI工具
- [x] `dist/sidebar.json` - 侧边栏导航数据
- [x] `dist/audit.json` - 审计检查数据
- [x] `dist/docs/` - 文档元数据

## 审计清单

- [ ] 文档front-matter解析
- [ ] 侧边栏JSON自动生成
- [ ] 审计JSON生成
- [ ] CI集成检查
- [ ] 完成度阈值检查
- [ ] Markdown报告生成
- [ ] 分类和负责人统计
- [ ] 文档索引生成
