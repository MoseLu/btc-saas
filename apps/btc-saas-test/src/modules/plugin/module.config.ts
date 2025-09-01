export default {
  id: 'plugins', // 改为plugins以匹配自动路由注册器的路径
  title: '插件管理',
  category: 'system', // 改为system以匹配自动路由注册器的分类
  icon: 'Grid',
  apiBase: '/api/plugin',
  devPort: 8312,
  showInMenu: true,
  routeMeta: { 
    auth: true
  }
}
