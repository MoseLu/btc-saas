---
title: 品质系统应用
category: apps
order: 14
owners: [frontend, quality]
auditable: true
acceptance:
  - [ ] 品质系统独立运行
  - [ ] 检测流程完整
  - [ ] 报告生成正常
  - [ ] 数据统计准确
outputs:
  - apps/quality/
  - packages/quality-components/
related: [03-ui-kit-btc-components, 15-purchase-system-app]
---

# 品质系统应用

## 背景与目标

构建独立的品质检测与管理系统，支持检测流程管理、报告生成、数据统计和品质分析，实现完整的品质管理闭环。

## 约定

### 应用结构
```
apps/quality/
├── src/
│   ├── components/     # 品质专用组件
│   ├── pages/         # 页面组件
│   ├── stores/        # 状态管理
│   ├── services/      # API服务
│   └── utils/         # 工具函数
├── public/            # 静态资源
└── package.json       # 应用配置
```

## 步骤

### 1. 创建品质应用基础结构
创建`apps/quality/package.json`：
```json
{
  "name": "@btc/quality",
  "version": "1.0.0",
  "description": "BTC品质检测与管理系统",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.ts,.jsx,.tsx --fix",
    "type-check": "vue-tsc --noEmit"
  },
  "dependencies": {
    "@btc/bridge": "workspace:*",
    "@btc/ui": "workspace:*",
    "@btc/tools": "workspace:*",
    "@btc/logs": "workspace:*",
    "@btc/quality-components": "workspace:*",
    "vue": "^3.3.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "element-plus": "^2.3.0",
    "echarts": "^5.4.0",
    "dayjs": "^1.11.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.2.0",
    "vite": "^4.4.0",
    "vue-tsc": "^1.8.0",
    "typescript": "^5.0.0",
    "sass": "^1.64.0"
  }
}
```

### 2. 创建品质专用组件
创建`packages/quality-components/src/components/QualityInspection.vue`：
```vue
<template>
  <div class="quality-inspection">
    <el-card class="inspection-card">
      <template #header>
        <div class="card-header">
          <span>品质检测</span>
          <el-button type="primary" @click="startInspection">开始检测</el-button>
        </div>
      </template>
      
      <el-form :model="inspectionForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品编号">
              <el-input v-model="inspectionForm.productCode" placeholder="请输入产品编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="批次号">
              <el-input v-model="inspectionForm.batchNumber" placeholder="请输入批次号" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="检测类型">
              <el-select v-model="inspectionForm.inspectionType" placeholder="请选择检测类型">
                <el-option label="外观检测" value="appearance" />
                <el-option label="尺寸检测" value="dimension" />
                <el-option label="功能检测" value="function" />
                <el-option label="性能检测" value="performance" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="检测标准">
              <el-select v-model="inspectionForm.standard" placeholder="请选择检测标准">
                <el-option label="国家标准" value="national" />
                <el-option label="行业标准" value="industry" />
                <el-option label="企业标准" value="enterprise" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="检测项目">
          <el-table :data="inspectionForm.items" border>
            <el-table-column prop="name" label="项目名称" />
            <el-table-column prop="standard" label="标准值" />
            <el-table-column prop="tolerance" label="公差" />
            <el-table-column prop="actual" label="实测值">
              <template #default="{ row }">
                <el-input v-model="row.actual" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="result" label="结果">
              <template #default="{ row }">
                <el-tag :type="row.result === 'pass' ? 'success' : 'danger'">
                  {{ row.result === 'pass' ? '合格' : '不合格' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        
        <el-form-item label="检测备注">
          <el-input
            v-model="inspectionForm.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入检测备注"
          />
        </el-form-item>
      </el-form>
      
      <div class="card-footer">
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" @click="submitInspection">提交检测</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { log } from '@btc/logs'

interface InspectionItem {
  id: string
  name: string
  standard: string
  tolerance: string
  actual: string
  result: 'pass' | 'fail'
}

interface InspectionForm {
  productCode: string
  batchNumber: string
  inspectionType: string
  standard: string
  items: InspectionItem[]
  remarks: string
}

const inspectionForm = reactive<InspectionForm>({
  productCode: '',
  batchNumber: '',
  inspectionType: '',
  standard: '',
  items: [
    {
      id: '1',
      name: '外观检查',
      standard: '无缺陷',
      tolerance: '±0',
      actual: '',
      result: 'pass'
    },
    {
      id: '2',
      name: '尺寸测量',
      standard: '100mm',
      tolerance: '±0.1mm',
      actual: '',
      result: 'pass'
    },
    {
      id: '3',
      name: '重量检测',
      standard: '500g',
      tolerance: '±5g',
      actual: '',
      result: 'pass'
    }
  ],
  remarks: ''
})

const startInspection = () => {
  log.crud('开始品质检测', {
    productCode: inspectionForm.productCode,
    batchNumber: inspectionForm.batchNumber,
    inspectionType: inspectionForm.inspectionType
  })
  
  ElMessage.success('检测已开始')
}

const submitInspection = async () => {
  try {
    // 验证表单
    if (!inspectionForm.productCode || !inspectionForm.batchNumber) {
      ElMessage.error('请填写完整的产品信息')
      return
    }
    
    // 计算检测结果
    inspectionForm.items.forEach(item => {
      if (item.actual) {
        const actual = parseFloat(item.actual)
        const standard = parseFloat(item.standard)
        const tolerance = parseFloat(item.tolerance.replace('±', ''))
        
        item.result = Math.abs(actual - standard) <= tolerance ? 'pass' : 'fail'
      }
    })
    
    // 提交检测结果
    const result = {
      ...inspectionForm,
      timestamp: new Date().toISOString(),
      inspector: '当前用户',
      overallResult: inspectionForm.items.every(item => item.result === 'pass') ? 'pass' : 'fail'
    }
    
    log.crud('提交品质检测结果', result)
    
    ElMessage.success('检测结果已提交')
    
    // 重置表单
    resetForm()
    
  } catch (error) {
    console.error('提交检测失败:', error)
    ElMessage.error('提交检测失败')
  }
}

const resetForm = () => {
  inspectionForm.productCode = ''
  inspectionForm.batchNumber = ''
  inspectionForm.inspectionType = ''
  inspectionForm.standard = ''
  inspectionForm.remarks = ''
  
  inspectionForm.items.forEach(item => {
    item.actual = ''
    item.result = 'pass'
  })
}
</script>

<style scoped lang="sass">
.quality-inspection
  padding: 20px

.inspection-card
  max-width: 1200px
  margin: 0 auto

.card-header
  display: flex
  justify-content: space-between
  align-items: center

.card-footer
  display: flex
  justify-content: flex-end
  gap: 12px
  margin-top: 20px
  padding-top: 20px
  border-top: 1px solid var(--el-border-color-light)
</style>
```

### 3. 创建品质报告组件
创建`packages/quality-components/src/components/QualityReport.vue`：
```vue
<template>
  <div class="quality-report">
    <el-card class="report-card">
      <template #header>
        <div class="card-header">
          <span>品质检测报告</span>
          <div class="header-actions">
            <el-button @click="exportReport">导出报告</el-button>
            <el-button type="primary" @click="printReport">打印报告</el-button>
          </div>
        </div>
      </template>
      
      <div class="report-content">
        <!-- 报告头部 -->
        <div class="report-header">
          <h1>品质检测报告</h1>
          <div class="report-info">
            <p><strong>报告编号：</strong>{{ report.reportNumber }}</p>
            <p><strong>检测日期：</strong>{{ formatDate(report.inspectionDate) }}</p>
            <p><strong>检测人员：</strong>{{ report.inspector }}</p>
          </div>
        </div>
        
        <!-- 产品信息 -->
        <div class="report-section">
          <h3>产品信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="产品编号">{{ report.productCode }}</el-descriptions-item>
            <el-descriptions-item label="批次号">{{ report.batchNumber }}</el-descriptions-item>
            <el-descriptions-item label="产品名称">{{ report.productName }}</el-descriptions-item>
            <el-descriptions-item label="规格型号">{{ report.specification }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <!-- 检测结果 -->
        <div class="report-section">
          <h3>检测结果</h3>
          <el-table :data="report.items" border>
            <el-table-column prop="name" label="检测项目" />
            <el-table-column prop="standard" label="标准值" />
            <el-table-column prop="tolerance" label="公差" />
            <el-table-column prop="actual" label="实测值" />
            <el-table-column prop="result" label="检测结果">
              <template #default="{ row }">
                <el-tag :type="row.result === 'pass' ? 'success' : 'danger'">
                  {{ row.result === 'pass' ? '合格' : '不合格' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remarks" label="备注" />
          </el-table>
        </div>
        
        <!-- 统计图表 -->
        <div class="report-section">
          <h3>检测统计</h3>
          <div class="chart-container">
            <div ref="pieChart" class="pie-chart"></div>
            <div ref="barChart" class="bar-chart"></div>
          </div>
        </div>
        
        <!-- 结论 -->
        <div class="report-section">
          <h3>检测结论</h3>
          <div class="conclusion">
            <el-alert
              :title="report.overallResult === 'pass' ? '检测合格' : '检测不合格'"
              :type="report.overallResult === 'pass' ? 'success' : 'error'"
              :description="report.conclusion"
              show-icon
            />
          </div>
        </div>
        
        <!-- 签名 -->
        <div class="report-signature">
          <div class="signature-item">
            <span>检测人员：</span>
            <span class="signature-line">{{ report.inspector }}</span>
          </div>
          <div class="signature-item">
            <span>审核人员：</span>
            <span class="signature-line">{{ report.reviewer }}</span>
          </div>
          <div class="signature-item">
            <span>批准人员：</span>
            <span class="signature-line">{{ report.approver }}</span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { log } from '@btc/logs'

interface ReportItem {
  name: string
  standard: string
  tolerance: string
  actual: string
  result: 'pass' | 'fail'
  remarks: string
}

interface QualityReport {
  reportNumber: string
  inspectionDate: string
  inspector: string
  productCode: string
  batchNumber: string
  productName: string
  specification: string
  items: ReportItem[]
  overallResult: 'pass' | 'fail'
  conclusion: string
  reviewer: string
  approver: string
}

const props = defineProps<{
  report: QualityReport
}>()

const pieChart = ref<HTMLElement>()
const barChart = ref<HTMLElement>()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const exportReport = () => {
  log.crud('导出品质报告', {
    reportNumber: props.report.reportNumber,
    format: 'PDF'
  })
  
  // 实现导出逻辑
  console.log('导出报告')
}

const printReport = () => {
  log.crud('打印品质报告', {
    reportNumber: props.report.reportNumber
  })
  
  window.print()
}

onMounted(() => {
  // 初始化饼图
  if (pieChart.value) {
    const pie = echarts.init(pieChart.value)
    const passCount = props.report.items.filter(item => item.result === 'pass').length
    const failCount = props.report.items.filter(item => item.result === 'fail').length
    
    pie.setOption({
      title: {
        text: '检测结果分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '检测结果',
          type: 'pie',
          radius: '50%',
          data: [
            { value: passCount, name: '合格', itemStyle: { color: '#67C23A' } },
            { value: failCount, name: '不合格', itemStyle: { color: '#F56C6C' } }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    })
  }
  
  // 初始化柱状图
  if (barChart.value) {
    const bar = echarts.init(barChart.value)
    
    bar.setOption({
      title: {
        text: '各项目检测结果',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: props.report.items.map(item => item.name)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '检测结果',
          type: 'bar',
          data: props.report.items.map(item => ({
            value: item.result === 'pass' ? 1 : 0,
            itemStyle: {
              color: item.result === 'pass' ? '#67C23A' : '#F56C6C'
            }
          }))
        }
      ]
    })
  }
})
</script>

<style scoped lang="sass">
.quality-report
  padding: 20px

.report-card
  max-width: 1200px
  margin: 0 auto

.card-header
  display: flex
  justify-content: space-between
  align-items: center

.header-actions
  display: flex
  gap: 12px

.report-content
  @media print
    .card-header
      display: none

.report-header
  text-align: center
  margin-bottom: 30px
  
  h1
    margin-bottom: 20px
    color: var(--btc-primary)

.report-info
  display: flex
  justify-content: space-around
  margin-top: 20px

.report-section
  margin-bottom: 30px
  
  h3
    margin-bottom: 15px
    color: var(--btc-text-primary)
    border-bottom: 2px solid var(--btc-primary)
    padding-bottom: 5px

.chart-container
  display: grid
  grid-template-columns: 1fr 1fr
  gap: 20px
  margin-top: 20px

.pie-chart,
.bar-chart
  height: 300px
  border: 1px solid var(--el-border-color-light)
  border-radius: 4px

.conclusion
  margin-top: 15px

.report-signature
  display: flex
  justify-content: space-between
  margin-top: 50px
  padding-top: 30px
  border-top: 1px solid var(--el-border-color-light)

.signature-item
  display: flex
  align-items: center
  gap: 10px

.signature-line
  border-bottom: 1px solid var(--btc-text-primary)
  min-width: 100px
  text-align: center
  padding-bottom: 5px

@media print
  .quality-report
    padding: 0
  
  .report-card
    box-shadow: none
    border: none
</style>
```

### 4. 创建品质统计组件
创建`packages/quality-components/src/components/QualityStatistics.vue`：
```vue
<template>
  <div class="quality-statistics">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :span="6" v-for="stat in statistics" :key="stat.key">
        <el-card class="stat-card" :class="stat.type">
          <div class="stat-content">
            <div class="stat-icon">
              <i :class="stat.icon"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>月度检测趋势</span>
          </template>
          <div ref="trendChart" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>不合格原因分析</span>
          </template>
          <div ref="reasonChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 数据表格 -->
    <el-card class="table-card">
      <template #header>
        <span>检测记录</span>
        <el-button type="primary" @click="exportData">导出数据</el-button>
      </template>
      
      <el-table :data="inspectionRecords" border>
        <el-table-column prop="reportNumber" label="报告编号" />
        <el-table-column prop="productCode" label="产品编号" />
        <el-table-column prop="inspectionDate" label="检测日期" />
        <el-table-column prop="inspector" label="检测人员" />
        <el-table-column prop="overallResult" label="检测结果">
          <template #default="{ row }">
            <el-tag :type="row.overallResult === 'pass' ? 'success' : 'danger'">
              {{ row.overallResult === 'pass' ? '合格' : '不合格' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" @click="viewReport(row)">查看报告</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'
import { log } from '@btc/logs'

interface InspectionRecord {
  reportNumber: string
  productCode: string
  inspectionDate: string
  inspector: string
  overallResult: 'pass' | 'fail'
}

const trendChart = ref<HTMLElement>()
const reasonChart = ref<HTMLElement>()

// 统计数据
const statistics = ref([
  {
    key: 'total',
    label: '总检测数',
    value: 1250,
    icon: 'el-icon-document',
    type: 'primary'
  },
  {
    key: 'pass',
    label: '合格数',
    value: 1180,
    icon: 'el-icon-check',
    type: 'success'
  },
  {
    key: 'fail',
    label: '不合格数',
    value: 70,
    icon: 'el-icon-close',
    type: 'danger'
  },
  {
    key: 'rate',
    label: '合格率',
    value: '94.4%',
    icon: 'el-icon-data-analysis',
    type: 'info'
  }
])

// 检测记录
const inspectionRecords = ref<InspectionRecord[]>([
  {
    reportNumber: 'QC2024001',
    productCode: 'P001',
    inspectionDate: '2024-01-15',
    inspector: '张三',
    overallResult: 'pass'
  },
  {
    reportNumber: 'QC2024002',
    productCode: 'P002',
    inspectionDate: '2024-01-15',
    inspector: '李四',
    overallResult: 'fail'
  }
])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const handleSizeChange = (size: number) => {
  pageSize.value = size
  loadData()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadData()
}

const loadData = () => {
  // 加载数据逻辑
  log.crud('加载品质统计数据', {
    page: currentPage.value,
    pageSize: pageSize.value
  })
}

const viewReport = (record: InspectionRecord) => {
  log.crud('查看品质报告', {
    reportNumber: record.reportNumber
  })
  
  // 实现查看报告逻辑
  console.log('查看报告:', record.reportNumber)
}

const exportData = () => {
  log.crud('导出品质数据', {
    format: 'Excel',
    filters: {
      page: currentPage.value,
      pageSize: pageSize.value
    }
  })
  
  // 实现导出逻辑
  console.log('导出数据')
}

onMounted(() => {
  // 初始化趋势图
  if (trendChart.value) {
    const trend = echarts.init(trendChart.value)
    trend.setOption({
      title: {
        text: '月度检测趋势'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['检测总数', '合格数', '不合格数']
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '检测总数',
          type: 'line',
          data: [120, 132, 101, 134, 90, 230]
        },
        {
          name: '合格数',
          type: 'line',
          data: [110, 125, 95, 128, 85, 220]
        },
        {
          name: '不合格数',
          type: 'line',
          data: [10, 7, 6, 6, 5, 10]
        }
      ]
    })
  }
  
  // 初始化原因分析图
  if (reasonChart.value) {
    const reason = echarts.init(reasonChart.value)
    reason.setOption({
      title: {
        text: '不合格原因分析'
      },
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          name: '不合格原因',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 30, name: '外观缺陷' },
            { value: 20, name: '尺寸偏差' },
            { value: 15, name: '功能异常' },
            { value: 5, name: '其他' }
          ]
        }
      ]
    })
  }
})
</script>

<style scoped lang="sass">
.quality-statistics
  padding: 20px

.stat-card
  margin-bottom: 20px
  
  &.primary
    .stat-icon
      background-color: var(--el-color-primary)
  
  &.success
    .stat-icon
      background-color: var(--el-color-success)
  
  &.danger
    .stat-icon
      background-color: var(--el-color-danger)
  
  &.info
    .stat-icon
      background-color: var(--el-color-info)

.stat-content
  display: flex
  align-items: center

.stat-icon
  width: 60px
  height: 60px
  border-radius: 50%
  display: flex
  align-items: center
  justify-content: center
  margin-right: 15px
  
  i
    font-size: 24px
    color: white

.stat-info
  flex: 1

.stat-value
  font-size: 24px
  font-weight: bold
  color: var(--btc-text-primary)

.stat-label
  font-size: 14px
  color: var(--btc-text-secondary)
  margin-top: 5px

.chart-row
  margin-bottom: 20px

.chart
  height: 300px

.table-card
  .el-card__header
    display: flex
    justify-content: space-between
    align-items: center

.pagination
  margin-top: 20px
  display: flex
  justify-content: center
</style>
```

### 5. 创建品质应用主页面
创建`apps/quality/src/App.vue`：
```vue
<template>
  <div id="app">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1>BTC品质管理系统</h1>
          <div class="header-actions">
            <el-button @click="toggleTheme">切换主题</el-button>
            <el-dropdown>
              <el-button>
                用户菜单 <el-icon><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      
      <el-container>
        <el-aside width="200px">
          <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="dashboard">
              <el-icon><data-board /></el-icon>
              <span>仪表板</span>
            </el-menu-item>
            <el-menu-item index="inspection">
              <el-icon><search /></el-icon>
              <span>品质检测</span>
            </el-menu-item>
            <el-menu-item index="report">
              <el-icon><document /></el-icon>
              <span>检测报告</span>
            </el-menu-item>
            <el-menu-item index="statistics">
              <el-icon><pie-chart /></el-icon>
              <span>统计分析</span>
            </el-menu-item>
            <el-menu-item index="settings">
              <el-icon><setting /></el-icon>
              <span>系统设置</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { log } from '@btc/logs'

const router = useRouter()
const activeMenu = ref('dashboard')

const handleMenuSelect = (index: string) => {
  activeMenu.value = index
  router.push(`/${index}`)
  
  log.navigation('品质系统菜单切换', {
    menu: index,
    timestamp: Date.now()
  })
}

const toggleTheme = () => {
  log.sdk('切换主题', {
    action: 'toggle',
    timestamp: Date.now()
  })
  
  // 实现主题切换逻辑
  console.log('切换主题')
}

const logout = () => {
  log.auth('用户退出', {
    action: 'logout',
    timestamp: Date.now()
  })
  
  // 实现退出登录逻辑
  console.log('退出登录')
}
</script>

<style scoped lang="sass">
#app
  height: 100vh

.el-header
  background-color: var(--btc-primary)
  color: white
  line-height: 60px

.header-content
  display: flex
  justify-content: space-between
  align-items: center
  
  h1
    margin: 0
    font-size: 20px

.header-actions
  display: flex
  gap: 12px

.el-aside
  background-color: var(--btc-bg-secondary)
  border-right: 1px solid var(--el-border-color-light)

.sidebar-menu
  border-right: none

.el-main
  background-color: var(--btc-bg-primary)
  padding: 20px
</style>
```

## 产出物

- [x] `apps/quality/` - 品质系统应用
- [x] `packages/quality-components/` - 品质专用组件
- [x] 品质检测组件
- [x] 品质报告组件
- [x] 品质统计组件
- [x] 应用主页面

## 审计清单

- [ ] 品质系统独立运行
- [ ] 检测流程完整
- [ ] 报告生成正常
- [ ] 数据统计准确
- [ ] 组件复用性好
- [ ] 数据可视化
- [ ] 导出功能完整
