import { onMounted, onBeforeUnmount, nextTick } from 'vue'

/**
 * 滚动指示器组合式函数
 * 为所有 .scrollarea 容器添加滚动时的视觉反馈
 */
export function useScrollingIndicator() {
  let areas: NodeListOf<HTMLElement>
  let timeouts: Map<HTMLElement, number> = new Map()

  // 初始化滚动指示器
  const initScrollingIndicator = () => {
    // 查找所有可滚动区域
    areas = document.querySelectorAll<HTMLElement>('.scrollarea')
    
    areas.forEach(el => {
      // 为每个滚动区域添加滚动监听
      el.addEventListener('scroll', handleScroll, { passive: true })
      
      // 为每个滚动区域添加触摸事件监听（移动端支持）
      el.addEventListener('touchstart', handleTouchStart, { passive: true })
      el.addEventListener('touchend', handleTouchEnd, { passive: true })
    })
  }

  // 处理滚动事件
  const handleScroll = (event: Event) => {
    const el = event.currentTarget as HTMLElement
    
    // 添加滚动状态类
    el.classList.add('is-scrolling')
    
    // 清除之前的定时器
    const existingTimeout = timeouts.get(el)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }
    
    // 设置新的定时器，800ms 后移除滚动状态
    const timeout = window.setTimeout(() => {
      el.classList.remove('is-scrolling')
      timeouts.delete(el)
    }, 800)
    
    timeouts.set(el, timeout)
  }

  // 处理触摸开始事件
  const handleTouchStart = (event: Event) => {
    const el = event.currentTarget as HTMLElement
    el.classList.add('is-scrolling')
  }

  // 处理触摸结束事件
  const handleTouchEnd = (event: Event) => {
    const el = event.currentTarget as HTMLElement
    
    // 触摸结束后延迟移除滚动状态
    const timeout = window.setTimeout(() => {
      el.classList.remove('is-scrolling')
      timeouts.delete(el)
    }, 800)
    
    timeouts.set(el, timeout)
  }

  // 清理所有定时器
  const cleanupTimeouts = () => {
    timeouts.forEach(timeout => {
      clearTimeout(timeout)
    })
    timeouts.clear()
  }

  // 清理事件监听器
  const cleanupEventListeners = () => {
    if (areas) {
      areas.forEach(el => {
        el.removeEventListener('scroll', handleScroll)
        el.removeEventListener('touchstart', handleTouchStart)
        el.removeEventListener('touchend', handleTouchEnd)
      })
    }
  }

  // 手动添加滚动区域（动态内容）
  const addScrollArea = (el: HTMLElement) => {
    if (el && !el.classList.contains('scrollarea')) {
      el.classList.add('scrollarea')
      el.addEventListener('scroll', handleScroll, { passive: true })
      el.addEventListener('touchstart', handleTouchStart, { passive: true })
      el.addEventListener('touchend', handleTouchEnd, { passive: true })
    }
  }

  // 手动移除滚动区域
  const removeScrollArea = (el: HTMLElement) => {
    if (el && el.classList.contains('scrollarea')) {
      el.classList.remove('scrollarea')
      el.removeEventListener('scroll', handleScroll)
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchend', handleTouchEnd)
      
      // 清理相关的定时器
      const timeout = timeouts.get(el)
      if (timeout) {
        clearTimeout(timeout)
        timeouts.delete(el)
      }
    }
  }

  onMounted(() => {
    // 等待 DOM 完全加载后初始化
    nextTick(() => {
      initScrollingIndicator()
    })
  })

  onBeforeUnmount(() => {
    cleanupEventListeners()
    cleanupTimeouts()
  })

  return {
    addScrollArea,
    removeScrollArea,
    initScrollingIndicator,
    cleanupEventListeners
  }
}
