import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export type LayoutMode = 'desktop' | 'tablet' | 'mobile'

const mode = ref<LayoutMode>('desktop')
const sidebarOpen = ref(false)     // 抽屉是否展开（tablet/mobile）
const sidebarCollapsed = ref(false) // 桌面模式下是否"窄化/只显示图标"

export function useLayout() {
  let ro: ResizeObserver | null = null

  const setByWidth = (inlineSize: number) => {
    // 断点按"容器像素"判断；配合容器查询，缩放不出错
    if (inlineSize < 768) mode.value = 'mobile'
    else if (inlineSize < 1280) mode.value = 'tablet'
    else mode.value = 'desktop'
  }

  const onShellReady = (el: HTMLElement) => {
    ro = new ResizeObserver(([entry]) => {
      const w = entry.contentBoxSize?.[0]?.inlineSize ?? el.clientWidth
      setByWidth(w)
      // 模式切换时重置形态：桌面=常驻，其他=抽屉关闭
      if (mode.value === 'desktop') { 
        sidebarOpen.value = true 
      } else { 
        sidebarOpen.value = false 
        sidebarCollapsed.value = false 
      }
    })
    ro.observe(el)
  }

  onBeforeUnmount(() => ro?.disconnect())

  const toggleButtonAction = computed(() =>
    mode.value === 'desktop' ? 'collapse' : 'drawer'
  )

  const toggleButtonIcon = computed(() => {
    if (mode.value === 'desktop') {
      return sidebarCollapsed.value ? 'Expand' : 'Fold'
    }
    return 'Menu'
  })

  const toggleButtonLabel = computed(() => {
    if (mode.value === 'desktop') {
      return sidebarCollapsed.value ? '展开侧栏' : '折叠侧栏'
    }
    return '打开菜单'
  })

  return { 
    mode, 
    sidebarOpen, 
    sidebarCollapsed, 
    toggleButtonAction, 
    toggleButtonIcon,
    toggleButtonLabel,
    onShellReady 
  }
}
