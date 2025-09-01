<template>
  <div class="filters-section">
    <div class="filters-row">
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索Mock接口、服务或端点..."
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      
      <el-select
        v-model="selectedMethod"
        placeholder="HTTP方法"
        clearable
        style="width: 120px"
        @change="handleSearch"
      >
        <el-option label="GET" value="GET" />
        <el-option label="POST" value="POST" />
        <el-option label="PUT" value="PUT" />
        <el-option label="DELETE" value="DELETE" />
        <el-option label="PATCH" value="PATCH" />
      </el-select>

      <el-select
        v-model="selectedStatus"
        placeholder="状态"
        clearable
        style="width: 120px"
        @change="handleSearch"
      >
        <el-option label="已启用" value="enabled" />
        <el-option label="已禁用" value="disabled" />
        <el-option label="待实现" value="inactive" />
      </el-select>

      <el-button type="primary" @click="$emit('refresh')">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'

interface Filters {
  searchQuery: string
  selectedMethod: string
  selectedStatus: string
}

const emit = defineEmits<{
  update: [filters: Filters]
  refresh: []
}>()

const searchQuery = ref('')
const selectedMethod = ref('')
const selectedStatus = ref('')

const handleSearch = () => {
  emit('update', {
    searchQuery: searchQuery.value,
    selectedMethod: selectedMethod.value,
    selectedStatus: selectedStatus.value
  })
}

// 监听过滤器变化
watch([searchQuery, selectedMethod, selectedStatus], handleSearch, { immediate: true })
</script>

<style lang="scss" scoped>
@use '../../../assets/styles/variables.scss' as *;

.filters-section {
  margin-bottom: $spacing-lg;
  padding: $spacing-md;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.filters-row {
  display: flex;
  gap: $spacing-md;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

/* 暗色模式适配 */
html.dark {
  .filters-section {
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color);
  }
}
</style>
