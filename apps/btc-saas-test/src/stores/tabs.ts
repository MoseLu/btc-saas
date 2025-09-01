import { defineStore } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'

export interface TabView {
  path: string
  name?: string | null
  title: string
  affix?: boolean        // 固定标签（不可关闭）
  icon?: string
  fullPath: string
  keepAliveKey?: string  // 用于 <keep-alive>
}

const LSK = 'btc:tabs:visited'
const LSF = 'btc:layout:content-fullscreen'

function readLS<T>(k: string, d: T): T { 
  try { 
    return JSON.parse(localStorage.getItem(k) || '') 
  } catch { 
    return d 
  } 
}

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    visited: readLS<TabView[]>(LSK, []),
    activePath: '',
    contentFullscreen: !!readLS<boolean>(LSF, false),
  }),
  
  getters: {
    includeKeepAlive: (state) => state.visited.map(v => v.keepAliveKey).filter(Boolean) as string[],
  },
  
  actions: {
    addByRoute(r: RouteLocationNormalized) {
      // 路由可通过 meta 控制：noTab/affix/keepAliveKey/title
      if (r.meta?.noTab) {
        return
      }
      
      const path = r.path
      
      // 检查是否已存在相同路径的标签
      const existingTabIndex = this.visited.findIndex(v => v.path === path)
      
      if (existingTabIndex !== -1) {
        // 如果标签已存在，只更新activePath，不创建新标签
        this.activePath = path
        return
      }
      
      // 创建新标签
      const title = (r.meta?.title as string) || (r.name as string) || path
      const v: TabView = {
        path, 
        fullPath: r.fullPath, 
        name: r.name?.toString() ?? null,
        title, 
        icon: r.meta?.icon as string | undefined,
        affix: !!r.meta?.affix,
        keepAliveKey: (r.meta?.keepAliveKey as string) || (r.name as string) || path,
      }
      
      this.visited.push(v)
      this.activePath = path
      localStorage.setItem(LSK, JSON.stringify(this.visited))
    },
    
    remove(path: string) {
      const idx = this.visited.findIndex(v => v.path === path)
      if (idx < 0 || this.visited[idx].affix) return
      
      // 如果要关闭的是当前活跃的tab，需要先切换到其他tab
      let shouldNavigate = false
      let nextPath = '/'
      
      if (this.activePath === path) {
        // 优先选择右侧的tab，如果没有则选择左侧的
        const next = this.visited[idx + 1] || this.visited[idx - 1]
        nextPath = next?.path || '/'
        shouldNavigate = true
      }
      
      this.visited.splice(idx, 1)
      localStorage.setItem(LSK, JSON.stringify(this.visited))
      
      // 更新activePath并返回导航信息
      if (shouldNavigate) {
        this.activePath = nextPath
      }
      
      return { shouldNavigate, nextPath }
    },
    
    closeOthers(path: string) {
      this.visited = this.visited.filter(v => v.path === path || v.affix)
      localStorage.setItem(LSK, JSON.stringify(this.visited))
      this.activePath = path
    },
    
    closeAll() {
      this.visited = this.visited.filter(v => v.affix)
      localStorage.setItem(LSK, JSON.stringify(this.visited))
      this.activePath = this.visited[0]?.path || '/'
    },
    
    toggleContentFullscreen(v?: boolean) {
      this.contentFullscreen = v ?? !this.contentFullscreen
      localStorage.setItem(LSF, JSON.stringify(this.contentFullscreen))
      // 不再操作 documentElement 属性，改为使用容器类
    },
    
    hydrateOnBoot() {
      // 预水合：在挂载前调用，避免标签/布局闪烁
      // 不再操作 documentElement 属性，改为使用容器类
    }
  }
})
