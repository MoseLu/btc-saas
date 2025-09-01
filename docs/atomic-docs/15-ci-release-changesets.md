---
title: CI发布与Changesets管理
category: ci
order: 15
owners: [devops, arch]
auditable: true
acceptance:
  - [ ] Changesets配置
  - [ ] CI流水线配置
  - [ ] 自动版本管理
  - [ ] 发布流程
outputs:
  - .changeset/
  - .github/workflows/
  - scripts/release/
related: [01-bootstrap-monorepo, 20-ci-guards-and-audit-json]
---

# CI发布与Changesets管理

## 背景与目标

配置Changesets进行版本管理和自动发布，建立完整的CI/CD流水线，支持monorepo的自动化构建、测试、版本管理和发布流程。

## 约定

### Changesets工作流
1. 开发者在功能分支上开发
2. 创建changeset描述变更
3. 合并到main分支
4. CI自动检测changeset并发布
5. 自动更新版本号和changelog

### 发布策略
- **patch**: 修复bug、文档更新
- **minor**: 新功能、向后兼容
- **major**: 破坏性变更

### 分支策略
- `main`: 主分支，用于发布
- `develop`: 开发分支
- `feature/*`: 功能分支
- `hotfix/*`: 热修复分支

## 步骤

### 1. 安装和配置Changesets
安装依赖：
```bash
pnpm add -D @changesets/cli
```

初始化changesets：
```bash
npx changeset init
```

创建`.changeset/config.json`：
```json
{
  "$schema": "https://unpkg.com/@changesets/config@2.3.1/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": [
    "@btc/docs-model",
    "@btc/eps-plugin"
  ]
}
```

### 2. 创建发布脚本
创建`scripts/release/setup.ts`：
```typescript
import { execSync } from 'child_process'
import { writeFileSync, readFileSync } from 'fs'
import { join } from 'path'

interface PackageInfo {
  name: string
  version: string
  private?: boolean
  publishConfig?: {
    access: string
  }
}

function updatePackageVersions() {
  const packages = [
    'packages/bridge',
    'packages/ui',
    'packages/tools',
    'packages/logs',
    'packages/eps-plugin',
    'packages/docs-model',
    'apps/quality-system',
    'apps/procurement-system',
    'apps/engineering-system',
    'apps/production-control',
    'apps/bi-system'
  ]

  for (const pkg of packages) {
    const packagePath = join(process.cwd(), pkg, 'package.json')
    try {
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8')) as PackageInfo
      
      // 更新版本号
      if (!packageJson.private) {
        packageJson.publishConfig = {
          access: 'restricted'
        }
      }
      
      writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n')
    } catch (error) {
      console.warn(`Failed to update ${pkg}:`, error)
    }
  }
}

function setupGitHooks() {
  try {
    execSync('npx husky install', { stdio: 'inherit' })
    execSync('npx husky add .husky/pre-commit "pnpm lint-staged"', { stdio: 'inherit' })
    execSync('npx husky add .husky/commit-msg "npx --no -- commitlint --edit $1"', { stdio: 'inherit' })
  } catch (error) {
    console.warn('Failed to setup git hooks:', error)
  }
}

function main() {
  console.log('🔧 Setting up release environment...')
  
  updatePackageVersions()
  setupGitHooks()
  
  console.log('✅ Release environment setup complete')
}

if (require.main === module) {
  main()
}
```

创建`scripts/release/publish.ts`：
```typescript
import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

interface ReleaseConfig {
  registry: string
  tag: string
  access: string
}

const config: ReleaseConfig = {
  registry: 'https://registry.npmjs.org/',
  tag: 'latest',
  access: 'restricted'
}

function checkGitStatus() {
  const status = execSync('git status --porcelain', { encoding: 'utf-8' })
  if (status.trim()) {
    throw new Error('Working directory is not clean. Please commit all changes.')
  }
}

function checkBranch() {
  const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim()
  if (branch !== 'main') {
    throw new Error('Must be on main branch to publish')
  }
}

function checkChangesets() {
  try {
    const changesets = execSync('npx changeset status', { encoding: 'utf-8' })
    if (!changesets.includes('🦋  All packages have been updated')) {
      throw new Error('No changesets found or packages not updated')
    }
  } catch (error) {
    throw new Error('Failed to check changesets status')
  }
}

function publishPackages() {
  console.log('📦 Publishing packages...')
  
  try {
    execSync(`npx changeset publish --registry ${config.registry} --tag ${config.tag}`, {
      stdio: 'inherit'
    })
  } catch (error) {
    throw new Error('Failed to publish packages')
  }
}

function updateChangelog() {
  console.log('📝 Updating changelog...')
  
  try {
    execSync('npx changeset version', { stdio: 'inherit' })
  } catch (error) {
    throw new Error('Failed to update changelog')
  }
}

function pushChanges() {
  console.log('🚀 Pushing changes...')
  
  try {
    execSync('git add .', { stdio: 'inherit' })
    execSync('git commit -m "chore: release packages"', { stdio: 'inherit' })
    execSync('git push origin main', { stdio: 'inherit' })
  } catch (error) {
    throw new Error('Failed to push changes')
  }
}

function main() {
  try {
    console.log('🚀 Starting release process...')
    
    checkGitStatus()
    checkBranch()
    checkChangesets()
    
    updateChangelog()
    publishPackages()
    pushChanges()
    
    console.log('✅ Release completed successfully!')
  } catch (error) {
    console.error('❌ Release failed:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
```

### 3. 配置GitHub Actions
创建`.github/workflows/ci.yml`：
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '18'
  PNPM_VERSION: '8'

jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      pnpm-cache: ${{ steps.pnpm-cache.outputs.cache-hit }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

      - name: Setup pnpm cache
        uses: actions/cache@v3
        id: pnpm-cache
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

  lint:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run linting
        run: pnpm lint

      - name: Run type checking
        run: pnpm typecheck

  test:
    needs: setup
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [quality-system, procurement-system, engineering-system, production-control, bi-system]
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm --filter @btc/${{ matrix.app }} test

  build:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build packages
        run: pnpm build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: |
            packages/*/dist
            apps/*/dist

  docs:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate docs
        run: |
          pnpm docs:scan
          pnpm docs:sidebar
          pnpm docs:audit

      - name: Upload docs artifacts
        uses: actions/upload-artifact@v3
        with:
          name: docs-artifacts
          path: dist/
```

创建`.github/workflows/release.yml`：
```yaml
name: Release

on:
  push:
    branches: [main]

env:
  NODE_VERSION: '18'
  PNPM_VERSION: '8'

jobs:
  release:
    runs-on: ubuntu-latest
    if: "!contains(github.event.head_commit.message, 'chore: release packages')"
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          registry-url: 'https://registry.npmjs.org'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check for changesets
        id: changesets
        uses: changesets/action@v1
        with:
          title: 'chore: release packages'
          commit: 'chore: release packages'
          title: 'chore: release packages'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          title: 'chore: release packages'
          commit: 'chore: release packages'
          publish: pnpm release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 4. 配置Commitlint
创建`.commitlintrc.js`：
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert'
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'bridge',
        'ui',
        'tools',
        'logs',
        'eps-plugin',
        'docs-model',
        'quality-system',
        'procurement-system',
        'engineering-system',
        'production-control',
        'bi-system',
        'release',
        'deps'
      ]
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72]
  }
}
```

### 5. 配置Lint-staged
创建`.lintstagedrc.js`：
```javascript
module.exports = {
  '*.{js,ts,vue}': [
    'eslint --fix',
    'prettier --write'
  ],
  '*.{json,md,yml,yaml}': [
    'prettier --write'
  ],
  '*.{ts,tsx}': [
    'tsc --noEmit'
  ]
}
```

### 6. 更新package.json脚本
在根目录的`package.json`中添加脚本：
```json
{
  "scripts": {
    "release:setup": "tsx scripts/release/setup.ts",
    "release:publish": "tsx scripts/release/publish.ts",
    "changeset": "changeset",
    "changeset:version": "changeset version",
    "changeset:publish": "changeset publish",
    "changeset:status": "changeset status"
  },
  "devDependencies": {
    "@changesets/cli": "^2.26.0",
    "@commitlint/cli": "^17.0.0",
    "@commitlint/config-conventional": "^17.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^13.0.0"
  }
}
```

### 7. 创建发布指南
创建`RELEASE.md`：
```markdown
# 发布指南

## 发布流程

### 1. 开发阶段
1. 在功能分支上开发
2. 提交代码时遵循约定式提交规范
3. 创建Pull Request到main分支

### 2. 创建Changeset
当需要发布时，创建changeset：
```bash
pnpm changeset
```

选择要发布的包和版本类型：
- `patch`: 修复bug、文档更新
- `minor`: 新功能、向后兼容
- `major`: 破坏性变更

### 3. 合并到主分支
1. 合并Pull Request到main分支
2. CI会自动检测changeset
3. 创建发布Pull Request

### 4. 发布
1. 审查发布Pull Request
2. 合并发布Pull Request
3. CI自动发布到npm registry

## 版本管理

### 版本号规则
- `major.minor.patch`
- 遵循语义化版本控制
- 内部依赖自动更新

### 包发布策略
- 公共包：发布到npm registry
- 私有包：标记为private，不发布
- 工具包：根据需要发布

## 回滚策略

### 紧急回滚
1. 创建hotfix分支
2. 修复问题
3. 创建新的patch版本
4. 快速发布

### 版本回滚
1. 使用git revert回滚提交
2. 创建新的changeset
3. 发布修复版本

## 注意事项

1. 确保所有测试通过
2. 检查构建产物
3. 验证文档更新
4. 确认版本号正确
5. 检查依赖关系
```

## 产出物

- [x] `.changeset/config.json` - Changesets配置
- [x] `scripts/release/` - 发布脚本
- [x] `.github/workflows/` - CI/CD流水线
- [x] `.commitlintrc.js` - 提交规范
- [x] `.lintstagedrc.js` - 代码检查
- [x] `RELEASE.md` - 发布指南

## 审计清单

- [ ] Changesets配置
- [ ] CI流水线配置
- [ ] 自动版本管理
- [ ] 发布流程
- [ ] 提交规范配置
- [ ] 代码检查配置
- [ ] 发布指南文档
- [ ] 回滚策略
- [ ] 版本管理策略
- [ ] 包发布策略
