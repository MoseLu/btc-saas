import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import btcPlugins from '../../packages/plugins/src/vite-plugin-btc-plugins'
import { btcAutoDiscover } from '@btc/auto-discover'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import svgLoader from 'vite-svg-loader'
import path from 'node:path'

export default defineConfig({
  plugins: [
    vue(),
    btcAutoDiscover(),
    // btcPlugins(), // 暂时注释掉，避免类型冲突
    
    // 本地 svg -> 直接作为 Vue 组件（适合复杂交互动效）
    svgLoader({ svgo: true }),
    
    // Element Plus Auto Import
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
        filepath: '.eslintrc-auto-import.json',
        globalsPropValue: true,
      },
    }),
    
    Components({
      dts: 'src/types/components.d.ts',
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({
          prefix: 'i', // 你也可以不加，下面我用 <BtcIcon /> 统一
          // enabledCollections: ['lucide','mdi','material-symbols'], // 可选，限制集合
        }),
      ],
    }),
    
    // Iconify：按需把图标编译成组件（零运行时）
    Icons({
      autoInstall: true,
      compiler: 'vue3',
      // scale: 1, // 默认即可
    }),
    
    // 本地 sprite（把 /src/assets/icons/**/*.svg 合成 1 个符号表）
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      symbolId: 'btc-[dir]-[name]', // sprite 的 id 规则
      svgoOptions: true,
      inject: 'body-last',
      customDomId: 'btc-svg-sprite', // DOM 容器 id
    }),
  ],

  // 路径别名配置
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@composables': fileURLToPath(new URL('./src/composables', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
      '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@modules': fileURLToPath(new URL('./src/modules', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@mocks': fileURLToPath(new URL('./src/mocks', import.meta.url)),
      '@plugins': fileURLToPath(new URL('./src/plugins', import.meta.url)),
      '@btc/logs': fileURLToPath(new URL('../../packages/logs/index.js', import.meta.url)),
      '@btc/styles': fileURLToPath(new URL('../../packages/styles/src', import.meta.url)),
    },
  },

  // 仅错误日志会掩盖一些关键告警；开发期更稳妥用 'info'
  logLevel: 'info',
  clearScreen: false,

  css: {
    // 临时关闭 CSS SourceMap 减少开发期开销
    devSourcemap: false,
    preprocessorOptions: {
      scss: {
        // 所有 .scss 自动拥有 tokens/mixins
        additionalData: `
          @use "@btc/styles/tokens/index.scss" as *;
          @use "@btc/styles/mixins/index.scss" as *;
        `,
      },
    },
  },

  optimizeDeps: {
    // 预构建常用依赖，减少冷启动/热更卡顿
    include: ['vue', 'vue-router', 'axios', 'pinia'],
    // 如果某些 ESM 包解析出问题，可在此排除
    // exclude: [],
  },

  build: {
    target: 'es2022',
    // 如安装了 lightningcss，可开启更快/更强 CSS 压缩
    // cssMinify: 'lightningcss',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // 更可控的文件命名，便于 CDN 缓存策略
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        // 手动分块：Element Plus 现在按需导入，不需要单独分块
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // 移除 axios 强制分块，让 Vite 自动处理
        },
      },
    },
  },

  // 允许自定义前缀的环境变量被注入客户端
  envPrefix: ['VITE_', 'BTC_'],

  server: {
    port: 3001,
    host: true,
    strictPort: true, // 端口被占用直接失败，避免"偷偷升到 3002"
    open: false, // 避免每次启动狂开新标签页
    hmr: { overlay: false },
    watch: {
      usePolling: false,
      interval: 100,
      ignored: [
        '**/types/**',
        '**/*.d.ts',
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/SIDEBAR_FIXES.md',
        '**/*.md',
        '**/DEV_LOGS.md',
        '**/VUE_REFACTORING_*.md',
        '**/AUTO_ROUTE_GUIDE.md',
        '**/IMPLEMENTATION_SUMMARY.md',
        '**/.logs/**',
        '**/tsconfig.tsbuildinfo',
        '**/*.timestamp-*.mjs',
      ],
    },
  },

  // 可选：预览服务器（CI/容器里很常用）
  preview: {
    port: 5173,
    strictPort: true,
    open: false,
  },
})
