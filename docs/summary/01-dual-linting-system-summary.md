# 双重语法检查系统配置

## 概述

本项目配置了双重语法检查机制，使用 **Biome** 和 **Ultracite** 两个工具来确保代码质量：

1. **Biome**: 快速的代码格式化和基础检查
2. **Ultracite**: AI友好的代码审查框架，提供更深入的检查

## 配置说明

### 1. 安装的工具

```json
{
  "devDependencies": {
    "@biomejs/biome": "^2.2.0",
    "ultracite": "5.2.4",
    "husky": "^9.1.7",
    "lefthook": "^1.12.3"
  }
}
```

### 2. 配置文件

#### Biome 配置 (`biome.json`)
```json
{
  "$schema": "https://biomejs.dev/schemas/2.2.0/schema.json",
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5",
      "semicolons": "always"
    }
  }
}
```

#### Ultracite 配置 (`ultracite.config.ts`)
```typescript
import { defineConfig } from 'ultracite'

export default defineConfig({
  extends: ['default'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
    'vue/no-unused-vars': 'error',
    'vue/no-unused-components': 'warn',
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-template': 'error',
    'object-shorthand': 'error'
  },
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '.turbo/**',
    'coverage/**',
    '*.d.ts'
  ],
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  plugins: ['@typescript-eslint', 'vue']
})
```

## 使用方法

### 1. 根目录脚本

```bash
# Biome 检查
pnpm lint:biome

# Biome 自动修复
pnpm lint:biome:fix

# Ultracite 检查
pnpm lint:ultracite

# Ultracite 自动修复
pnpm lint:ultracite:fix

# 双重检查（先 Biome 修复，再 Ultracite 修复）
pnpm lint:all

# 完整工作流（格式化 + 双重检查）
pnpm format:all

# 自动化工作流脚本
pnpm lint:workflow
```

### 2. 子包脚本（以 bridge 为例）

```bash
# 进入子包目录
cd packages/bridge

# Biome 检查
pnpm lint:biome

# Biome 自动修复
pnpm lint:biome:fix

# Ultracite 检查
pnpm lint:ultracite

# Ultracite 自动修复
pnpm lint:ultracite:fix

# 双重检查
pnpm lint:all
```

## 工作流程

### 自动化工作流 (`scripts/lint-workflow.js`)

1. **第一步**: Biome 自动修复
   - 修复基础的格式和语法问题
   - 如果失败，继续执行下一步

2. **第二步**: Ultracite 检查
   - 进行更深入的代码质量检查
   - 如果发现问题，尝试自动修复

3. **第三步**: Ultracite 自动修复（如果需要）
   - 修复 Ultracite 发现的问题

4. **第四步**: 最终验证
   - 再次运行 Biome 和 Ultracite 检查
   - 生成检查结果总结

### 输出示例

```
🔍 开始双重语法检查工作流...

🔄 第一步：Biome 自动修复
📋 Biome 自动修复...
✅ Biome 自动修复 完成

🔄 第二步：Ultracite 检查
📋 Ultracite 检查...
✅ Ultracite 检查通过

🔄 第四步：最终检查
📋 最终 Biome 检查...
✅ 最终 Biome 检查 完成
📋 最终 Ultracite 检查...
✅ 最终 Ultracite 检查 完成

📊 检查结果总结:
Biome 检查: ✅ 通过
Ultracite 检查: ✅ 通过

🎉 双重语法检查全部通过！
```

## 工具特点对比

| 特性 | Biome | Ultracite |
|------|-------|-----------|
| 速度 | ⚡ 极快 | 🚀 快速 |
| 格式化 | ✅ 内置 | ✅ 内置 |
| Vue 支持 | ⚠️ 有限 | ✅ 完整 |
| TypeScript | ✅ 支持 | ✅ 支持 |
| 规则配置 | 🔧 简单 | 🔧 灵活 |
| AI 友好 | ✅ | ✅ 专门优化 |

## 最佳实践

### 1. 开发流程

1. **编写代码**时使用 IDE 的实时检查
2. **提交前**运行 `pnpm lint:workflow`
3. **CI/CD** 中集成双重检查

### 2. 规则协调

- Biome 负责基础的格式和语法检查
- Ultracite 负责更深入的代码质量检查
- 两个工具的规则配置相互补充，避免冲突

### 3. 性能优化

- Biome 检查速度快，适合频繁运行
- Ultracite 检查更全面，适合最终验证
- 使用工作流脚本自动化整个过程

## 故障排除

### 常见问题

1. **Biome 找不到忽略文件**
   - 确保 `.biomeignore` 文件存在
   - 检查 `biome.json` 配置是否正确

2. **Ultracite 命令失败**
   - 使用 `npx ultracite --help` 查看正确用法
   - 注意 Ultracite 使用 `format` 而不是 `lint --fix`

3. **规则冲突**
   - 检查两个工具的配置文件
   - 确保规则设置合理且不冲突

### 调试命令

```bash
# 检查 Biome 配置
npx @biomejs/biome --help

# 检查 Ultracite 配置
npx ultracite --help

# 查看详细错误信息
pnpm lint:biome --verbose
npx ultracite lint --debug
```

## 总结

双重语法检查系统为项目提供了：

- ✅ **全面的代码质量保证**
- ✅ **快速的开发反馈**
- ✅ **自动化的修复流程**
- ✅ **AI 友好的代码生成**

通过 Biome 和 Ultracite 的配合，我们实现了既快速又全面的代码质量检查机制。
