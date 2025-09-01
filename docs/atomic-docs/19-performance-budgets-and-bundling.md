---
title: 性能预算与打包优化
category: performance
order: 19
owners: [frontend, devops]
auditable: true
acceptance:
  - [ ] 性能预算配置
  - [ ] 打包优化
  - [ ] 代码分割
  - [ ] 性能监控
outputs:
  - config/performance/
  - scripts/performance/
  - docs/performance/
related: [01-bootstrap-monorepo, 20-ci-guards-and-audit-json]
---

# 性能预算与打包优化

## 背景与目标

建立性能预算体系，优化打包配置，实现代码分割和懒加载，确保应用性能符合企业级要求，提供性能监控和告警机制。

## 约定

### 性能预算
- **首屏JS**: ≤ 300KB (gzip)
- **首屏CSS**: ≤ 50KB (gzip)
- **首屏时间**: ≤ 2秒
- **交互时间**: ≤ 100ms
- **LCP**: ≤ 2.5秒
- **FID**: ≤ 100ms
- **CLS**: ≤ 0.1

### 打包策略
- **代码分割**: 按路由和组件分割
- **懒加载**: 非关键资源延迟加载
- **Tree Shaking**: 移除未使用代码
- **压缩优化**: 多级压缩策略

### 监控指标
- **Core Web Vitals**: LCP、FID、CLS
- **资源加载**: JS、CSS、图片大小
- **运行时性能**: 内存使用、CPU占用
- **用户体验**: 页面加载时间、交互响应

## 步骤

### 1. 创建性能配置
创建`config/performance/performance.config.ts`：
```typescript
export interface PerformanceBudget {
  // 资源大小限制
  resources: {
    js: {
      initial: number // 首屏JS大小 (KB)
      total: number   // 总JS大小 (KB)
    }
    css: {
      initial: number // 首屏CSS大小 (KB)
      total: number   // 总CSS大小 (KB)
    }
    images: {
      total: number   // 图片总大小 (KB)
    }
  }
  
  // 性能指标限制
  metrics: {
    fcp: number      // First Contentful Paint (ms)
    lcp: number      // Largest Contentful Paint (ms)
    fid: number      // First Input Delay (ms)
    cls: number      // Cumulative Layout Shift
    ttfb: number     // Time to First Byte (ms)
  }
  
  // 运行时限制
  runtime: {
    memory: number   // 内存使用限制 (MB)
    cpu: number      // CPU使用限制 (%)
  }
}

export const performanceBudget: PerformanceBudget = {
  resources: {
    js: {
      initial: 300,  // 300KB
      total: 1000    // 1MB
    },
    css: {
      initial: 50,   // 50KB
      total: 200     // 200KB
    },
    images: {
      total: 500     // 500KB
    }
  },
  metrics: {
    fcp: 2000,       // 2秒
    lcp: 2500,       // 2.5秒
    fid: 100,        // 100ms
    cls: 0.1,        // 0.1
    ttfb: 600        // 600ms
  },
  runtime: {
    memory: 100,     // 100MB
    cpu: 50          // 50%
  }
}

export interface BundleConfig {
  // 代码分割配置
  splitting: {
    chunks: 'all' | 'async' | 'initial'
    maxSize: number
    minSize: number
    cacheGroups: Record<string, any>
  }
  
  // 压缩配置
  compression: {
    gzip: boolean
    brotli: boolean
    level: number
  }
  
  // 优化配置
  optimization: {
    minimize: boolean
    treeShaking: boolean
    sideEffects: boolean
  }
  
  // 懒加载配置
  lazyLoading: {
    enabled: boolean
    preload: boolean
    prefetch: boolean
  }
}

export const bundleConfig: BundleConfig = {
  splitting: {
    chunks: 'all',
    maxSize: 244 * 1024, // 244KB
    minSize: 20 * 1024,  // 20KB
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
        priority: 10
      },
      common: {
        name: 'common',
        minChunks: 2,
        chunks: 'all',
        priority: 5
      }
    }
  },
  compression: {
    gzip: true,
    brotli: true,
    level: 6
  },
  optimization: {
    minimize: true,
    treeShaking: true,
    sideEffects: false
  },
  lazyLoading: {
    enabled: true,
    preload: true,
    prefetch: false
  }
}
```

### 2. 创建性能监控工具
创建`packages/performance/src/monitor.ts`：
```typescript
export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number
  fid: number
  cls: number
  
  // 其他指标
  fcp: number
  ttfb: number
  
  // 资源指标
  resources: {
    js: number
    css: number
    images: number
    total: number
  }
  
  // 运行时指标
  runtime: {
    memory: number
    cpu: number
  }
}

export interface PerformanceThreshold {
  metric: keyof PerformanceMetrics
  threshold: number
  operator: 'gt' | 'lt' | 'eq'
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics | null = null
  private thresholds: PerformanceThreshold[] = []
  private listeners: Array<(metrics: PerformanceMetrics) => void> = []
  
  constructor() {
    this.initializeMonitoring()
  }
  
  // 初始化监控
  private initializeMonitoring(): void {
    // 监控Core Web Vitals
    this.monitorCoreWebVitals()
    
    // 监控资源加载
    this.monitorResourceLoading()
    
    // 监控运行时性能
    this.monitorRuntimePerformance()
  }
  
  // 监控Core Web Vitals
  private monitorCoreWebVitals(): void {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.updateMetric('lcp', lastEntry.startTime)
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    }
    
    // FID (First Input Delay)
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          this.updateMetric('fid', entry.processingStart - entry.startTime)
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
    }
    
    // CLS (Cumulative Layout Shift)
    if ('PerformanceObserver' in window) {
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        this.updateMetric('cls', clsValue)
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    }
    
    // FCP (First Contentful Paint)
    if ('PerformanceObserver' in window) {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const firstEntry = entries[0]
        this.updateMetric('fcp', firstEntry.startTime)
      })
      fcpObserver.observe({ entryTypes: ['paint'] })
    }
    
    // TTFB (Time to First Byte)
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (entry.entryType === 'navigation') {
            this.updateMetric('ttfb', entry.responseStart - entry.requestStart)
          }
        })
      })
      navigationObserver.observe({ entryTypes: ['navigation'] })
    }
  }
  
  // 监控资源加载
  private monitorResourceLoading(): void {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        let jsSize = 0
        let cssSize = 0
        let imageSize = 0
        
        entries.forEach((entry: any) => {
          const size = entry.transferSize || 0
          const url = entry.name
          
          if (url.endsWith('.js')) {
            jsSize += size
          } else if (url.endsWith('.css')) {
            cssSize += size
          } else if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
            imageSize += size
          }
        })
        
        this.updateResourceMetrics({
          js: jsSize / 1024, // 转换为KB
          css: cssSize / 1024,
          images: imageSize / 1024,
          total: (jsSize + cssSize + imageSize) / 1024
        })
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
    }
  }
  
  // 监控运行时性能
  private monitorRuntimePerformance(): void {
    // 内存使用监控
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        this.updateRuntimeMetric('memory', memory.usedJSHeapSize / 1024 / 1024) // MB
      }, 5000)
    }
    
    // CPU使用监控（简化版本）
    let lastTime = performance.now()
    let frameCount = 0
    
    const measureCPU = () => {
      const currentTime = performance.now()
      frameCount++
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount / ((currentTime - lastTime) / 1000)
        const cpuUsage = Math.max(0, 100 - (fps / 60) * 100)
        this.updateRuntimeMetric('cpu', cpuUsage)
        
        lastTime = currentTime
        frameCount = 0
      }
      
      requestAnimationFrame(measureCPU)
    }
    
    requestAnimationFrame(measureCPU)
  }
  
  // 更新指标
  private updateMetric(key: keyof PerformanceMetrics, value: number): void {
    if (!this.metrics) {
      this.metrics = this.createEmptyMetrics()
    }
    
    this.metrics[key] = value
    this.checkThresholds()
    this.notifyListeners()
  }
  
  // 更新资源指标
  private updateResourceMetrics(resources: PerformanceMetrics['resources']): void {
    if (!this.metrics) {
      this.metrics = this.createEmptyMetrics()
    }
    
    this.metrics.resources = resources
    this.checkThresholds()
    this.notifyListeners()
  }
  
  // 更新运行时指标
  private updateRuntimeMetric(key: keyof PerformanceMetrics['runtime'], value: number): void {
    if (!this.metrics) {
      this.metrics = this.createEmptyMetrics()
    }
    
    this.metrics.runtime[key] = value
    this.checkThresholds()
    this.notifyListeners()
  }
  
  // 创建空指标对象
  private createEmptyMetrics(): PerformanceMetrics {
    return {
      lcp: 0,
      fid: 0,
      cls: 0,
      fcp: 0,
      ttfb: 0,
      resources: {
        js: 0,
        css: 0,
        images: 0,
        total: 0
      },
      runtime: {
        memory: 0,
        cpu: 0
      }
    }
  }
  
  // 检查阈值
  private checkThresholds(): void {
    if (!this.metrics) return
    
    this.thresholds.forEach(threshold => {
      const value = this.getMetricValue(threshold.metric)
      const exceeded = this.checkThreshold(value, threshold.threshold, threshold.operator)
      
      if (exceeded) {
        this.emitThresholdExceeded(threshold, value)
      }
    })
  }
  
  // 获取指标值
  private getMetricValue(metric: string): number {
    if (!this.metrics) return 0
    
    const parts = metric.split('.')
    let value: any = this.metrics
    
    for (const part of parts) {
      value = value[part]
      if (value === undefined) return 0
    }
    
    return value
  }
  
  // 检查阈值
  private checkThreshold(value: number, threshold: number, operator: string): boolean {
    switch (operator) {
      case 'gt':
        return value > threshold
      case 'lt':
        return value < threshold
      case 'eq':
        return value === threshold
      default:
        return false
    }
  }
  
  // 发出阈值超限事件
  private emitThresholdExceeded(threshold: PerformanceThreshold, value: number): void {
    const event = new CustomEvent('performance-threshold-exceeded', {
      detail: {
        metric: threshold.metric,
        threshold: threshold.threshold,
        operator: threshold.operator,
        value: value
      }
    })
    window.dispatchEvent(event)
  }
  
  // 通知监听器
  private notifyListeners(): void {
    if (!this.metrics) return
    
    this.listeners.forEach(listener => {
      try {
        listener(this.metrics)
      } catch (error) {
        console.error('Performance monitor listener error:', error)
      }
    })
  }
  
  // 添加阈值
  addThreshold(threshold: PerformanceThreshold): void {
    this.thresholds.push(threshold)
  }
  
  // 移除阈值
  removeThreshold(metric: string): void {
    this.thresholds = this.thresholds.filter(t => t.metric !== metric)
  }
  
  // 添加监听器
  addListener(listener: (metrics: PerformanceMetrics) => void): void {
    this.listeners.push(listener)
  }
  
  // 移除监听器
  removeListener(listener: (metrics: PerformanceMetrics) => void): void {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }
  
  // 获取当前指标
  getMetrics(): PerformanceMetrics | null {
    return this.metrics
  }
  
  // 重置指标
  reset(): void {
    this.metrics = null
  }
}

// Vue组合式函数
export function usePerformanceMonitor() {
  const monitor = new PerformanceMonitor()
  
  return {
    addThreshold: monitor.addThreshold.bind(monitor),
    removeThreshold: monitor.removeThreshold.bind(monitor),
    addListener: monitor.addListener.bind(monitor),
    removeListener: monitor.removeListener.bind(monitor),
    getMetrics: monitor.getMetrics.bind(monitor),
    reset: monitor.reset.bind(monitor)
  }
}
```

### 3. 创建性能检查工具
创建`scripts/performance/check-bundle.ts`：
```typescript
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { performanceBudget } from '../../config/performance/performance.config'

interface BundleStats {
  name: string
  size: number
  gzippedSize: number
  chunks: string[]
}

interface PerformanceReport {
  timestamp: Date
  bundleStats: BundleStats[]
  totalSize: number
  totalGzippedSize: number
  budgetCompliance: {
    js: boolean
    css: boolean
    total: boolean
  }
  recommendations: string[]
}

export class BundleAnalyzer {
  private statsPath: string
  private reportPath: string
  
  constructor(statsPath: string = 'dist/stats.json', reportPath: string = 'dist/performance-report.json') {
    this.statsPath = statsPath
    this.reportPath = reportPath
  }
  
  // 分析打包结果
  analyzeBundle(): PerformanceReport {
    try {
      const stats = JSON.parse(readFileSync(this.statsPath, 'utf-8'))
      const bundleStats = this.extractBundleStats(stats)
      const totalSize = bundleStats.reduce((sum, stat) => sum + stat.size, 0)
      const totalGzippedSize = bundleStats.reduce((sum, stat) => sum + stat.gzippedSize, 0)
      
      const budgetCompliance = this.checkBudgetCompliance(bundleStats, totalSize)
      const recommendations = this.generateRecommendations(bundleStats, budgetCompliance)
      
      const report: PerformanceReport = {
        timestamp: new Date(),
        bundleStats,
        totalSize,
        totalGzippedSize,
        budgetCompliance,
        recommendations
      }
      
      // 保存报告
      writeFileSync(this.reportPath, JSON.stringify(report, null, 2))
      
      return report
    } catch (error) {
      console.error('Bundle analysis failed:', error)
      throw error
    }
  }
  
  // 提取打包统计信息
  private extractBundleStats(stats: any): BundleStats[] {
    const assets = stats.assets || []
    const chunks = stats.chunks || []
    
    return assets
      .filter((asset: any) => asset.name.endsWith('.js') || asset.name.endsWith('.css'))
      .map((asset: any) => {
        const chunkNames = chunks
          .filter((chunk: any) => chunk.files.includes(asset.name))
          .map((chunk: any) => chunk.names.join(', '))
        
        return {
          name: asset.name,
          size: asset.size,
          gzippedSize: this.estimateGzippedSize(asset.size),
          chunks: chunkNames
        }
      })
  }
  
  // 估算gzip压缩后的大小
  private estimateGzippedSize(size: number): number {
    // 简单的gzip压缩率估算
    const compressionRatio = 0.3
    return Math.round(size * compressionRatio)
  }
  
  // 检查预算合规性
  private checkBudgetCompliance(bundleStats: BundleStats[], totalSize: number): {
    js: boolean
    css: boolean
    total: boolean
  } {
    const jsSize = bundleStats
      .filter(stat => stat.name.endsWith('.js'))
      .reduce((sum, stat) => sum + stat.gzippedSize, 0)
    
    const cssSize = bundleStats
      .filter(stat => stat.name.endsWith('.css'))
      .reduce((sum, stat) => sum + stat.gzippedSize, 0)
    
    const totalGzippedSize = bundleStats.reduce((sum, stat) => sum + stat.gzippedSize, 0)
    
    return {
      js: jsSize <= performanceBudget.resources.js.total,
      css: cssSize <= performanceBudget.resources.css.total,
      total: totalGzippedSize <= (performanceBudget.resources.js.total + performanceBudget.resources.css.total)
    }
  }
  
  // 生成优化建议
  private generateRecommendations(bundleStats: BundleStats[], budgetCompliance: any): string[] {
    const recommendations: string[] = []
    
    if (!budgetCompliance.js) {
      recommendations.push('JavaScript包大小超出预算，建议进行代码分割和懒加载')
    }
    
    if (!budgetCompliance.css) {
      recommendations.push('CSS包大小超出预算，建议提取关键CSS和移除未使用样式')
    }
    
    if (!budgetCompliance.total) {
      recommendations.push('总体包大小超出预算，建议优化依赖和移除未使用代码')
    }
    
    // 检查大文件
    const largeFiles = bundleStats.filter(stat => stat.gzippedSize > 100)
    if (largeFiles.length > 0) {
      recommendations.push(`发现${largeFiles.length}个大文件，建议进一步分割`)
    }
    
    // 检查重复代码
    const duplicateChunks = this.findDuplicateChunks(bundleStats)
    if (duplicateChunks.length > 0) {
      recommendations.push('发现重复代码块，建议优化打包配置')
    }
    
    return recommendations
  }
  
  // 查找重复代码块
  private findDuplicateChunks(bundleStats: BundleStats[]): string[] {
    const chunkMap = new Map<string, string[]>()
    
    bundleStats.forEach(stat => {
      stat.chunks.forEach(chunk => {
        if (!chunkMap.has(chunk)) {
          chunkMap.set(chunk, [])
        }
        chunkMap.get(chunk)!.push(stat.name)
      })
    })
    
    return Array.from(chunkMap.entries())
      .filter(([_, files]) => files.length > 1)
      .map(([chunk]) => chunk)
  }
  
  // 生成HTML报告
  generateHTMLReport(report: PerformanceReport): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>性能预算报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .stats { margin: 20px 0; }
        .budget { margin: 20px 0; }
        .recommendations { margin: 20px 0; }
        .compliant { color: green; }
        .non-compliant { color: red; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f5f5f5; }
    </style>
</head>
<body>
    <div class="header">
        <h1>性能预算报告</h1>
        <p>生成时间: ${report.timestamp.toLocaleString()}</p>
    </div>
    
    <div class="stats">
        <h2>打包统计</h2>
        <table>
            <thead>
                <tr>
                    <th>文件</th>
                    <th>大小 (KB)</th>
                    <th>Gzip后 (KB)</th>
                    <th>代码块</th>
                </tr>
            </thead>
            <tbody>
                ${report.bundleStats.map(stat => `
                    <tr>
                        <td>${stat.name}</td>
                        <td>${Math.round(stat.size / 1024)}</td>
                        <td>${Math.round(stat.gzippedSize / 1024)}</td>
                        <td>${stat.chunks.join(', ')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    
    <div class="budget">
        <h2>预算合规性</h2>
        <ul>
            <li class="${report.budgetCompliance.js ? 'compliant' : 'non-compliant'}">
                JavaScript: ${report.budgetCompliance.js ? '✓' : '✗'}
            </li>
            <li class="${report.budgetCompliance.css ? 'compliant' : 'non-compliant'}">
                CSS: ${report.budgetCompliance.css ? '✓' : '✗'}
            </li>
            <li class="${report.budgetCompliance.total ? 'compliant' : 'non-compliant'}">
                总计: ${report.budgetCompliance.total ? '✓' : '✗'}
            </li>
        </ul>
    </div>
    
    <div class="recommendations">
        <h2>优化建议</h2>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>
    `
  }
}

// CLI工具
if (require.main === module) {
  const analyzer = new BundleAnalyzer()
  
  try {
    const report = analyzer.analyzeBundle()
    console.log('性能预算检查完成')
    console.log('总大小:', Math.round(report.totalSize / 1024), 'KB')
    console.log('Gzip后:', Math.round(report.totalGzippedSize / 1024), 'KB')
    console.log('预算合规:', report.budgetCompliance)
    
    if (report.recommendations.length > 0) {
      console.log('优化建议:')
      report.recommendations.forEach(rec => console.log('-', rec))
    }
    
    // 生成HTML报告
    const htmlReport = analyzer.generateHTMLReport(report)
    writeFileSync('dist/performance-report.html', htmlReport)
    console.log('HTML报告已生成: dist/performance-report.html')
    
    // 如果不符合预算，退出码为1
    if (!report.budgetCompliance.js || !report.budgetCompliance.css || !report.budgetCompliance.total) {
      process.exit(1)
    }
  } catch (error) {
    console.error('性能检查失败:', error)
    process.exit(1)
  }
}
```

### 4. 创建Vite配置优化
创建`config/performance/vite.config.ts`：
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { bundleConfig } from './performance.config'

export default defineConfig({
  plugins: [vue()],
  
  build: {
    // 代码分割配置
    rollupOptions: {
      output: {
        manualChunks: {
          // 第三方库分离
          vendor: ['vue', 'vue-router', 'pinia'],
          element: ['element-plus'],
          utils: ['lodash', 'axios', 'dayjs']
        }
      }
    },
    
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // 资源内联阈值
    assetsInlineLimit: 4096,
    
    // 启用源码映射（开发环境）
    sourcemap: process.env.NODE_ENV === 'development',
    
    // 目标浏览器
    target: 'es2015'
  },
  
  // 依赖优化
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'element-plus'],
    exclude: ['@btc/bridge', '@btc/ui']
  },
  
  // 服务器配置
  server: {
    // 启用压缩
    compress: true,
    
    // 预热常用模块
    warmup: {
      clientFiles: [
        './src/main.ts',
        './src/router/index.ts',
        './src/stores/index.ts'
      ]
    }
  },
  
  // 预览配置
  preview: {
    // 启用压缩
    compress: true,
    
    // 静态资源缓存
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  }
})
```

### 5. 创建性能指南
创建`docs/performance/guidelines.md`：
```markdown
# 性能优化指南

## 基本原则

### 1. 性能预算
- 严格遵循性能预算
- 定期监控和报告
- 超标时及时优化

### 2. 代码分割
- 按路由分割代码
- 按功能模块分割
- 第三方库单独分割

### 3. 懒加载
- 路由级别懒加载
- 组件级别懒加载
- 图片懒加载

## 优化策略

### 1. 打包优化
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          element: ['element-plus']
        }
      }
    }
  }
})
```

### 2. 代码分割
```typescript
// 路由懒加载
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue')
  }
]

// 组件懒加载
const LazyComponent = defineAsyncComponent(() => 
  import('@/components/HeavyComponent.vue')
)
```

### 3. 资源优化
```typescript
// 图片优化
<img 
  src="image.jpg" 
  loading="lazy"
  decoding="async"
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// 字体优化
<link 
  rel="preload" 
  href="font.woff2" 
  as="font" 
  type="font/woff2" 
  crossorigin
/>
```

### 4. 缓存策略
```typescript
// 服务工作者缓存
const CACHE_NAME = 'btc-cache-v1'
const urlsToCache = [
  '/',
  '/static/js/vendor.js',
  '/static/css/main.css'
]

// 内存缓存
const cache = new Map()
const getCachedData = (key: string) => {
  if (cache.has(key)) {
    return cache.get(key)
  }
  // 获取数据并缓存
  const data = fetchData(key)
  cache.set(key, data)
  return data
}
```

## 监控指标

### 1. Core Web Vitals
- **LCP**: 最大内容绘制时间
- **FID**: 首次输入延迟
- **CLS**: 累积布局偏移

### 2. 资源指标
- JS/CSS文件大小
- 图片大小和数量
- 网络请求数量

### 3. 运行时指标
- 内存使用情况
- CPU使用率
- 页面响应时间

## 工具和资源

### 开发工具
- Lighthouse
- WebPageTest
- Chrome DevTools
- Bundle Analyzer

### 监控工具
- Google Analytics
- Sentry
- New Relic
- 自定义监控

### 优化工具
- Webpack Bundle Analyzer
- Vite Bundle Analyzer
- ImageOptim
- TinyPNG

## 最佳实践

### 1. 开发阶段
- 使用性能预算检查
- 定期进行性能测试
- 优化关键路径

### 2. 构建阶段
- 启用代码压缩
- 优化资源加载
- 配置缓存策略

### 3. 部署阶段
- 启用Gzip压缩
- 配置CDN
- 设置缓存头

### 4. 监控阶段
- 实时性能监控
- 用户行为分析
- 性能告警机制
```

## 产出物

- [x] `config/performance/performance.config.ts` - 性能配置
- [x] `packages/performance/src/monitor.ts` - 性能监控工具
- [x] `scripts/performance/check-bundle.ts` - 打包检查工具
- [x] `config/performance/vite.config.ts` - Vite优化配置
- [x] `docs/performance/guidelines.md` - 性能指南

## 审计清单

- [ ] 性能预算配置
- [ ] 打包优化
- [ ] 代码分割
- [ ] 性能监控
- [ ] Core Web Vitals
- [ ] 资源优化
- [ ] 缓存策略
- [ ] 懒加载
- [ ] 压缩配置
- [ ] 监控工具
- [ ] 性能指南
- [ ] CI集成
