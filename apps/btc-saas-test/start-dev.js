#!/usr/bin/env node

// 开发服务器启动脚本 - 减少日志输出
const { spawn } = require('child_process')
const path = require('path')

// 设置环境变量来减少日志
process.env.SASS_SILENCE_DEPRECATIONS = 'legacy-js-api,import,global-builtin,color-functions'
process.env.SASS_QUIET_DEPS = 'true'
process.env.SASS_API = 'modern-compiler'
process.env.NODE_ENV = 'production'

// 启动 Vite 开发服务器
const viteProcess = spawn('npx', ['vite', '--logLevel=warn', '--clearScreen=false'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
})

// 处理进程退出
viteProcess.on('close', (code) => {
  console.log(`开发服务器已退出，退出码: ${code}`)
  process.exit(code)
})

// 处理错误
viteProcess.on('error', (err) => {
  console.error('启动开发服务器时出错:', err)
  process.exit(1)
})

// 处理进程信号
process.on('SIGINT', () => {
  console.log('\n正在关闭开发服务器...')
  viteProcess.kill('SIGINT')
})

process.on('SIGTERM', () => {
  console.log('\n正在关闭开发服务器...')
  viteProcess.kill('SIGTERM')
})
