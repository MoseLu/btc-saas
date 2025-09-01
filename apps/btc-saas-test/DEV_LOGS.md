# 开发服务器日志说明

## 日志来源

您看到的这些日志信息：
```
[btc-saas] File added: C:\Users\mlu\Desktop\btc-saas\apps\btc-saas\src\mocks\user.mock.ts
[btc-saas] File added: C:\Users\mlu\Desktop\btc-saas\apps\btc-saas\src\plugins\chart\index.ts
[btc-saas] File added: C:\Users\mlu\Desktop\btc-saas\apps\btc-saas\src\modules\user\index.ts
[btc-saas] File added: C:\Users\mlu\Desktop\btc-saas\apps\btc-saas\src\modules\user\UserList.vue
[btc-saas] File added: C:\Users\mlu\Desktop\btc-saas\apps\btc-saas\src\services\user\index.ts
[btc-saas] File added: C:\Users\mlu\Desktop\btc-saas\apps\btc-saas\src\plugins\icon-manager\IconManagerComponent.vue
[btc-saas] File added: C:\Users\mlu\Desktop\btc-saas\apps\btc-saas\src\plugins\icon-manager\index.ts
```

这些是 **Vite 开发服务器的 HMR (Hot Module Replacement) 功能** 产生的日志，当检测到文件变化时会自动打印。

## 日志类型

1. **File added** - 文件被添加
2. **File changed** - 文件被修改
3. **File deleted** - 文件被删除
4. **Module loaded** - 模块被加载
5. **HMR update** - 热更新

## 减少日志的方法

### 方法1：使用修改后的开发脚本

```bash
# 减少日志输出（只显示错误）
pnpm dev

# 更安静的启动（只显示错误）
pnpm dev:quiet

# 最安静的启动（使用自定义脚本）
pnpm dev:silent
```

### 方法2：直接使用 Vite 参数

```bash
# 只显示警告和错误
npx vite --logLevel=warn

# 只显示错误
npx vite --logLevel=error

# 不清理屏幕
npx vite --clearScreen=false
```

### 方法3：环境变量控制

```bash
# 设置环境变量来减少日志
set VITE_LOG_LEVEL=warn
pnpm dev
```

## 配置说明

### vite.config.ts 中的配置

```typescript
export default defineConfig({
  // 设置日志级别
  logLevel: 'warn', // 'info' | 'warn' | 'error' | 'silent'
  
  // 不清理屏幕
  clearScreen: false,
  
  server: {
    // 禁用 HMR 覆盖层
    hmr: {
      overlay: false
    },
    
    // 忽略特定文件，减少不必要的监听
    watch: {
      ignored: [
        '**/types/**',
        '**/*.d.ts',
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/*.md'
      ]
    }
  }
})
```

### package.json 中的脚本

```json
{
  "scripts": {
    "dev": "vite --logLevel=warn --clearScreen=false",
    "dev:quiet": "vite --logLevel=error --clearScreen=false",
    "dev:silent": "node start-dev.js"
  }
}
```

## 日志级别说明

- **info** - 显示所有信息（默认）
- **warn** - 只显示警告和错误
- **error** - 只显示错误
- **silent** - 不显示任何日志

## 为什么会有这些日志

1. **开发体验** - 帮助开发者了解文件变化
2. **调试** - 便于排查问题
3. **HMR 状态** - 显示热更新状态
4. **构建信息** - 显示构建进度

## 建议

- **开发时**：使用 `pnpm dev` 或 `pnpm dev:quiet`
- **调试时**：临时修改 `vite.config.ts` 中的 `logLevel` 为 `'info'`
- **演示时**：使用 `pnpm dev:silent` 获得最干净的输出

## 注意事项

- 这些日志只在开发模式下出现
- 生产构建不会产生这些日志
- 日志有助于开发调试，完全禁用可能影响开发体验
- **重构完成后**：已将默认日志级别设置为 `error`，只显示错误信息
- **需要调试时**：临时将 `vite.config.ts` 中的 `logLevel` 改为 `'info'` 或 `'warn'`
