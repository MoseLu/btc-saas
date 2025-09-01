const KEY = 'btc:menu:openeds'

/**
 * 预水合：在 Vue 挂载前读取菜单展开状态
 */
export function prefetchOpeneds(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * 持久化菜单展开状态
 */
export function persistOpeneds(keys: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(keys))
  } catch {
    // 忽略存储错误
  }
}

/**
 * 清除菜单展开状态
 */
export function clearOpeneds() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // 忽略清除错误
  }
}
