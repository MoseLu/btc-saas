import { defineStore } from 'pinia'

interface AppState {
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  currentPage: string
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    theme: 'light',
    sidebarCollapsed: false,
    currentPage: ''
  }),

  getters: {
    isDark: (state) => state.theme === 'dark',
    isLight: (state) => state.theme === 'light'
  },

  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      document.documentElement.classList.toggle('dark', this.isDark)
    },

    setTheme(theme: 'light' | 'dark') {
      this.theme = theme
      document.documentElement.classList.toggle('dark', this.isDark)
    },

    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    setCurrentPage(page: string) {
      this.currentPage = page
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'btc-app-store',
        storage: localStorage
      }
    ]
  }
})
