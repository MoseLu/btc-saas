# 滚动条详细诊断测试脚本

## 🔍 深度诊断

### 1. 检查所有滚动相关元素

```javascript
console.log('=== 深度滚动诊断 ===');

// 检查所有可能的滚动容器
const allScrollElements = [...document.querySelectorAll('*')].filter(n => {
  const s = getComputedStyle(n);
  return /(auto|scroll)/.test(s.overflow + s.overflowY + s.overflowX);
});

console.log('所有滚动元素数量:', allScrollElements.length);

// 分类显示
const categorized = {
  scrollarea: [],
  elScrollbar: [],
  other: []
};

allScrollElements.forEach(el => {
  if (el.classList.contains('scrollarea')) {
    categorized.scrollarea.push(el);
  } else if (el.classList.contains('el-scrollbar') || el.classList.contains('el-scrollbar__wrap')) {
    categorized.elScrollbar.push(el);
  } else {
    categorized.other.push(el);
  }
});

console.log('分类结果:', {
  scrollarea: categorized.scrollarea.length,
  elScrollbar: categorized.elScrollbar.length,
  other: categorized.other.length
});

// 详细显示每个类别
console.log('\n=== .scrollarea 元素 ===');
categorized.scrollarea.forEach((el, i) => {
  const s = getComputedStyle(el);
  console.log(`${i + 1}. ${el.tagName.toLowerCase()}.${el.className}`, {
    overflow: s.overflow,
    scrollbarGutter: s.scrollbarGutter,
    hasMain: el.classList.contains('scrollarea--main'),
    hasSide: el.classList.contains('scrollarea--side')
  });
});

console.log('\n=== Element Plus 滚动条元素 ===');
categorized.elScrollbar.forEach((el, i) => {
  const s = getComputedStyle(el);
  console.log(`${i + 1}. ${el.tagName.toLowerCase()}.${el.className}`, {
    overflow: s.overflow,
    scrollbarGutter: s.scrollbarGutter,
    parent: el.parentElement?.className || 'none'
  });
});

console.log('\n=== 其他滚动元素 ===');
categorized.other.forEach((el, i) => {
  const s = getComputedStyle(el);
  console.log(`${i + 1}. ${el.tagName.toLowerCase()}.${el.className}`, {
    overflow: s.overflow,
    scrollbarGutter: s.scrollbarGutter,
    parent: el.parentElement?.className || 'none'
  });
});
```

### 2. 检查滚动条样式优先级

```javascript
console.log('\n=== 样式优先级检查 ===');

// 检查 .scrollarea 的样式是否被正确应用
const mainScrollarea = document.querySelector('.scrollarea--main');
if (mainScrollarea) {
  console.log('主滚动区域样式检查:');
  
  // 检查基础样式
  const style = getComputedStyle(mainScrollarea);
  console.log('- overflow:', style.overflow);
  console.log('- scrollbarGutter:', style.scrollbarGutter);
  console.log('- minWidth:', style.minWidth);
  console.log('- minHeight:', style.minHeight);
  
  // 检查是否有其他样式覆盖
  console.log('\n检查是否有样式冲突...');
  console.log('请在 DevTools 中检查以下选择器的优先级:');
  console.log('1. .scrollarea::-webkit-scrollbar-track');
  console.log('2. .scrollarea::-webkit-scrollbar-thumb');
  console.log('3. .scrollarea::-webkit-scrollbar-corner');
  
  // 检查是否有全局样式干扰
  const htmlStyle = getComputedStyle(document.documentElement);
  const bodyStyle = getComputedStyle(document.body);
  console.log('\n全局样式检查:');
  console.log('- html.scrollbarGutter:', htmlStyle.scrollbarGutter);
  console.log('- body.scrollbarGutter:', bodyStyle.scrollbarGutter);
}
```

### 3. 测试滚动条交互功能

```javascript
console.log('\n=== 滚动条交互功能测试 ===');

// 测试滚动指示器
const scrollareas = document.querySelectorAll('.scrollarea');
console.log(`找到 ${scrollareas.length} 个 .scrollarea 元素`);

scrollareas.forEach((el, index) => {
  console.log(`\n测试滚动区域 ${index + 1}: ${el.className}`);
  
  // 检查初始状态
  console.log('  初始状态:', {
    hasIsScrolling: el.classList.contains('is-scrolling'),
    scrollTop: el.scrollTop,
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight
  });
  
  // 模拟滚动
  if (el.scrollHeight > el.clientHeight) {
    el.scrollTop = 100;
    console.log('  滚动后状态:', {
      hasIsScrolling: el.classList.contains('is-scrolling'),
      scrollTop: el.scrollTop
    });
    
    // 等待一下再检查
    setTimeout(() => {
      console.log(`  滚动区域 ${index + 1} 延迟检查:`, {
        hasIsScrolling: el.classList.contains('is-scrolling')
      });
    }, 100);
    
    // 恢复位置
    el.scrollTop = 0;
  } else {
    console.log('  容器高度不足，无法滚动');
  }
});
```

### 4. 检查Element Plus组件

```javascript
console.log('\n=== Element Plus 组件检查 ===');

// 查找所有Element Plus相关元素
const epElements = document.querySelectorAll('[class*="el-"]');
const scrollbarElements = Array.from(epElements).filter(el => 
  el.className.includes('scrollbar')
);

console.log('Element Plus 滚动条相关元素:', scrollbarElements.length);
scrollbarElements.forEach((el, i) => {
  console.log(`${i + 1}. ${el.tagName.toLowerCase()}.${el.className}`, {
    parent: el.parentElement?.className || 'none',
    overflow: getComputedStyle(el).overflow
  });
});

// 检查是否有Element Plus组件在创建滚动条
console.log('\n检查可能的Element Plus组件...');
const possibleEPComponents = [
  'el-table',
  'el-tree', 
  'el-menu',
  'el-select',
  'el-cascader'
];

possibleEPComponents.forEach(componentName => {
  const elements = document.querySelectorAll(componentName);
  if (elements.length > 0) {
    console.log(`找到 ${elements.length} 个 ${componentName} 组件`);
    elements.forEach((el, i) => {
      console.log(`  ${i + 1}. ${el.className}`);
      // 检查内部是否有滚动条
      const internalScrollbars = el.querySelectorAll('[class*="scrollbar"]');
      if (internalScrollbars.length > 0) {
        console.log(`    内部滚动条: ${internalScrollbars.length} 个`);
      }
    });
  }
});
```

### 5. 强制刷新滚动条样式

```javascript
console.log('\n=== 强制刷新滚动条样式 ===');

// 尝试强制刷新滚动条样式
const scrollareas = document.querySelectorAll('.scrollarea');
scrollareas.forEach(el => {
  // 移除并重新添加类来触发样式重新计算
  el.classList.remove('scrollarea');
  el.offsetHeight; // 强制重排
  el.classList.add('scrollarea');
  
  if (el.classList.contains('scrollarea--main')) {
    el.classList.add('scrollarea--main');
  } else if (el.classList.contains('scrollarea--side')) {
    el.classList.add('scrollarea--side');
  }
});

console.log('已强制刷新所有 .scrollarea 元素的样式');
console.log('请在 DevTools 中重新检查滚动条样式');
```

## 🎯 问题诊断指南

### 如果滚动条仍然常显
1. 检查是否有全局样式覆盖 `.scrollarea` 的样式
2. 检查 `html` 和 `body` 的 `scrollbar-gutter` 设置
3. 检查是否有其他选择器优先级更高

### 如果滚动条仍然是矩形
1. 检查 `::-webkit-scrollbar-thumb` 的 `border` 属性
2. 检查是否有其他样式在设置边框
3. 检查 `border-radius` 是否被覆盖

### 如果滚动指示器不工作
1. 检查滚动事件监听器是否正确添加
2. 检查是否有JavaScript错误
3. 检查CSS选择器 `:is(:hover, :focus-within, .is-scrolling)` 是否正确

### 如果Element Plus滚动条干扰
1. 检查哪些组件在使用Element Plus滚动条
2. 考虑统一使用原生滚动条或Element Plus滚动条
3. 避免混合使用两种滚动条系统
