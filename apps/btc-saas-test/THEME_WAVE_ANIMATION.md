# 主题切换动画实现说明

## 🎯 实现目标

成功实现了 cool-admin 风格的主题切换动画效果：

- **亮色 → 暗色**：新主题从右上角**展开圆弧**（reveal）
- **暗色 → 亮色**：旧主题从左下角**收起圆弧**（conceal）

## ✅ 核心实现

### 1. 组合式 API (`useThemeWaveSwitch.ts`)

```typescript
export function useThemeWaveSwitch(applyTheme: (next: 'light'|'dark') => void) {
  const supportVT = 'startViewTransition' in document;
  
  function start(next: 'light'|'dark') {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');

    if (!isDark && next === 'dark') {
      // 亮 -> 暗：新主题「展开」
      originFrom('tr');        // 右上角
      markMode('reveal');      // 动 ::view-transition-new(root)
    } else {
      // 暗 -> 亮：旧主题「收起」
      originFrom('bl');        // 左下角
      markMode('conceal');     // 动 ::view-transition-old(root)
    }

    // 使用 View Transitions API
    (document as any).startViewTransition(() => {
      applyTheme(next);
    }).finished.finally(clearMarks);
  }

  return { start };
}
```

### 2. 动画样式 (`theme-wave.css`)

```css
/* 亮 -> 暗：新主题"展开" */
html[data-vt-mode="reveal"] ::view-transition-new(root){
  clip-path: circle(0 at var(--vt-cx) var(--vt-cy));
  animation: vt-reveal var(--vt-duration) var(--vt-easing) forwards;
}
@keyframes vt-reveal{
  to { clip-path: circle(141.5% at var(--vt-cx) var(--vt-cy)); }
}

/* 暗 -> 亮：旧主题"收起" */
html[data-vt-mode="conceal"] ::view-transition-old(root){
  clip-path: circle(141.5% at var(--vt-cx) var(--vt-cy));
  animation: vt-conceal var(--vt-duration) var(--vt-easing) forwards;
}
@keyframes vt-conceal{
  to { clip-path: circle(0 at var(--vt-cx) var(--vt-cy)); }
}
```

### 3. 主题切换按钮 (`ThemeToggleButton.vue`)

```vue
<script setup lang="ts">
import { useThemeWaveSwitch } from '@/composables/useThemeWaveSwitch';
import 'element-plus/theme-chalk/dark/css-vars.css';
import '@/styles/theme-wave.css';

function applyTheme(next: 'light'|'dark') {
  document.documentElement.classList.toggle('dark', next === 'dark');
}

const { start } = useThemeWaveSwitch(applyTheme);

function onToggle() {
  const currentIsDark = document.documentElement.classList.contains('dark');
  const next = currentIsDark ? 'light' : 'dark';
  start(next);
}
</script>
```

## 🎨 动画效果

### 亮色 → 暗色（展开）
- **动画目标**：`::view-transition-new(root)`
- **圆心位置**：右上角 (`100% 0%`)
- **动画类型**：圆从 0 扩展到 141.5%（覆盖全屏）
- **视觉效果**：新主题从右上角圆弧展开

### 暗色 → 亮色（收起）
- **动画目标**：`::view-transition-old(root)`
- **圆心位置**：左下角 (`0% 100%`)
- **动画类型**：圆从 141.5% 收缩到 0
- **视觉效果**：旧主题像被吸回左下角

## 🔧 技术要点

### 1. View Transitions API
- 使用浏览器原生 API，性能优秀
- 支持 `startViewTransition()` 回调
- 自动处理页面状态快照

### 2. CSS 变量控制
- `--vt-cx` 和 `--vt-cy`：控制圆心位置
- `--vt-duration`：动画时长（720ms）
- `--vt-easing`：缓动函数（cubic-bezier）

### 3. 数据属性标记
- `data-vt-mode="reveal"`：展开模式
- `data-vt-mode="conceal"`：收起模式

### 4. 兼容性处理
- 检查 `startViewTransition` 支持
- 检查 `prefers-reduced-motion` 偏好
- 降级到直接切换

## 🚀 使用方法

### 1. 在组件中使用

```vue
<template>
  <el-button @click="toggleTheme">
    切换主题
  </el-button>
</template>

<script setup lang="ts">
import { useThemeWaveSwitch } from '@/composables/useThemeWaveSwitch';

const { start } = useThemeWaveSwitch((next) => {
  document.documentElement.classList.toggle('dark', next === 'dark');
});

function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  start(isDark ? 'light' : 'dark');
}
</script>
```

### 2. 测试页面

访问 `/theme-test` 页面可以：
- 测试主题切换动画效果
- 查看当前主题状态
- 检查浏览器支持情况
- 对比有动画和无动画的切换

## 📱 浏览器支持

- ✅ Chrome 111+
- ✅ Edge 111+
- ✅ Safari 16.4+
- ❌ Firefox（暂不支持 View Transitions API）

在不支持的浏览器中，会自动降级为直接切换，无动画效果。

## 🎯 自定义配置

### 修改动画时长
```css
:root {
  --vt-duration: 720ms; /* 可调整 */
}
```

### 修改缓动函数
```css
:root {
  --vt-easing: cubic-bezier(.22,.61,.36,1); /* 可调整 */
}
```

### 修改圆心位置
```typescript
// 在 useThemeWaveSwitch 中修改
originFrom('tr'); // 右上角
originFrom('bl'); // 左下角
originFrom('tl'); // 左上角
originFrom('br'); // 右下角
```

## 🎉 效果预览

启动开发服务器后，访问：
- `http://localhost:5173/theme-test` - 主题切换测试页面
- 点击"切换主题（展开/收起）"按钮体验动画效果

动画效果包括：
- 流畅的圆弧展开/收起
- 波纹前沿质感（支持时）
- 统一的缓动曲线
- 优雅的降级处理
