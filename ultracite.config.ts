import { defineConfig } from 'ultracite';

export default defineConfig({
  // 继承默认配置
  extends: ['default'],

  // 项目特定配置
  rules: {
    // 与Biome协调的规则
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',

    // Vue特定规则
    'vue/no-unused-vars': 'error',
    'vue/no-unused-components': 'warn',

    // 代码质量规则
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'warn',

    // 最佳实践
    'prefer-template': 'error',
    'object-shorthand': 'error',
    'array-callback-return': 'error',
  },

  // 忽略文件
  ignorePatterns: ['node_modules/**', 'dist/**', 'build/**', '.turbo/**', 'coverage/**', '*.d.ts'],

  // 环境配置
  env: {
    browser: true,
    es2020: true,
    node: true,
  },

  // 解析器配置
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },

  // 插件配置
  plugins: ['@typescript-eslint', 'vue'],

  // 覆盖特定文件的规则
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        'vue/multi-word-component-names': 'off',
        'vue/no-v-html': 'warn',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-non-null-assertion': 'warn',
      },
    },
  ],
});
