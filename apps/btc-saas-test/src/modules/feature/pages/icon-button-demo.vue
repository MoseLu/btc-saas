<template>
  <BasePage>
    <div class="icon-button-demo">
      <h1>IconButton 统一图标按钮组件演示</h1>
      <p>这是一个统一的图标按钮组件，以 TabBar 的图标按钮为标准，统一所有按钮级别的图标样式。</p>
      
      <!-- 基础用法 -->
      <section class="demo-section">
        <h2>基础用法</h2>
        <div class="demo-row">
          <div class="demo-item">
            <h3>简单图标按钮</h3>
            <div class="button-group">
              <IconButton icon="Setting" @click="handleClick" />
              <IconButton icon="Refresh" @click="handleClick" />
              <IconButton icon="Search" @click="handleClick" />
            </div>
          </div>
          
          <div class="demo-item">
            <h3>带提示的按钮</h3>
            <div class="button-group">
              <IconButton 
                icon="Setting" 
                tooltip="设置"
                @click="handleClick" 
              />
              <IconButton 
                icon="Refresh" 
                tooltip="刷新页面"
                @click="handleClick" 
              />
              <IconButton 
                icon="Search" 
                tooltip="搜索内容"
                @click="handleClick" 
              />
            </div>
          </div>
          
          <div class="demo-item">
            <h3>带文本的按钮</h3>
            <div class="button-group">
              <IconButton icon="Download" @click="handleClick">
                下载
              </IconButton>
              <IconButton icon="Upload" @click="handleClick">
                上传
              </IconButton>
              <IconButton icon="Edit" @click="handleClick">
                编辑
              </IconButton>
            </div>
          </div>
        </div>
      </section>
      
      <!-- 变体样式 -->
      <section class="demo-section">
        <h2>变体样式</h2>
        
        <div class="demo-row">
          <div class="demo-item">
            <h3>颜色变体</h3>
            <div class="button-group">
              <IconButton icon="Setting" variant="default" @click="handleClick" />
              <IconButton icon="Check" variant="primary" @click="handleClick" />
                  <IconButton icon="Check" variant="success" @click="handleClick" />
    <IconButton icon="Warning" variant="warning" @click="handleClick" />
    <IconButton icon="Delete" variant="danger" @click="handleClick" />
    <IconButton icon="Bell" variant="info" @click="handleClick" />
            </div>
          </div>
          
          <div class="demo-item">
            <h3>样式变体</h3>
            <div class="button-group">
              <IconButton icon="Setting" @click="handleClick" />
              <IconButton icon="Setting" plain @click="handleClick" />
              <IconButton icon="Setting" text @click="handleClick" />
              <IconButton icon="Setting" link @click="handleClick" />
              <IconButton icon="Setting" round @click="handleClick" />
            </div>
          </div>
          
          <div class="demo-item">
            <h3>尺寸变体</h3>
            <div class="button-group">
              <IconButton icon="Setting" size="small" @click="handleClick" />
              <IconButton icon="Setting" size="medium" @click="handleClick" />
              <IconButton icon="Setting" size="large" @click="handleClick" />
            </div>
          </div>
        </div>
      </section>
      
      <!-- 状态控制 -->
      <section class="demo-section">
        <h2>状态控制</h2>
        
        <div class="demo-row">
          <div class="demo-item">
            <h3>禁用状态</h3>
            <div class="button-group">
              <IconButton icon="Delete" @click="handleClick" />
              <IconButton icon="Delete" :disabled="true" @click="handleClick" />
              <IconButton icon="Delete" :disabled="isDeleting" @click="handleClick" />
            </div>
            <p class="demo-note">第二个按钮永久禁用，第三个按钮根据状态动态禁用</p>
          </div>
          
          <div class="demo-item">
            <h3>加载状态</h3>
            <div class="button-group">
              <IconButton icon="Refresh" @click="handleClick" />
              <IconButton icon="Refresh" :loading="isRefreshing" @click="handleClick" />
              <IconButton icon="Refresh" :loading="true" @click="handleClick" />
            </div>
            <p class="demo-note">第二个按钮根据状态动态加载，第三个按钮永久加载</p>
          </div>
          
          <div class="demo-item">
            <h3>交互状态</h3>
            <div class="button-group">
              <IconButton 
                icon="Edit" 
                :class="{ 'is-active': isEditing }"
                @click="toggleEditing"
                @mouseenter="handleMouseEnter"
                @mouseleave="handleMouseLeave"
              />
              <IconButton 
                icon="Star" 
                :class="{ 'is-active': isStarred }"
                @click="toggleStarred"
              />
            </div>
            <p class="demo-note">点击按钮查看交互状态变化</p>
          </div>
        </div>
      </section>
      
      <!-- 高级用法 -->
      <section class="demo-section">
        <h2>高级用法</h2>
        
        <div class="demo-row">
          <div class="demo-item">
            <h3>自定义图标尺寸</h3>
            <div class="button-group">
              <IconButton icon="Search" :icon-size="12" @click="handleClick" />
              <IconButton icon="Search" :icon-size="16" @click="handleClick" />
              <IconButton icon="Search" :icon-size="20" @click="handleClick" />
              <IconButton icon="Search" :icon-size="24" @click="handleClick" />
            </div>
          </div>
          
          <div class="demo-item">
            <h3>自定义提示位置</h3>
            <div class="button-group">
              <IconButton 
                icon="Help" 
                tooltip="顶部提示"
                tooltip-placement="top"
                @click="handleClick"
              />
              <IconButton 
                icon="Help" 
                tooltip="右侧提示"
                tooltip-placement="right"
                @click="handleClick"
              />
              <IconButton 
                icon="Help" 
                tooltip="底部提示"
                tooltip-placement="bottom"
                @click="handleClick"
              />
              <IconButton 
                icon="Help" 
                tooltip="左侧提示"
                tooltip-placement="left"
                @click="handleClick"
              />
            </div>
          </div>
          
          <div class="demo-item">
            <h3>提示主题</h3>
            <div class="button-group">
              <IconButton 
                icon="Bell" 
                tooltip="深色主题提示"
                tooltip-effect="dark"
                @click="handleClick"
              />
              <IconButton 
                icon="Bell" 
                tooltip="浅色主题提示"
                tooltip-effect="light"
                @click="handleClick"
              />
            </div>
          </div>
        </div>
      </section>
      
      <!-- 实际应用示例 -->
      <section class="demo-section">
        <h2>实际应用示例</h2>
        
        <div class="demo-row">
          <div class="demo-item">
            <h3>页面操作按钮</h3>
            <div class="button-group">
              <IconButton 
                icon="Plus" 
                variant="primary"
                tooltip="新增"
                @click="handleAdd"
              />
              <IconButton 
                icon="Edit" 
                variant="warning"
                tooltip="编辑"
                @click="handleEdit"
              />
              <IconButton 
                icon="Delete" 
                variant="danger"
                tooltip="删除"
                @click="handleDelete"
              />
              <IconButton 
                icon="Download" 
                variant="success"
                tooltip="导出"
                @click="handleExport"
              />
              <IconButton 
                icon="Search" 
                tooltip="搜索"
                @click="handleSearch"
              />
            </div>
          </div>
          
          <div class="demo-item">
            <h3>工具栏按钮</h3>
            <div class="button-group">
              <IconButton 
                icon="Setting" 
                tooltip="加粗"
                :class="{ 'is-active': isBold }"
                @click="toggleBold"
              />
              <IconButton 
                icon="Edit" 
                tooltip="斜体"
                :class="{ 'is-active': isItalic }"
                @click="toggleItalic"
              />
              <IconButton 
                icon="Link" 
                tooltip="下划线"
                :class="{ 'is-active': isUnderline }"
                @click="toggleUnderline"
              />
              <IconButton 
                icon="Link" 
                tooltip="插入链接"
                @click="insertLink"
              />
            </div>
          </div>
          
          <div class="demo-item">
            <h3>导航按钮</h3>
            <div class="button-group">
              <IconButton 
                icon="ArrowLeft" 
                tooltip="上一个"
                @click="goPrevious"
              />
              <IconButton 
                icon="ArrowRight" 
                tooltip="下一个"
                @click="goNext"
              />
              <IconButton 
                icon="HomeFilled" 
                tooltip="首页"
                @click="goHome"
              />
              <IconButton 
                icon="Refresh" 
                tooltip="刷新"
                @click="refresh"
              />
            </div>
          </div>
        </div>
      </section>
      
      <!-- 事件处理演示 -->
      <section class="demo-section">
        <h2>事件处理演示</h2>
        <div class="demo-row">
          <div class="demo-item">
            <h3>事件监听</h3>
            <div class="button-group">
              <IconButton 
                icon="Bell" 
                tooltip="点击查看事件"
                @click="handleClick"
                @mouseenter="handleMouseEnter"
                @mouseleave="handleMouseLeave"
                @focus="handleFocus"
                @blur="handleBlur"
              />
            </div>
            <div class="event-log">
              <h4>事件日志：</h4>
              <ul>
                <li v-for="(event, index) in eventLog" :key="index">
                  {{ event }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  </BasePage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BasePage from '../../../components/BasePage.vue'
import IconButton from '../../../components/IconButton.vue'
import { 
  Setting, Refresh, Search, Download, Upload, Edit, 
  Check, Warning, Delete, Plus, 
  Bell, Link, ArrowLeft, 
  ArrowRight, HomeFilled, Star
} from '@element-plus/icons-vue'

// 状态变量
const isDeleting = ref(false)
const isRefreshing = ref(false)
const isEditing = ref(false)
const isStarred = ref(false)
const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)

// 事件日志
const eventLog = ref<string[]>([])

// 添加事件日志
const addEventLog = (event: string) => {
  const timestamp = new Date().toLocaleTimeString()
  eventLog.value.unshift(`[${timestamp}] ${event}`)
  if (eventLog.value.length > 10) {
    eventLog.value = eventLog.value.slice(0, 10)
  }
}

// 基础点击处理
const handleClick = () => {
  addEventLog('按钮被点击')
}

// 状态切换
const toggleEditing = () => {
  isEditing.value = !isEditing.value
  addEventLog(`编辑状态: ${isEditing.value ? '开启' : '关闭'}`)
}

const toggleStarred = () => {
  isStarred.value = !isStarred.value
  addEventLog(`收藏状态: ${isStarred.value ? '已收藏' : '未收藏'}`)
}

const toggleBold = () => {
  isBold.value = !isBold.value
  addEventLog(`加粗状态: ${isBold.value ? '开启' : '关闭'}`)
}

const toggleItalic = () => {
  isItalic.value = !isItalic.value
  addEventLog(`斜体状态: ${isItalic.value ? '开启' : '关闭'}`)
}

const toggleUnderline = () => {
  isUnderline.value = !isUnderline.value
  addEventLog(`下划线状态: ${isUnderline.value ? '开启' : '关闭'}`)
}

// 页面操作
const handleAdd = () => {
  addEventLog('新增操作')
}

const handleEdit = () => {
  addEventLog('编辑操作')
}

const handleDelete = () => {
  addEventLog('删除操作')
}

const handleExport = () => {
  addEventLog('导出操作')
}

const handleSearch = () => {
  addEventLog('搜索操作')
}

// 工具栏操作
const insertLink = () => {
  addEventLog('插入链接')
}

// 导航操作
const goPrevious = () => {
  addEventLog('上一个')
}

const goNext = () => {
  addEventLog('下一个')
}

const goHome = () => {
  addEventLog('回到首页')
}

const refresh = () => {
  addEventLog('刷新页面')
}

// 鼠标事件
const handleMouseEnter = () => {
  addEventLog('鼠标进入')
}

const handleMouseLeave = () => {
  addEventLog('鼠标离开')
}

const handleFocus = () => {
  addEventLog('获得焦点')
}

const handleBlur = () => {
  addEventLog('失去焦点')
}
</script>

<style lang="scss" scoped>
.icon-button-demo {
  padding: 20px;
  
  h1 {
    color: var(--el-text-color-primary);
    margin-bottom: 16px;
    font-size: 24px;
  }
  
  p {
    color: var(--el-text-color-regular);
    margin-bottom: 32px;
    line-height: 1.6;
  }
}

.demo-section {
  margin-bottom: 40px;
  
  h2 {
    color: var(--el-text-color-primary);
    margin-bottom: 20px;
    font-size: 20px;
    border-bottom: 2px solid var(--el-border-color-light);
    padding-bottom: 8px;
  }
}

.demo-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.demo-item {
  h3 {
    color: var(--el-text-color-primary);
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
  }
  
  .demo-note {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    margin-top: 8px;
    font-style: italic;
  }
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.event-log {
  margin-top: 16px;
  
  h4 {
    color: var(--el-text-color-primary);
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 120px;
    overflow-y: auto;
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
    padding: 8px;
    background: var(--el-fill-color-light);
    
    li {
      color: var(--el-text-color-regular);
      font-size: 12px;
      padding: 2px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);
      
      &:last-child {
        border-bottom: none;
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .demo-row {
    grid-template-columns: 1fr;
  }
  
  .button-group {
    justify-content: center;
  }
}
</style>
