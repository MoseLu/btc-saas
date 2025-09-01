---
title: Mock 策略与切换
category: mock
order: 11
owners: [frontend, backend]
auditable: true
acceptance:
  - [ ] Mock 开关正常工作
  - [ ] 延迟和错误率模拟
  - [ ] 鉴权模拟生效
  - [ ] 一键切换真实API
outputs:
  - packages/tools/mock/
  - packages/bridge/src/components/MockToggle.vue
  - config/mock/
related: [05-tools-conventions-and-request-mock, 12-multi-env-config]
---

# Mock 策略与切换

## 背景与目标

实现完整的Mock策略系统，支持延迟/错误率/鉴权模拟，提供一键切换真实API的功能，确保开发和生产环境的无缝切换。

## 约定

### Mock配置结构
```typescript
interface MockConfig {
  enabled: boolean
  delay: number
  errorRate: number
  auth: {
    enabled: boolean
    token: string
    user: User
  }
  scenarios: MockScenario[]
}

interface MockScenario {
  name: string
  enabled: boolean
  conditions: MockCondition[]
  responses: MockResponse[]
}
```

## 步骤

### 1. 创建Mock切换组件
创建`packages/bridge/src/components/MockToggle.vue`：
```vue
<template>
  <div class="mock-toggle">
    <el-switch
      v-model="mockEnabled"
      active-text="Mock模式"
      inactive-text="真实API"
      @change="handleMockToggle"
    />
    
    <el-button
      v-if="mockEnabled"
      size="small"
      @click="showMockConfig = true"
    >
      配置
    </el-button>
  </div>
  
  <!-- Mock配置对话框 -->
  <el-dialog
    v-model="showMockConfig"
    title="Mock配置"
    width="600px"
  >
    <el-form :model="mockConfig" label-width="100px">
      <el-form-item label="网络延迟">
        <el-slider
          v-model="mockConfig.delay"
          :min="0"
          :max="5000"
          :step="100"
          show-input
        />
        <span class="config-hint">{{ mockConfig.delay }}ms</span>
      </el-form-item>
      
      <el-form-item label="错误率">
        <el-slider
          v-model="mockConfig.errorRate"
          :min="0"
          :max="100"
          :step="5"
          show-input
        />
        <span class="config-hint">{{ mockConfig.errorRate }}%</span>
      </el-form-item>
      
      <el-form-item label="鉴权模拟">
        <el-switch v-model="mockConfig.auth.enabled" />
      </el-form-item>
      
      <el-form-item v-if="mockConfig.auth.enabled" label="模拟用户">
        <el-select v-model="mockConfig.auth.userId">
          <el-option
            v-for="user in mockUsers"
            :key="user.id"
            :label="user.name"
            :value="user.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="showMockConfig = false">取消</el-button>
      <el-button type="primary" @click="saveMockConfig">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRuntimeStore } from '../stores/runtime'
import { log } from '@btc/logs'

const runtimeStore = useRuntimeStore()
const showMockConfig = ref(false)

const mockEnabled = ref(runtimeStore.config.mock)

const mockConfig = reactive({
  delay: 500,
  errorRate: 10,
  auth: {
    enabled: true,
    userId: '1'
  }
})

const mockUsers = ref([
  { id: '1', name: '管理员', roles: ['admin'] },
  { id: '2', name: '普通用户', roles: ['user'] },
  { id: '3', name: '访客', roles: ['guest'] }
])

const handleMockToggle = (enabled: boolean) => {
  runtimeStore.setMockMode(enabled)
  
  log.sdk('Mock模式切换', {
    enabled,
    timestamp: Date.now()
  })
}

const saveMockConfig = () => {
  runtimeStore.updateMockConfig(mockConfig)
  showMockConfig.value = false
  
  log.sdk('Mock配置更新', {
    config: mockConfig,
    timestamp: Date.now()
  })
}
</script>

<style scoped>
.mock-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
}

.config-hint {
  margin-left: 8px;
  color: var(--btc-text-secondary);
  font-size: 12px;
}
</style>
```

### 2. 创建Mock场景管理
创建`packages/tools/mock/scenarios.ts`：
```typescript
import type { MockScenario, MockCondition, MockResponse } from './types'

export class MockScenarioManager {
  private scenarios: Map<string, MockScenario> = new Map()

  // 注册场景
  registerScenario(scenario: MockScenario): void {
    this.scenarios.set(scenario.name, scenario)
  }

  // 获取场景
  getScenario(name: string): MockScenario | undefined {
    return this.scenarios.get(name)
  }

  // 获取所有场景
  getAllScenarios(): MockScenario[] {
    return Array.from(this.scenarios.values())
  }

  // 启用场景
  enableScenario(name: string): void {
    const scenario = this.scenarios.get(name)
    if (scenario) {
      scenario.enabled = true
    }
  }

  // 禁用场景
  disableScenario(name: string): void {
    const scenario = this.scenarios.get(name)
    if (scenario) {
      scenario.enabled = false
    }
  }

  // 匹配场景
  matchScenario(request: any): MockResponse | null {
    for (const scenario of this.scenarios.values()) {
      if (!scenario.enabled) continue
      
      if (this.matchConditions(scenario.conditions, request)) {
        return this.selectResponse(scenario.responses)
      }
    }
    
    return null
  }

  private matchConditions(conditions: MockCondition[], request: any): boolean {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'url':
          return request.url.includes(condition.value)
        case 'method':
          return request.method === condition.value
        case 'header':
          return request.headers[condition.key] === condition.value
        case 'body':
          return this.matchBody(condition, request.body)
        default:
          return false
      }
    })
  }

  private matchBody(condition: MockCondition, body: any): boolean {
    if (condition.key) {
      return body[condition.key] === condition.value
    }
    return JSON.stringify(body) === JSON.stringify(condition.value)
  }

  private selectResponse(responses: MockResponse[]): MockResponse {
    // 简单的响应选择逻辑
    return responses[0] || { status: 200, data: {} }
  }
}

export const scenarioManager = new MockScenarioManager()
```

### 3. 创建Mock数据生成器
创建`packages/tools/mock/generator.ts`：
```typescript
import { faker } from '@faker-js/faker/locale/zh_CN'

export class MockDataGenerator {
  // 生成用户数据
  generateUser(overrides: Partial<any> = {}): any {
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
      roles: ['user'],
      permissions: ['read'],
      tenant: 'default',
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      ...overrides
    }
  }

  // 生成列表数据
  generateList<T>(
    generator: () => T,
    count: number = 10,
    page: number = 1,
    pageSize: number = 10
  ): { items: T[]; total: number; page: number; pageSize: number } {
    const total = count
    const items = Array.from({ length: Math.min(pageSize, count) }, generator)
    
    return {
      items,
      total,
      page,
      pageSize
    }
  }

  // 生成分页数据
  generatePaginatedData<T>(
    generator: () => T,
    total: number = 100,
    page: number = 1,
    pageSize: number = 10
  ): { items: T[]; total: number; page: number; pageSize: number } {
    const start = (page - 1) * pageSize
    const end = Math.min(start + pageSize, total)
    const items = Array.from({ length: end - start }, generator)
    
    return {
      items,
      total,
      page,
      pageSize
    }
  }

  // 生成错误响应
  generateError(
    code: number = 500,
    message: string = '服务器内部错误'
  ): any {
    return {
      code,
      message,
      timestamp: new Date().toISOString(),
      path: faker.internet.url(),
      traceId: faker.string.uuid()
    }
  }

  // 生成成功响应
  generateSuccess<T>(data: T): any {
    return {
      code: 200,
      message: '操作成功',
      data,
      timestamp: new Date().toISOString()
    }
  }
}

export const mockGenerator = new MockDataGenerator()
```

### 4. 创建Mock拦截器
创建`packages/tools/mock/interceptor.ts`：
```typescript
import type { RequestConfig, Response } from '../request/adapter'
import { scenarioManager } from './scenarios'
import { mockGenerator } from './generator'

export interface MockInterceptorConfig {
  enabled: boolean
  delay: number
  errorRate: number
  auth: {
    enabled: boolean
    token: string
    user: any
  }
}

export class MockInterceptor {
  private config: MockInterceptorConfig

  constructor(config: MockInterceptorConfig) {
    this.config = config
  }

  // 拦截请求
  async intercept(request: RequestConfig): Promise<Response> {
    if (!this.config.enabled) {
      throw new Error('Mock未启用')
    }

    // 模拟网络延迟
    if (this.config.delay > 0) {
      await this.sleep(this.config.delay)
    }

    // 模拟错误
    if (Math.random() < this.config.errorRate / 100) {
      throw new Error('模拟网络错误')
    }

    // 匹配场景
    const scenarioResponse = scenarioManager.matchScenario(request)
    if (scenarioResponse) {
      return this.createResponse(scenarioResponse)
    }

    // 默认响应
    return this.createDefaultResponse(request)
  }

  private createResponse(mockResponse: any): Response {
    return {
      data: mockResponse.data,
      status: mockResponse.status || 200,
      statusText: mockResponse.statusText || 'OK',
      headers: mockResponse.headers || {},
      config: {} as RequestConfig
    }
  }

  private createDefaultResponse(request: RequestConfig): Response {
    const { url, method } = request

    // 根据URL和Method生成默认响应
    if (url.includes('/api/auth/login')) {
      return this.createResponse({
        status: 200,
        data: {
          token: 'mock-token-' + Date.now(),
          user: mockGenerator.generateUser({ roles: ['admin'] }),
          expiresIn: 3600
        }
      })
    }

    if (url.includes('/api/auth/me')) {
      return this.createResponse({
        status: 200,
        data: mockGenerator.generateUser({ roles: ['admin'] })
      })
    }

    if (url.includes('/api/users')) {
      return this.createResponse({
        status: 200,
        data: mockGenerator.generatePaginatedData(
          () => mockGenerator.generateUser(),
          100,
          1,
          10
        )
      })
    }

    // 默认成功响应
    return this.createResponse({
      status: 200,
      data: { message: 'Mock响应' }
    })
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 更新配置
  updateConfig(config: Partial<MockInterceptorConfig>): void {
    this.config = { ...this.config, ...config }
  }
}
```

### 5. 创建Mock运行时存储
创建`packages/bridge/src/stores/runtime.ts`：
```typescript
import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export interface RuntimeConfig {
  mock: boolean
  apiBase: string
  env: string
  tenant: string
  locale: string
  features: Record<string, boolean>
  mockConfig: {
    delay: number
    errorRate: number
    auth: {
      enabled: boolean
      token: string
      user: any
    }
  }
}

export const useRuntimeStore = defineStore('runtime', () => {
  const config = reactive<RuntimeConfig>({
    mock: false,
    apiBase: import.meta.env.VITE_API_BASE || '/api',
    env: import.meta.env.MODE,
    tenant: 'default',
    locale: 'zh-CN',
    features: {
      mockToggle: true,
      themeSwitch: true,
      pluginSystem: true
    },
    mockConfig: {
      delay: 500,
      errorRate: 10,
      auth: {
        enabled: true,
        token: '',
        user: null
      }
    }
  })

  const loading = ref(false)

  // 设置Mock模式
  const setMockMode = (enabled: boolean) => {
    config.mock = enabled
    
    // 更新全局配置
    if (window.BtcConsole) {
      window.BtcConsole.runtime.mock = enabled
    }
    
    // 存储到本地
    localStorage.setItem('btc-mock-enabled', String(enabled))
  }

  // 更新Mock配置
  const updateMockConfig = (mockConfig: Partial<RuntimeConfig['mockConfig']>) => {
    Object.assign(config.mockConfig, mockConfig)
    
    // 存储到本地
    localStorage.setItem('btc-mock-config', JSON.stringify(config.mockConfig))
  }

  // 初始化运行时配置
  const initRuntime = () => {
    // 从本地存储恢复配置
    const savedMockEnabled = localStorage.getItem('btc-mock-enabled')
    if (savedMockEnabled !== null) {
      config.mock = savedMockEnabled === 'true'
    }
    
    const savedMockConfig = localStorage.getItem('btc-mock-config')
    if (savedMockConfig) {
      try {
        const parsed = JSON.parse(savedMockConfig)
        Object.assign(config.mockConfig, parsed)
      } catch (error) {
        console.error('解析Mock配置失败:', error)
      }
    }
  }

  // 获取功能开关状态
  const isFeatureEnabled = (feature: string): boolean => {
    return config.features[feature] || false
  }

  // 设置功能开关
  const setFeature = (feature: string, enabled: boolean) => {
    config.features[feature] = enabled
  }

  return {
    // 状态
    config: readonly(config),
    loading: readonly(loading),

    // 方法
    setMockMode,
    updateMockConfig,
    initRuntime,
    isFeatureEnabled,
    setFeature
  }
})
```

### 6. 创建Mock配置文件
创建`config/mock/default.ts`：
```typescript
import { scenarioManager } from '@btc/tools/mock/scenarios'
import { mockGenerator } from '@btc/tools/mock/generator'

// 用户相关场景
scenarioManager.registerScenario({
  name: 'user-login',
  enabled: true,
  conditions: [
    { type: 'url', value: '/api/auth/login' },
    { type: 'method', value: 'POST' }
  ],
  responses: [
    {
      status: 200,
      data: {
        token: 'mock-token-' + Date.now(),
        user: mockGenerator.generateUser({ roles: ['admin'] }),
        expiresIn: 3600
      }
    }
  ]
})

scenarioManager.registerScenario({
  name: 'user-profile',
  enabled: true,
  conditions: [
    { type: 'url', value: '/api/auth/me' },
    { type: 'method', value: 'GET' }
  ],
  responses: [
    {
      status: 200,
      data: mockGenerator.generateUser({ roles: ['admin'] })
    }
  ]
})

// 用户列表场景
scenarioManager.registerScenario({
  name: 'user-list',
  enabled: true,
  conditions: [
    { type: 'url', value: '/api/users' },
    { type: 'method', value: 'GET' }
  ],
  responses: [
    {
      status: 200,
      data: mockGenerator.generatePaginatedData(
        () => mockGenerator.generateUser(),
        100,
        1,
        10
      )
    }
  ]
})

// 错误场景
scenarioManager.registerScenario({
  name: 'server-error',
  enabled: false,
  conditions: [
    { type: 'url', value: '/api/error' }
  ],
  responses: [
    {
      status: 500,
      data: mockGenerator.generateError(500, '服务器内部错误')
    }
  ]
})

// 网络超时场景
scenarioManager.registerScenario({
  name: 'network-timeout',
  enabled: false,
  conditions: [
    { type: 'url', value: '/api/timeout' }
  ],
  responses: [
    {
      status: 408,
      data: mockGenerator.generateError(408, '请求超时')
    }
  ]
})
```

## 产出物

- [x] `packages/bridge/src/components/MockToggle.vue` - Mock切换组件
- [x] `packages/tools/mock/scenarios.ts` - 场景管理
- [x] `packages/tools/mock/generator.ts` - 数据生成器
- [x] `packages/tools/mock/interceptor.ts` - 请求拦截器
- [x] `packages/bridge/src/stores/runtime.ts` - 运行时存储
- [x] `config/mock/default.ts` - 默认Mock配置

## 审计清单

- [ ] Mock 开关正常工作
- [ ] 延迟和错误率模拟
- [ ] 鉴权模拟生效
- [ ] 一键切换真实API
- [ ] 场景管理可用
- [ ] 数据生成器正常
- [ ] 配置持久化
