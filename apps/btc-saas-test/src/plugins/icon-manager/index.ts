import IconManagerComponent from './IconManagerComponent.vue'

export interface IconConfig {
  name: string
  sizes: string
  type: string
  href: string
}

export interface FaviconConfig {
  themeColor: string
  tileColor: string
  icons: IconConfig[]
}

export class IconManager {
  private static readonly DEFAULT_ICONS: IconConfig[] = [
    {
      name: 'favicon.ico',
      sizes: '',
      type: 'image/x-icon',
      href: '/favicon.ico'
    },
    {
      name: 'favicon-16x16.png',
      sizes: '16x16',
      type: 'image/png',
      href: '/favicon-16x16.png'
    },
    {
      name: 'favicon-32x32.png',
      sizes: '32x32',
      type: 'image/png',
      href: '/favicon-32x32.png'
    },
    {
      name: 'apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
      href: '/apple-touch-icon.png'
    },
    {
      name: 'android-chrome-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      href: '/android-chrome-192x192.png'
    },
    {
      name: 'android-chrome-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      href: '/android-chrome-512x512.png'
    }
  ]

  /**
   * 生成 favicon HTML 标签
   */
  static generateFaviconHTML(config: Partial<FaviconConfig> = {}): string {
    const themeColor = config.themeColor || '#1890ff'
    const tileColor = config.tileColor || '#1890ff'
    const icons = config.icons || this.DEFAULT_ICONS

    const iconTags = icons.map(icon => {
      const sizesAttr = icon.sizes ? ` sizes="${icon.sizes}"` : ''
      const rel = icon.name.includes('apple') ? 'apple-touch-icon' : 'icon'
      return `    <link rel="${rel}" type="${icon.type}"${sizesAttr} href="${icon.href}" />`
    }).join('\n')

    return `    <!-- Favicon 配置 -->
${iconTags}
    
    <!-- 主题色 -->
    <meta name="theme-color" content="${themeColor}" />
    <meta name="msapplication-TileColor" content="${tileColor}" />`
  }

  /**
   * 获取图标配置
   */
  static getIconConfig(): FaviconConfig {
    return {
      themeColor: '#1890ff',
      tileColor: '#1890ff',
      icons: this.DEFAULT_ICONS
    }
  }

  /**
   * 获取所有可用图标
   */
  static getAvailableIcons(): IconConfig[] {
    return this.DEFAULT_ICONS
  }

  /**
   * 验证图标配置
   */
  static validateIconConfig(config: Partial<FaviconConfig>): boolean {
    if (!config.icons || !Array.isArray(config.icons)) {
      return false
    }
    
    return config.icons.every(icon => 
      icon.name && 
      icon.type && 
      icon.href
    )
  }
}

// 插件安装函数
export const install = (app: any, ctx: any) => {
  // 注册组件
  app.component('IconManager', IconManagerComponent)
  
  // 将图标管理器添加到上下文
  ctx.iconManager = IconManager
  
  // 添加图标管理相关的工具方法
  ctx.utils.iconManager = {
    generateFaviconHTML: IconManager.generateFaviconHTML,
    getIconConfig: IconManager.getIconConfig,
    getAvailableIcons: IconManager.getAvailableIcons,
    validateIconConfig: IconManager.validateIconConfig
  }
}
