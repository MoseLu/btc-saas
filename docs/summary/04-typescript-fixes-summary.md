# TypeScript 错误修复总结

## 概述

本文档记录了项目中TypeScript错误的修复过程，确保所有代码都能通过类型检查。

## 修复的问题

### 1. TypeScript 版本兼容性问题

**问题**: TypeScript 5.5.4 与 @vitejs/plugin-vue 6.0.1 不兼容
```
@vitejs/plugin-vue/dist/index.d.ts(120,94): error TS1003: Identifier expected.
@vitejs/plugin-vue/dist/index.d.ts(120,110): error TS1005: ';' expected.
@vitejs/plugin-vue/dist/index.d.ts(120,128): error TS1128: Declaration or statement expected.
```

**解决方案**: 升级 TypeScript 到 5.7.2
```json
{
  "devDependencies": {
    "typescript": "^5.7.2"
  }
}
```

### 2. Vue 组件类型声明问题

**问题**: 无法找到 Vue 组件的类型声明
```
src/index.ts(3,23): error TS2307: Cannot find module './components/BtcTopbar.vue' or its corresponding type declarations.
```

**解决方案**: 创建 `packages/bridge/src/vue-shims.d.ts`
```typescript
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
```

### 3. 类属性初始化问题

**问题**: 类属性没有初始化器且未在构造函数中明确赋值
```
src/index.ts(8,11): error TS2564: Property 'app' has no initializer and is not definitely assigned in the constructor.
src/index.ts(9,11): error TS2564: Property 'pinia' has no initializer and is not definitely assigned in the constructor.
```

**解决方案**: 使用非空断言操作符 `!`
```typescript
class BtcConsoleImpl implements BtcConsole {
  private app!: ReturnType<typeof createApp>;
  private pinia!: ReturnType<typeof createPinia>;
  
  constructor() {
    this.initStores();
    this.initWebSocket();
    this.initTheme();
  }
}
```

### 4. 全局类型声明冲突

**问题**: 全局类型声明中的属性类型不匹配
```
src/index.ts(114,5): error TS2717: Subsequent property declarations must have the same type. Property 'BtcConsole' must be of type 'BtcConsole', but here has type 'BtcConsoleImpl'.
```

**解决方案**: 修正全局类型声明
```typescript
declare global {
  interface Window {
    BtcConsole: BtcConsole; // 使用接口类型而不是实现类型
  }
}
```

### 5. Vite 配置类型错误

**问题**: Vite 配置中的类型不匹配
```
vite.config.ts(15,7): error TS2769: No overload matches this call.
Type '(assetInfo: PreRenderedAsset) => string | undefined' is not assignable to type '(chunkInfo: PreRenderedAsset) => string'.
```

**解决方案**: 确保函数返回类型正确
```typescript
assetFileNames: (assetInfo) => {
  if (assetInfo.name === 'style.css') {
    return 'console-bridge.css';
  }
  return assetInfo.name || 'asset'; // 确保总是返回字符串
},
```

### 6. 代码质量检查问题

**问题**: Biome 和 Ultracite 发现的代码质量问题

**解决方案**: 修复各种 lint 错误
- 使用 `node:` 协议导入 Node.js 模块
- 使用模板字符串替代字符串拼接
- 修复未使用的变量和导入
- 改进类型定义，避免使用 `any` 和 `{}`

## 修复后的状态

### ✅ TypeScript 检查
```bash
pnpm typecheck
# 所有包都通过类型检查
```

### ✅ 构建检查
```bash
pnpm build
# 所有包都成功构建
```

### ✅ 双重语法检查
```bash
pnpm lint:workflow
# Biome 和 Ultracite 都能正常运行
```

## 最佳实践

### 1. 类型安全
- 避免使用 `any` 类型，使用 `unknown` 或具体类型
- 使用 `Record<string, unknown>` 替代 `{}`
- 为类属性使用非空断言 `!` 或提供默认值

### 2. 模块导入
- 使用 `node:` 协议导入 Node.js 内置模块
- 为 Vue 组件创建正确的类型声明

### 3. 配置管理
- 保持 TypeScript 版本与依赖库的兼容性
- 正确配置 `tsconfig.json` 的 `include` 和 `exclude`
- 使用 `skipLibCheck: true` 避免第三方库的类型问题

### 4. 代码质量
- 定期运行 `pnpm typecheck` 检查类型错误
- 使用双重语法检查确保代码质量
- 及时修复 lint 警告和错误

## 总结

通过以上修复，项目现在具有：
- ✅ 完整的 TypeScript 类型安全
- ✅ 兼容的依赖版本
- ✅ 正确的 Vue 组件类型支持
- ✅ 高质量的代码检查机制
- ✅ 成功的构建流程

所有 TypeScript 错误都已修复，项目可以正常开发和构建。
