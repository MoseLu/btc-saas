# 滚动条样式测试脚本

## 🧪 测试步骤

### 1. 打开浏览器控制台，粘贴以下代码检查滚动容器

```javascript
// 检查当前视口中谁在滚动
console.log('=== 滚动容器检查 ===');
const scrollElements = [...document.querySelectorAll('*')].filter(n => {
  const s = getComputedStyle(n);
  return /(auto|scroll)/.test(s.overflow + s.overflowY + s.overflowX);
});

scrollElements.forEach(n => {
  const s = getComputedStyle(n);
  console.log(`${n.tagName.toLowerCase()}.${n.className}`, {
    overflow: s.overflow,
    overflowY: s.overflowY,
    overflowX: s.overflowX,
    hasScrollarea: n.classList.contains('scrollarea'),
    scrollbarGutter: s.scrollbarGutter
  });
});

// 检查 .scrollarea 元素
console.log('\n=== .scrollarea 元素检查 ===');
const scrollareas = document.querySelectorAll('.scrollarea');
scrollareas.forEach(el => {
  console.log(`${el.tagName.toLowerCase()}.${el.className}`, {
    hasScrollareaMain: el.classList.contains('scrollarea--main'),
    hasScrollareaSide: el.classList.contains('scrollarea--side'),
    scrollbarGutter: getComputedStyle(el).scrollbarGutter
  });
});
```

### 2. 检查滚动条样式是否命中

```javascript
// 检查滚动条样式是否命中
console.log('\n=== 滚动条样式检查 ===');
const mainScrollarea = document.querySelector('.scrollarea--main');
if (mainScrollarea) {
  const computedStyle = getComputedStyle(mainScrollarea);
  console.log('主滚动区域样式:', {
    overflow: computedStyle.overflow,
    scrollbarGutter: computedStyle.scrollbarGutter,
    minWidth: computedStyle.minWidth,
    minHeight: computedStyle.minHeight
  });
  
  // 检查伪元素样式（需要手动在 DevTools 中查看）
  console.log('请在 DevTools 中手动检查以下伪元素样式:');
  console.log('- .scrollarea--main::-webkit-scrollbar-track');
  console.log('- .scrollarea--main::-webkit-scrollbar-thumb');
  console.log('- .scrollarea--main::-webkit-scrollbar-corner');
}
```

### 3. 测试滚动条交互

```javascript
// 测试滚动条交互
console.log('\n=== 滚动条交互测试 ===');
const scrollareas = document.querySelectorAll('.scrollarea');
scrollareas.forEach((el, index) => {
  console.log(`滚动区域 ${index + 1}:`, el.className);
  
  // 模拟滚动
  el.scrollTop = 100;
  console.log('  - 滚动后是否有 .is-scrolling 类:', el.classList.contains('is-scrolling'));
  
  // 模拟悬停
  el.dispatchEvent(new Event('mouseenter'));
  console.log('  - 悬停后是否有 :hover 状态: 请在 DevTools 中检查');
  
  // 恢复滚动位置
  el.scrollTop = 0;
});
```

## ✅ 期望结果

### 滚动容器检查
- 应该只看到 `.scrollarea` 容器在滚动
- 不应该看到 `html` 或 `body` 在滚动
- 每个 `.scrollarea` 都应该有正确的 `scrollbar-gutter: stable`

### 滚动条样式检查
- `.scrollarea::-webkit-scrollbar-track` 应该是 `background: transparent`
- `.scrollarea::-webkit-scrollbar-thumb` 应该是 `border-radius: 999px; border: 0; opacity: 0`
- 悬停时 `opacity` 应该变为 `1`

### 滚动条交互测试
- 滚动时应该添加 `.is-scrolling` 类
- 悬停时滚动条应该淡入
- 滚动条应该是圆弧形状，没有"限位器"

## 🚨 如果仍有问题

### 问题1: 滚动条仍然常显
```javascript
// 检查是否有全局样式覆盖
console.log('检查全局滚动条样式...');
const htmlStyle = getComputedStyle(document.documentElement);
const bodyStyle = getComputedStyle(document.body);
console.log('html.scrollbar-gutter:', htmlStyle.scrollbarGutter);
console.log('body.scrollbar-gutter:', bodyStyle.scrollbarGutter);
```

### 问题2: 滚动条仍然是矩形
```javascript
// 检查是否有边框样式
console.log('检查滚动条边框样式...');
const scrollarea = document.querySelector('.scrollarea');
if (scrollarea) {
  // 在 DevTools 中手动检查 ::-webkit-scrollbar-thumb 的 border 属性
  console.log('请在 DevTools 中检查 .scrollarea::-webkit-scrollbar-thumb 的 border 属性');
}
```

### 问题3: 滚动条完全不出现
```javascript
// 检查容器高度和溢出设置
console.log('检查容器设置...');
const scrollarea = document.querySelector('.scrollarea');
if (scrollarea) {
  const style = getComputedStyle(scrollarea);
  console.log('容器样式:', {
    height: style.height,
    maxHeight: style.maxHeight,
    overflow: style.overflow,
    overflowY: style.overflowY,
    minHeight: style.minHeight
  });
}
```

## 🎯 修复后的最终状态

修复完成后，三个页面应该都有：
1. **统一的滚动容器** - 都使用 `.scrollarea` 类
2. **统一的滚动条样式** - 圆弧、无边框、透明轨道
3. **统一的交互行为** - 默认隐藏、悬停/滚动时显示
4. **无"限位器"** - 滚动条完全贴边，没有两侧留白
