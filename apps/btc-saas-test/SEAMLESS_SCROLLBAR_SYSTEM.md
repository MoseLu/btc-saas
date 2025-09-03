# 无感滚动条系统设计文档

## 设计理念

基于 cool-admin 的滚动条设计理念，实现真正的"无感滚动条"：

### 🎯 核心特征
1. **无轨道外沿** - 不占左右空隙
2. **贴着内容右边框** - 与容器边框融为一体
3. **仅悬停/滚动时出现** - 默认不可见，交互时淡入

### 🚫 不是"隐藏滚动条"
- 轨道做成透明
- 拇指做成半透明并默认 0 透明度
- 只有容器 `:hover` 或"正在滚动"时把拇指淡入

## 技术实现

### 1. CSS 变量系统

```scss
:root {
  /* 滚动条尺寸 */
  --sb-w-main: 10px;          /* 主区厚度 */
  --sb-w-side: 8px;           /* 侧栏厚度 */
  
  /* 亮色主题滚动条颜色 */
  --sb-thumb:    rgba(0, 0, 0, 0.28);
  --sb-thumb-h:  rgba(0, 0, 0, 0.45);
  --sb-thumb-a:  rgba(0, 0, 0, 0.60);
}

html.dark {
  --sb-thumb:    rgba(255, 255, 255, 0.28);
  --sb-thumb-h:  rgba(255, 255, 255, 0.45);
  --sb-thumb-a:  rgba(255, 255, 255, 0.65);
}
```

### 2. 滚动区域基础样式

```scss
.scrollarea {
  overflow: auto;
  scrollbar-gutter: stable;   /* 避免出现/消失抖动；不留两侧额外空隙 */
  min-width: 0; 
  min-height: 0;
}
```

### 3. 无感滚动条样式

```scss
/* 默认：轨道透明、拇指存在但完全透明（不可见） */
.scrollarea::-webkit-scrollbar {
  width: var(--sb-w-main);
  height: var(--sb-w-main);
}

.scrollarea::-webkit-scrollbar-track {
  background: transparent;      /* 轨道透明 = 看起来"没有两侧轨道" */
  border: 0;
}

.scrollarea::-webkit-scrollbar-thumb {
  background: var(--sb-thumb);
  border-radius: 999px;
  border: 0;                    /* 不留缝，贴边 */
  opacity: 0;                   /* 默认不可见 */
  transition: opacity 0.12s ease, background-color 0.12s ease;
}

/* 悬停/键盘聚焦/正在滚动 时淡入拇指 */
.scrollarea:is(:hover, :focus-within, .is-scrolling)::-webkit-scrollbar-thumb {
  opacity: 1;
}

/* 拐角同样透明，保证"无轨道感" */
.scrollarea::-webkit-scrollbar-corner {
  background: transparent;
}
```

### 4. Firefox 支持

```scss
/* Firefox 等价（直接作用在容器自身） */
.scrollarea { 
  scrollbar-width: none; /* 默认隐藏拇指/轨道 */
}

.scrollarea:is(:hover, :focus-within, .is-scrolling) { 
  scrollbar-width: thin; 
}

.scrollarea { 
  scrollbar-color: var(--sb-thumb) transparent; /* 贴边、透明轨道 */
}
```

## 滚动指示器系统

### 1. JavaScript 实现

```typescript
// 作用在所有 .scrollarea 容器：滚动时 800ms 内保持可见
const areas = document.querySelectorAll<HTMLElement>('.scrollarea');
areas.forEach(el => {
  let t: number|undefined;
  el.addEventListener('scroll', () => {
    el.classList.add('is-scrolling');
    clearTimeout(t);
    t = window.setTimeout(() => el.classList.remove('is-scrolling'), 800);
  }, { passive: true });
});
```

### 2. 核心功能

- **自动检测**：监听所有 `.scrollarea` 类元素
- **滚动状态**：滚动时添加 `.is-scrolling` 类
- **自动隐藏**：800ms 后自动移除滚动状态
- **性能优化**：使用被动事件监听器

## 应用场景

### 1. 主内容区域

```scss
.page-content {
  /* 应用无感滚动条系统 */
  scrollbar-width: thin;
  scrollbar-color: var(--sb-thumb) transparent; /* 贴边、透明轨道 */
  
  &::-webkit-scrollbar {
    width: var(--sb-w-main);
    height: var(--sb-w-main);
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;      /* 轨道透明 = 看起来"没有两侧轨道" */
    border: 0;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--sb-thumb);
    border-radius: 999px;
    border: 0;                    /* 不留缝，贴边 */
    opacity: 0;                   /* 默认不可见 */
    transition: opacity 0.12s ease, background-color 0.12s ease;
  }
  
  /* 悬停/键盘聚焦/正在滚动 时淡入拇指 */
  &:is(:hover, :focus-within, .is-scrolling)::-webkit-scrollbar-thumb {
    opacity: 1;
  }
}
```

### 2. 侧边栏

```scss
.layout__aside {
  /* 应用无感滚动条系统 */
  scrollbar-width: thin;
  scrollbar-color: var(--sb-thumb) transparent; /* 贴边、透明轨道 */
  
  &::-webkit-scrollbar {
    width: var(--sb-w-side);
    height: var(--sb-w-side);
  }
  
  /* 其他样式同上... */
}
```

### 3. Mock 管理页面

```scss
/* 树形面板 */
.mock-tree {
  /* 应用无感滚动条系统 */
  scrollbar-width: thin;
  scrollbar-color: var(--sb-thumb) transparent;
  
  &::-webkit-scrollbar {
    width: var(--sb-w-side);
    height: var(--sb-w-side);
  }
  
  /* 其他样式同上... */
}

/* 表格内容 */
.el-table__body-wrapper {
  /* 应用无感滚动条系统 */
  scrollbar-width: thin;
  scrollbar-color: var(--sb-thumb) transparent;
  
  &::-webkit-scrollbar {
    width: var(--sb-w-main);
    height: var(--sb-w-main);
  }
  
  /* 其他样式同上... */
}
```

## Element Plus 支持

### 1. 原生滚动条 vs Element Plus

```scss
/* 主内容区里的 el-scrollbar */
.layout__main .el-scrollbar {
  --sb-w: var(--sb-w-main);
  --sb-thumb: var(--sb-thumb);
  --sb-thumb-h: var(--sb-thumb-h);
  --sb-thumb-a: var(--sb-thumb-a);
}

/* 侧边栏里的 el-scrollbar */
.layout__aside .el-scrollbar {
  --sb-w: var(--sb-w-side);
  --sb-thumb: var(--sb-thumb);
  --sb-thumb-h: var(--sb-thumb-h);
  --sb-thumb-a: var(--sb-thumb-a);
}
```

### 2. Element Plus 滚动条样式

```scss
/* 轨道条（垂直/水平） */
.el-scrollbar__bar.is-vertical {
  width: var(--sb-w);
  right: 0;
  background: transparent; /* 轨道透明 */
}

.el-scrollbar__bar.is-horizontal {
  height: var(--sb-w);
  bottom: 0;
  background: transparent; /* 轨道透明 */
}

/* 拇指：默认透明，悬停时淡入 */
.el-scrollbar__thumb {
  background: var(--sb-thumb);
  border-radius: 999px;
  opacity: 0; /* 默认不可见 */
  transition: opacity 0.12s ease, background-color 0.12s ease;
}

.el-scrollbar:hover .el-scrollbar__thumb,
.el-scrollbar:active .el-scrollbar__thumb { 
  opacity: 1; /* 悬停/激活时淡入 */
}
```

## 主题切换支持

### 1. 主题切换期间的保护

```scss
/* 防止主题切换时的滚动条闪烁 */
html[data-theme-from] *,
html[data-theme-to] *,
html[data-vt-active] *,
html[data-vt-cooldown] * {
  /* 禁用所有过渡动画，避免滚动条样式变化 */
  transition: none !important;
  animation: none !important;
}

/* 确保滚动条在主题切换期间保持可见 */
html[data-theme-from] .page-content,
html[data-theme-to] .page-content,
html[data-vt-active] .page-content,
html[data-vt-cooldown] .page-content {
  /* 强制保持滚动条样式，防止消失 */
  scrollbar-width: thin !important;
  scrollbar-color: var(--sb-thumb) transparent !important;
  
  &::-webkit-scrollbar-thumb {
    opacity: 1 !important; /* 主题切换期间强制显示 */
  }
}
```

### 2. 主题切换完成后的恢复

```scss
/* 主题切换完成后的平滑恢复 */
html:not([data-theme-from]):not([data-theme-to]):not([data-vt-active]):not([data-vt-cooldown]) {
  .page-content,
  .layout__aside {
    /* 恢复正常的过渡动画 */
    transition: background-color 0.3s ease, border-color 0.3s ease;
    
    /* 恢复滚动条的正常过渡 */
    &::-webkit-scrollbar-thumb {
      transition: opacity 0.12s ease, background-color 0.12s ease;
    }
  }
}
```

## 无障碍支持

### 1. 高对比度模式

```scss
@media (prefers-contrast: more) {
  :root {
    --sb-thumb:   rgba(0, 0, 0, 0.45);
    --sb-thumb-h: rgba(0, 0, 0, 0.60);
    --sb-thumb-a: rgba(0, 0, 0, 0.75);
  }
  
  html.dark {
    --sb-thumb:   rgba(255, 255, 255, 0.45);
    --sb-thumb-h: rgba(255, 255, 255, 0.60);
    --sb-thumb-a: rgba(255, 255, 255, 0.80);
  }
}
```

### 2. 触摸设备支持

- `:hover` 在触摸设备上不触发
- `.is-scrolling` 类确保滚动时滚动条可见
- 可选的触摸设备常显模式

## 使用方法

### 1. 基本用法

```html
<!-- 主内容区域 -->
<main class="scrollarea scrollarea--main">
  <!-- 内容 -->
</main>

<!-- 侧边栏 -->
<aside class="scrollarea scrollarea--side">
  <!-- 内容 -->
</aside>
```

### 2. 自定义配置

```typescript
import { useScrollIndicator } from '@/utils/scrollIndicator'

// 在 Vue 组件中使用
const { indicator, attach, detach } = useScrollIndicator({
  visibleDuration: 1000, // 自定义显示时长
  debug: true            // 启用调试模式
})

// 手动管理滚动指示器
onMounted(() => {
  const element = document.querySelector('.my-scroll-area')
  if (element) {
    attach(element)
  }
})
```

### 3. 全局配置

```typescript
import { globalScrollIndicator } from '@/utils/scrollIndicator'

// 全局配置
globalScrollIndicator.init()

// 手动管理
const element = document.querySelector('.custom-scroll')
globalScrollIndicator.attach(element)
```

## 注意事项

### 1. 常见问题

- **轨道外露**：确保没有全局滚动条样式覆盖
- **始终可见**：检查是否有其他样式强制显示滚动条
- **布局抖动**：使用 `scrollbar-gutter: stable` 和 `min-width: 0`

### 2. 浏览器兼容性

- **WebKit/Chromium**：完整支持
- **Firefox**：通过 `scrollbar-width` 和 `scrollbar-color` 支持
- **Safari**：完整支持
- **IE/Edge Legacy**：降级为默认滚动条

### 3. 性能考虑

- 使用被动事件监听器
- 避免频繁的 DOM 操作
- 合理设置滚动指示器显示时长

## 总结

新的无感滚动条系统实现了：

1. **真正的无感体验**：默认不可见，交互时淡入
2. **贴边设计**：与容器边框融为一体
3. **主题适配**：支持亮色/暗色主题切换
4. **性能优化**：使用现代CSS特性和JavaScript优化
5. **无障碍支持**：支持高对比度和触摸设备

这个系统为整个应用提供了统一、优雅的滚动条体验，符合现代UI设计的最佳实践。
