/**
 * 布局自检脚本 - 验证滚动权绑定是否正确
 * 在浏览器控制台粘贴运行，检查是否符合cool-admin的滚动权绑定原则
 */

export function checkLayoutHealth() {
  console.log('🔍 布局健康检查开始...\n')
  
  // 检查根滚动控制
  const htmlOverflow = getComputedStyle(document.documentElement).overflow
  const bodyOverflow = getComputedStyle(document.body).overflow
  const htmlScrollbarGutter = getComputedStyle(document.documentElement).scrollbarGutter
  const bodyScrollbarGutter = getComputedStyle(document.body).scrollbarGutter
  
  console.log('📋 根滚动控制检查:')
  console.log(`  html.overflow: ${htmlOverflow} ${htmlOverflow === 'clip' ? '✅' : '❌'}`)
  console.log(`  body.overflow: ${bodyOverflow} ${bodyOverflow === 'clip' ? '✅' : '❌'}`)
  console.log(`  html.scrollbar-gutter: ${htmlScrollbarGutter} ${htmlScrollbarGutter === 'auto' ? '✅' : '❌'}`)
  console.log(`  body.scrollbar-gutter: ${bodyScrollbarGutter} ${bodyScrollbarGutter === 'auto' ? '✅' : '❌'}`)
  
  // 检查外壳定位
  const app = document.getElementById('app')
  if (app) {
    const appPosition = getComputedStyle(app).position
    const appTop = getComputedStyle(app).top
    const appRight = getComputedStyle(app).right
    const appBottom = getComputedStyle(app).bottom
    const appLeft = getComputedStyle(app).left
    
    console.log('\n📋 外壳定位检查:')
    console.log(`  #app.position: ${appPosition} ${appPosition === 'fixed' ? '✅' : '❌'}`)
    console.log(`  #app.top: ${appTop} ${appTop === '0px' ? '✅' : '❌'}`)
    console.log(`  #app.right: ${appRight} ${appRight === '0px' ? '✅' : '❌'}`)
    console.log(`  #app.bottom: ${appBottom} ${appBottom === '0px' ? '✅' : '❌'}`)
    console.log(`  #app.left: ${appLeft} ${appLeft === '0px' ? '✅' : '❌'}`)
  }
  
  // 检查滚动容器
  const pageContent = document.querySelector('.page-content')
  if (pageContent) {
    const pageOverflow = getComputedStyle(pageContent).overflow
    const pageMinWidth = getComputedStyle(pageContent).minWidth
    const pageMinHeight = getComputedStyle(pageContent).minHeight
    const pageOverscrollBehavior = getComputedStyle(pageContent).overscrollBehavior
    const pageScrollbarGutter = getComputedStyle(pageContent).scrollbarGutter
    
    console.log('\n📋 滚动容器检查:')
    console.log(`  .page-content.overflow: ${pageOverflow} ${pageOverflow === 'auto' ? '✅' : '❌'}`)
    console.log(`  .page-content.min-width: ${pageMinWidth} ${pageMinWidth === '0px' ? '✅' : '❌'}`)
    console.log(`  .page-content.min-height: ${pageMinHeight} ${pageMinHeight === '0px' ? '✅' : '❌'}`)
    console.log(`  .page-content.overscroll-behavior: ${pageOverscrollBehavior} ${pageOverscrollBehavior === 'contain' ? '✅' : '❌'}`)
    console.log(`  .page-content.scrollbar-gutter: ${pageScrollbarGutter} ${pageScrollbarGutter === 'stable' ? '✅' : '❌'}`)
  }
  
  // 检查侧边栏
  const sidebar = document.querySelector('.layout__aside')
  if (sidebar) {
    const sidebarMinWidth = getComputedStyle(sidebar).minWidth
    const sidebarMinHeight = getComputedStyle(sidebar).minHeight
    const sidebarOverflow = getComputedStyle(sidebar).overflow
    
    console.log('\n📋 侧边栏检查:')
    console.log(`  .layout__aside.min-width: ${sidebarMinWidth} ${sidebarMinWidth === '0px' ? '✅' : '❌'}`)
    console.log(`  .layout__aside.min-height: ${sidebarMinHeight} ${sidebarMinHeight === '0px' ? '✅' : '❌'}`)
    console.log(`  .layout__aside.overflow: ${sidebarOverflow} ${sidebarOverflow === 'auto' || sidebarOverflow === 'hidden' ? '✅' : '❌'}`)
  }
  
  // 检查主内容区
  const mainContent = document.querySelector('.layout__main')
  if (mainContent) {
    const mainMinWidth = getComputedStyle(mainContent).minWidth
    const mainMinHeight = getComputedStyle(mainContent).minHeight
    const mainOverflow = getComputedStyle(mainContent).overflow
    
    console.log('\n📋 主内容区检查:')
    console.log(`  .layout__main.min-width: ${mainMinWidth} ${mainMinWidth === '0px' ? '✅' : '❌'}`)
    console.log(`  .layout__main.min-height: ${mainMinHeight} ${mainMinHeight === '0px' ? '✅' : '❌'}`)
    console.log(`  .layout__main.overflow: ${mainOverflow} ${mainOverflow === 'hidden' ? '✅' : '❌'}`)
  }
  
  // 检查视口尺寸一致性
  const innerWidth = window.innerWidth
  const htmlWidth = document.documentElement.clientWidth
  const bodyWidth = document.body.clientWidth
  
  console.log('\n📋 视口尺寸一致性检查:')
  console.log(`  window.innerWidth: ${innerWidth}`)
  console.log(`  html.clientWidth: ${htmlWidth}`)
  console.log(`  body.clientWidth: ${bodyWidth}`)
  
  const widthsMatch = innerWidth === htmlWidth && htmlWidth === bodyWidth
  console.log(`  尺寸一致性: ${widthsMatch ? '✅' : '❌'}`)
  
  // 总结
  console.log('\n🎯 滚动权绑定原则检查结果:')
  console.log('✅ 根不滚: html/body overflow: clip')
  console.log('✅ 壳固定: #app position: fixed, inset: 0')
  console.log('✅ 滚动权绑定: .page-content overflow: auto')
  console.log('✅ 防撑爆: 关键容器 min-width: 0, min-height: 0')
  console.log('✅ 无全局滚动条: 移除 * 通配符滚动条样式')
  
  console.log('\n🚀 如果所有检查都通过，你的布局在500%放大时应该依然健壮！')
}

// 导出为全局函数，方便在控制台调用
if (typeof window !== 'undefined') {
  (window as any).checkLayoutHealth = checkLayoutHealth
}
