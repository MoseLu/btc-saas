/**
 * 完美主题切换工具 - 重构版
 * 采用 cool-admin 的稳定方案：动画与主题解耦，只改根类名
 */

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeTransitionOptions {
  direction?: 'tr' | 'bl' // tr: 右上角, bl: 左下角
  skipAnimation?: boolean
}

// 节流锁：300ms 锁，避免快速切换丢动画
let until = 0
// 动画状态管理
let isTransitioning = false

/**
 * 主题切换核心函数 - 重构版
 * 采用 cool-admin 方案：底层变量立即切换，前景动画解耦
 */
export function applyTheme(
  next: 'light' | 'dark',
  options: ThemeTransitionOptions = {}
): Promise<void> {
  const now = performance.now()
  
  // 如果正在过渡中，直接返回
  if (isTransitioning) {
    return Promise.resolve()
  }
  
  // 节流检查
  if (now < until) {
    console.log('主题切换被节流，剩余时间:', Math.max(0, until - now), 'ms')
    return Promise.resolve()
  }

  const html = document.documentElement
  const from: 'light' | 'dark' = html.classList.contains('dark') ? 'dark' : 'light'
  
  if (from === next) return Promise.resolve()

  const { direction = next === 'dark' ? 'tr' : 'bl', skipAnimation = false } = options
  const supportsVT = 'startViewTransition' in document && !skipAnimation

  // 设置节流锁
  until = now + 300
  isTransitioning = true

  // 核心切换函数：只改根类名，不动其他
  const flip = () => {
    // 1. 同步切换主题类名和属性（底层变量立即切换）
    html.classList.toggle('dark', next === 'dark')
    html.style.colorScheme = next === 'dark' ? 'dark' : 'light'
    html.setAttribute('data-theme', next)
    
    // 2. 更新本地存储
    localStorage.setItem('theme', next)
    
    // 3. 触发自定义事件
    window.dispatchEvent(new CustomEvent('themechange', { 
      detail: { from, to: next, direction } 
    }))
  }

  // 如果不支持 View Transitions 或跳过动画，直接切换
  if (!supportsVT) {
    flip()
    // 延迟解锁，确保状态稳定
    setTimeout(() => {
      isTransitioning = false
    }, 100)
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    try {
      // 1) 过渡前：标记 from/to + 动画方向
      html.dataset.themeFrom = from
      html.dataset.themeTo = next
      
      // 设置波浪原点（用于 clip-path 动画）
      const origin = direction === 'tr' ? '100% 0%' : '0% 100%'
      html.style.setProperty('--wave-origin', origin)

      // 2) 开始过渡
      // @ts-ignore - startViewTransition 可能不存在
      const vt = document.startViewTransition(() => {
        // 3) 在回调内部只切主题，不改 from/to
        flip()
      })

      // 4) 设置冻结期属性，配合 CSS 冻结规则
      html.setAttribute('data-vt-active', '1')
      
      vt.finished
        .then(() => {
          // 5) 设置冷却期属性
          html.setAttribute('data-vt-cooldown', '1')
          
          // 6) 延迟移除冷却期属性，确保过渡完全结束
          setTimeout(() => {
            html.removeAttribute('data-vt-cooldown')
          }, 150)
          
          resolve()
        })
        .catch((error) => {
          console.error('View Transitions 失败:', error)
          reject(error)
        })
        .finally(() => {
          // 7) 结束后清理标记
          delete html.dataset.themeFrom
          delete html.dataset.themeTo
          html.removeAttribute('data-vt-active')
          
          // 延迟解锁动画状态，确保过渡完全结束
          setTimeout(() => {
            isTransitioning = false
          }, 200)
        })
    } catch (error) {
      console.error('主题切换失败:', error)
      // 降级处理
      flip()
      setTimeout(() => {
        isTransitioning = false
      }, 200)
      resolve()
    }
  })
}

/**
 * 主题切换（带方向）
 */
export function toggleTheme(options: ThemeTransitionOptions = {}): Promise<void> {
  const html = document.documentElement
  const isDark = html.classList.contains('dark')
  const next = isDark ? 'light' : 'dark'
  
  // 自动判断方向：
  // 亮→暗：新主题从右上角扩散到左下角，起点是右上角(tr)
  // 暗→亮：旧主题从左下角收拢到右上角，起点是左下角(bl)
  const direction = next === 'dark' ? 'tr' : 'bl'
  
  return applyTheme(next, { ...options, direction })
}

/**
 * 设置主题模式
 */
export function setThemeMode(mode: ThemeMode): Promise<void> {
  if (mode === 'system') {
    // 跟随系统主题
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return applyTheme(prefersDark ? 'dark' : 'light')
  }
  
  return applyTheme(mode)
}

/**
 * 获取当前主题
 */
export function getCurrentTheme(): 'light' | 'dark' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

/**
 * 获取主题模式
 */
export function getThemeMode(): ThemeMode {
  return localStorage.getItem('theme') as ThemeMode || 'system'
}

/**
 * 初始化主题
 * 必须在 DOM 准备好后调用
 */
export function initTheme(): void {
  const html = document.documentElement
  
  try {
    const saved = localStorage.getItem('theme') || 'system'
    let isDark = false
    
    if (saved === 'system') {
      // 跟随系统主题
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark = prefersDark
      
      // 监听系统主题变化
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener?.('change', (e) => {
        const dark = e.matches
        html.classList.toggle('dark', dark)
        html.style.colorScheme = dark ? 'dark' : 'light'
        html.setAttribute('data-theme', dark ? 'dark' : 'light')
      })
    } else {
      isDark = saved === 'dark'
    }
    
    // 应用主题
    html.classList.toggle('dark', isDark)
    html.style.colorScheme = isDark ? 'dark' : 'light'
    html.setAttribute('data-theme', isDark ? 'dark' : 'light')
    
    // 设置初始状态
    html.setAttribute('data-theme-initialized', '1')
    
  } catch (error) {
    console.error('主题初始化失败:', error)
    // 降级处理：默认亮色主题
    html.classList.remove('dark')
    html.style.colorScheme = 'light'
    html.setAttribute('data-theme', 'light')
  }
}

/**
 * 主题管理器
 */
export const themeManager = {
  current: getCurrentTheme,
  mode: getThemeMode,
  set: applyTheme,
  toggle: toggleTheme,
  setMode: setThemeMode,
  init: initTheme,
  
  // 状态查询
  isDark: () => getCurrentTheme() === 'dark',
  isLight: () => getCurrentTheme() === 'light',
  isSystem: () => getThemeMode() === 'system',
  
  // 节流状态
  isLocked: () => performance.now() < until,
  getLockTime: () => Math.max(0, until - performance.now()),
  isTransitioning: () => isTransitioning
}
