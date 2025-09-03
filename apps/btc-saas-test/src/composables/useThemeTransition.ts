import { ref } from 'vue'
import { useThemeTransition as usePerfectThemeTransition } from './usePerfectTheme'

/**
 * 主题切换组合式 API
 * 基于本地完美主题切换系统
 */
export function useThemeTransition() {
  // 使用完美主题切换系统
  const {
    isDark,
    isLight,
    isTransitioning,
    currentTheme,
    themeMode,
    toggle,
    setTheme,
    setMode,
    themeIcon,
    themeLabel,
    isSupported
  } = usePerfectThemeTransition({
    autoInit: true,
    watchSystem: true,
    debug: false // 暂时禁用调试模式
  })

  // 初始化主题
  const initTheme = () => {
    // 完美主题切换系统会自动初始化
    // 这里保持向后兼容
  }

  // 应用主题同步（向后兼容）
  const applyThemeSync = (theme: 'light' | 'dark') => {
    setTheme(theme, { skipAnimation: true })
  }

  // 主题切换（向后兼容）
  const toggleThemeWithTransition = () => {
    toggle()
  }

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
    toggleThemeWithTransition,
    applyThemeSync,
    initTheme,
    
    // 计算属性
    themeIcon,
    themeLabel,
    
    // 工具方法
    isSupported
  }
}
