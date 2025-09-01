# BTC SaaS Platform

一个现代化的SaaS平台，基于Vue 3 + TypeScript + Element Plus构建。

## 🚀 特性

- **现代化技术栈**: Vue 3 + TypeScript + Vite + Element Plus
- **主题切换**: 流畅的暗色/亮色主题切换动画
- **模块化架构**: 基于monorepo的模块化设计
- **插件系统**: 可扩展的插件架构
- **响应式设计**: 适配各种屏幕尺寸
- **性能优化**: 基于iframe的主题切换优化

## 📦 项目结构

```
btc-saas/
├── apps/                    # 应用目录
│   ├── btc-saas-test/      # 主测试应用
│   ├── bi/                 # BI应用
│   ├── engineering/       # 工程应用
│   ├── production/        # 生产应用
│   ├── purchase/          # 采购应用
│   └── quality/           # 质量应用
├── packages/              # 共享包
│   ├── auto-discover/     # 自动发现
│   ├── bridge/           # 桥接SDK
│   ├── eps-plugin/       # EPS插件
│   ├── logs/             # 日志系统
│   ├── plugins/          # 插件系统
│   ├── styles/           # 样式系统
│   └── tools/            # 工具包
├── docs/                 # 文档
└── scripts/             # 脚本
```

## 🛠️ 开发环境

### 前置要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
# 启动主测试应用
cd apps/btc-saas-test
pnpm dev

# 或者从根目录启动
pnpm --filter @btc/btc-saas-test dev
```

### 构建

```bash
# 构建所有应用
pnpm build

# 构建特定应用
pnpm --filter @btc/btc-saas-test build
```

## 🎨 主题切换

项目实现了基于iframe的流畅主题切换动画：

- **亮色→暗色**: 从右上角展开
- **暗色→亮色**: 向左下角收起
- **性能优化**: 使用iframe镜像层避免重计算
- **无闪烁**: 预加载机制确保平滑过渡

## 📚 文档

详细文档请查看 `docs/` 目录：

- [项目架构](./docs/SCALABLE_ARCHITECTURE.md)
- [原子文档](./docs/atomic-docs/)
- [项目状态](./docs/PROJECT_STATUS.md)

## 🤝 贡献

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Vue.js](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)

