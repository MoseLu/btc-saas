# IconButton 统一图标按钮组件

## 概述

`IconButton` 是一个统一的图标按钮组件，以 TabBar 的图标按钮为标准，统一所有按钮级别的图标样式。该组件提供了丰富的配置选项和变体，确保整个应用的图标按钮风格一致。

## 特性

- 🎨 **统一设计**：基于 TabBar 按钮标准，确保视觉一致性
- 🌈 **多种变体**：支持 primary、success、warning、danger、info 等变体
- 📏 **灵活尺寸**：提供 small、medium、large 三种尺寸
- 🎭 **丰富样式**：支持 plain、text、link、round 等样式变体
- 🎯 **无障碍支持**：内置 tooltip 和 aria-label 支持
- 🌙 **主题适配**：自动适配亮色/暗色主题
- ⚡ **性能优化**：防止主题切换时的布局变化

## 基础用法

### 简单图标按钮

```vue
<template>
  <IconButton icon="Setting" @click="handleClick" />
</template>

<script setup>
import IconButton from '@/components/IconButton.vue'
import { Setting } from '@element-plus/icons-vue'

const handleClick = () => {
  console.log('按钮被点击')
}
</script>
```

### 带提示的按钮

```vue
<template>
  <IconButton 
    icon="Refresh" 
    tooltip="刷新页面"
    @click="refreshPage" 
  />
</template>
```

### 带文本的按钮

```vue
<template>
  <IconButton icon="Download" @click="downloadFile">
    下载文件
  </IconButton>
</template>
```

## 变体样式

### 颜色变体

```vue
<template>
  <div class="button-group">
    <IconButton icon="Setting" variant="default" />
    <IconButton icon="Check" variant="primary" />
    <IconButton icon="Success" variant="success" />
    <IconButton icon="Warning" variant="warning" />
    <IconButton icon="Delete" variant="danger" />
    <IconButton icon="Info" variant="info" />
  </div>
</template>
```

### 样式变体

```vue
<template>
  <div class="button-group">
    <IconButton icon="Setting" />
    <IconButton icon="Setting" plain />
    <IconButton icon="Setting" text />
    <IconButton icon="Setting" link />
    <IconButton icon="Setting" round />
  </div>
</template>
```

### 尺寸变体

```vue
<template>
  <div class="button-group">
    <IconButton icon="Setting" size="small" />
    <IconButton icon="Setting" size="medium" />
    <IconButton icon="Setting" size="large" />
  </div>
</template>
```

## 状态控制

### 禁用状态

```vue
<template>
  <IconButton 
    icon="Delete" 
    :disabled="isDeleting"
    @click="deleteItem" 
  />
</template>
```

### 加载状态

```vue
<template>
  <IconButton 
    icon="Refresh" 
    :loading="isRefreshing"
    @click="refreshData" 
  />
</template>
```

## 高级用法

### 自定义图标尺寸

```vue
<template>
  <IconButton 
    icon="Search" 
    :icon-size="20"
    tooltip="搜索"
  />
</template>
```

### 自定义提示位置

```vue
<template>
  <IconButton 
    icon="Help" 
    tooltip="帮助信息"
    tooltip-placement="right"
    tooltip-effect="light"
  />
</template>
```

### 事件处理

```vue
<template>
  <IconButton 
    icon="Edit" 
    tooltip="编辑"
    @click="handleEdit"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>

<script setup>
const handleEdit = (event) => {
  console.log('编辑按钮被点击', event)
}

const handleMouseEnter = (event) => {
  console.log('鼠标进入', event)
}

const handleMouseLeave = (event) => {
  console.log('鼠标离开', event)
}

const handleFocus = (event) => {
  console.log('获得焦点', event)
}

const handleBlur = (event) => {
  console.log('失去焦点', event)
}
</script>
```

## 实际应用示例

### 替换 TabBar 中的按钮

```vue
<template>
  <div class="tabbar__nav">
    <IconButton 
      icon="ArrowLeft" 
      tooltip="上一个标签"
      @click="goToPrevious"
    />
    
    <IconButton 
      icon="Refresh" 
      tooltip="刷新页面"
      @click="refreshPage"
    />
    
    <IconButton 
      icon="HomeFilled" 
      tooltip="首页"
      @click="goHome"
    />
  </div>
</template>
```

### 替换 AdminLayout 中的主题切换按钮

```vue
<template>
  <IconButton 
    :icon="isDark ? 'Sunny' : 'Moon'"
    tooltip="切换主题"
    @click="toggleTheme"
  />
</template>
```

### 页面操作按钮

```vue
<template>
  <div class="page-actions">
    <IconButton 
      icon="Plus" 
      variant="primary"
      tooltip="新增"
      @click="handleAdd"
    />
    
    <IconButton 
      icon="Edit" 
      variant="warning"
      tooltip="编辑"
      @click="handleEdit"
    />
    
    <IconButton 
      icon="Delete" 
      variant="danger"
      tooltip="删除"
      @click="handleDelete"
    />
    
    <IconButton 
      icon="Download" 
      variant="success"
      tooltip="导出"
      @click="handleExport"
    />
  </div>
</template>
```

## Props 说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| icon | any | - | 图标组件 |
| iconSize | number \| string | 16 | 图标尺寸 |
| type | string | 'button' | 按钮类型 |
| variant | string | 'default' | 按钮变体 |
| size | string | 'medium' | 按钮尺寸 |
| disabled | boolean | false | 是否禁用 |
| loading | boolean | false | 是否加载中 |
| round | boolean | false | 是否圆形 |
| plain | boolean | false | 是否朴素 |
| text | boolean | false | 是否文本按钮 |
| link | boolean | false | 是否链接按钮 |
| block | boolean | false | 是否块级按钮 |
| tooltip | string | - | 提示文本 |
| tooltipPlacement | string | 'top' | 提示位置 |
| tooltipEffect | string | 'dark' | 提示主题 |
| ariaLabel | string | - | 无障碍标签 |

## Events 说明

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击事件 | (event: MouseEvent) |
| mouseenter | 鼠标进入 | (event: MouseEvent) |
| mouseleave | 鼠标离开 | (event: MouseEvent) |
| focus | 获得焦点 | (event: FocusEvent) |
| blur | 失去焦点 | (event: FocusEvent) |

## 样式类名

组件会自动生成以下 CSS 类名：

- `.icon-button` - 基础按钮类
- `.icon-button--{variant}` - 变体类（如 `.icon-button--primary`）
- `.icon-button--{size}` - 尺寸类（如 `.icon-button--small`）
- `.is-disabled` - 禁用状态
- `.is-loading` - 加载状态
- `.is-round` - 圆形状态
- `.is-plain` - 朴素状态
- `.is-text` - 文本状态
- `.is-link` - 链接状态
- `.is-block` - 块级状态

## 最佳实践

### 1. 统一使用

- 所有图标按钮都应该使用 `IconButton` 组件
- 避免直接使用 `<button>` 或 `<el-button>` 创建图标按钮

### 2. 合理选择变体

- 主要操作使用 `primary` 变体
- 成功操作使用 `success` 变体
- 警告操作使用 `warning` 变体
- 危险操作使用 `danger` 变体
- 信息操作使用 `info` 变体

### 3. 提供提示信息

- 为所有图标按钮添加 `tooltip` 属性
- 提示文本应该简洁明了，说明按钮的功能

### 4. 无障碍支持

- 为重要按钮添加 `aria-label` 属性
- 确保按钮有足够的对比度和可访问性

### 5. 响应式设计

- 在移动端考虑使用更大的按钮尺寸
- 确保触摸目标足够大（至少 44px × 44px）

## 迁移指南

### 从原有按钮迁移

**迁移前：**
```vue
<button class="custom-btn" @click="handleClick">
  <el-icon><Setting /></el-icon>
</button>
```

**迁移后：**
```vue
<IconButton icon="Setting" @click="handleClick" />
```

### 从 Element Plus 按钮迁移

**迁移前：**
```vue
<el-button size="small" @click="handleClick">
  <el-icon><Setting /></el-icon>
</el-button>
```

**迁移后：**
```vue
<IconButton 
  icon="Setting" 
  size="small"
  @click="handleClick" 
/>
```

## 注意事项

1. **图标导入**：确保在使用前正确导入 Element Plus 图标
2. **主题适配**：组件会自动适配亮色/暗色主题，无需额外配置
3. **性能优化**：组件使用了 `contain: layout style` 防止主题切换时的布局变化
4. **事件冒泡**：点击事件会自动阻止在禁用或加载状态下的触发
5. **样式覆盖**：如需自定义样式，建议使用 CSS 变量或通过 props 配置
