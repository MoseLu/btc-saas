# BTC SaaS 项目文档

本目录包含BTC SaaS项目的完整文档，分为三个主要部分：

## 📁 文档结构

### 1. 项目状态文档
- **PROJECT_STATUS.md** - 项目整体进度和里程碑状态

### 2. 原子操作文档 (atomic-docs/)
位于 `atomic-docs/` 子目录，包含具体的操作步骤和实现细节：

- **01-bootstrap-monorepo.md** - Monorepo 初始化和基础配置
- **02-bridge-sdk-and-topbar.md** - Bridge SDK 和 Topbar 组件开发
- **03-ui-kit-btc-components.md** - UI 组件库开发
- **04-plugin-system-conventions.md** - 插件系统规范
- **05-tools-conventions-and-request-mock.md** - 工具规范和请求模拟
- **06-logs-conventions-and-channels.md** - 日志规范和通道
- **07-eps-plugin-and-services.md** - EPS 插件和服务
- **08-styles-and-ep-theme.sass.md** - 样式和主题
- **09-auth-rbac-and-pinia-stores.md** - 认证、权限和状态管理
- **10-navigation-hamburger-anim.md** - 导航和汉堡菜单动画
- **11-mock-strategy-and-switch.md** - 模拟策略和开关
- **12-multi-env-config.md** - 多环境配置
- **13-dev-scripts-and-ports.md** - 开发脚本和端口配置
- **14-docs-model-and-sidebar-json.md** - 文档模型和侧边栏
- **14-quality-system-app.md** - 品质系统应用
- **15-ci-release-changesets.md** - CI/CD 和发布流程
- **16-a11y-and-keypaths-testing.md** - 无障碍和键路径测试
- **17-security-and-tenant-isolation.md** - 安全和租户隔离
- **18-feature-flags-and-ops-switch.md** - 功能标志和运维开关
- **19-performance-budgets-and-bundling.md** - 性能预算和打包
- **20-ci-guards-and-audit-json.md** - CI 守卫和审计

### 3. 总结文档 (summary/)
位于 `summary/` 子目录，包含工作成果总结和解决方案：

- **README.md** - 总结文档索引
- **03-dual-linting-system.md** - 双重语法检查系统配置总结
- **04-typescript-fixes.md** - TypeScript 错误修复总结

## 🎯 使用指南

### 开发阶段
1. 查看 `PROJECT_STATUS.md` 了解当前进度
2. 按照原子操作文档的顺序进行开发
3. 每个文档包含具体的实现步骤和代码示例
4. 完成每个模块后，参考相关的总结文档

### 问题排查
1. 查看 `summary/` 中的相关总结文档
2. 参考故障排除指南和最佳实践
3. 学习已解决的类似问题

### 团队协作
1. 分享总结文档中的经验和教训
2. 更新原子操作文档以反映最新的实现
3. 维护文档的时效性和准确性

## 📋 文档维护规范

### 项目状态文档
- 实时更新项目进度和里程碑状态
- 记录已完成功能和待完成任务
- 提供技术栈和项目结构概览

### 原子操作文档
- 包含具体的操作步骤和代码示例
- 按功能模块分类，便于查找
- 保持与代码实现的同步

### 总结文档
- 记录重要的工作成果和解决方案
- 提供故障排除和参考指南
- 总结最佳实践和经验教训

## 🔗 快速链接

- [项目状态](./PROJECT_STATUS.md)
- [原子操作文档](./atomic-docs/)
- [总结文档索引](./summary/README.md)
- [双重语法检查系统](./summary/03-dual-linting-system.md)
- [TypeScript 错误修复](./summary/04-typescript-fixes.md)

## 📊 当前进度

根据最新的项目状态，已完成以下里程碑：

- ✅ **里程碑1**: Monorepo基础架构 (100% 完成)
- ✅ **里程碑2**: 核心SDK与组件库 (100% 完成)
- ✅ **里程碑3**: 插件系统与工具体系 (100% 完成)
- ✅ **里程碑4**: 日志体系与通道 (100% 完成)
- 🚧 **里程碑5**: EPS插件与服务生成 (进行中)

详细进度请查看 [PROJECT_STATUS.md](./PROJECT_STATUS.md)
