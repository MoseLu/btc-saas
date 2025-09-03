export type ThemeTarget = 'dark' | 'light'

export function themeRipple(to: ThemeTarget) {
  const html = document.documentElement
  const from: ThemeTarget = html.classList.contains('dark') ? 'dark' : 'light'
  if (from === to) return

  // 标注"从什么到什么"，供 CSS 精确挑选动画
  html.dataset.themeFrom = from
  html.dataset.themeTo = to

  const apply = () => html.classList.toggle('dark', to === 'dark')

  // 支持就走 View Transitions；不支持就瞬切（渐进增强）
  const start = (document as any).startViewTransition?.bind(document)
  if (start) {
    start(apply).finished.finally(() => {
      delete html.dataset.themeFrom
      delete html.dataset.themeTo
    })
  } else {
    apply()
    delete html.dataset.themeFrom
    delete html.dataset.themeTo
  }
}
