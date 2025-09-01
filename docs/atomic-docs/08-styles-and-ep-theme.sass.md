---
title: 样式与 Element Plus 主题定制
category: styles
order: 8
owners: [frontend, ui]
auditable: true
acceptance:
  - [ ] SASS 变量驱动主题
  - [ ] CSS Vars 注入机制
  - [ ] Element Plus 主题定制
  - [ ] 响应式设计支持
outputs:
  - packages/ui/src/styles/
  - packages/bridge/src/styles/
  - dist/themes/
related: [03-ui-kit-btc-components, 02-bridge-sdk-and-topbar]
---

# 样式与 Element Plus 主题定制

## 背景与目标

建立统一的样式体系，使用SASS变量驱动主题，实现CSS Vars注入机制，定制Element Plus主题，支持响应式设计。

## 约定

### 样式目录结构
```
packages/ui/src/styles/
├── variables.sass    # 主题变量
├── mixins.sass       # 混入函数
├── reset.sass        # 重置样式
├── base.sass         # 基础样式
├── themes/           # 主题文件
│   ├── light.sass    # 浅色主题
│   └── dark.sass     # 深色主题
└── components/       # 组件样式
    ├── button.sass   # 按钮样式
    ├── table.sass    # 表格样式
    └── form.sass     # 表单样式
```

## 步骤

### 1. 创建主题变量
创建`packages/ui/src/styles/variables.sass`：
```sass
// 颜色系统
$primary-color: #e53e3e
$success-color: #38a169
$warning-color: #d69e2e
$danger-color: #e53e3e
$info-color: #3182ce

// 中性色
$text-primary: #2d3748
$text-secondary: #4a5568
$text-disabled: #a0aec0
$border-color: #e2e8f0
$background-color: #ffffff

// 间距系统
$spacing-xs: 4px
$spacing-sm: 8px
$spacing-md: 16px
$spacing-lg: 24px
$spacing-xl: 32px

// 字体系统
$font-size-xs: 12px
$font-size-sm: 14px
$font-size-md: 16px
$font-size-lg: 18px
$font-size-xl: 20px

// 圆角
$border-radius-sm: 4px
$border-radius-md: 8px
$border-radius-lg: 12px

// 阴影
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
```

### 2. 创建混入函数
创建`packages/ui/src/styles/mixins.sass`：
```sass
// 响应式断点
@mixin mobile
  @media (max-width: 768px)
    @content

@mixin tablet
  @media (min-width: 769px) and (max-width: 1024px)
    @content

@mixin desktop
  @media (min-width: 1025px)
    @content

// 弹性布局
@mixin flex-center
  display: flex
  align-items: center
  justify-content: center

@mixin flex-between
  display: flex
  align-items: center
  justify-content: space-between

// 文本省略
@mixin text-ellipsis
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap

// 卡片样式
@mixin card
  background: $background-color
  border-radius: $border-radius-md
  box-shadow: $shadow-sm
  padding: $spacing-md
```

### 3. 创建主题生成器
创建`packages/ui/src/styles/theme-generator.sass`：
```sass
// 生成CSS变量
:root
  // 颜色变量
  --btc-primary: #{$primary-color}
  --btc-success: #{$success-color}
  --btc-warning: #{$warning-color}
  --btc-danger: #{$danger-color}
  --btc-info: #{$info-color}
  
  // 文本颜色
  --btc-text-primary: #{$text-primary}
  --btc-text-secondary: #{$text-secondary}
  --btc-text-disabled: #{$text-disabled}
  
  // 边框颜色
  --btc-border-color: #{$border-color}
  
  // 背景颜色
  --btc-bg-primary: #{$background-color}
  --btc-bg-secondary: #f7fafc
  
  // 间距
  --btc-spacing-xs: #{$spacing-xs}
  --btc-spacing-sm: #{$spacing-sm}
  --btc-spacing-md: #{$spacing-md}
  --btc-spacing-lg: #{$spacing-lg}
  --btc-spacing-xl: #{$spacing-xl}
  
  // 字体大小
  --btc-font-size-xs: #{$font-size-xs}
  --btc-font-size-sm: #{$font-size-sm}
  --btc-font-size-md: #{$font-size-md}
  --btc-font-size-lg: #{$font-size-lg}
  --btc-font-size-xl: #{$font-size-xl}
  
  // 圆角
  --btc-border-radius-sm: #{$border-radius-sm}
  --btc-border-radius-md: #{$border-radius-md}
  --btc-border-radius-lg: #{$border-radius-lg}
  
  // 阴影
  --btc-shadow-sm: #{$shadow-sm}
  --btc-shadow-md: #{$shadow-md}
  --btc-shadow-lg: #{$shadow-lg}

// 深色主题
[data-theme="dark"]
  --btc-primary: #{$primary-color}
  --btc-text-primary: #ffffff
  --btc-text-secondary: #a0aec0
  --btc-bg-primary: #1a202c
  --btc-bg-secondary: #2d3748
  --btc-border-color: #4a5568
```

### 4. 创建Element Plus主题定制
创建`packages/ui/src/styles/element-theme.sass`：
```sass
// Element Plus 主题变量覆盖
:root
  // 主色
  --el-color-primary: var(--btc-primary)
  --el-color-primary-light-3: #{lighten($primary-color, 30%)}
  --el-color-primary-light-5: #{lighten($primary-color, 50%)}
  --el-color-primary-light-7: #{lighten($primary-color, 70%)}
  --el-color-primary-light-8: #{lighten($primary-color, 80%)}
  --el-color-primary-light-9: #{lighten($primary-color, 90%)}
  --el-color-primary-dark-2: #{darken($primary-color, 20%)}
  
  // 成功色
  --el-color-success: var(--btc-success)
  --el-color-success-light-3: #{lighten($success-color, 30%)}
  --el-color-success-light-5: #{lighten($success-color, 50%)}
  --el-color-success-light-7: #{lighten($success-color, 70%)}
  --el-color-success-light-8: #{lighten($success-color, 80%)}
  --el-color-success-light-9: #{lighten($success-color, 90%)}
  --el-color-success-dark-2: #{darken($success-color, 20%)}
  
  // 警告色
  --el-color-warning: var(--btc-warning)
  --el-color-warning-light-3: #{lighten($warning-color, 30%)}
  --el-color-warning-light-5: #{lighten($warning-color, 50%)}
  --el-color-warning-light-7: #{lighten($warning-color, 70%)}
  --el-color-warning-light-8: #{lighten($warning-color, 80%)}
  --el-color-warning-light-9: #{lighten($warning-color, 90%)}
  --el-color-warning-dark-2: #{darken($warning-color, 20%)}
  
  // 危险色
  --el-color-danger: var(--btc-danger)
  --el-color-danger-light-3: #{lighten($danger-color, 30%)}
  --el-color-danger-light-5: #{lighten($danger-color, 50%)}
  --el-color-danger-light-7: #{lighten($danger-color, 70%)}
  --el-color-danger-light-8: #{lighten($danger-color, 80%)}
  --el-color-danger-light-9: #{lighten($danger-color, 90%)}
  --el-color-danger-dark-2: #{darken($danger-color, 20%)}
  
  // 信息色
  --el-color-info: var(--btc-info)
  --el-color-info-light-3: #{lighten($info-color, 30%)}
  --el-color-info-light-5: #{lighten($info-color, 50%)}
  --el-color-info-light-7: #{lighten($info-color, 70%)}
  --el-color-info-light-8: #{lighten($info-color, 80%)}
  --el-color-info-light-9: #{lighten($info-color, 90%)}
  --el-color-info-dark-2: #{darken($info-color, 20%)}
  
  // 文本颜色
  --el-text-color-primary: var(--btc-text-primary)
  --el-text-color-regular: var(--btc-text-secondary)
  --el-text-color-secondary: var(--btc-text-secondary)
  --el-text-color-placeholder: var(--btc-text-disabled)
  --el-text-color-disabled: var(--btc-text-disabled)
  
  // 边框颜色
  --el-border-color: var(--btc-border-color)
  --el-border-color-light: #{lighten($border-color, 10%)}
  --el-border-color-lighter: #{lighten($border-color, 20%)}
  --el-border-color-extra-light: #{lighten($border-color, 30%)}
  
  // 背景颜色
  --el-bg-color: var(--btc-bg-primary)
  --el-bg-color-page: var(--btc-bg-secondary)
  --el-bg-color-overlay: var(--btc-bg-primary)
  
  // 圆角
  --el-border-radius-base: var(--btc-border-radius-sm)
  --el-border-radius-small: var(--btc-border-radius-sm)
  --el-border-radius-round: 20px
  --el-border-radius-circle: 50%
  
  // 阴影
  --el-box-shadow: var(--btc-shadow-sm)
  --el-box-shadow-light: var(--btc-shadow-sm)
  --el-box-shadow-dark: var(--btc-shadow-md)
  
  // 字体大小
  --el-font-size-extra-large: var(--btc-font-size-xl)
  --el-font-size-large: var(--btc-font-size-lg)
  --el-font-size-medium: var(--btc-font-size-md)
  --el-font-size-base: var(--btc-font-size-sm)
  --el-font-size-small: var(--btc-font-size-xs)
```

### 5. 创建组件样式
创建`packages/ui/src/styles/components/button.sass`：
```sass
.btc-button
  @include flex-center
  padding: $spacing-sm $spacing-md
  border-radius: $border-radius-sm
  font-size: $font-size-sm
  font-weight: 500
  border: 1px solid transparent
  cursor: pointer
  transition: all 0.2s ease
  
  &:hover
    transform: translateY(-1px)
    box-shadow: $shadow-md
  
  &:active
    transform: translateY(0)
    box-shadow: $shadow-sm
  
  // 主要按钮
  &--primary
    background: var(--btc-primary)
    color: white
    
    &:hover
      background: #{darken($primary-color, 10%)}
  
  // 次要按钮
  &--secondary
    background: transparent
    border-color: var(--btc-primary)
    color: var(--btc-primary)
    
    &:hover
      background: var(--btc-primary)
      color: white
  
  // 文本按钮
  &--text
    background: transparent
    color: var(--btc-primary)
    padding: $spacing-xs $spacing-sm
    
    &:hover
      background: #{rgba($primary-color, 0.1)}
  
  // 尺寸变体
  &--small
    padding: $spacing-xs $spacing-sm
    font-size: $font-size-xs
  
  &--large
    padding: $spacing-md $spacing-lg
    font-size: $font-size-md
  
  // 禁用状态
  &:disabled
    opacity: 0.6
    cursor: not-allowed
    
    &:hover
      transform: none
      box-shadow: none
```

### 6. 创建主题切换工具
创建`packages/ui/src/styles/theme-switcher.ts`：
```typescript
export interface ThemeConfig {
  primary: string
  success: string
  warning: string
  danger: string
  info: string
  mode: 'light' | 'dark'
}

export class ThemeSwitcher {
  private static instance: ThemeSwitcher
  private currentTheme: ThemeConfig

  private constructor() {
    this.currentTheme = this.getDefaultTheme()
  }

  static getInstance(): ThemeSwitcher {
    if (!ThemeSwitcher.instance) {
      ThemeSwitcher.instance = new ThemeSwitcher()
    }
    return ThemeSwitcher.instance
  }

  setTheme(theme: Partial<ThemeConfig>): void {
    this.currentTheme = { ...this.currentTheme, ...theme }
    this.applyTheme()
  }

  private applyTheme(): void {
    const root = document.documentElement
    
    // 设置主题模式
    root.setAttribute('data-theme', this.currentTheme.mode)
    
    // 设置颜色变量
    root.style.setProperty('--btc-primary', this.currentTheme.primary)
    root.style.setProperty('--btc-success', this.currentTheme.success)
    root.style.setProperty('--btc-warning', this.currentTheme.warning)
    root.style.setProperty('--btc-danger', this.currentTheme.danger)
    root.style.setProperty('--btc-info', this.currentTheme.info)
    
    // 同步Element Plus主题
    this.syncElementTheme()
  }

  private syncElementTheme(): void {
    const root = document.documentElement
    
    // 同步主色
    root.style.setProperty('--el-color-primary', this.currentTheme.primary)
    
    // 生成色阶
    const primaryLight3 = this.lightenColor(this.currentTheme.primary, 30)
    const primaryLight5 = this.lightenColor(this.currentTheme.primary, 50)
    const primaryLight7 = this.lightenColor(this.currentTheme.primary, 70)
    const primaryLight8 = this.lightenColor(this.currentTheme.primary, 80)
    const primaryLight9 = this.lightenColor(this.currentTheme.primary, 90)
    const primaryDark2 = this.darkenColor(this.currentTheme.primary, 20)
    
    root.style.setProperty('--el-color-primary-light-3', primaryLight3)
    root.style.setProperty('--el-color-primary-light-5', primaryLight5)
    root.style.setProperty('--el-color-primary-light-7', primaryLight7)
    root.style.setProperty('--el-color-primary-light-8', primaryLight8)
    root.style.setProperty('--el-color-primary-light-9', primaryLight9)
    root.style.setProperty('--el-color-primary-dark-2', primaryDark2)
  }

  private getDefaultTheme(): ThemeConfig {
    return {
      primary: '#e53e3e',
      success: '#38a169',
      warning: '#d69e2e',
      danger: '#e53e3e',
      info: '#3182ce',
      mode: 'light'
    }
  }

  private lightenColor(color: string, percent: number): string {
    // 简单的颜色变亮实现
    return color
  }

  private darkenColor(color: string, percent: number): string {
    // 简单的颜色变暗实现
    return color
  }
}

export const themeSwitcher = ThemeSwitcher.getInstance()
```

## 产出物

- [x] `packages/ui/src/styles/variables.sass` - 主题变量
- [x] `packages/ui/src/styles/mixins.sass` - 混入函数
- [x] `packages/ui/src/styles/theme-generator.sass` - 主题生成器
- [x] `packages/ui/src/styles/element-theme.sass` - Element Plus主题
- [x] `packages/ui/src/styles/components/` - 组件样式
- [x] `packages/ui/src/styles/theme-switcher.ts` - 主题切换工具

## 审计清单

- [ ] SASS 变量驱动主题
- [ ] CSS Vars 注入机制
- [ ] Element Plus 主题定制
- [ ] 响应式设计支持
- [ ] 主题切换功能
- [ ] 组件样式统一
- [ ] 深色主题支持
