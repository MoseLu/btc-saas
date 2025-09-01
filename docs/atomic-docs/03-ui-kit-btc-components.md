---
title: UI 组件库 BTC Components
category: ui
order: 3
owners: [frontend, ui]
auditable: true
acceptance:
  - [x] BtcCrud 系列组件可用
  - [x] 自动导入约定生效
  - [x] 组件文档完整
  - [x] 主题定制支持
outputs:
  - packages/ui/src/components/
  - packages/ui/dist/
  - packages/ui/docs/
related: [02-bridge-sdk-and-topbar, 08-styles-and-ep-theme.sass]
---

# UI 组件库 BTC Components

## 背景与目标

构建统一的UI组件库，提供BtcCrud系列组件和通用业务组件，支持自动导入和主题定制，确保各子系统UI一致性。

## 约定

### 组件命名约定
- 所有组件以`Btc`前缀命名
- 使用PascalCase命名
- 文件名使用kebab-case

### 组件分类
```
BtcCrud/          # CRUD操作组件
├── BtcTable      # 数据表格
├── BtcForm       # 表单组件
├── BtcModal      # 弹窗组件
└── BtcUpload     # 上传组件

BtcLayout/        # 布局组件
├── BtcCard       # 卡片容器
├── BtcRow        # 行容器
├── BtcCol        # 列容器
└── BtcContainer  # 容器组件

BtcData/          # 数据展示组件
├── BtcChart      # 图表组件
├── BtcProgress   # 进度条
├── BtcTag        # 标签组件
└── BtcBadge      # 徽章组件

BtcFeedback/      # 反馈组件
├── BtcAlert      # 警告提示
├── BtcMessage    # 消息提示
├── BtcLoading    # 加载组件
└── BtcEmpty      # 空状态
```

## 步骤

### 1. 初始化UI包
```bash
cd packages/ui
pnpm init
pnpm add vue@^3.3.0 element-plus@^2.3.0 @element-plus/icons-vue
pnpm add -D @vitejs/plugin-vue typescript vite sass
```

### 2. 创建组件基础结构
```bash
mkdir -p src/components/{BtcCrud,BtcLayout,BtcData,BtcFeedback}
mkdir -p src/hooks src/utils src/types
mkdir -p docs/components
```

### 3. 创建BtcTable组件
创建`packages/ui/src/components/BtcCrud/BtcTable.vue`：
```vue
<template>
  <div class="btc-table">
    <el-table
      :data="data"
      :loading="loading"
      :border="border"
      :stripe="stripe"
      :height="height"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column
        v-if="selectable"
        type="selection"
        width="55"
        align="center"
      />
      
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :sortable="column.sortable"
        :align="column.align || 'left'"
      >
        <template #default="scope">
          <slot
            :name="`column-${column.prop}`"
            :row="scope.row"
            :column="scope.column"
            :index="scope.$index"
          >
            {{ scope.row[column.prop] }}
          </slot>
        </template>
      </el-table-column>
      
      <el-table-column
        v-if="actions.length > 0"
        label="操作"
        :width="actionWidth"
        align="center"
      >
        <template #default="scope">
          <el-button
            v-for="action in actions"
            :key="action.name"
            :type="action.type || 'primary'"
            :size="action.size || 'small'"
            @click="handleAction(action, scope.row, scope.$index)"
          >
            {{ action.label }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div v-if="pagination" class="btc-table-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface TableColumn {
  prop: string
  label: string
  width?: number | string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
}

interface TableAction {
  name: string
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger'
  size?: 'large' | 'default' | 'small'
  handler: (row: any, index: number) => void
}

interface Props {
  data: any[]
  columns: TableColumn[]
  loading?: boolean
  border?: boolean
  stripe?: boolean
  height?: number | string
  selectable?: boolean
  actions?: TableAction[]
  actionWidth?: number | string
  pagination?: boolean
  total?: number
  pageSize?: number
  pageSizes?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  border: true,
  stripe: true,
  selectable: false,
  actions: () => [],
  actionWidth: 200,
  pagination: false,
  total: 0,
  pageSize: 10,
  pageSizes: () => [10, 20, 50, 100]
})

const emit = defineEmits<{
  'selection-change': [selection: any[]]
  'sort-change': [sort: any]
  'action': [action: TableAction, row: any, index: number]
  'size-change': [size: number]
  'current-change': [page: number]
}>()

const currentPage = ref(1)

const handleSelectionChange = (selection: any[]) => {
  emit('selection-change', selection)
}

const handleSortChange = (sort: any) => {
  emit('sort-change', sort)
}

const handleAction = (action: TableAction, row: any, index: number) => {
  action.handler(row, index)
  emit('action', action, row, index)
}

const handleSizeChange = (size: number) => {
  emit('size-change', size)
}

const handleCurrentChange = (page: number) => {
  emit('current-change', page)
}
</script>

<style scoped>
.btc-table {
  width: 100%;
}

.btc-table-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
```

### 4. 创建BtcForm组件
创建`packages/ui/src/components/BtcCrud/BtcForm.vue`：
```vue
<template>
  <el-form
    ref="formRef"
    :model="modelValue"
    :rules="rules"
    :label-width="labelWidth"
    :label-position="labelPosition"
    :size="size"
  >
    <el-row :gutter="gutter">
      <el-col
        v-for="field in fields"
        :key="field.prop"
        :span="field.span || 24"
        :offset="field.offset || 0"
      >
        <el-form-item
          :label="field.label"
          :prop="field.prop"
          :required="field.required"
        >
          <component
            :is="getFieldComponent(field.type)"
            v-model="modelValue[field.prop]"
            v-bind="field.props || {}"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            @change="handleFieldChange(field, $event)"
          />
        </el-form-item>
      </el-col>
    </el-row>
    
    <el-form-item v-if="showActions">
      <el-button type="primary" @click="handleSubmit">
        {{ submitText }}
      </el-button>
      <el-button @click="handleReset">
        {{ resetText }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface FormField {
  prop: string
  label: string
  type: 'input' | 'select' | 'date' | 'textarea' | 'switch' | 'radio' | 'checkbox'
  span?: number
  offset?: number
  required?: boolean
  placeholder?: string
  disabled?: boolean
  props?: Record<string, any>
}

interface Props {
  modelValue: Record<string, any>
  fields: FormField[]
  rules?: FormRules
  labelWidth?: string | number
  labelPosition?: 'left' | 'right' | 'top'
  size?: 'large' | 'default' | 'small'
  gutter?: number
  showActions?: boolean
  submitText?: string
  resetText?: string
}

const props = withDefaults(defineProps<Props>(), {
  labelWidth: 'auto',
  labelPosition: 'right',
  size: 'default',
  gutter: 20,
  showActions: true,
  submitText: '提交',
  resetText: '重置'
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'submit': [form: Record<string, any>]
  'reset': []
  'field-change': [field: FormField, value: any]
}>()

const formRef = ref<FormInstance>()

const getFieldComponent = (type: string) => {
  const componentMap = {
    input: 'el-input',
    select: 'el-select',
    date: 'el-date-picker',
    textarea: 'el-input',
    switch: 'el-switch',
    radio: 'el-radio-group',
    checkbox: 'el-checkbox-group'
  }
  return componentMap[type] || 'el-input'
}

const handleFieldChange = (field: FormField, value: any) => {
  emit('field-change', field, value)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('submit', props.modelValue)
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  emit('reset')
}
</script>
```

### 5. 创建自动导入配置
创建`packages/ui/src/auto-imports.ts`：
```typescript
import { defineAsyncComponent } from 'vue'

// 自动导入所有组件
const components = import.meta.glob('./components/**/*.vue', { eager: true })

export const autoImports = Object.entries(components).reduce((acc, [path, component]) => {
  const name = path.split('/').pop()?.replace('.vue', '') || ''
  acc[name] = defineAsyncComponent(() => Promise.resolve(component))
  return acc
}, {} as Record<string, any>)
```

### 6. 创建组件文档
创建`packages/ui/docs/components/BtcTable.md`：
```markdown
# BtcTable 表格组件

## 基础用法

```vue
<template>
  <BtcTable
    :data="tableData"
    :columns="columns"
    :loading="loading"
    @selection-change="handleSelectionChange"
  />
</template>

<script setup>
const columns = [
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'age', label: '年龄', width: 80 },
  { prop: 'email', label: '邮箱' }
]

const tableData = [
  { name: '张三', age: 25, email: 'zhangsan@example.com' },
  { name: '李四', age: 30, email: 'lisi@example.com' }
]
</script>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| data | 表格数据 | Array | [] |
| columns | 列配置 | Array | [] |
| loading | 加载状态 | Boolean | false |
| border | 是否显示边框 | Boolean | true |
| stripe | 是否显示斑马纹 | Boolean | true |
| selectable | 是否可选择 | Boolean | false |
| actions | 操作按钮 | Array | [] |
| pagination | 是否显示分页 | Boolean | false |
```

### 7. 配置构建和导出
创建`packages/ui/src/index.ts`：
```typescript
// 导出所有组件
export { default as BtcTable } from './components/BtcCrud/BtcTable.vue'
export { default as BtcForm } from './components/BtcCrud/BtcForm.vue'
export { default as BtcModal } from './components/BtcCrud/BtcModal.vue'
export { default as BtcUpload } from './components/BtcCrud/BtcUpload.vue'

export { default as BtcCard } from './components/BtcLayout/BtcCard.vue'
export { default as BtcRow } from './components/BtcLayout/BtcRow.vue'
export { default as BtcCol } from './components/BtcLayout/BtcCol.vue'

export { default as BtcChart } from './components/BtcData/BtcChart.vue'
export { default as BtcProgress } from './components/BtcData/BtcProgress.vue'
export { default as BtcTag } from './components/BtcData/BtcTag.vue'

export { default as BtcAlert } from './components/BtcFeedback/BtcAlert.vue'
export { default as BtcMessage } from './components/BtcFeedback/BtcMessage.vue'
export { default as BtcLoading } from './components/BtcFeedback/BtcLoading.vue'

// 导出类型
export type { TableColumn, TableAction } from './types/table'
export type { FormField } from './types/form'

// 导出工具函数
export { useTable } from './hooks/useTable'
export { useForm } from './hooks/useForm'
```

## 产出物

- [x] `packages/ui/src/components/BtcCrud/` - CRUD组件
- [x] `packages/ui/src/components/BtcLayout/` - 布局组件
- [x] `packages/ui/src/components/BtcData/` - 数据组件
- [x] `packages/ui/src/components/BtcFeedback/` - 反馈组件
- [x] `packages/ui/src/hooks/` - 组合式函数
- [x] `packages/ui/src/types/` - 类型定义
- [x] `packages/ui/docs/` - 组件文档
- [x] `packages/ui/dist/` - 构建产物

## 审计清单

- [x] BtcCrud 系列组件可用
- [x] 自动导入约定生效
- [x] 组件文档完整
- [x] 主题定制支持
- [x] 类型定义完整
- [x] 构建产物正确
- [x] 组件测试覆盖
