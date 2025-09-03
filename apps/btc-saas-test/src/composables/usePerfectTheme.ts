/**
 * Vue 组合式 API：完美主题切换
 * 基于本地完美主题切换工具实现
 */

import { ref, computed, onMounted, onUnmounted, type Ref, type ComputedRef } from 'vue'
import { 
  applyTheme, 
  toggleTheme, 
  setThemeMode, 
  getCurrentTheme, 
  getThemeMode,
  initTheme,
  themeManager,
  type ThemeMode,
  type ThemeTransitionOptions
} from '../utils/perfectTheme'

export interface UseThemeTransitionOptions {
  /**
   * 是否自动初始化主题
   * @default true
   */
  autoInit?: boolean
  
  /**
   * 是否监听系统主题变化
   * @default true
   */
  watchSystem?: boolean
  
  /**
   * 调试模式
   * @default false
   */
  debug?: boolean
}

export interface UseThemeTransitionReturn {
  // 状态
  isDark: Ref<boolean>
  isLight: Ref<boolean>
  isTransitioning: Ref<boolean>
  currentTheme: Ref<'light' | 'dark'>
  themeMode: Ref<ThemeMode>
  
  // 方法
  toggle: (options?: ThemeTransitionOptions) => Promise<void>
  setTheme: (theme: 'light' | 'dark', options?: ThemeTransitionOptions) => Promise<void>
  setMode: (mode: ThemeMode) => Promise<void>
  
  // 计算属性
  themeIcon: ComputedRef<string>
  themeLabel: ComputedRef<string>
  
  // 工具方法
  isSupported: boolean
}

/**
 * 使用完美主题切换的组合式 API
 */
export function useThemeTransition(options: UseThemeTransitionOptions = {}): UseThemeTransitionReturn {
  const {
    autoInit = true,
    watchSystem = true,
    debug = false
  } = options

  // 响应式状态
  const isDark = ref(getCurrentTheme() === 'dark')
  const isLight = computed(() => !isDark.value)
  const isTransitioning = ref(false)
  const currentTheme = ref<'light' | 'dark'>(getCurrentTheme())
  const themeMode = ref<ThemeMode>(getThemeMode())

  // 检查 View Transitions API 支持
  const isSupported = 'startViewTransition' in document

  // 主题切换方法
  const toggle = async (options: ThemeTransitionOptions = {}) => {
    if (isTransitioning.value) return
    
    isTransitioning.value = true
    try {
      await toggleTheme(options)
      // 状态会在 themechange 事件中自动更新
    } finally {
      isTransitioning.value = false
    }
  }

  const setTheme = async (theme: 'light' | 'dark', options: ThemeTransitionOptions = {}) => {
    if (isTransitioning.value || currentTheme.value === theme) return
    
    isTransitioning.value = true
    try {
      await applyTheme(theme, options)
      // 状态会在 themechange 事件中自动更新
    } finally {
      isTransitioning.value = false
    }
  }

  const setMode = async (mode: ThemeMode) => {
    themeMode.value = mode
    await setThemeMode(mode)
  }

  // 计算属性
  const themeIcon = computed(() => {
    return isDark.value ? '🌙' : '☀️'
  })

  const themeLabel = computed(() => {
    return isDark.value ? '切换到亮色' : '切换到暗色'
  })

  // 监听主题变化事件
  const handleThemeChange = (e: CustomEvent) => {
    const { to } = e.detail
    currentTheme.value = to
    isDark.value = to === 'dark'
  }

  // 监听系统主题变化
  let systemThemeListener: (() => void) | null = null

  // 初始化
  onMounted(() => {
    if (autoInit) {
      initTheme()
    }

    // 监听主题变化
    window.addEventListener('themechange', handleThemeChange as EventListener)

    // 监听系统主题变化
    if (watchSystem && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      systemThemeListener = () => {
        if (themeMode.value === 'system') {
          const prefersDark = mq.matches
          const newTheme = prefersDark ? 'dark' : 'light'
          if (currentTheme.value !== newTheme) {
            setTheme(newTheme, { skipAnimation: true })
          }
        }
      }
      
      mq.addEventListener('change', systemThemeListener)
    }

    // 调试模式
    if (debug) {
      document.documentElement.setAttribute('data-debug-theme', '1')
    }
  })

  // 清理
  onUnmounted(() => {
    window.removeEventListener('themechange', handleThemeChange as EventListener)
    
    if (systemThemeListener) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.removeEventListener('change', systemThemeListener)
    }

    if (debug) {
      document.documentElement.removeAttribute('data-debug-theme')
    }
  })

  return {
    // 状态
    isDark,
    isLight,
    isTransitioning,
    currentTheme,
    themeMode,
    
    // 方法
    toggle,
    setTheme,
    setMode,
    
    // 计算属性
    themeIcon,
    themeLabel,
    
    // 工具方法
    isSupported
  }
}

/**
 * 简化的主题切换 Hook
 * 只提供基本的切换功能
 */
export function useThemeToggle() {
  const isDark = ref(getCurrentTheme() === 'dark')
  const isTransitioning = ref(false)

  const toggle = async () => {
    if (isTransitioning.value) return
    
    isTransitioning.value = true
    try {
      await toggleTheme()
      isDark.value = !isDark.value
    } finally {
      isTransitioning.value = false
    }
  }

  // 监听主题变化
  onMounted(() => {
    const handleThemeChange = (e: CustomEvent) => {
      isDark.value = e.detail.to === 'dark'
    }
    
    window.addEventListener('themechange', handleThemeChange as EventListener)
    
    onUnmounted(() => {
      window.removeEventListener('themechange', handleThemeChange as EventListener)
    })
  })

  return {
    isDark,
    isTransitioning,
    toggle
  }
}

/**
 * 主题状态 Hook
 * 只提供状态读取，不提供切换功能
 */
export function useThemeState() {
  const isDark = ref(getCurrentTheme() === 'dark')
  const currentTheme = ref<'light' | 'dark'>(getCurrentTheme())
  const themeMode = ref<ThemeMode>(getThemeMode())

  onMounted(() => {
    const handleThemeChange = (e: CustomEvent) => {
      const { to } = e.detail
      currentTheme.value = to
      isDark.value = to === 'dark'
    }
    
    window.addEventListener('themechange', handleThemeChange as EventListener)
    
    onUnmounted(() => {
      window.removeEventListener('themechange', handleThemeChange as EventListener)
    })
  })

  return {
    isDark,
    isLight: computed(() => !isDark.value),
    currentTheme,
    themeMode
  }
}
