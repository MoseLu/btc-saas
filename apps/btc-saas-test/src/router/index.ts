import { createRouter, createWebHistory } from 'vue-router'
import routes from 'virtual:@btc/auto/routes'
import { useTabsStore } from '../stores/tabs'
import appConfig from '../app.config'
// 使用动态导入避免循环依赖
import { resolveNotFound } from '../utils/fallback-404'

// 使用动态导入
const Home = () => import('../pages/home.vue')
const NotFound = resolveNotFound()

// 自动推断首页：查找第一个affix路由作为兜底
function pickAutoHome(childRoutes: any[]): string {
  const affix = childRoutes.find(r => r.meta?.affix)
  return affix?.path || childRoutes[0]?.path || '/home'
}

// 根路由直接显示Home内容，不在TabBar中显示
const homeRoute = {
  path: '/',
  name: 'Home',
  component: Home,
  meta: {
    title: '首页',
    icon: 'HomeFilled',
    noTab: true, // 不显示在TabBar中
    showInMenu: false // 不显示在侧边栏菜单中
  }
}

// 顶层404兜底
const notFoundRoute = {
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: NotFound,
  meta: { noTab: true }
}

// 去重路由：确保没有重复的路径
const uniqueRoutes = routes.filter((route, index, self) => {
  const firstIndex = self.findIndex(r => r.path === route.path)
  return index === firstIndex
})



// 构建完整的路由结构 - 扁平化，避免嵌套布局
const allRoutes = [
  homeRoute, // 根路由直接显示Home
  ...uniqueRoutes, // 虚拟路由已包含布局
  notFoundRoute
]

export const router = createRouter({
  history: createWebHistory(),
  routes: allRoutes,
})

// 路由钩子：写入标签
router.afterEach((to) => {
  const tabs = useTabsStore()
  tabs.addByRoute(to)
})

// 获取菜单路由的函数
export function getMenuRoutes() {
  return uniqueRoutes.filter(route => {
    // 过滤掉不需要显示在菜单中的路由
    return route.meta?.showInMenu !== false && route.path !== '/'
  })
}

export default router
