---
title: 无障碍与键盘路径测试
category: a11y
order: 16
owners: [frontend, qa]
auditable: true
acceptance:
  - [ ] 无障碍标准遵循
  - [ ] 键盘导航支持
  - [ ] 屏幕阅读器兼容
  - [ ] 自动化测试
outputs:
  - packages/a11y/
  - tests/a11y/
  - docs/a11y/
related: [03-ui-kit-btc-components, 14-quality-system-app]
---

# 无障碍与键盘路径测试

## 背景与目标

建立完整的无障碍（Accessibility）支持体系，确保BTC MES控制台符合WCAG 2.1 AA标准，支持键盘导航、屏幕阅读器，并提供自动化测试工具。

## 约定

### 无障碍标准
- **WCAG 2.1 AA**: 主要遵循标准
- **Section 508**: 美国联邦政府标准
- **EN 301 549**: 欧盟标准

### 键盘导航约定
- `Tab`: 焦点导航
- `Shift + Tab`: 反向焦点导航
- `Enter/Space`: 激活按钮/链接
- `Arrow Keys`: 菜单/列表导航
- `Escape`: 关闭模态框/菜单

### 语义化HTML约定
- 使用正确的HTML标签
- 提供有意义的alt文本
- 使用ARIA标签增强语义
- 确保颜色对比度达标

## 步骤

### 1. 创建无障碍工具包
创建`packages/a11y/package.json`：
```json
{
  "name": "@btc/a11y",
  "version": "1.0.0",
  "description": "BTC无障碍工具包",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest",
    "test:a11y": "playwright test a11y.spec.ts"
  },
  "dependencies": {
    "vue": "^3.3.0",
    "@vueuse/core": "^10.0.0"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "typescript": "^5.0.0",
    "vitest": "^0.34.0",
    "@playwright/test": "^1.35.0",
    "axe-core": "^4.7.0"
  }
}
```

### 2. 创建无障碍指令
创建`packages/a11y/src/directives.ts`：
```typescript
import type { DirectiveBinding } from 'vue'

export interface A11yOptions {
  role?: string
  ariaLabel?: string
  ariaDescribedby?: string
  ariaExpanded?: boolean
  ariaPressed?: boolean
  ariaHidden?: boolean
  tabindex?: number
}

// 焦点管理指令
export const vFocus = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    if (binding.value !== false) {
      el.focus()
    }
  }
}

// 键盘导航指令
export const vKeyboardNav = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const options = binding.value as A11yOptions || {}
    
    // 设置tabindex
    if (options.tabindex !== undefined) {
      el.setAttribute('tabindex', options.tabindex.toString())
    }
    
    // 设置ARIA属性
    if (options.role) {
      el.setAttribute('role', options.role)
    }
    
    if (options.ariaLabel) {
      el.setAttribute('aria-label', options.ariaLabel)
    }
    
    if (options.ariaDescribedby) {
      el.setAttribute('aria-describedby', options.ariaDescribedby)
    }
    
    if (options.ariaExpanded !== undefined) {
      el.setAttribute('aria-expanded', options.ariaExpanded.toString())
    }
    
    if (options.ariaPressed !== undefined) {
      el.setAttribute('aria-pressed', options.ariaPressed.toString())
    }
    
    if (options.ariaHidden !== undefined) {
      el.setAttribute('aria-hidden', options.ariaHidden.toString())
    }
  },
  
  updated(el: HTMLElement, binding: DirectiveBinding) {
    const options = binding.value as A11yOptions || {}
    
    // 更新ARIA属性
    if (options.ariaExpanded !== undefined) {
      el.setAttribute('aria-expanded', options.ariaExpanded.toString())
    }
    
    if (options.ariaPressed !== undefined) {
      el.setAttribute('aria-pressed', options.ariaPressed.toString())
    }
  }
}

// 跳过链接指令
export const vSkipLink = {
  mounted(el: HTMLElement) {
    el.addEventListener('click', (e) => {
      e.preventDefault()
      const targetId = el.getAttribute('href')?.replace('#', '')
      if (targetId) {
        const target = document.getElementById(targetId)
        if (target) {
          target.focus()
          target.scrollIntoView()
        }
      }
    })
  }
}

// 模态框焦点陷阱指令
export const vFocusTrap = {
  mounted(el: HTMLElement) {
    const focusableElements = el.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
    
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    })
  }
}
```

### 3. 创建无障碍组合式函数
创建`packages/a11y/src/composables.ts`：
```typescript
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 焦点管理
export function useFocusManagement() {
  const focusableElements = ref<HTMLElement[]>([])
  const currentFocusIndex = ref(0)
  
  const registerElement = (element: HTMLElement) => {
    if (!focusableElements.value.includes(element)) {
      focusableElements.value.push(element)
    }
  }
  
  const unregisterElement = (element: HTMLElement) => {
    const index = focusableElements.value.indexOf(element)
    if (index > -1) {
      focusableElements.value.splice(index, 1)
    }
  }
  
  const focusNext = () => {
    if (currentFocusIndex.value < focusableElements.value.length - 1) {
      currentFocusIndex.value++
      focusableElements.value[currentFocusIndex.value].focus()
    }
  }
  
  const focusPrevious = () => {
    if (currentFocusIndex.value > 0) {
      currentFocusIndex.value--
      focusableElements.value[currentFocusIndex.value].focus()
    }
  }
  
  const focusFirst = () => {
    if (focusableElements.value.length > 0) {
      currentFocusIndex.value = 0
      focusableElements.value[0].focus()
    }
  }
  
  const focusLast = () => {
    if (focusableElements.value.length > 0) {
      currentFocusIndex.value = focusableElements.value.length - 1
      focusableElements.value[currentFocusIndex.value].focus()
    }
  }
  
  return {
    focusableElements: computed(() => focusableElements.value),
    currentFocusIndex: computed(() => currentFocusIndex.value),
    registerElement,
    unregisterElement,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast
  }
}

// 键盘导航
export function useKeyboardNavigation() {
  const isNavigating = ref(false)
  
  const handleKeyDown = (event: KeyboardEvent, handlers: {
    onEnter?: () => void
    onEscape?: () => void
    onArrowUp?: () => void
    onArrowDown?: () => void
    onArrowLeft?: () => void
    onArrowRight?: () => void
    onTab?: () => void
    onShiftTab?: () => void
  }) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        handlers.onEnter?.()
        break
      case 'Escape':
        event.preventDefault()
        handlers.onEscape?.()
        break
      case 'ArrowUp':
        event.preventDefault()
        handlers.onArrowUp?.()
        break
      case 'ArrowDown':
        event.preventDefault()
        handlers.onArrowDown?.()
        break
      case 'ArrowLeft':
        event.preventDefault()
        handlers.onArrowLeft?.()
        break
      case 'ArrowRight':
        event.preventDefault()
        handlers.onArrowRight?.()
        break
      case 'Tab':
        isNavigating.value = true
        if (event.shiftKey) {
          handlers.onShiftTab?.()
        } else {
          handlers.onTab?.()
        }
        break
    }
  }
  
  return {
    isNavigating: computed(() => isNavigating.value),
    handleKeyDown
  }
}

// 屏幕阅读器支持
export function useScreenReader() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }
  
  const announcePageTitle = (title: string) => {
    document.title = title
    announce(`页面标题: ${title}`)
  }
  
  const announceStatus = (status: string) => {
    announce(status, 'assertive')
  }
  
  return {
    announce,
    announcePageTitle,
    announceStatus
  }
}

// 颜色对比度检查
export function useColorContrast() {
  const getContrastRatio = (color1: string, color2: string): number => {
    const luminance1 = getLuminance(color1)
    const luminance2 = getLuminance(color2)
    
    const lighter = Math.max(luminance1, luminance2)
    const darker = Math.min(luminance1, luminance2)
    
    return (lighter + 0.05) / (darker + 0.05)
  }
  
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color)
    if (!rgb) return 0
    
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }
  
  const isContrastSufficient = (color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const ratio = getContrastRatio(color1, color2)
    const threshold = level === 'AA' ? 4.5 : 7
    return ratio >= threshold
  }
  
  return {
    getContrastRatio,
    getLuminance,
    isContrastSufficient
  }
}
```

### 4. 创建无障碍组件
创建`packages/a11y/src/components/SkipLink.vue`：
```vue
<template>
  <a
    :href="`#${targetId}`"
    class="skip-link"
    v-keyboard-nav="{ role: 'link', ariaLabel: `跳转到${label}` }"
    v-skip-link
  >
    {{ label }}
  </a>
</template>

<script setup lang="ts">
interface Props {
  targetId: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '主要内容'
})
</script>

<style scoped>
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 6px;
}
</style>
```

创建`packages/a11y/src/components/LiveRegion.vue`：
```vue
<template>
  <div
    :aria-live="polite ? 'polite' : 'assertive'"
    :aria-atomic="atomic"
    class="live-region"
    aria-hidden="true"
  >
    {{ message }}
  </div>
</template>

<script setup lang="ts">
interface Props {
  message: string
  polite?: boolean
  atomic?: boolean
}

withDefaults(defineProps<Props>(), {
  polite: true,
  atomic: true
})
</script>

<style scoped>
.live-region {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
</style>
```

### 5. 创建无障碍测试工具
创建`packages/a11y/src/testing/axe-runner.ts`：
```typescript
import axe from 'axe-core'

export interface AxeResult {
  violations: axe.Result[]
  passes: axe.Result[]
  incomplete: axe.Result[]
  inapplicable: axe.Result[]
}

export class AxeRunner {
  static async run(element?: HTMLElement): Promise<AxeResult> {
    const context = element ? element : document
    
    try {
      const results = await axe.run(context, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa']
        },
        rules: {
          'color-contrast': { enabled: true },
          'button-name': { enabled: true },
          'image-alt': { enabled: true },
          'link-name': { enabled: true },
          'list': { enabled: true },
          'listitem': { enabled: true },
          'heading-order': { enabled: true },
          'landmark-one-main': { enabled: true },
          'page-has-heading-one': { enabled: true }
        }
      })
      
      return {
        violations: results.violations,
        passes: results.passes,
        incomplete: results.incomplete,
        inapplicable: results.inapplicable
      }
    } catch (error) {
      console.error('Axe test failed:', error)
      throw error
    }
  }
  
  static formatResults(results: AxeResult): string {
    let output = 'Accessibility Test Results\n'
    output += '========================\n\n'
    
    if (results.violations.length > 0) {
      output += 'Violations:\n'
      results.violations.forEach((violation, index) => {
        output += `${index + 1}. ${violation.description}\n`
        output += `   Impact: ${violation.impact}\n`
        output += `   Tags: ${violation.tags.join(', ')}\n`
        output += `   Help: ${violation.help}\n`
        output += `   Help URL: ${violation.helpUrl}\n\n`
      })
    }
    
    if (results.passes.length > 0) {
      output += `Passes: ${results.passes.length}\n`
    }
    
    if (results.incomplete.length > 0) {
      output += `Incomplete: ${results.incomplete.length}\n`
    }
    
    return output
  }
}
```

### 6. 创建Playwright测试
创建`tests/a11y/a11y.spec.ts`：
```typescript
import { test, expect } from '@playwright/test'
import { AxeRunner } from '@btc/a11y/testing/axe-runner'

test.describe('Accessibility Tests', () => {
  test('should pass WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('/')
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle')
    
    // 运行axe测试
    const results = await page.evaluate(() => {
      return window.axe.run()
    })
    
    expect(results.violations).toHaveLength(0)
  })
  
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/')
    
    // 测试Tab键导航
    await page.keyboard.press('Tab')
    const firstFocusable = await page.evaluate(() => document.activeElement?.tagName)
    expect(firstFocusable).toBeTruthy()
    
    // 测试Shift+Tab反向导航
    await page.keyboard.press('Shift+Tab')
    const lastFocusable = await page.evaluate(() => document.activeElement?.tagName)
    expect(lastFocusable).toBeTruthy()
  })
  
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/')
    
    const headings = await page.evaluate(() => {
      const h1s = document.querySelectorAll('h1')
      const h2s = document.querySelectorAll('h2')
      const h3s = document.querySelectorAll('h3')
      
      return {
        h1: h1s.length,
        h2: h2s.length,
        h3: h3s.length,
        hasMainHeading: h1s.length > 0
      }
    })
    
    expect(headings.hasMainHeading).toBe(true)
    expect(headings.h1).toBeLessThanOrEqual(1) // 应该只有一个h1
  })
  
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/')
    
    const ariaLabels = await page.evaluate(() => {
      const elements = document.querySelectorAll('[aria-label], [aria-labelledby]')
      return Array.from(elements).map(el => ({
        tagName: el.tagName,
        ariaLabel: el.getAttribute('aria-label'),
        ariaLabelledby: el.getAttribute('aria-labelledby')
      }))
    })
    
    // 检查关键元素是否有ARIA标签
    const buttonElements = ariaLabels.filter(item => item.tagName === 'BUTTON')
    const hasUnlabeledButtons = buttonElements.some(item => !item.ariaLabel && !item.ariaLabelledby)
    
    expect(hasUnlabeledButtons).toBe(false)
  })
  
  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/')
    
    const contrastResults = await page.evaluate(() => {
      const { isContrastSufficient } = window.useColorContrast()
      
      // 检查主要文本颜色对比度
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div')
      const results = []
      
      for (const element of textElements) {
        const style = window.getComputedStyle(element)
        const color = style.color
        const backgroundColor = style.backgroundColor
        
        if (color && backgroundColor) {
          const sufficient = isContrastSufficient(color, backgroundColor, 'AA')
          if (!sufficient) {
            results.push({
              element: element.tagName,
              color,
              backgroundColor,
              sufficient
            })
          }
        }
      }
      
      return results
    })
    
    expect(contrastResults).toHaveLength(0)
  })
  
  test('should support screen readers', async ({ page }) => {
    await page.goto('/')
    
    const screenReaderSupport = await page.evaluate(() => {
      // 检查是否有跳过链接
      const skipLinks = document.querySelectorAll('.skip-link, [href^="#"]')
      
      // 检查是否有live regions
      const liveRegions = document.querySelectorAll('[aria-live]')
      
      // 检查是否有landmarks
      const landmarks = document.querySelectorAll('main, nav, header, footer, aside')
      
      return {
        hasSkipLinks: skipLinks.length > 0,
        hasLiveRegions: liveRegions.length > 0,
        hasLandmarks: landmarks.length > 0
      }
    })
    
    expect(screenReaderSupport.hasSkipLinks).toBe(true)
    expect(screenReaderSupport.hasLiveRegions).toBe(true)
    expect(screenReaderSupport.hasLandmarks).toBe(true)
  })
})
```

### 7. 创建无障碍指南
创建`docs/a11y/guidelines.md`：
```markdown
# 无障碍开发指南

## 基本原则

### 1. 语义化HTML
- 使用正确的HTML标签
- 避免div滥用
- 使用语义化标签：main, nav, header, footer, aside

### 2. 键盘导航
- 所有交互元素必须可通过键盘访问
- 提供清晰的焦点指示器
- 支持Tab键导航
- 实现焦点陷阱（模态框）

### 3. 屏幕阅读器支持
- 提供有意义的alt文本
- 使用ARIA标签增强语义
- 提供跳过链接
- 使用live regions通知状态变化

### 4. 颜色和对比度
- 确保颜色对比度符合WCAG AA标准（4.5:1）
- 不单独使用颜色传达信息
- 提供高对比度模式

## 组件开发规范

### 按钮组件
```vue
<template>
  <button
    :aria-label="ariaLabel"
    :aria-pressed="pressed"
    :aria-expanded="expanded"
    @click="handleClick"
    @keydown="handleKeyDown"
  >
    <slot />
  </button>
</template>
```

### 表单组件
```vue
<template>
  <div>
    <label :for="inputId">{{ label }}</label>
    <input
      :id="inputId"
      :aria-describedby="errorId"
      :aria-invalid="hasError"
    />
    <div :id="errorId" role="alert" v-if="hasError">
      {{ errorMessage }}
    </div>
  </div>
</template>
```

### 模态框组件
```vue
<template>
  <div
    role="dialog"
    :aria-labelledby="titleId"
    :aria-describedby="descriptionId"
    v-focus-trap
  >
    <h2 :id="titleId">{{ title }}</h2>
    <div :id="descriptionId">{{ description }}</div>
    <slot />
  </div>
</template>
```

## 测试清单

### 手动测试
- [ ] 键盘导航测试
- [ ] 屏幕阅读器测试
- [ ] 颜色对比度测试
- [ ] 缩放测试（200%）
- [ ] 高对比度模式测试

### 自动化测试
- [ ] axe-core测试
- [ ] Playwright无障碍测试
- [ ] 颜色对比度检查
- [ ] ARIA标签验证

## 工具和资源

### 开发工具
- axe DevTools
- Lighthouse
- WAVE Web Accessibility Evaluator
- Color Contrast Analyzer

### 测试工具
- NVDA (Windows)
- VoiceOver (macOS)
- TalkBack (Android)
- axe-core

### 参考资源
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Web Accessibility Initiative](https://www.w3.org/WAI/)
```

## 产出物

- [x] `packages/a11y/src/directives.ts` - 无障碍指令
- [x] `packages/a11y/src/composables.ts` - 无障碍组合式函数
- [x] `packages/a11y/src/components/` - 无障碍组件
- [x] `packages/a11y/src/testing/axe-runner.ts` - 测试工具
- [x] `tests/a11y/a11y.spec.ts` - Playwright测试
- [x] `docs/a11y/guidelines.md` - 开发指南

## 审计清单

- [ ] 无障碍标准遵循
- [ ] 键盘导航支持
- [ ] 屏幕阅读器兼容
- [ ] 自动化测试
- [ ] 颜色对比度检查
- [ ] ARIA标签规范
- [ ] 语义化HTML
- [ ] 焦点管理
- [ ] 跳过链接
- [ ] Live regions
- [ ] 开发指南文档
- [ ] 测试工具集成
