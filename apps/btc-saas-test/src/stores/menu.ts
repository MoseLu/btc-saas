import { defineStore } from 'pinia'
import { persistOpeneds, prefetchOpeneds } from '../bootstrap/opened-prefetch'

// 读取持久化的折叠状态
function getPersistedCollapseState(): boolean {
  try {
    const stored = localStorage.getItem('menuCollapse')
    return stored ? JSON.parse(stored) : false
  } catch {
    return false
  }
}

export const useMenuStore = defineStore('menu', {
  state: () => ({
    openeds: prefetchOpeneds().length > 0 ? prefetchOpeneds() : ['system', 'plugins', 'apps'], // 优先使用持久化状态
    isCollapse: getPersistedCollapseState()
  }),
  
  actions: {
    /**
     * 设置展开的菜单
     */
    setOpeneds(keys: string[]) {
      this.openeds = keys
      persistOpeneds(keys)
    },
    
    /**
     * 切换菜单展开状态
     */
    toggle(key: string) {
      const set = new Set(this.openeds)
      if (set.has(key)) {
        set.delete(key)
      } else {
        set.add(key)
      }
      this.setOpeneds([...set])
    },
    
    /**
     * 添加展开的菜单
     */
    addOpened(key: string) {
      if (!this.openeds.includes(key)) {
        this.setOpeneds([...this.openeds, key])
      }
    },
    
    /**
     * 移除展开的菜单
     */
    removeOpened(key: string) {
      const index = this.openeds.indexOf(key)
      if (index > -1) {
        const newOpeneds = [...this.openeds]
        newOpeneds.splice(index, 1)
        this.setOpeneds(newOpeneds)
      }
    },
    
    /**
     * 设置折叠状态
     */
    setCollapse(collapse: boolean) {
      this.isCollapse = collapse
      localStorage.setItem('menuCollapse', collapse.toString())
    },
    
    /**
     * 切换折叠状态
     */
    toggleCollapse() {
      this.setCollapse(!this.isCollapse)
    }
  }
})
