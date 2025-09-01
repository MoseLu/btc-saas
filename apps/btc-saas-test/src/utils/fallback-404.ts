import { h } from 'vue'

/**
 * 内置简易404组件 - 兜底方案
 * 当找不到自定义404组件时使用
 */
export const FallbackNotFound = {
  name: 'FallbackNotFound',
  setup() {
    return () => h('div', { 
      style: {
        padding: '48px',
        textAlign: 'center',
        color: 'var(--el-text-color-secondary)',
        background: 'var(--el-bg-color)',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, [
      h('div', { 
        style: { 
          fontSize: '72px', 
          fontWeight: 'bold', 
          color: 'var(--el-color-primary)',
          marginBottom: '16px'
        } 
      }, '404'),
      h('h2', { 
        style: { 
          fontSize: '24px', 
          color: 'var(--el-text-color-primary)',
          margin: '0 0 12px 0'
        } 
      }, '页面未找到'),
      h('p', { 
        style: { 
          fontSize: '16px', 
          color: 'var(--el-text-color-regular)',
          margin: '0 0 24px 0'
        } 
      }, '抱歉，您访问的页面不存在或已被移除'),
      h('button', {
        style: {
          padding: '8px 16px',
          background: 'var(--el-color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px'
        },
        onClick: () => {
          if (typeof window !== 'undefined') {
            window.location.href = '/'
          }
        }
      }, '返回首页')
    ])
  }
}

/**
 * NotFound组件解析器
 * 按优先级查找404组件，找不到就返回内置兜底组件
 */
export function resolveNotFound(): any {
  // 尝试动态导入自定义404组件
  try {
    return () => import('../pages/404.vue').catch(() => FallbackNotFound)
  } catch {
    // 如果导入失败，使用内置兜底组件
    return FallbackNotFound
  }
}
