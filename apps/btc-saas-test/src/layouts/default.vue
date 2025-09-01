<template>
  <div class="layout-default">
    <header class="layout-header">
      <div class="header-content">
        <div class="logo">
          <h1>BTC SaaS</h1>
        </div>
        <nav class="main-nav">
          <router-link to="/" class="nav-item">首页</router-link>
          <router-link to="/mock" class="nav-item">Mock管理</router-link>
          <router-link to="/plugin" class="nav-item">插件管理</router-link>
          <router-link to="/service" class="nav-item">服务管理</router-link>
          <router-link to="/log" class="nav-item">日志查看</router-link>
        </nav>
        <div class="header-actions">
          <el-button size="small" @click="toggleTheme">
            <el-icon><Moon v-if="isDark" /><Sunny v-else /></el-icon>
          </el-button>
        </div>
      </div>
    </header>

    <main class="layout-main">
      <slot />
    </main>

    <footer class="layout-footer">
      <div class="footer-content">
        <p>&copy; 2024 BTC SaaS. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useThemeWaveSwitch } from '../composables/useThemeWaveSwitch'

// 使用统一的主题切换 composable
const { start } = useThemeWaveSwitch((next: 'light' | 'dark') => {
  document.documentElement.classList.toggle('dark', next === 'dark');
})

// 使用 ref 来跟踪主题状态
const isDark = ref(document.documentElement.classList.contains('dark'))

// 监听主题变化，但避免循环调用
watch(() => document.documentElement.classList.contains('dark'), (newValue, oldValue) => {
  // 只有当值真正改变时才更新
  if (newValue !== oldValue) {
    isDark.value = newValue
  }
}, { immediate: true })

const toggleTheme = () => {
  // 直接检查 DOM 状态，而不是依赖响应式变量
  const currentIsDark = document.documentElement.classList.contains('dark');
  const next = currentIsDark ? 'light' : 'dark';
  start(next);
}
</script>

<style lang="scss" scoped>
@use '../assets/styles/variables.scss' as *;

.layout-default {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-header {
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 0 $spacing-lg;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.logo {
  h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--el-color-primary);
  }
}

.main-nav {
  display: flex;
  gap: $spacing-lg;
}

.nav-item {
  text-decoration: none;
  color: var(--el-text-color-regular);
  font-weight: 500;
  padding: $spacing-sm $spacing-md;
  border-radius: 6px;
  transition: all 0.3s ease;
  
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
  
  &.router-link-active {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}

.header-actions {
  display: flex;
  gap: $spacing-sm;
}

.layout-main {
  flex: 1;
  background: var(--el-bg-color-page);
}

.layout-footer {
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-light);
  padding: $spacing-lg;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  
  p {
    margin: 0;
    color: var(--el-text-color-secondary);
    font-size: 0.875rem;
  }
}

/* 暗色模式适配 */
html.dark {
  .layout-header {
    background: var(--el-bg-color);
    border-color: var(--el-border-color);
  }
  
  .layout-footer {
    background: var(--el-bg-color);
    border-color: var(--el-border-color);
  }
}
</style>
