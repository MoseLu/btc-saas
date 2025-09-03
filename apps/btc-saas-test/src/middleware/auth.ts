import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

export default function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  // 这里可以添加认证逻辑
  // 例如检查用户是否已登录
  
  // 示例：检查localStorage中的token
  const token = localStorage.getItem('auth-token')
  
  if (!token && to.path !== '/login') {
    // 如果没有token且不是登录页面，重定向到登录页
    next('/login')
  } else if (token && to.path === '/login') {
    // 如果已有token且访问登录页，重定向到首页
    next('/')
  } else {
    next()
  }
}
