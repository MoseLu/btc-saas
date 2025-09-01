<!-- src/components/ThemeToggleButton.vue -->
<script setup lang="ts">
import { useThemeWaveSwitch } from '@/composables/useThemeWaveSwitch';

const { start } = useThemeWaveSwitch();

function onToggle() {
  const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  start(next);
}
</script>

<template>
  <el-button type="primary" @click="onToggle">切换主题</el-button>
</template>