#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import EpsGenerator, { EpsConfig } from './index'
import { FileUtils } from './utils/fs'

const program = new Command()

program
  .name('eps-generator')
  .description('EPS API服务生成工具')
  .version('1.0.0')

program
  .command('generate')
  .description('生成EPS服务')
  .option('-u, --url <url>', '从URL生成')
  .option('-f, --file <file>', '从文件生成')
  .option('-m, --mock <mock>', '从Mock数据生成')
  .option('-o, --output <dir>', '输出目录', './src/services/auto')
  .option('-b, --base-url <url>', 'API基础URL', '/api')
  .option('-t, --timeout <ms>', '请求超时时间', '30000')
  .option('--no-types', '不生成类型定义')
  .option('--no-services', '不生成服务类')
  .option('--crud', '生成CRUD操作')
  .option('--crud-config <config>', 'CRUD配置文件路径')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🚀 开始生成EPS服务...'))

      const generator = new EpsGenerator()

      // 构建配置
      const config: EpsConfig = {
        baseURL: options.baseUrl,
        timeout: parseInt(options.timeout),
        outputDir: options.output,
        generateTypes: options.types,
        generateServices: options.services,
        generateCrud: options.crud
      }

      // 验证配置
      const validation = generator.validateConfig(config)
      if (!validation.valid) {
        console.error(chalk.red('❌ 配置验证失败:'))
        validation.errors.forEach(error => console.error(chalk.red(`  - ${error}`)))
        process.exit(1)
      }

      let result

      // 根据输入源生成
      if (options.url) {
        console.log(chalk.yellow(`📡 从URL生成: ${options.url}`))
        result = await generator.generateFromUrl(options.url, config)
      } else if (options.file) {
        console.log(chalk.yellow(`📁 从文件生成: ${options.file}`))
        result = await generator.generateFromFile(options.file, config)
      } else if (options.mock) {
        console.log(chalk.yellow(`🎭 从Mock数据生成: ${options.mock}`))
        const mockData = JSON.parse(options.mock)
        result = await generator.generateFromMock(mockData, config)
      } else {
        console.error(chalk.red('❌ 请指定输入源: --url, --file, 或 --mock'))
        process.exit(1)
      }

      // 显示结果
      if (result.success) {
        console.log(chalk.green('✅ EPS服务生成成功!'))
        console.log(chalk.green(`📊 统计信息:`))
        console.log(chalk.green(`  - 端点: ${result.stats.endpoints}`))
        console.log(chalk.green(`  - 类型: ${result.stats.types}`))
        console.log(chalk.green(`  - 服务: ${result.stats.services}`))
        console.log(chalk.green(`  - CRUD: ${result.stats.cruds}`))
        console.log(chalk.green(`  - 文件: ${result.files.length}`))

        if (result.files.length > 0) {
          console.log(chalk.blue('\n📁 生成的文件:'))
          result.files.forEach(file => {
            console.log(chalk.blue(`  - ${file}`))
          })
        }

        if (result.warnings.length > 0) {
          console.log(chalk.yellow('\n⚠️  警告:'))
          result.warnings.forEach(warning => {
            console.log(chalk.yellow(`  - ${warning}`))
          })
        }
      } else {
        console.error(chalk.red('❌ EPS服务生成失败!'))
        if (result.errors.length > 0) {
          console.error(chalk.red('\n错误:'))
          result.errors.forEach(error => {
            console.error(chalk.red(`  - ${error}`))
          })
        }
        process.exit(1)
      }

    } catch (error) {
      console.error(chalk.red('❌ 执行失败:'), error)
      process.exit(1)
    }
  })

program
  .command('init')
  .description('初始化EPS配置')
  .option('-o, --output <file>', '配置文件输出路径', './eps.config.json')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🔧 初始化EPS配置...'))

      const config = {
        baseURL: '/api',
        timeout: 30000,
        outputDir: './src/services/auto',
        generateTypes: true,
        generateServices: true,
        generateCrud: false,
        crudConfigs: [
          {
            entityName: 'user',
            basePath: '/users',
            idField: 'id'
          }
        ]
      }

      await FileUtils.writeFile(options.output, JSON.stringify(config, null, 2))
      console.log(chalk.green(`✅ 配置文件已生成: ${options.output}`))
      console.log(chalk.blue('📝 请根据需要修改配置文件'))

    } catch (error) {
      console.error(chalk.red('❌ 初始化失败:'), error)
      process.exit(1)
    }
  })

program
  .command('validate')
  .description('验证EPS配置')
  .argument('<config>', '配置文件路径')
  .action(async (configPath) => {
    try {
      console.log(chalk.blue('🔍 验证EPS配置...'))

      if (!await FileUtils.exists(configPath)) {
        console.error(chalk.red(`❌ 配置文件不存在: ${configPath}`))
        process.exit(1)
      }

      const configContent = await FileUtils.readFile(configPath)
      const config = JSON.parse(configContent)

      const generator = new EpsGenerator()
      const validation = generator.validateConfig(config)

      if (validation.valid) {
        console.log(chalk.green('✅ 配置验证通过'))
        console.log(chalk.blue('📋 配置信息:'))
        console.log(chalk.blue(`  - 基础URL: ${config.baseURL}`))
        console.log(chalk.blue(`  - 超时时间: ${config.timeout}ms`))
        console.log(chalk.blue(`  - 输出目录: ${config.outputDir}`))
        console.log(chalk.blue(`  - 生成类型: ${config.generateTypes}`))
        console.log(chalk.blue(`  - 生成服务: ${config.generateServices}`))
        console.log(chalk.blue(`  - 生成CRUD: ${config.generateCrud}`))
      } else {
        console.error(chalk.red('❌ 配置验证失败:'))
        validation.errors.forEach(error => {
          console.error(chalk.red(`  - ${error}`))
        })
        process.exit(1)
      }

    } catch (error) {
      console.error(chalk.red('❌ 验证失败:'), error)
      process.exit(1)
    }
  })

program
  .command('clean')
  .description('清理生成的文件')
  .option('-o, --output <dir>', '输出目录', './src/services/auto')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🧹 清理生成的文件...'))

      if (await FileUtils.exists(options.output)) {
        await FileUtils.removeDir(options.output)
        console.log(chalk.green(`✅ 已清理目录: ${options.output}`))
      } else {
        console.log(chalk.yellow(`⚠️  目录不存在: ${options.output}`))
      }

    } catch (error) {
      console.error(chalk.red('❌ 清理失败:'), error)
      process.exit(1)
    }
  })

// 添加帮助信息
program.addHelpText('after', `

示例:
  $ eps-generator generate --url https://api.example.com/swagger.json
  $ eps-generator generate --file ./swagger.json --output ./src/api
  $ eps-generator generate --mock '{"paths":{}}' --crud
  $ eps-generator init
  $ eps-generator validate ./eps.config.json
  $ eps-generator clean

更多信息:
  https://github.com/btc/eps-plugin
`)

// 解析命令行参数
program.parse()
