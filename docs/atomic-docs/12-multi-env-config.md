---
title: 多环境配置
category: config
order: 12
owners: [frontend, devops]
auditable: true
acceptance:
  - [ ] 环境配置正确加载
  - [ ] 变量注入生效
  - [ ] 环境切换正常
  - [ ] 配置验证通过
outputs:
  - .env.*
  - config/environments/
  - packages/tools/config/
related: [11-mock-strategy-and-switch, 13-dev-scripts-and-ports]
---

# 多环境配置

## 背景与目标

建立完整的多环境配置体系，支持开发/测试/预发/生产环境，实现环境变量注入、配置验证和环境切换功能。

## 约定

### 环境配置结构
```
config/environments/
├── development.ts
├── testing.ts
├── staging.ts
└── production.ts

.env.*
├── .env
├── .env.development
├── .env.testing
├── .env.staging
└── .env.production
```

## 步骤

### 1. 创建环境配置文件
创建`config/environments/development.ts`：
```typescript
export default {
  name: 'development',
  api: {
    baseURL: 'http://localhost:3000/api',
    timeout: 10000,
    retries: 3
  },
  mock: {
    enabled: true,
    delay: 500,
    errorRate: 10
  },
  auth: {
    tokenKey: 'btc-dev-token',
    refreshThreshold: 300
  },
  logging: {
    level: 'debug',
    console: true,
    http: false,
    indexeddb: true
  },
  features: {
    mockToggle: true,
    themeSwitch: true,
    pluginSystem: true,
    debugPanel: true
  },
  plugins: {
    pdf2png: true,
    richtext: true,
    schedule: true
  }
}
```

创建`config/environments/testing.ts`：
```typescript
export default {
  name: 'testing',
  api: {
    baseURL: 'https://test-api.btc.com/api',
    timeout: 15000,
    retries: 2
  },
  mock: {
    enabled: false,
    delay: 0,
    errorRate: 0
  },
  auth: {
    tokenKey: 'btc-test-token',
    refreshThreshold: 300
  },
  logging: {
    level: 'info',
    console: true,
    http: true,
    indexeddb: false
  },
  features: {
    mockToggle: false,
    themeSwitch: true,
    pluginSystem: true,
    debugPanel: false
  },
  plugins: {
    pdf2png: true,
    richtext: true,
    schedule: false
  }
}
```

创建`config/environments/staging.ts`：
```typescript
export default {
  name: 'staging',
  api: {
    baseURL: 'https://staging-api.btc.com/api',
    timeout: 20000,
    retries: 1
  },
  mock: {
    enabled: false,
    delay: 0,
    errorRate: 0
  },
  auth: {
    tokenKey: 'btc-staging-token',
    refreshThreshold: 300
  },
  logging: {
    level: 'warn',
    console: false,
    http: true,
    indexeddb: false
  },
  features: {
    mockToggle: false,
    themeSwitch: true,
    pluginSystem: true,
    debugPanel: false
  },
  plugins: {
    pdf2png: true,
    richtext: true,
    schedule: true
  }
}
```

创建`config/environments/production.ts`：
```typescript
export default {
  name: 'production',
  api: {
    baseURL: 'https://api.btc.com/api',
    timeout: 30000,
    retries: 1
  },
  mock: {
    enabled: false,
    delay: 0,
    errorRate: 0
  },
  auth: {
    tokenKey: 'btc-prod-token',
    refreshThreshold: 300
  },
  logging: {
    level: 'error',
    console: false,
    http: true,
    indexeddb: false
  },
  features: {
    mockToggle: false,
    themeSwitch: true,
    pluginSystem: true,
    debugPanel: false
  },
  plugins: {
    pdf2png: true,
    richtext: true,
    schedule: true
  }
}
```

### 2. 创建环境变量文件
创建`.env`：
```bash
# 通用环境变量
VITE_APP_NAME=BTC MES
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=BTC制造执行系统

# 构建配置
VITE_BUILD_TARGET=esnext
VITE_BUILD_MINIFY=true
VITE_BUILD_SOURCEMAP=false

# 开发服务器
VITE_DEV_SERVER_PORT=3000
VITE_DEV_SERVER_HOST=localhost
VITE_DEV_SERVER_HTTPS=false

# 分析工具
VITE_ANALYZE=false
VITE_ANALYZE_PORT=8888
```

创建`.env.development`：
```bash
# 开发环境
NODE_ENV=development
VITE_APP_ENV=development

# API配置
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000
VITE_API_RETRIES=3

# Mock配置
VITE_MOCK_ENABLED=true
VITE_MOCK_DELAY=500
VITE_MOCK_ERROR_RATE=10

# 日志配置
VITE_LOG_LEVEL=debug
VITE_LOG_CONSOLE=true
VITE_LOG_HTTP=false
VITE_LOG_INDEXEDDB=true

# 功能开关
VITE_FEATURE_MOCK_TOGGLE=true
VITE_FEATURE_THEME_SWITCH=true
VITE_FEATURE_PLUGIN_SYSTEM=true
VITE_FEATURE_DEBUG_PANEL=true

# 插件配置
VITE_PLUGIN_PDF2PNG=true
VITE_PLUGIN_RICHTEXT=true
VITE_PLUGIN_SCHEDULE=true
```

创建`.env.testing`：
```bash
# 测试环境
NODE_ENV=production
VITE_APP_ENV=testing

# API配置
VITE_API_BASE_URL=https://test-api.btc.com/api
VITE_API_TIMEOUT=15000
VITE_API_RETRIES=2

# Mock配置
VITE_MOCK_ENABLED=false
VITE_MOCK_DELAY=0
VITE_MOCK_ERROR_RATE=0

# 日志配置
VITE_LOG_LEVEL=info
VITE_LOG_CONSOLE=true
VITE_LOG_HTTP=true
VITE_LOG_INDEXEDDB=false

# 功能开关
VITE_FEATURE_MOCK_TOGGLE=false
VITE_FEATURE_THEME_SWITCH=true
VITE_FEATURE_PLUGIN_SYSTEM=true
VITE_FEATURE_DEBUG_PANEL=false

# 插件配置
VITE_PLUGIN_PDF2PNG=true
VITE_PLUGIN_RICHTEXT=true
VITE_PLUGIN_SCHEDULE=false
```

创建`.env.staging`：
```bash
# 预发环境
NODE_ENV=production
VITE_APP_ENV=staging

# API配置
VITE_API_BASE_URL=https://staging-api.btc.com/api
VITE_API_TIMEOUT=20000
VITE_API_RETRIES=1

# Mock配置
VITE_MOCK_ENABLED=false
VITE_MOCK_DELAY=0
VITE_MOCK_ERROR_RATE=0

# 日志配置
VITE_LOG_LEVEL=warn
VITE_LOG_CONSOLE=false
VITE_LOG_HTTP=true
VITE_LOG_INDEXEDDB=false

# 功能开关
VITE_FEATURE_MOCK_TOGGLE=false
VITE_FEATURE_THEME_SWITCH=true
VITE_FEATURE_PLUGIN_SYSTEM=true
VITE_FEATURE_DEBUG_PANEL=false

# 插件配置
VITE_PLUGIN_PDF2PNG=true
VITE_PLUGIN_RICHTEXT=true
VITE_PLUGIN_SCHEDULE=true
```

创建`.env.production`：
```bash
# 生产环境
NODE_ENV=production
VITE_APP_ENV=production

# API配置
VITE_API_BASE_URL=https://api.btc.com/api
VITE_API_TIMEOUT=30000
VITE_API_RETRIES=1

# Mock配置
VITE_MOCK_ENABLED=false
VITE_MOCK_DELAY=0
VITE_MOCK_ERROR_RATE=0

# 日志配置
VITE_LOG_LEVEL=error
VITE_LOG_CONSOLE=false
VITE_LOG_HTTP=true
VITE_LOG_INDEXEDDB=false

# 功能开关
VITE_FEATURE_MOCK_TOGGLE=false
VITE_FEATURE_THEME_SWITCH=true
VITE_FEATURE_PLUGIN_SYSTEM=true
VITE_FEATURE_DEBUG_PANEL=false

# 插件配置
VITE_PLUGIN_PDF2PNG=true
VITE_PLUGIN_RICHTEXT=true
VITE_PLUGIN_SCHEDULE=true
```

### 3. 创建配置管理器
创建`packages/tools/config/manager.ts`：
```typescript
import type { EnvironmentConfig } from './types'

export class ConfigManager {
  private static instance: ConfigManager
  private config: EnvironmentConfig
  private env: string

  private constructor() {
    this.env = this.detectEnvironment()
    this.config = this.loadConfig()
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  // 获取配置
  getConfig(): EnvironmentConfig {
    return this.config
  }

  // 获取环境名称
  getEnvironment(): string {
    return this.env
  }

  // 获取API配置
  getApiConfig() {
    return this.config.api
  }

  // 获取Mock配置
  getMockConfig() {
    return this.config.mock
  }

  // 获取日志配置
  getLoggingConfig() {
    return this.config.logging
  }

  // 获取功能开关
  getFeatureFlag(feature: string): boolean {
    return this.config.features[feature] || false
  }

  // 获取插件配置
  getPluginConfig(plugin: string): boolean {
    return this.config.plugins[plugin] || false
  }

  // 检测环境
  private detectEnvironment(): string {
    const env = import.meta.env.VITE_APP_ENV || import.meta.env.MODE
    
    // 根据URL判断环境
    if (window.location.hostname.includes('test')) {
      return 'testing'
    }
    if (window.location.hostname.includes('staging')) {
      return 'staging'
    }
    if (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')) {
      return 'development'
    }
    
    return env || 'production'
  }

  // 加载配置
  private loadConfig(): EnvironmentConfig {
    const env = this.env
    
    // 动态导入环境配置
    const envConfig = import.meta.glob('../config/environments/*.ts', { eager: true })
    const configPath = `../config/environments/${env}.ts`
    
    if (envConfig[configPath]) {
      return (envConfig[configPath] as any).default
    }
    
    // 回退到开发环境配置
    return (envConfig['../config/environments/development.ts'] as any).default
  }

  // 验证配置
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // 验证必需字段
    if (!this.config.api?.baseURL) {
      errors.push('API baseURL is required')
    }
    
    if (!this.config.auth?.tokenKey) {
      errors.push('Auth tokenKey is required')
    }
    
    if (this.config.mock.delay < 0 || this.config.mock.delay > 10000) {
      errors.push('Mock delay must be between 0 and 10000ms')
    }
    
    if (this.config.mock.errorRate < 0 || this.config.mock.errorRate > 100) {
      errors.push('Mock error rate must be between 0 and 100%')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  // 更新配置
  updateConfig(updates: Partial<EnvironmentConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  // 重置配置
  resetConfig(): void {
    this.config = this.loadConfig()
  }
}

export const configManager = ConfigManager.getInstance()
```

### 4. 创建配置类型定义
创建`packages/tools/config/types.ts`：
```typescript
export interface EnvironmentConfig {
  name: string
  api: ApiConfig
  mock: MockConfig
  auth: AuthConfig
  logging: LoggingConfig
  features: FeatureFlags
  plugins: PluginConfig
}

export interface ApiConfig {
  baseURL: string
  timeout: number
  retries: number
}

export interface MockConfig {
  enabled: boolean
  delay: number
  errorRate: number
}

export interface AuthConfig {
  tokenKey: string
  refreshThreshold: number
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error'
  console: boolean
  http: boolean
  indexeddb: boolean
}

export interface FeatureFlags {
  mockToggle: boolean
  themeSwitch: boolean
  pluginSystem: boolean
  debugPanel: boolean
  [key: string]: boolean
}

export interface PluginConfig {
  pdf2png: boolean
  richtext: boolean
  schedule: boolean
  [key: string]: boolean
}

export interface ConfigValidation {
  valid: boolean
  errors: string[]
}
```

### 5. 创建配置注入工具
创建`packages/tools/config/injector.ts`：
```typescript
import { configManager } from './manager'

export class ConfigInjector {
  // 注入到全局对象
  static injectToGlobal(): void {
    const config = configManager.getConfig()
    
    // 注入到window对象
    if (typeof window !== 'undefined') {
      (window as any).__BTC_CONFIG__ = config
    }
    
    // 注入到BtcConsole
    if ((window as any).BtcConsole) {
      (window as any).BtcConsole.config = config
    }
  }

  // 注入到Vite环境变量
  static injectToVite(): void {
    const config = configManager.getConfig()
    
    // 注入API配置
    import.meta.env.VITE_API_BASE_URL = config.api.baseURL
    import.meta.env.VITE_API_TIMEOUT = config.api.timeout.toString()
    import.meta.env.VITE_API_RETRIES = config.api.retries.toString()
    
    // 注入Mock配置
    import.meta.env.VITE_MOCK_ENABLED = config.mock.enabled.toString()
    import.meta.env.VITE_MOCK_DELAY = config.mock.delay.toString()
    import.meta.env.VITE_MOCK_ERROR_RATE = config.mock.errorRate.toString()
    
    // 注入日志配置
    import.meta.env.VITE_LOG_LEVEL = config.logging.level
    import.meta.env.VITE_LOG_CONSOLE = config.logging.console.toString()
    import.meta.env.VITE_LOG_HTTP = config.logging.http.toString()
    import.meta.env.VITE_LOG_INDEXEDDB = config.logging.indexeddb.toString()
    
    // 注入功能开关
    Object.entries(config.features).forEach(([key, value]) => {
      import.meta.env[`VITE_FEATURE_${key.toUpperCase()}`] = value.toString()
    })
    
    // 注入插件配置
    Object.entries(config.plugins).forEach(([key, value]) => {
      import.meta.env[`VITE_PLUGIN_${key.toUpperCase()}`] = value.toString()
    })
  }

  // 注入到CSS变量
  static injectToCSS(): void {
    const config = configManager.getConfig()
    const root = document.documentElement
    
    // 注入环境标识
    root.style.setProperty('--btc-env', config.name)
    
    // 注入功能开关
    Object.entries(config.features).forEach(([key, value]) => {
      root.style.setProperty(`--btc-feature-${key}`, value ? '1' : '0')
    })
  }

  // 注入到HTML
  static injectToHTML(): void {
    const config = configManager.getConfig()
    
    // 注入环境标识到body
    document.body.setAttribute('data-env', config.name)
    
    // 注入功能开关到body
    Object.entries(config.features).forEach(([key, value]) => {
      if (value) {
        document.body.setAttribute(`data-feature-${key}`, 'true')
      }
    })
  }
}
```

### 6. 创建配置验证器
创建`packages/tools/config/validator.ts`：
```typescript
import type { EnvironmentConfig, ConfigValidation } from './types'

export class ConfigValidator {
  // 验证环境配置
  static validateEnvironmentConfig(config: EnvironmentConfig): ConfigValidation {
    const errors: string[] = []
    
    // 验证API配置
    if (!config.api?.baseURL) {
      errors.push('API baseURL is required')
    }
    
    if (config.api?.timeout && (config.api.timeout < 1000 || config.api.timeout > 60000)) {
      errors.push('API timeout must be between 1000ms and 60000ms')
    }
    
    if (config.api?.retries && (config.api.retries < 0 || config.api.retries > 5)) {
      errors.push('API retries must be between 0 and 5')
    }
    
    // 验证Mock配置
    if (config.mock?.delay && (config.mock.delay < 0 || config.mock.delay > 10000)) {
      errors.push('Mock delay must be between 0ms and 10000ms')
    }
    
    if (config.mock?.errorRate && (config.mock.errorRate < 0 || config.mock.errorRate > 100)) {
      errors.push('Mock error rate must be between 0% and 100%')
    }
    
    // 验证认证配置
    if (!config.auth?.tokenKey) {
      errors.push('Auth tokenKey is required')
    }
    
    if (config.auth?.refreshThreshold && (config.auth.refreshThreshold < 60 || config.auth.refreshThreshold > 3600)) {
      errors.push('Auth refresh threshold must be between 60s and 3600s')
    }
    
    // 验证日志配置
    const validLogLevels = ['debug', 'info', 'warn', 'error']
    if (config.logging?.level && !validLogLevels.includes(config.logging.level)) {
      errors.push(`Log level must be one of: ${validLogLevels.join(', ')}`)
    }
    
    // 验证功能开关
    if (config.features) {
      Object.entries(config.features).forEach(([key, value]) => {
        if (typeof value !== 'boolean') {
          errors.push(`Feature flag ${key} must be a boolean`)
        }
      })
    }
    
    // 验证插件配置
    if (config.plugins) {
      Object.entries(config.plugins).forEach(([key, value]) => {
        if (typeof value !== 'boolean') {
          errors.push(`Plugin config ${key} must be a boolean`)
        }
      })
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  // 验证环境变量
  static validateEnvironmentVariables(): ConfigValidation {
    const errors: string[] = []
    const requiredVars = [
      'VITE_APP_NAME',
      'VITE_APP_ENV',
      'VITE_API_BASE_URL'
    ]
    
    requiredVars.forEach(varName => {
      if (!import.meta.env[varName]) {
        errors.push(`Environment variable ${varName} is required`)
      }
    })
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  // 验证URL配置
  static validateURLs(config: EnvironmentConfig): ConfigValidation {
    const errors: string[] = []
    
    try {
      new URL(config.api.baseURL)
    } catch {
      errors.push('API baseURL must be a valid URL')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}
```

## 产出物

- [x] `config/environments/` - 环境配置文件
- [x] `.env.*` - 环境变量文件
- [x] `packages/tools/config/manager.ts` - 配置管理器
- [x] `packages/tools/config/types.ts` - 类型定义
- [x] `packages/tools/config/injector.ts` - 配置注入器
- [x] `packages/tools/config/validator.ts` - 配置验证器

## 审计清单

- [ ] 环境配置正确加载
- [ ] 变量注入生效
- [ ] 环境切换正常
- [ ] 配置验证通过
- [ ] 功能开关可用
- [ ] 插件配置生效
- [ ] 日志配置正确
