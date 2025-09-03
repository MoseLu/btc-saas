import { ref, reactive } from 'vue'

// 页面操作按钮接口
export interface PageAction {
  key: string
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  icon?: string
  disabled?: boolean
  loading?: boolean
  onClick: () => void
}

// 页面操作管理器
export function usePageActions() {
  // 当前页面的操作按钮
  const currentPageActions = ref<PageAction[]>([])
  
  // 设置页面操作按钮
  const setPageActions = (actions: PageAction[]) => {
    currentPageActions.value = actions
  }
  
  // 清空页面操作按钮
  const clearPageActions = () => {
    currentPageActions.value = []
  }
  
  // 添加单个操作按钮
  const addPageAction = (action: PageAction) => {
    currentPageActions.value.push(action)
  }
  
  // 移除操作按钮
  const removePageAction = (key: string) => {
    const index = currentPageActions.value.findIndex(action => action.key === key)
    if (index > -1) {
      currentPageActions.value.splice(index, 1)
    }
  }
  
  // 更新操作按钮状态
  const updatePageAction = (key: string, updates: Partial<PageAction>) => {
    const action = currentPageActions.value.find(action => action.key === key)
    if (action) {
      Object.assign(action, updates)
    }
  }
  
  return {
    currentPageActions,
    setPageActions,
    clearPageActions,
    addPageAction,
    removePageAction,
    updatePageAction
  }
}

// 全局页面操作管理器实例
export const globalPageActions = usePageActions()
