import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: any
    requiresAuth?: boolean
    roles?: string[]
  }
}
