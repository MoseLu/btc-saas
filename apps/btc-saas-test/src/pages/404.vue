<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在或已被移除</p>
      <div class="actions">
        <el-button type="primary" @click="goHome">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回上页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HomeFilled, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

function goHome() {
  router.push('/')
}

function goBack() {
  router.back()
}
</script>

<style scoped lang="scss">
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 32px;
  
  .not-found-content {
    text-align: center;
    max-width: 400px;
    
    .error-code {
      font-size: 72px;
      font-weight: 700;
      color: var(--el-color-primary);
      margin-bottom: 16px;
      line-height: 1;
    }
    
    h2 {
      font-size: 24px;
      color: var(--el-text-color-primary);
      margin: 0 0 12px 0;
    }
    
    p {
      font-size: 16px;
      color: var(--el-text-color-regular);
      margin: 0 0 32px 0;
      line-height: 1.5;
    }
    
    .actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
  }
}
</style>
