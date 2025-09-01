import { ref } from 'vue'

export function useThemeTransition() {
  const isDark = ref(localStorage.getItem('theme') === 'dark')
  const isTransitioning = ref(false)

  // 同步应用主题的核心函数（不包含异步操作）
  const applyThemeSync = (theme: 'light' | 'dark') => {
    const html = document.documentElement
    
    // 同步操作：只修改类名和 color-scheme
    html.classList.toggle('dark', theme === 'dark')
    html.style.colorScheme = theme === 'dark' ? 'dark' : 'light'
    
    // 延迟更新状态和存储，避免阻塞动画
    setTimeout(() => {
      isDark.value = theme === 'dark'
      localStorage.setItem('theme', theme)
    }, 0)
  }

  // 使用 View Transitions API 的主题切换
  const toggleThemeWithTransition = () => {
    const nextTheme = isDark.value ? 'light' : 'dark'
    const direction = isDark.value ? 'dark-to-light' : 'light-to-dark'
    
    // 检查是否支持 View Transitions API 且用户没有禁用动画
    if ('startViewTransition' in document && 
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      
      isTransitioning.value = true
      
      try {
        // 在开始过渡前设置方向属性
        document.documentElement.setAttribute('data-theme-direction', direction)
        
        // 使用 View Transitions API - 回调必须是同步的！
        const transition = (document as any).startViewTransition(() => {
          // 这一步必须是 O(毫秒) 的同步操作
          applyThemeSync(nextTheme)
        })
        
        // 监听过渡完成
        transition.finished.then(() => {
          isTransitioning.value = false
          // 清理方向属性
          document.documentElement.removeAttribute('data-theme-direction')
        }).catch(() => {
          isTransitioning.value = false
          // 清理方向属性
          document.documentElement.removeAttribute('data-theme-direction')
        })
        
        return transition
      } catch (error) {
        console.error('View Transitions API 失败:', error)
        // 降级处理
        applyThemeSync(nextTheme)
        isTransitioning.value = false
        // 清理方向属性
        document.documentElement.removeAttribute('data-theme-direction')
      }
    } else {
      // 不支持 View Transitions API 或用户禁用动画时的降级处理
      applyThemeSync(nextTheme)
    }
  }

  // 初始化主题
  const initTheme = () => {
    applyThemeSync(isDark.value ? 'dark' : 'light')
  }

  return {
    isDark,
    isTransitioning,
    toggleThemeWithTransition,
    applyThemeSync,
    initTheme
  }
}
