import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'
import btcPlugins from '../../packages/plugins/src/vite-plugin-btc-plugins'
import { btcAutoDiscover } from '@btc/auto-discover'

export default defineConfig({
  plugins: [
    vue(),
    btcAutoDiscover(),
    // btcPlugins(), // 暂时注释掉，避免类型冲突
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
        // 手动分块：保留你的分组，但别把一切都钉死
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus', '@element-plus/icons-vue'],
          axios: ['axios'],
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
