# PDF转PNG插件

## 功能描述

将PDF文件转换为PNG图片格式，支持批量转换和自定义输出参数。

## 使用方法

```vue
<template>
  <Pdf2Png
    :file="pdfFile"
    :options="options"
    @convert="handleConvert"
  />
</template>

<script setup>
import { ref } from 'vue';

const pdfFile = ref(null);
const options = ref({
  quality: 0.8,
  scale: 1.0
});

const handleConvert = (result) => {
  console.log('转换结果:', result);
};
</script>
```

## 配置选项

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| quality | 输出质量 | Number | 0.8 |
| scale | 缩放比例 | Number | 1.0 |
| format | 输出格式 | String | 'png' |

## 依赖

- pdf-lib: PDF处理库
- canvas: 图像处理

## 开发说明

### 插件结构
```
pdf2png/
├── index.ts              # 插件入口
├── README.md             # 插件文档
├── src/
│   └── components/
│       └── Pdf2PngComponent.vue  # 主组件
└── assets/
    └── styles/           # 样式文件
```

### 插件接口
```typescript
interface Pdf2PngPlugin {
  name: 'pdf2png';
  version: string;
  description: string;
  author: string;
  setup: (app: App) => void;
  routes: RouteRecordRaw[];
  onActivate?: () => void;
  onDeactivate?: () => void;
  onUpdate?: (config: any) => void;
}
```

## 更新日志

### v1.0.0
- 初始版本
- 支持PDF转PNG功能
- 支持质量、缩放、格式配置
