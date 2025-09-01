---
title: 功能开关与运维开关
category: features
order: 18
owners: [frontend, ops]
auditable: true
acceptance:
  - [ ] 功能开关系统
  - [ ] 运维开关配置
  - [ ] 动态开关控制
  - [ ] 开关管理界面
outputs:
  - packages/features/
  - config/features/
  - docs/features/
related: [12-multi-env-config, 20-ci-guards-and-audit-json]
---

# 功能开关与运维开关

## 背景与目标

建立完整的功能开关和运维开关系统，支持灰度发布、A/B测试、紧急回滚、运维控制等功能，提供可视化管理界面和API接口。

## 约定

### 开关类型
- **功能开关**: 控制新功能发布
- **运维开关**: 控制系统运维行为
- **实验开关**: 控制A/B测试
- **紧急开关**: 紧急情况下的快速控制

### 开关级别
- **全局**: 影响整个系统
- **租户**: 影响特定租户
- **用户**: 影响特定用户
- **环境**: 影响特定环境

### 开关状态
- **开启**: 功能可用
- **关闭**: 功能不可用
- **灰度**: 部分用户可用
- **实验**: 实验模式

## 步骤

### 1. 创建功能开关包
创建`packages/features/package.json`：
```json
{
  "name": "@btc/features",
  "version": "1.0.0",
  "description": "BTC功能开关系统",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest"
  },
  "dependencies": {
    "vue": "^3.3.0",
    "@vueuse/core": "^10.0.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "typescript": "^5.0.0",
    "vitest": "^0.34.0"
  }
}
```

### 2. 创建开关管理器
创建`packages/features/src/feature-manager.ts`：
```typescript
import { ref, computed, watch } from 'vue'

export interface FeatureFlag {
  id: string
  name: string
  description: string
  type: 'feature' | 'ops' | 'experiment' | 'emergency'
  level: 'global' | 'tenant' | 'user' | 'environment'
  status: 'enabled' | 'disabled' | 'gradual' | 'experiment'
  defaultValue: boolean
  gradualPercentage?: number
  conditions?: FeatureCondition[]
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface FeatureCondition {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in' | 'contains'
  value: any
}

export interface FeatureContext {
  userId?: string
  tenantId?: string
  environment?: string
  userAgent?: string
  ipAddress?: string
  custom?: Record<string, any>
}

export class FeatureManager {
  private flags = ref<Map<string, FeatureFlag>>(new Map())
  private context = ref<FeatureContext>({})
  private cache = new Map<string, boolean>()
  private cacheTimeout = 5 * 60 * 1000 // 5分钟缓存
  
  // 设置上下文
  setContext(context: FeatureContext): void {
    this.context.value = context
    this.clearCache() // 清除缓存
  }
  
  // 添加功能开关
  addFlag(flag: FeatureFlag): void {
    this.flags.value.set(flag.id, flag)
  }
  
  // 移除功能开关
  removeFlag(flagId: string): void {
    this.flags.value.delete(flagId)
    this.cache.delete(flagId)
  }
  
  // 检查开关状态
  isEnabled(flagId: string): boolean {
    // 检查缓存
    const cached = this.cache.get(flagId)
    if (cached !== undefined) {
      return cached
    }
    
    const flag = this.flags.value.get(flagId)
    if (!flag) {
      return false
    }
    
    const result = this.evaluateFlag(flag)
    
    // 缓存结果
    this.cache.set(flagId, result)
    setTimeout(() => this.cache.delete(flagId), this.cacheTimeout)
    
    return result
  }
  
  // 评估开关状态
  private evaluateFlag(flag: FeatureFlag): boolean {
    const context = this.context.value
    
    // 检查级别权限
    if (!this.checkLevelAccess(flag, context)) {
      return false
    }
    
    // 检查条件
    if (flag.conditions && !this.evaluateConditions(flag.conditions, context)) {
      return false
    }
    
    // 根据状态返回结果
    switch (flag.status) {
      case 'enabled':
        return true
      case 'disabled':
        return false
      case 'gradual':
        return this.evaluateGradual(flag, context)
      case 'experiment':
        return this.evaluateExperiment(flag, context)
      default:
        return flag.defaultValue
    }
  }
  
  // 检查级别访问权限
  private checkLevelAccess(flag: FeatureFlag, context: FeatureContext): boolean {
    switch (flag.level) {
      case 'global':
        return true
      case 'tenant':
        return !!context.tenantId
      case 'user':
        return !!context.userId
      case 'environment':
        return !!context.environment
      default:
        return true
    }
  }
  
  // 评估条件
  private evaluateConditions(conditions: FeatureCondition[], context: FeatureContext): boolean {
    return conditions.every(condition => {
      const value = this.getContextValue(condition.field, context)
      return this.evaluateCondition(condition, value)
    })
  }
  
  // 获取上下文值
  private getContextValue(field: string, context: FeatureContext): any {
    if (field.startsWith('custom.')) {
      const customField = field.replace('custom.', '')
      return context.custom?.[customField]
    }
    
    return context[field as keyof FeatureContext]
  }
  
  // 评估单个条件
  private evaluateCondition(condition: FeatureCondition, value: any): boolean {
    switch (condition.operator) {
      case 'eq':
        return value === condition.value
      case 'ne':
        return value !== condition.value
      case 'gt':
        return value > condition.value
      case 'lt':
        return value < condition.value
      case 'gte':
        return value >= condition.value
      case 'lte':
        return value <= condition.value
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value)
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(value)
      case 'contains':
        return String(value).includes(String(condition.value))
      default:
        return false
    }
  }
  
  // 评估灰度发布
  private evaluateGradual(flag: FeatureFlag, context: FeatureContext): boolean {
    if (!flag.gradualPercentage || !context.userId) {
      return flag.defaultValue
    }
    
    // 基于用户ID的哈希计算
    const hash = this.hashString(context.userId)
    const percentage = (hash % 100) + 1
    
    return percentage <= flag.gradualPercentage
  }
  
  // 评估实验
  private evaluateExperiment(flag: FeatureFlag, context: FeatureContext): boolean {
    // 这里可以实现更复杂的实验逻辑
    return this.evaluateGradual(flag, context)
  }
  
  // 字符串哈希
  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash)
  }
  
  // 清除缓存
  private clearCache(): void {
    this.cache.clear()
  }
  
  // 获取所有开关
  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.value.values())
  }
  
  // 获取开关详情
  getFlag(flagId: string): FeatureFlag | undefined {
    return this.flags.value.get(flagId)
  }
  
  // 更新开关
  updateFlag(flagId: string, updates: Partial<FeatureFlag>): void {
    const flag = this.flags.value.get(flagId)
    if (flag) {
      const updatedFlag = {
        ...flag,
        ...updates,
        updatedAt: new Date()
      }
      this.flags.value.set(flagId, updatedFlag)
      this.cache.delete(flagId)
    }
  }
  
  // 批量更新开关
  updateFlags(updates: Record<string, Partial<FeatureFlag>>): void {
    for (const [flagId, update] of Object.entries(updates)) {
      this.updateFlag(flagId, update)
    }
  }
}

// Vue组合式函数
export function useFeatureFlags() {
  const manager = new FeatureManager()
  
  const flags = computed(() => manager.getAllFlags())
  const isEnabled = (flagId: string) => manager.isEnabled(flagId)
  const getFlag = (flagId: string) => manager.getFlag(flagId)
  
  return {
    flags,
    isEnabled,
    getFlag,
    setContext: manager.setContext.bind(manager),
    addFlag: manager.addFlag.bind(manager),
    removeFlag: manager.removeFlag.bind(manager),
    updateFlag: manager.updateFlag.bind(manager),
    updateFlags: manager.updateFlags.bind(manager)
  }
}
```

### 3. 创建开关配置
创建`config/features/features.config.ts`：
```typescript
import type { FeatureFlag } from '@btc/features'

export const defaultFeatures: FeatureFlag[] = [
  {
    id: 'new-ui',
    name: '新UI界面',
    description: '启用新的用户界面设计',
    type: 'feature',
    level: 'global',
    status: 'gradual',
    defaultValue: false,
    gradualPercentage: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system'
  },
  {
    id: 'dark-mode',
    name: '深色模式',
    description: '启用深色主题模式',
    type: 'feature',
    level: 'user',
    status: 'enabled',
    defaultValue: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system'
  },
  {
    id: 'maintenance-mode',
    name: '维护模式',
    description: '系统维护模式开关',
    type: 'ops',
    level: 'global',
    status: 'disabled',
    defaultValue: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system'
  },
  {
    id: 'rate-limiting',
    name: '限流控制',
    description: 'API请求限流开关',
    type: 'ops',
    level: 'tenant',
    status: 'enabled',
    defaultValue: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system'
  },
  {
    id: 'ab-test-header',
    name: 'A/B测试头部',
    description: '头部导航A/B测试',
    type: 'experiment',
    level: 'user',
    status: 'experiment',
    defaultValue: false,
    gradualPercentage: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system'
  },
  {
    id: 'emergency-shutdown',
    name: '紧急关闭',
    description: '紧急情况下关闭系统',
    type: 'emergency',
    level: 'global',
    status: 'disabled',
    defaultValue: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system'
  }
]

export const featureConfig = {
  cacheTimeout: 5 * 60 * 1000, // 5分钟
  maxFlags: 1000,
  defaultGradualPercentage: 10,
  emergencyFlags: ['emergency-shutdown', 'maintenance-mode']
}
```

### 4. 创建开关组件
创建`packages/features/src/components/FeatureToggle.vue`：
```vue
<template>
  <div class="feature-toggle">
    <slot v-if="isEnabled" name="enabled" />
    <slot v-else name="disabled" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFeatureFlags } from '../feature-manager'

interface Props {
  flag: string
  fallback?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fallback: false
})

const { isEnabled } = useFeatureFlags()

const enabled = computed(() => {
  try {
    return isEnabled(props.flag)
  } catch (error) {
    console.warn(`Feature flag "${props.flag}" not found, using fallback:`, props.fallback)
    return props.fallback
  }
})
</script>

<style scoped>
.feature-toggle {
  display: contents;
}
</style>
```

创建`packages/features/src/components/FeatureSwitch.vue`：
```vue
<template>
  <div class="feature-switch">
    <div v-if="isEnabled" class="feature-switch__enabled">
      <slot name="enabled" />
    </div>
    <div v-else class="feature-switch__disabled">
      <slot name="disabled" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFeatureFlags } from '../feature-manager'

interface Props {
  flag: string
  fallback?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fallback: false
})

const { isEnabled } = useFeatureFlags()

const enabled = computed(() => {
  try {
    return isEnabled(props.flag)
  } catch (error) {
    console.warn(`Feature flag "${props.flag}" not found, using fallback:`, props.fallback)
    return props.fallback
  }
})
</script>

<style scoped>
.feature-switch {
  display: contents;
}

.feature-switch__enabled,
.feature-switch__disabled {
  display: contents;
}
</style>
```

### 5. 创建开关管理界面
创建`packages/features/src/components/FeatureManager.vue`：
```vue
<template>
  <div class="feature-manager">
    <div class="feature-manager__header">
      <h2>功能开关管理</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        新建开关
      </el-button>
    </div>
    
    <el-table :data="flags" style="width: 100%">
      <el-table-column prop="id" label="ID" width="180" />
      <el-table-column prop="name" label="名称" width="200" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="type" label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getTypeTag(row.type)">{{ getTypeLabel(row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="level" label="级别" width="100">
        <template #default="{ row }">
          <el-tag :type="getLevelTag(row.level)">{{ getLevelLabel(row.level) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="'enabled'"
            :inactive-value="'disabled'"
            @change="updateFlagStatus(row.id, $event)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="editFlag(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteFlag(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingFlag ? '编辑开关' : '新建开关'"
      width="600px"
    >
      <el-form :model="flagForm" label-width="100px">
        <el-form-item label="ID">
          <el-input v-model="flagForm.id" :disabled="!!editingFlag" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="flagForm.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="flagForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="flagForm.type">
            <el-option label="功能开关" value="feature" />
            <el-option label="运维开关" value="ops" />
            <el-option label="实验开关" value="experiment" />
            <el-option label="紧急开关" value="emergency" />
          </el-select>
        </el-form-item>
        <el-form-item label="级别">
          <el-select v-model="flagForm.level">
            <el-option label="全局" value="global" />
            <el-option label="租户" value="tenant" />
            <el-option label="用户" value="user" />
            <el-option label="环境" value="environment" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="flagForm.status">
            <el-option label="开启" value="enabled" />
            <el-option label="关闭" value="disabled" />
            <el-option label="灰度" value="gradual" />
            <el-option label="实验" value="experiment" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="flagForm.status === 'gradual'" label="灰度比例">
          <el-input-number v-model="flagForm.gradualPercentage" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="默认值">
          <el-switch v-model="flagForm.defaultValue" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveFlag">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFeatureFlags } from '../feature-manager'
import type { FeatureFlag } from '../feature-manager'

const { flags, addFlag, removeFlag, updateFlag } = useFeatureFlags()

const showCreateDialog = ref(false)
const editingFlag = ref<FeatureFlag | null>(null)

const flagForm = reactive({
  id: '',
  name: '',
  description: '',
  type: 'feature' as const,
  level: 'global' as const,
  status: 'disabled' as const,
  defaultValue: false,
  gradualPercentage: 10
})

const getTypeTag = (type: string) => {
  const tags = {
    feature: 'primary',
    ops: 'warning',
    experiment: 'success',
    emergency: 'danger'
  }
  return tags[type as keyof typeof tags] || 'info'
}

const getTypeLabel = (type: string) => {
  const labels = {
    feature: '功能',
    ops: '运维',
    experiment: '实验',
    emergency: '紧急'
  }
  return labels[type as keyof typeof labels] || type
}

const getLevelTag = (level: string) => {
  const tags = {
    global: 'danger',
    tenant: 'warning',
    user: 'success',
    environment: 'info'
  }
  return tags[level as keyof typeof tags] || 'info'
}

const getLevelLabel = (level: string) => {
  const labels = {
    global: '全局',
    tenant: '租户',
    user: '用户',
    environment: '环境'
  }
  return labels[level as keyof typeof labels] || level
}

const updateFlagStatus = (flagId: string, status: string) => {
  updateFlag(flagId, { status: status as any })
  ElMessage.success('开关状态已更新')
}

const editFlag = (flag: FeatureFlag) => {
  editingFlag.value = flag
  Object.assign(flagForm, flag)
  showCreateDialog.value = true
}

const deleteFlag = async (flagId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这个开关吗？', '确认删除')
    removeFlag(flagId)
    ElMessage.success('开关已删除')
  } catch {
    // 用户取消删除
  }
}

const saveFlag = () => {
  if (!flagForm.id || !flagForm.name) {
    ElMessage.error('请填写必填字段')
    return
  }
  
  const flag: FeatureFlag = {
    ...flagForm,
    createdAt: editingFlag.value?.createdAt || new Date(),
    updatedAt: new Date(),
    createdBy: editingFlag.value?.createdBy || 'admin'
  }
  
  if (editingFlag.value) {
    updateFlag(flag.id, flag)
    ElMessage.success('开关已更新')
  } else {
    addFlag(flag)
    ElMessage.success('开关已创建')
  }
  
  showCreateDialog.value = false
  editingFlag.value = null
  resetForm()
}

const resetForm = () => {
  Object.assign(flagForm, {
    id: '',
    name: '',
    description: '',
    type: 'feature',
    level: 'global',
    status: 'disabled',
    defaultValue: false,
    gradualPercentage: 10
  })
}
</script>

<style scoped>
.feature-manager {
  padding: 20px;
}

.feature-manager__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.feature-manager__header h2 {
  margin: 0;
}
</style>
```

### 6. 创建开关API
创建`packages/features/src/api.ts`：
```typescript
import type { FeatureFlag, FeatureContext } from './feature-manager'

export interface FeatureAPI {
  // 获取所有开关
  getFlags(): Promise<FeatureFlag[]>
  
  // 获取单个开关
  getFlag(flagId: string): Promise<FeatureFlag | null>
  
  // 创建开关
  createFlag(flag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'>): Promise<FeatureFlag>
  
  // 更新开关
  updateFlag(flagId: string, updates: Partial<FeatureFlag>): Promise<FeatureFlag>
  
  // 删除开关
  deleteFlag(flagId: string): Promise<void>
  
  // 批量更新开关
  updateFlags(updates: Record<string, Partial<FeatureFlag>>): Promise<void>
  
  // 检查开关状态
  checkFlag(flagId: string, context: FeatureContext): Promise<boolean>
  
  // 获取用户开关状态
  getUserFlags(context: FeatureContext): Promise<Record<string, boolean>>
}

export class FeatureAPIClient implements FeatureAPI {
  private baseURL: string
  
  constructor(baseURL: string = '/api/features') {
    this.baseURL = baseURL
  }
  
  async getFlags(): Promise<FeatureFlag[]> {
    const response = await fetch(`${this.baseURL}/flags`)
    if (!response.ok) {
      throw new Error('Failed to fetch flags')
    }
    return response.json()
  }
  
  async getFlag(flagId: string): Promise<FeatureFlag | null> {
    const response = await fetch(`${this.baseURL}/flags/${flagId}`)
    if (response.status === 404) {
      return null
    }
    if (!response.ok) {
      throw new Error('Failed to fetch flag')
    }
    return response.json()
  }
  
  async createFlag(flag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'>): Promise<FeatureFlag> {
    const response = await fetch(`${this.baseURL}/flags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(flag)
    })
    if (!response.ok) {
      throw new Error('Failed to create flag')
    }
    return response.json()
  }
  
  async updateFlag(flagId: string, updates: Partial<FeatureFlag>): Promise<FeatureFlag> {
    const response = await fetch(`${this.baseURL}/flags/${flagId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })
    if (!response.ok) {
      throw new Error('Failed to update flag')
    }
    return response.json()
  }
  
  async deleteFlag(flagId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/flags/${flagId}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error('Failed to delete flag')
    }
  }
  
  async updateFlags(updates: Record<string, Partial<FeatureFlag>>): Promise<void> {
    const response = await fetch(`${this.baseURL}/flags/batch`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })
    if (!response.ok) {
      throw new Error('Failed to update flags')
    }
  }
  
  async checkFlag(flagId: string, context: FeatureContext): Promise<boolean> {
    const response = await fetch(`${this.baseURL}/flags/${flagId}/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(context)
    })
    if (!response.ok) {
      throw new Error('Failed to check flag')
    }
    return response.json()
  }
  
  async getUserFlags(context: FeatureContext): Promise<Record<string, boolean>> {
    const response = await fetch(`${this.baseURL}/flags/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(context)
    })
    if (!response.ok) {
      throw new Error('Failed to get user flags')
    }
    return response.json()
  }
}
```

## 产出物

- [x] `packages/features/package.json` - 功能开关包配置
- [x] `packages/features/src/feature-manager.ts` - 开关管理器
- [x] `config/features/features.config.ts` - 开关配置
- [x] `packages/features/src/components/` - 开关组件
- [x] `packages/features/src/api.ts` - 开关API

## 审计清单

- [ ] 功能开关系统
- [ ] 运维开关配置
- [ ] 动态开关控制
- [ ] 开关管理界面
- [ ] 开关类型支持
- [ ] 开关级别控制
- [ ] 条件评估
- [ ] 灰度发布
- [ ] A/B测试
- [ ] 紧急开关
- [ ] 缓存机制
- [ ] API接口
