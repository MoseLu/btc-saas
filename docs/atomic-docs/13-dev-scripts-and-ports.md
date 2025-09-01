---
title: 开发脚本与端口管理
category: devops
order: 13
owners: [frontend, devops]
auditable: true
acceptance:
  - [ ] 开发脚本正常工作
  - [ ] 端口管理生效
  - [ ] 热重载可用
  - [ ] 构建流程完整
outputs:
  - package.json scripts
  - scripts/dev/
  - config/ports.ts
related: [01-bootstrap-monorepo, 12-multi-env-config]
---

# 开发脚本与端口管理

## 背景与目标

建立完整的开发脚本体系，实现端口管理、热重载、构建流程和部署脚本，确保开发和生产环境的顺畅运行。

## 约定

### 端口分配
- 主应用：3000
- 品质系统：3001
- 采购系统：3002
- 工程系统：3003
- 生产控制：3004
- BI系统：3005
- 开发工具：3006-3010

## 步骤

### 1. 创建端口配置文件
创建`config/ports.ts`：
```typescript
export interface PortConfig {
  name: string
  port: number
  description: string
  enabled: boolean
}

export const ports: Record<string, PortConfig> = {
  main: {
    name: '主应用',
    port: 3000,
    description: 'BTC MES主控制台',
    enabled: true
  },
  quality: {
    name: '品质系统',
    port: 3001,
    description: '品质检测与管理系统',
    enabled: true
  },
  purchase: {
    name: '采购系统',
    port: 3002,
    description: '采购流程管理系统',
    enabled: true
  },
  engineering: {
    name: '工程系统',
    port: 3003,
    description: '工程项目管理系统',
    enabled: true
  },
  production: {
    name: '生产控制',
    port: 3004,
    description: '生产计划与控制系统',
    enabled: true
  },
  bi: {
    name: 'BI系统',
    port: 3005,
    description: '商业智能分析系统',
    enabled: true
  },
  devtools: {
    name: '开发工具',
    port: 3006,
    description: '开发调试工具',
    enabled: false
  },
  storybook: {
    name: 'Storybook',
    port: 3007,
    description: '组件文档和测试',
    enabled: false
  },
  docs: {
    name: '文档站点',
    port: 3008,
    description: '项目文档站点',
    enabled: false
  },
  api: {
    name: 'API服务',
    port: 3009,
    description: 'Mock API服务',
    enabled: false
  }
}

export class PortManager {
  private static instance: PortManager
  private usedPorts: Set<number> = new Set()

  static getInstance(): PortManager {
    if (!PortManager.instance) {
      PortManager.instance = new PortManager()
    }
    return PortManager.instance
  }

  // 获取可用端口
  getAvailablePort(basePort: number): number {
    let port = basePort
    while (this.usedPorts.has(port)) {
      port++
    }
    this.usedPorts.add(port)
    return port
  }

  // 释放端口
  releasePort(port: number): void {
    this.usedPorts.delete(port)
  }

  // 检查端口是否可用
  isPortAvailable(port: number): boolean {
    return !this.usedPorts.has(port)
  }

  // 获取所有已用端口
  getUsedPorts(): number[] {
    return Array.from(this.usedPorts)
  }

  // 重置端口状态
  reset(): void {
    this.usedPorts.clear()
  }
}

export const portManager = PortManager.getInstance()
```

### 2. 创建开发脚本
创建`scripts/dev/start.ts`：
```typescript
#!/usr/bin/env tsx

import { spawn } from 'child_process'
import { portManager, ports } from '../../config/ports'
import { configManager } from '@btc/tools/config'

interface DevServer {
  name: string
  process: any
  port: number
  status: 'starting' | 'running' | 'stopped' | 'error'
}

class DevServerManager {
  private servers: Map<string, DevServer> = new Map()
  private config = configManager.getConfig()

  // 启动所有服务
  async startAll(): Promise<void> {
    console.log('🚀 启动开发服务器...')
    
    const enabledApps = Object.entries(ports).filter(([, config]) => config.enabled)
    
    for (const [key, config] of enabledApps) {
      await this.startServer(key, config)
    }
    
    this.printStatus()
  }

  // 启动单个服务
  async startServer(key: string, config: any): Promise<void> {
    const port = portManager.getAvailablePort(config.port)
    
    console.log(`📦 启动 ${config.name} (端口: ${port})...`)
    
    const server: DevServer = {
      name: config.name,
      process: null,
      port,
      status: 'starting'
    }
    
    this.servers.set(key, server)
    
    try {
      const process = spawn('pnpm', ['dev'], {
        cwd: `apps/${key}`,
        stdio: 'pipe',
        env: {
          ...process.env,
          VITE_DEV_SERVER_PORT: port.toString(),
          VITE_APP_ENV: 'development'
        }
      })
      
      server.process = process
      
      process.stdout?.on('data', (data) => {
        const output = data.toString()
        if (output.includes('Local:')) {
          server.status = 'running'
          console.log(`✅ ${config.name} 启动成功 (http://localhost:${port})`)
        }
      })
      
      process.stderr?.on('data', (data) => {
        const error = data.toString()
        if (error.includes('EADDRINUSE')) {
          server.status = 'error'
          console.error(`❌ ${config.name} 端口 ${port} 已被占用`)
        }
      })
      
      process.on('close', (code) => {
        server.status = 'stopped'
        portManager.releasePort(port)
        console.log(`🛑 ${config.name} 已停止 (退出码: ${code})`)
      })
      
    } catch (error) {
      server.status = 'error'
      console.error(`❌ 启动 ${config.name} 失败:`, error)
    }
  }

  // 停止所有服务
  stopAll(): void {
    console.log('🛑 停止所有开发服务器...')
    
    for (const [key, server] of this.servers) {
      if (server.process) {
        server.process.kill('SIGTERM')
      }
    }
    
    this.servers.clear()
    portManager.reset()
  }

  // 重启服务
  async restartServer(key: string): Promise<void> {
    const server = this.servers.get(key)
    if (server) {
      if (server.process) {
        server.process.kill('SIGTERM')
      }
      this.servers.delete(key)
    }
    
    const config = ports[key]
    if (config) {
      await this.startServer(key, config)
    }
  }

  // 打印状态
  printStatus(): void {
    console.log('\n📊 开发服务器状态:')
    console.log('='.repeat(50))
    
    for (const [key, server] of this.servers) {
      const statusIcon = {
        starting: '⏳',
        running: '✅',
        stopped: '🛑',
        error: '❌'
      }[server.status]
      
      console.log(`${statusIcon} ${server.name}: http://localhost:${server.port} (${server.status})`)
    }
    
    console.log('='.repeat(50))
  }

  // 监听进程退出
  setupGracefulShutdown(): void {
    process.on('SIGINT', () => {
      console.log('\n🛑 收到退出信号，正在停止所有服务...')
      this.stopAll()
      process.exit(0)
    })
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 收到终止信号，正在停止所有服务...')
      this.stopAll()
      process.exit(0)
    })
  }
}

// 主函数
async function main() {
  const manager = new DevServerManager()
  manager.setupGracefulShutdown()
  
  const args = process.argv.slice(2)
  
  if (args.includes('--stop')) {
    manager.stopAll()
    return
  }
  
  if (args.includes('--restart')) {
    const app = args[args.indexOf('--restart') + 1]
    if (app) {
      await manager.restartServer(app)
      return
    }
  }
  
  await manager.startAll()
}

main().catch(console.error)
```

### 3. 创建构建脚本
创建`scripts/build/build.ts`：
```typescript
#!/usr/bin/env tsx

import { spawn } from 'child_process'
import { configManager } from '@btc/tools/config'
import { ConfigValidator } from '@btc/tools/config/validator'

interface BuildConfig {
  env: string
  analyze: boolean
  sourcemap: boolean
  minify: boolean
}

class BuildManager {
  private config = configManager.getConfig()

  // 构建所有应用
  async buildAll(buildConfig: BuildConfig): Promise<void> {
    console.log('🔨 开始构建...')
    
    // 验证配置
    const validation = ConfigValidator.validateEnvironmentConfig(this.config)
    if (!validation.valid) {
      console.error('❌ 配置验证失败:')
      validation.errors.forEach(error => console.error(`  - ${error}`))
      process.exit(1)
    }
    
    const apps = ['main', 'quality', 'purchase', 'engineering', 'production', 'bi']
    
    for (const app of apps) {
      await this.buildApp(app, buildConfig)
    }
    
    console.log('✅ 所有应用构建完成')
  }

  // 构建单个应用
  async buildApp(app: string, buildConfig: BuildConfig): Promise<void> {
    console.log(`📦 构建 ${app} 应用...`)
    
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      VITE_APP_ENV: buildConfig.env,
      VITE_BUILD_ANALYZE: buildConfig.analyze.toString(),
      VITE_BUILD_SOURCEMAP: buildConfig.sourcemap.toString(),
      VITE_BUILD_MINIFY: buildConfig.minify.toString()
    }
    
    return new Promise((resolve, reject) => {
      const process = spawn('pnpm', ['build'], {
        cwd: `apps/${app}`,
        stdio: 'pipe',
        env
      })
      
      process.stdout?.on('data', (data) => {
        console.log(`[${app}] ${data.toString().trim()}`)
      })
      
      process.stderr?.on('data', (data) => {
        console.error(`[${app}] ${data.toString().trim()}`)
      })
      
      process.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${app} 构建成功`)
          resolve()
        } else {
          console.error(`❌ ${app} 构建失败 (退出码: ${code})`)
          reject(new Error(`${app} build failed with code ${code}`))
        }
      })
    })
  }

  // 构建共享包
  async buildPackages(): Promise<void> {
    console.log('📦 构建共享包...')
    
    const packages = ['bridge', 'ui', 'tools', 'logs', 'plugins']
    
    for (const pkg of packages) {
      await this.buildPackage(pkg)
    }
  }

  async buildPackage(pkg: string): Promise<void> {
    console.log(`📦 构建 ${pkg} 包...`)
    
    return new Promise((resolve, reject) => {
      const process = spawn('pnpm', ['build'], {
        cwd: `packages/${pkg}`,
        stdio: 'pipe'
      })
      
      process.stdout?.on('data', (data) => {
        console.log(`[${pkg}] ${data.toString().trim()}`)
      })
      
      process.stderr?.on('data', (data) => {
        console.error(`[${pkg}] ${data.toString().trim()}`)
      })
      
      process.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${pkg} 构建成功`)
          resolve()
        } else {
          console.error(`❌ ${pkg} 构建失败 (退出码: ${code})`)
          reject(new Error(`${pkg} build failed with code ${code}`))
        }
      })
    })
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2)
  
  const buildConfig: BuildConfig = {
    env: args.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'production',
    analyze: args.includes('--analyze'),
    sourcemap: args.includes('--sourcemap'),
    minify: !args.includes('--no-minify')
  }
  
  const manager = new BuildManager()
  
  if (args.includes('--packages-only')) {
    await manager.buildPackages()
  } else {
    await manager.buildPackages()
    await manager.buildAll(buildConfig)
  }
}

main().catch((error) => {
  console.error('❌ 构建失败:', error)
  process.exit(1)
})
```

### 4. 创建部署脚本
创建`scripts/deploy/deploy.ts`：
```typescript
#!/usr/bin/env tsx

import { spawn } from 'child_process'
import { configManager } from '@btc/tools/config'

interface DeployConfig {
  env: string
  target: string
  dryRun: boolean
}

class DeployManager {
  private config = configManager.getConfig()

  // 部署到指定环境
  async deploy(config: DeployConfig): Promise<void> {
    console.log(`🚀 部署到 ${config.env} 环境...`)
    
    if (config.dryRun) {
      console.log('🔍 干运行模式，不会实际部署')
    }
    
    const deployScript = this.getDeployScript(config.env)
    
    if (!deployScript) {
      throw new Error(`未找到 ${config.env} 环境的部署脚本`)
    }
    
    return new Promise((resolve, reject) => {
      const args = ['run', deployScript]
      if (config.target) {
        args.push('--target', config.target)
      }
      if (config.dryRun) {
        args.push('--dry-run')
      }
      
      const process = spawn('pnpm', args, {
        stdio: 'inherit'
      })
      
      process.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ 部署到 ${config.env} 成功`)
          resolve()
        } else {
          console.error(`❌ 部署到 ${config.env} 失败 (退出码: ${code})`)
          reject(new Error(`Deploy failed with code ${code}`))
        }
      })
    })
  }

  private getDeployScript(env: string): string | null {
    const scripts = {
      development: 'deploy:dev',
      testing: 'deploy:test',
      staging: 'deploy:staging',
      production: 'deploy:prod'
    }
    
    return scripts[env as keyof typeof scripts] || null
  }

  // 回滚部署
  async rollback(env: string, version: string): Promise<void> {
    console.log(`🔄 回滚 ${env} 环境到版本 ${version}...`)
    
    return new Promise((resolve, reject) => {
      const process = spawn('pnpm', ['run', `rollback:${env}`, '--version', version], {
        stdio: 'inherit'
      })
      
      process.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ 回滚到版本 ${version} 成功`)
          resolve()
        } else {
          console.error(`❌ 回滚失败 (退出码: ${code})`)
          reject(new Error(`Rollback failed with code ${code}`))
        }
      })
    })
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2)
  
  const config: DeployConfig = {
    env: args.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'production',
    target: args.find(arg => arg.startsWith('--target='))?.split('=')[1] || '',
    dryRun: args.includes('--dry-run')
  }
  
  const manager = new DeployManager()
  
  if (args.includes('--rollback')) {
    const version = args[args.indexOf('--rollback') + 1]
    if (!version) {
      console.error('❌ 请指定回滚版本')
      process.exit(1)
    }
    await manager.rollback(config.env, version)
  } else {
    await manager.deploy(config)
  }
}

main().catch((error) => {
  console.error('❌ 部署失败:', error)
  process.exit(1)
})
```

### 5. 更新package.json脚本
更新根目录`package.json`：
```json
{
  "scripts": {
    "dev": "tsx scripts/dev/start.ts",
    "dev:main": "pnpm --filter @btc/main dev",
    "dev:quality": "pnpm --filter @btc/quality dev",
    "dev:purchase": "pnpm --filter @btc/purchase dev",
    "dev:engineering": "pnpm --filter @btc/engineering dev",
    "dev:production": "pnpm --filter @btc/production dev",
    "dev:bi": "pnpm --filter @btc/bi dev",
    "dev:stop": "tsx scripts/dev/start.ts --stop",
    "dev:restart": "tsx scripts/dev/start.ts --restart",
    
    "build": "tsx scripts/build/build.ts",
    "build:packages": "tsx scripts/build/build.ts --packages-only",
    "build:analyze": "tsx scripts/build/build.ts --analyze",
    "build:sourcemap": "tsx scripts/build/build.ts --sourcemap",
    "build:dev": "tsx scripts/build/build.ts --env=development",
    "build:test": "tsx scripts/build/build.ts --env=testing",
    "build:staging": "tsx scripts/build/build.ts --env=staging",
    "build:prod": "tsx scripts/build/build.ts --env=production",
    
    "deploy": "tsx scripts/deploy/deploy.ts",
    "deploy:dev": "tsx scripts/deploy/deploy.ts --env=development",
    "deploy:test": "tsx scripts/deploy/deploy.ts --env=testing",
    "deploy:staging": "tsx scripts/deploy/deploy.ts --env=staging",
    "deploy:prod": "tsx scripts/deploy/deploy.ts --env=production",
    "deploy:dry-run": "tsx scripts/deploy/deploy.ts --dry-run",
    "rollback": "tsx scripts/deploy/deploy.ts --rollback",
    
    "lint": "eslint . --ext .vue,.js,.ts,.jsx,.tsx --fix",
    "lint:packages": "eslint packages/ --ext .vue,.js,.ts,.jsx,.tsx --fix",
    "lint:apps": "eslint apps/ --ext .vue,.js,.ts,.jsx,.tsx --fix",
    
    "type-check": "tsc --noEmit",
    "type-check:packages": "tsc --noEmit --project packages/tsconfig.json",
    "type-check:apps": "tsc --noEmit --project apps/tsconfig.json",
    
    "test": "vitest",
    "test:unit": "vitest --run",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    
    "clean": "rimraf dist node_modules/.cache",
    "clean:all": "rimraf dist node_modules packages/*/dist packages/*/node_modules apps/*/dist apps/*/node_modules",
    
    "preview": "vite preview",
    "preview:main": "pnpm --filter @btc/main preview",
    "preview:quality": "pnpm --filter @btc/quality preview",
    "preview:purchase": "pnpm --filter @btc/purchase preview",
    "preview:engineering": "pnpm --filter @btc/engineering preview",
    "preview:production": "pnpm --filter @btc/production preview",
    "preview:bi": "pnpm --filter @btc/bi preview",
    
    "storybook": "pnpm --filter @btc/ui storybook",
    "storybook:build": "pnpm --filter @btc/ui storybook:build",
    
    "docs:dev": "pnpm --filter @btc/docs dev",
    "docs:build": "pnpm --filter @btc/docs build",
    "docs:preview": "pnpm --filter @btc/docs preview",
    
    "changeset": "changeset",
    "version": "changeset version",
    "release": "changeset publish"
  }
}
```

### 6. 创建端口检查工具
创建`scripts/dev/check-ports.ts`：
```typescript
#!/usr/bin/env tsx

import { createServer } from 'net'
import { ports } from '../../config/ports'

class PortChecker {
  // 检查端口是否被占用
  async isPortInUse(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = createServer()
      
      server.listen(port, () => {
        server.close()
        resolve(false)
      })
      
      server.on('error', () => {
        resolve(true)
      })
    })
  }

  // 检查所有端口
  async checkAllPorts(): Promise<void> {
    console.log('🔍 检查端口占用情况...')
    console.log('='.repeat(50))
    
    for (const [key, config] of Object.entries(ports)) {
      const inUse = await this.isPortInUse(config.port)
      const status = inUse ? '❌ 被占用' : '✅ 可用'
      
      console.log(`${config.name} (${config.port}): ${status}`)
    }
    
    console.log('='.repeat(50))
  }

  // 查找可用端口
  async findAvailablePort(startPort: number): Promise<number> {
    let port = startPort
    while (await this.isPortInUse(port)) {
      port++
    }
    return port
  }

  // 释放端口
  async killProcessOnPort(port: number): Promise<void> {
    const { exec } = require('child_process')
    
    return new Promise((resolve, reject) => {
      exec(`lsof -ti:${port} | xargs kill -9`, (error: any) => {
        if (error) {
          console.log(`端口 ${port} 没有进程占用`)
        } else {
          console.log(`已释放端口 ${port}`)
        }
        resolve()
      })
    })
  }
}

// 主函数
async function main() {
  const checker = new PortChecker()
  const args = process.argv.slice(2)
  
  if (args.includes('--kill')) {
    const port = parseInt(args[args.indexOf('--kill') + 1])
    if (port) {
      await checker.killProcessOnPort(port)
    }
  } else if (args.includes('--find')) {
    const startPort = parseInt(args[args.indexOf('--find') + 1]) || 3000
    const availablePort = await checker.findAvailablePort(startPort)
    console.log(`可用端口: ${availablePort}`)
  } else {
    await checker.checkAllPorts()
  }
}

main().catch(console.error)
```

## 产出物

- [x] `config/ports.ts` - 端口配置文件
- [x] `scripts/dev/start.ts` - 开发服务器启动脚本
- [x] `scripts/build/build.ts` - 构建脚本
- [x] `scripts/deploy/deploy.ts` - 部署脚本
- [x] `scripts/dev/check-ports.ts` - 端口检查工具
- [x] `package.json` - 更新脚本配置

## 审计清单

- [ ] 开发脚本正常工作
- [ ] 端口管理生效
- [ ] 热重载可用
- [ ] 构建流程完整
- [ ] 部署脚本可用
- [ ] 端口检查工具
- [ ] 多应用并行启动
