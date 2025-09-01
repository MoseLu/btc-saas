# 🪓 Vue3 巨石组件拆分指导方案 (Cursor规则)

## 📋 重构目标

将庞大的Vue单文件组件（SFC）重构为职责清晰的四层架构：
- **容器层** (pages/) - 页面拼装
- **展示层** (components/) - UI组件
- **逻辑层** (composables/) - 状态管理
- **服务层** (services/) - API调用
- **样式层** (styles/) - 样式模块

## 🏗️ 目录结构规范

```
src/
├── pages/                    # 容器组件 (页面级)
│   ├── PluginManager.vue     # 插件管理页面
│   ├── ServiceManager.vue    # 服务管理页面
│   └── ...
├── components/               # 展示组件 (可复用)
│   ├── PluginStats.vue       # 插件统计卡片
│   ├── PluginList.vue        # 插件列表
│   ├── PluginPreview.vue     # 插件预览弹窗
│   ├── ServiceStats.vue      # 服务统计卡片
│   ├── ServiceList.vue       # 服务列表
│   └── ...
├── composables/              # 逻辑层 (状态管理)
│   ├── usePluginManager.ts   # 插件管理逻辑
│   ├── useServiceManager.ts  # 服务管理逻辑
│   └── ...
├── services/                 # 服务层 (API调用)
│   ├── plugin.api.ts         # 插件API
│   ├── service.api.ts        # 服务API
│   └── ...
├── styles/                   # 样式层
│   ├── modules/              # 模块样式
│   │   ├── plugin-manager.module.scss
│   │   ├── service-manager.module.scss
│   │   └── ...
│   └── ...
└── views/                    # 原始文件 (重构后删除)
    ├── PluginManager.vue     # 待删除
    ├── ServiceManager.vue    # 待删除
    └── ...
```

## 📝 各层职责定义

### 1. 容器组件 (pages/XXX.vue)
**职责：** 页面级组件，只负责UI拼装和事件转发
```vue
<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <PageHeader title="页面标题" description="页面描述" />
    
    <!-- 统计卡片 -->
    <StatsCards :stats="stats" />
    
    <!-- 控制面板 -->
    <ControlPanel @action="handleAction" />
    
    <!-- 数据列表 -->
    <DataList 
      :data="filteredData" 
      @item-action="handleItemAction" 
    />
    
    <!-- 弹窗组件 -->
    <PreviewDialog 
      :visible="dialogVisible"
      :data="currentItem"
      @close="closeDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { useXXXManager } from '@/composables/useXXXManager'
import PageHeader from '@/components/PageHeader.vue'
import StatsCards from '@/components/StatsCards.vue'
import ControlPanel from '@/components/ControlPanel.vue'
import DataList from '@/components/DataList.vue'
import PreviewDialog from '@/components/PreviewDialog.vue'
import '@/styles/modules/xxx-manager.module.scss'

// 使用逻辑层
const {
  // 状态
  data,
  stats,
  dialogVisible,
  currentItem,
  
  // 计算属性
  filteredData,
  
  // 方法
  handleAction,
  handleItemAction,
  closeDialog
} = useXXXManager()
</script>
```

### 2. 展示组件 (components/XXX.vue)
**职责：** 纯展示组件，接收props，发出emit，不包含业务逻辑
```vue
<template>
  <div class="component-name">
    <!-- 组件内容 -->
    <div class="content">
      {{ title }}
    </div>
    
    <!-- 操作按钮 -->
    <div class="actions">
      <el-button @click="$emit('action', data)">
        {{ buttonText }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  data: any
  buttonText?: string
}

interface Emits {
  action: [data: any]
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style lang="scss" scoped>
.component-name {
  // 组件样式
}
</style>
```

### 3. 逻辑层 (composables/useXXX.ts)
**职责：** 管理状态和业务逻辑，对外暴露最小API
```typescript
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { xxxApi, type XXXData } from '@/services/xxx.api'

export function useXXXManager() {
  // 响应式数据
  const data = ref<XXXData[]>([])
  const loading = ref(false)
  const searchQuery = ref('')
  const dialogVisible = ref(false)
  const currentItem = ref<XXXData | null>(null)

  // 计算属性
  const stats = computed(() => ({
    total: data.value.length,
    active: data.value.filter(item => item.status === 'active').length,
    inactive: data.value.filter(item => item.status === 'inactive').length
  }))

  const filteredData = computed(() => {
    let filtered = data.value
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      )
    }
    return filtered
  })

  // 方法
  const loadData = async () => {
    loading.value = true
    try {
      const result = await xxxApi.getData()
      data.value = result
    } catch (error) {
      ElMessage.error('加载数据失败')
      console.error('加载失败:', error)
    } finally {
      loading.value = false
    }
  }

  const handleAction = async (action: string) => {
    try {
      await xxxApi.performAction(action)
      ElMessage.success('操作成功')
      await loadData() // 重新加载数据
    } catch (error) {
      ElMessage.error('操作失败')
      console.error('操作失败:', error)
    }
  }

  const handleItemAction = (item: XXXData) => {
    currentItem.value = item
    dialogVisible.value = true
  }

  const closeDialog = () => {
    dialogVisible.value = false
    currentItem.value = null
  }

  return {
    // 状态
    data,
    loading,
    searchQuery,
    dialogVisible,
    currentItem,

    // 计算属性
    stats,
    filteredData,

    // 方法
    loadData,
    handleAction,
    handleItemAction,
    closeDialog
  }
}
```

### 4. 服务层 (services/xxx.api.ts)
**职责：** 封装所有API调用，提供类型安全的接口
```typescript
// 数据类型定义
export interface XXXData {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

export interface XXXStats {
  total: number
  active: number
  inactive: number
}

// API服务
export const xxxApi = {
  // 获取数据列表
  async getData(): Promise<XXXData[]> {
    try {
      const response = await fetch('/api/xxx')
      if (!response.ok) {
        throw new Error('获取数据失败')
      }
      return await response.json()
    } catch (error) {
      console.error('API调用失败:', error)
      throw error
    }
  },

  // 创建数据
  async createData(data: Partial<XXXData>): Promise<XXXData> {
    try {
      const response = await fetch('/api/xxx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        throw new Error('创建数据失败')
      }
      return await response.json()
    } catch (error) {
      console.error('API调用失败:', error)
      throw error
    }
  },

  // 更新数据
  async updateData(id: string, data: Partial<XXXData>): Promise<XXXData> {
    try {
      const response = await fetch(`/api/xxx/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        throw new Error('更新数据失败')
      }
      return await response.json()
    } catch (error) {
      console.error('API调用失败:', error)
      throw error
    }
  },

  // 删除数据
  async deleteData(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/xxx/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        throw new Error('删除数据失败')
      }
    } catch (error) {
      console.error('API调用失败:', error)
      throw error
    }
  },

  // 执行操作
  async performAction(action: string): Promise<void> {
    try {
      const response = await fetch('/api/xxx/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })
      if (!response.ok) {
        throw new Error('执行操作失败')
      }
    } catch (error) {
      console.error('API调用失败:', error)
      throw error
    }
  }
}
```

### 5. 样式模块 (styles/modules/xxx-manager.module.scss)
**职责：** 模块级样式，避免样式冲突
```scss
// 页面容器样式
.xxx-manager {
  padding: 20px;

  .page-header {
    margin-bottom: 24px;

    h2 {
      margin: 0 0 8px 0;
      color: var(--el-text-color-primary);
      font-size: 24px;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
  }

  .control-section {
    margin-bottom: 24px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  .filter-section {
    margin-bottom: 24px;

    .filter-controls {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;

      .search-input {
        width: 300px;
      }

      .status-select {
        width: 200px;
      }
    }
  }

  .data-section {
    margin-bottom: 24px;
  }

  .info-section {
    margin-bottom: 24px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .xxx-manager {
    padding: 16px;

    .control-section {
      .card-header {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;

        .header-actions {
          justify-content: center;
        }
      }
    }

    .filter-section {
      .filter-controls {
        flex-direction: column;
        align-items: stretch;

        .search-input,
        .status-select {
          width: 100%;
        }
      }
    }
  }
}
```

## 🔄 重构步骤

### 第一步：分析原文件
1. 识别主要功能模块
2. 提取业务逻辑
3. 分离UI组件
4. 识别API调用

### 第二步：创建服务层
1. 定义数据类型接口
2. 封装API调用方法
3. 添加错误处理

### 第三步：创建逻辑层
1. 管理响应式状态
2. 实现业务逻辑
3. 提供计算属性
4. 暴露操作方法

### 第四步：创建展示组件
1. 提取可复用UI组件
2. 定义Props和Emits
3. 保持组件纯净

### 第五步：创建容器组件
1. 拼装页面结构
2. 连接逻辑层
3. 处理事件转发
4. 导入样式模块

### 第六步：创建样式模块
1. 提取页面样式
2. 使用模块化CSS
3. 添加响应式设计

## ✅ 重构检查清单

- [ ] 原文件功能完全保留
- [ ] 组件职责单一明确
- [ ] 类型定义完整
- [ ] 错误处理完善
- [ ] 样式模块化
- [ ] 响应式设计
- [ ] 代码可维护性
- [ ] 组件可复用性

## 🚫 禁止事项

1. **容器组件中直接写API调用**
2. **展示组件中包含业务逻辑**
3. **逻辑层中直接操作DOM**
4. **服务层中包含UI逻辑**
5. **样式文件中使用全局选择器**
6. **组件间直接传递复杂对象**

## 📊 重构效果

**重构前：**
- 单个文件 800+ 行
- 职责混乱
- 难以维护
- 不可复用

**重构后：**
- 多个小文件，职责清晰
- 逻辑分离，易于测试
- 组件复用，提高效率
- 类型安全，减少错误

## 🎯 使用指南

当遇到大型Vue文件时，按照以下步骤进行重构：

1. **复制此指导方案到项目根目录**
2. **按照目录结构创建文件**
3. **按照各层职责编写代码**
4. **使用重构检查清单验证**
5. **删除原始文件**

---

**注意：** 此指导方案适用于Vue3 + TypeScript + Element Plus项目，其他技术栈可参考调整。
