/**
 * 完美主题切换工具
 * 实现 cool-admin 风格的"手术刀式切割"主题切换
 */

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeTransitionOptions {
  direction?: 'tr' | 'bl' // tr: 右上角, bl: 左下角
  skipAnimation?: boolean
}

/**
 * 主题切换核心函数
 * 实现"一次成像 + 硬遮罩 + 合成层动画"
 */
export function applyTheme(
  next: 'light' | 'dark',
  options: ThemeTransitionOptions = {}
): Promise<void> {
  const html = document.documentElement
  const from: 'light' | 'dark' = html.classList.contains('dark') ? 'dark' : 'light'
  
  if (from === next) return Promise.resolve()

  // 修复方向设置：
  // 亮→暗：新主题从右上角扩散到左下角，起点是右上角(tr)
  // 暗→亮：旧主题从左下角收拢到右上角，起点是左下角(bl)
  const { direction = next === 'dark' ? 'tr' : 'bl', skipAnimation = false } = options
  const supportsVT = 'startViewTransition' in document && !skipAnimation

  // 防抖：避免连点造成队列叠加
  if ((applyTheme as any)._busy) return Promise.resolve()
  ;(applyTheme as any)._busy = true

  // 核心切换函数
  const flip = () => {
    // 1. 同步切换主题类名和属性
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
    ;(applyTheme as any)._busy = false
    return Promise.resolve()
  }

  // 不锁定滚动条，避免宽度重算
  // const prevOverflow = html.style.overflow
  // html.style.overflow = 'clip'

  return new Promise((resolve, reject) => {
    try {
      // 1) 过渡前：标记 from/to + 动画方向（CSS 变量只管方向）
      // 必须在 startViewTransition 之前设置，避免 old/new 掉包
      html.dataset.themeFrom = from
      html.dataset.themeTo = next
      
      // 设置波浪原点（用于 clip-path 动画）
      // 亮→暗：从右上角(100% 0%)开始扩散
      // 暗→亮：从左下角(0% 100%)开始收拢
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
          }, 100)
          
          resolve()
        })
        .catch(reject)
        .finally(() => {
          // 7) 结束后清理标记
          delete html.dataset.themeFrom
          delete html.dataset.themeTo
          html.removeAttribute('data-vt-active')
          
          // 不再需要恢复滚动条
          // html.style.overflow = prevOverflow
          ;(applyTheme as any)._busy = false
        })
    } catch (error) {
      // 降级处理
      flip()
      // html.style.overflow = prevOverflow
      ;(applyTheme as any)._busy = false
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
    
    // 标记主题已准备就绪
    html.setAttribute('data-theme-ready', '1')
    
  } catch (error) {
    console.warn('主题初始化失败:', error)
    // 降级：使用系统主题
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    html.classList.toggle('dark', prefersDark)
    html.style.colorScheme = prefersDark ? 'dark' : 'light'
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    html.setAttribute('data-theme-ready', '1')
  }
}

/**
 * 主题切换状态管理
 */
export class ThemeManager {
  private _current: 'light' | 'dark' = 'light'
  private _mode: ThemeMode = 'system'
  private _isTransitioning = false
  private _listeners: Set<(theme: 'light' | 'dark') => void> = new Set()

  constructor() {
    this._current = getCurrentTheme()
    this._mode = getThemeMode()
    
    // 监听主题变化事件
    window.addEventListener('themechange', (e: any) => {
      this._current = e.detail.to
      this._notifyListeners()
    })
  }

  get current(): 'light' | 'dark' {
    return this._current
  }

  get mode(): ThemeMode {
    return this._mode
  }

  get isTransitioning(): boolean {
    return this._isTransitioning
  }

  async toggle(options: ThemeTransitionOptions = {}): Promise<void> {
    this._isTransitioning = true
    try {
      await toggleTheme(options)
      // 状态会在 themechange 事件中自动更新
    } finally {
      this._isTransitioning = false
    }
  }

  async set(theme: 'light' | 'dark', options: ThemeTransitionOptions = {}): Promise<void> {
    if (this._isTransitioning || this._current === theme) return
    
    this._isTransitioning = true
    try {
      await applyTheme(theme, options)
      // 状态会在 themechange 事件中自动更新
    } finally {
      this._isTransitioning = false
    }
  }

  async setMode(mode: ThemeMode): Promise<void> {
    this._mode = mode
    await setThemeMode(mode)
  }

  onThemeChange(listener: (theme: 'light' | 'dark') => void): () => void {
    this._listeners.add(listener)
    return () => this._listeners.delete(listener)
  }

  private _notifyListeners(): void {
    this._listeners.forEach(listener => listener(this._current))
  }
}

// 导出默认实例
export const themeManager = new ThemeManager()
