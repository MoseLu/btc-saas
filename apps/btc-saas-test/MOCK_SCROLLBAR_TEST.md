# Mock页面滚动条测试脚本

## 🧪 测试步骤

### 1. 检查滚动容器结构

```javascript
console.log('=== Mock页面滚动容器检查 ===');

// 检查 page-layout-wrapper 是否成为滚动容器
const pageWrapper = document.querySelector('.page-layout-wrapper.scrollarea');
console.log('PageLayoutWrapper 滚动容器:', pageWrapper ? '✅' : '❌');

// 检查 MockTree 和 MockTable 是否移除了滚动类
const mockTree = document.querySelector('.tree-panel');
const mockTable = document.querySelector('.table-panel');

console.log('MockTree 滚动类:', mockTree?.classList.contains('scrollarea') ? '❌' : '✅');
console.log('MockTable 滚动类:', mockTable?.classList.contains('scrollarea') ? '❌' : '✅');

// 检查 page-layout-wrapper 的样式
if (pageWrapper) {
  const style = getComputedStyle(pageWrapper);
  console.log('PageLayoutWrapper 样式:', {
    overflow: style.overflow,
    scrollbarGutter: style.scrollbarGutter,
    height: style.height,
    maxHeight: style.maxHeight
  });
}
```

### 2. 检查内容高度

```javascript
console.log('\n=== 内容高度检查 ===');

// 检查各个组件的高度
const mockPage = document.querySelector('.mock-manager-page');
const treePanel = document.querySelector('.tree-panel');
const tablePanel = document.querySelector('.table-panel');
const pageWrapper = document.querySelector('.page-layout-wrapper');

if (mockPage && treePanel && tablePanel && pageWrapper) {
  console.log('各组件高度:');
  console.log('- Mock页面总高度:', mockPage.scrollHeight, 'px');
  console.log('- 树形面板高度:', treePanel.scrollHeight, 'px');
  console.log('- 表格面板高度:', tablePanel.scrollHeight, 'px');
  console.log('- PageLayoutWrapper 高度:', pageWrapper.scrollHeight, 'px');
  console.log('- PageLayoutWrapper 可视高度:', pageWrapper.clientHeight, 'px');
  
  // 检查是否需要滚动
  const needsScroll = pageWrapper.scrollHeight > pageWrapper.clientHeight;
  console.log('是否需要滚动:', needsScroll ? '✅ 是' : '❌ 否');
}
```

### 3. 测试滚动功能

```javascript
console.log('\n=== 滚动功能测试 ===');

const pageWrapper = document.querySelector('.page-layout-wrapper.scrollarea');
if (pageWrapper) {
  // 检查初始滚动位置
  console.log('初始滚动位置:', pageWrapper.scrollTop);
  
  // 尝试滚动
  if (pageWrapper.scrollHeight > pageWrapper.clientHeight) {
    pageWrapper.scrollTop = 100;
    console.log('滚动后位置:', pageWrapper.scrollTop);
    
    // 检查是否有 .is-scrolling 类
    setTimeout(() => {
      console.log('滚动指示器状态:', pageWrapper.classList.contains('is-scrolling') ? '✅' : '❌');
    }, 100);
    
    // 恢复位置
    pageWrapper.scrollTop = 0;
  } else {
    console.log('内容高度不足，无法滚动');
  }
}
```

### 4. 检查滚动条样式

```javascript
console.log('\n=== 滚动条样式检查 ===');

const pageWrapper = document.querySelector('.page-layout-wrapper.scrollarea');
if (pageWrapper) {
  console.log('请在 DevTools 中检查以下伪元素样式:');
  console.log('1. .page-layout-wrapper::-webkit-scrollbar-track');
  console.log('2. .page-layout-wrapper::-webkit-scrollbar-thumb');
  console.log('3. .page-layout-wrapper::-webkit-scrollbar-corner');
  
  // 检查基础样式
  const style = getComputedStyle(pageWrapper);
  console.log('滚动条基础样式:', {
    scrollbarWidth: style.scrollbarWidth,
    scrollbarColor: style.scrollbarColor
  });
}
```

## ✅ 期望结果

修复完成后：

1. **滚动容器正确** - `page-layout-wrapper` 成为滚动容器 ✅
2. **子组件无滚动** - MockTree 和 MockTable 不再有滚动类 ✅
3. **内容撑开高度** - Mock页面内容能撑开 `page-layout-wrapper` ✅
4. **滚动条出现** - 当内容超过视口高度时，滚动条出现在 `page-layout-wrapper` 右侧 ✅
5. **滚动指示器工作** - 滚动时正确添加 `.is-scrolling` 类 ✅

## 🚨 如果仍有问题

### 问题1: 内容没有撑开高度
```javascript
// 检查是否有固定高度限制
console.log('检查高度限制...');
const mockPage = document.querySelector('.mock-manager-page');
const pageWrapper = document.querySelector('.page-layout-wrapper');

if (mockPage && pageWrapper) {
  const mockStyle = getComputedStyle(mockPage);
  const wrapperStyle = getComputedStyle(pageWrapper);
  
  console.log('Mock页面样式:', {
    height: mockStyle.height,
    maxHeight: mockStyle.maxHeight,
    overflow: mockStyle.overflow
  });
  
  console.log('PageLayoutWrapper样式:', {
    height: wrapperStyle.height,
    maxHeight: wrapperStyle.maxHeight,
    overflow: wrapperStyle.overflow
  });
}
```

### 问题2: 滚动条仍然不出现
```javascript
// 检查是否有其他样式覆盖
console.log('检查样式覆盖...');
const pageWrapper = document.querySelector('.page-layout-wrapper');
if (pageWrapper) {
  // 在 DevTools 中检查计算样式
  console.log('请在 DevTools 中检查 .page-layout-wrapper 的 overflow 属性');
  console.log('确保没有其他样式覆盖了 overflow: auto');
}
```

### 问题3: 滚动指示器不工作
```javascript
// 检查滚动事件监听器
console.log('检查滚动事件...');
const pageWrapper = document.querySelector('.page-layout-wrapper.scrollarea');
if (pageWrapper) {
  // 手动触发滚动事件
  pageWrapper.scrollTop = 100;
  console.log('滚动后是否有 .is-scrolling 类:', pageWrapper.classList.contains('is-scrolling'));
  
  // 检查是否有事件监听器
  console.log('请在 DevTools 中检查元素的事件监听器');
}
```

## 🎯 修复后的最终状态

修复完成后，Mock页面应该：

1. **滚动条位置正确** - 贴合 `page-layout-wrapper` 右边缘
2. **内容自然撑开** - MockTree 和 MockTable 的内容撑开容器高度
3. **统一滚动体验** - 使用 `page-layout-wrapper` 的滚动，而不是子组件各自滚动
4. **滚动指示器工作** - 滚动时正确添加 `.is-scrolling` 类
5. **样式统一** - 滚动条使用相同的圆弧、无边框设计
