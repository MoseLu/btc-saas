# BTC SaaS 样式系统重构总结

## 重构目标

按照"三板斧"方案，将 btc-saas 项目的样式系统重构为：
- **可维护**：统一的设计变量和组件样式
- **可复用**：模块化的样式包和工具类
- **可主题化**：支持明暗主题和多租户定制

## 重构成果

### 1. 创建统一的样式包 `@btc/styles`

#### 目录结构
```
packages/styles/
├── src/
│   ├── tokens/                 # 设计变量
│   │   ├── _colors.scss       # 颜色系统
│   │   ├── _spacing.scss      # 间距系统
│   │   ├── _radius.scss       # 圆角系统
│   │   ├── _zindex.scss       # 层级系统
│   │   ├── index.scss         # 变量统一入口
│   │   └── css-vars.css       # CSS 变量定义
│   ├── base/                  # 基础样式层
│   │   ├── reset.css          # CSS 重置
│   │   ├── typography.scss    # 排版样式
│   │   └── layout.scss        # 布局工具类
│   ├── mixins/                # 混入工具
│   │   ├── _media.scss        # 媒体查询
│   │   ├── _focus.scss        # 焦点和无障碍
│   │   └── index.scss         # 混入统一入口
│   ├── themes/                # 主题层
│   │   ├── element-plus.scss  # Element Plus 覆盖
│   │   └── components.scss    # 自定义组件主题
│   └── index.scss             # 总入口
├── package.json
└── README.md
```

#### 核心特性
- 🎨 **统一设计变量**：颜色、间距、圆角等设计值统一管理
- 🌙 **主题切换**：支持明暗主题，使用 `data-theme` 属性切换
- 🧩 **模块化组织**：分层设计，职责清晰
- 📱 **响应式支持**：内置媒体查询 mixins
- ♿ **无障碍设计**：焦点环和屏幕阅读器支持

### 2. 设计变量系统

#### CSS 变量定义
```css
:root {
  --btc-color-primary: #D92D20;
  --btc-color-bg: #ffffff;
  --btc-color-text: #1f2328;
  --btc-spacing-3: 12px;
  --btc-radius-md: 8px;
}

[data-theme="dark"] {
  --btc-color-primary: #F97066;
  --btc-color-bg: #0f1115;
  --btc-color-text: #e6e8eb;
}
```

#### SASS 变量映射
```scss
$color-primary: var(--btc-color-primary);
$color-bg: var(--btc-color-bg);
$color-text: var(--btc-color-text);
```

### 3. 组件样式重构

#### AdminLayout.vue 重构
- ✅ 移除内联样式，使用并排 SCSS 文件
- ✅ 应用设计变量，替换硬编码值
- ✅ 使用 BEM 命名规范
- ✅ 支持响应式设计
- ✅ 主题切换使用 `data-theme` 属性

#### 样式文件结构
```
src/layouts/
├── AdminLayout.vue          # 组件逻辑
└── AdminLayout.scss         # 样式文件
```

### 4. 工具类和混入

#### 布局工具类
```scss
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-3 { gap: $spacing-3; }
```

#### 媒体查询混入
```scss
@include respond-to('md') {
  // 中等屏幕样式
}

@include respond-to-max('lg') {
  // 大屏幕以下样式
}
```

#### 无障碍混入
```scss
@include accessible-focus;  // 焦点环
@include sr-only;           // 屏幕阅读器专用
```

### 5. Element Plus 主题覆盖

#### 变量映射
```scss
:root {
  --el-color-primary: #{$color-primary};
  --el-bg-color: #{$color-bg};
  --el-text-color-primary: #{$color-text};
}
```

#### 组件样式覆盖
```scss
.el-button {
  border-radius: $radius-button;
  
  &--primary {
    background-color: $color-primary;
  }
}
```

### 6. 开发工具配置

#### Vite 配置
```ts
css: {
  preprocessorOptions: {
    scss: {
      additionalData: `
        @use "@btc/styles/src/tokens/index.scss" as *;
        @use "@btc/styles/src/mixins/index.scss" as *;
      `,
    },
  },
}
```

#### Stylelint 配置
```json
{
  "extends": ["stylelint-config-standard-scss"],
  "rules": {
    "selector-max-id": 0,
    "selector-class-pattern": "^[a-z]([a-z0-9-]+)?(__([a-z0-9]+-?)+)?(--([a-z0-9]+-?)+){0,2}$"
  }
}
```

## 使用指南

### 1. 在组件中使用设计变量
```vue
<template>
  <div class="user-card">
    <h3 class="user-card__name">{{ name }}</h3>
  </div>
</template>

<style lang="scss">
.user-card {
  background: $color-bg;
  color: $color-text;
  border-radius: $radius-md;
  padding: $spacing-3;
  
  &__name {
    font-weight: 600;
    color: $color-primary;
  }
}
</style>
```

### 2. 主题切换
```ts
// 切换到暗色主题
document.documentElement.setAttribute('data-theme', 'dark')

// 切换到亮色主题
document.documentElement.removeAttribute('data-theme')
```

### 3. 响应式设计
```scss
@include respond-to('md') {
  .container {
    max-width: 768px;
  }
}
```

### 4. 并排 SCSS 文件
```vue
<template>
  <div class="component">
    <!-- 组件内容 -->
  </div>
</template>

<script setup>
// 组件逻辑
</script>

<style lang="scss" src="./Component.scss"></style>
```

## 重构收益

### 1. 可维护性提升
- ✅ 设计变量集中管理，修改一处全局生效
- ✅ 样式文件分离，逻辑和样式解耦
- ✅ BEM 命名规范，样式结构清晰

### 2. 可复用性增强
- ✅ 工具类和混入可在所有项目中复用
- ✅ 组件样式标准化，减少重复代码
- ✅ 设计系统统一，品牌一致性

### 3. 可主题化实现
- ✅ 支持明暗主题切换
- ✅ 多租户样式定制
- ✅ CSS 变量驱动，性能优化

### 4. 开发体验改善
- ✅ 自动补全设计变量
- ✅ Stylelint 规范检查
- ✅ 响应式设计工具

## 后续计划

### 1. 组件库建设
- [ ] 创建 `@btc/ui` 组件库
- [ ] 基于设计系统的组件开发
- [ ] Storybook 文档站点

### 2. 主题系统完善
- [ ] 多租户主题配置
- [ ] 主题预览工具
- [ ] 主题切换动画

### 3. 开发工具优化
- [ ] 样式审计脚本
- [ ] 设计变量检查工具
- [ ] 样式覆盖率统计

### 4. 文档完善
- [ ] 组件样式指南
- [ ] 设计系统文档
- [ ] 最佳实践示例

## 总结

本次重构成功建立了 btc-saas 项目的统一样式系统，实现了：

1. **架构清晰**：分层设计，职责明确
2. **变量统一**：设计值集中管理，易于维护
3. **主题支持**：明暗主题切换，多租户定制
4. **开发友好**：工具完善，规范统一
5. **性能优化**：CSS 变量驱动，减少重复

为后续的组件库建设和多应用开发奠定了坚实的基础。
