# @btc/styles

BTC SaaS 统一样式系统

## 架构设计

### 分层结构
- **Design Tokens**: 设计变量（SASS + CSS Variables）
- **基础层**: reset/base/utilities
- **组件主题层**: Element Plus 覆盖/自定义组件
- **应用覆盖层**: 业务应用特定样式

### 核心特性
- 🎨 统一的设计变量系统
- 🌙 支持明暗主题切换
- 🧩 模块化样式组织
- 📱 响应式设计支持
- ♿ 无障碍设计支持

## 使用方法

### 1. 安装依赖
```bash
pnpm add @btc/styles
```

### 2. 在 Vite 配置中注入
```ts
// vite.config.ts
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@btc/styles/src/tokens/index.scss" as *;
          @use "@btc/styles/src/mixins/index.scss" as *;
        `,
      },
    },
  },
})
```

### 3. 在 main.ts 中引入
```ts
import '@btc/styles/src/index.scss'
```

### 4. 在组件中使用
```vue
<template>
  <div class="user-card">
    <h3 class="user-card__name">{{ name }}</h3>
  </div>
</template>

<style lang="scss">
.user-card {
  background: var(--btc-color-bg);
  color: var(--btc-color-text);
  border-radius: var(--btc-radius-md);
  padding: var(--btc-spacing-3);
  
  &__name {
    font-weight: 600;
    color: var(--btc-color-primary);
  }
}
</style>
```

## 设计变量

### 颜色系统
```scss
// 主色调
--btc-color-primary: #D92D20;
--btc-color-primary-light: #F97066;
--btc-color-primary-dark: #B42318;

// 背景色
--btc-color-bg: #ffffff;
--btc-color-bg-secondary: #f8f9fa;
--btc-color-bg-tertiary: #f1f3f4;

// 文字色
--btc-color-text: #1f2328;
--btc-color-text-secondary: #656d76;
--btc-color-text-tertiary: #8c959f;
```

### 间距系统
```scss
--btc-spacing-1: 4px;
--btc-spacing-2: 8px;
--btc-spacing-3: 12px;
--btc-spacing-4: 16px;
--btc-spacing-5: 20px;
--btc-spacing-6: 24px;
--btc-spacing-8: 32px;
--btc-spacing-10: 40px;
```

### 圆角系统
```scss
--btc-radius-sm: 4px;
--btc-radius-md: 8px;
--btc-radius-lg: 12px;
--btc-radius-xl: 16px;
--btc-radius-full: 9999px;
```

## 主题切换

### 明暗主题
```ts
// 切换到暗色主题
document.documentElement.setAttribute('data-theme', 'dark')

// 切换到亮色主题
document.documentElement.setAttribute('data-theme', 'light')
```

### 多租户支持
```css
/* 租户特定样式 */
body[data-tenant="acme"] .user-card {
  border-color: #00a3ff;
}
```

## 开发规范

### BEM 命名规范
```scss
.block {
  &__element {
    &--modifier {
      // 样式
    }
  }
}
```

### 作用域规范
- 全局样式只能出现在 `@btc/styles` 包中
- 业务应用使用模块化样式或并排 SCSS 文件
- 避免使用 ID 选择器

### 变量优先原则
- 颜色、间距、圆角等设计值使用 CSS 变量
- SASS 变量仅用于结构和计算
- 避免硬编码设计值
