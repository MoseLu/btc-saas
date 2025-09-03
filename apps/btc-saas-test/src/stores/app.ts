import { defineStore } from 'pinia'
import { useThemeTransition } from '../composables/useThemeTransition'

interface AppState {
  sidebarCollapsed: boolean
  currentPage: string
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebarCollapsed: false,
    currentPage: ''
  }),

  getters: {
    // 使用完美主题切换系统的状态
    isDark: () => useThemeTransition().isDark.value,
    isLight: () => useThemeTransition().isLight.value
  },

  actions: {
    // 主题切换使用完美主题切换系统
    toggleTheme() {
      const { toggle } = useThemeTransition()
      toggle()
    },

    setTheme(theme: 'light' | 'dark') {
      const { setTheme } = useThemeTransition()
      setTheme(theme)
    },

    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    setCurrentPage(page: string) {
      this.currentPage = page
    }
  }
})
