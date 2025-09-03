<template>
  <div class="select-test">
    <h3>El-Select 测试组件</h3>
    
    <div class="test-section">
      <h4>基础选择器</h4>
      <el-select v-model="value1" placeholder="请选择">
        <el-option label="选项1" value="1" />
        <el-option label="选项2" value="2" />
        <el-option label="选项3" value="3" />
      </el-select>
      <p>当前值: {{ value1 }}</p>
    </div>

    <div class="test-section">
      <h4>多选选择器</h4>
      <el-select v-model="value2" multiple placeholder="请选择多个">
        <el-option label="选项A" value="A" />
        <el-option label="选项B" value="B" />
        <el-option label="选项C" value="C" />
      </el-select>
      <p>当前值: {{ value2 }}</p>
    </div>

    <div class="test-section">
      <h4>可过滤选择器</h4>
      <el-select v-model="value3" filterable placeholder="请输入搜索">
        <el-option label="苹果" value="apple" />
        <el-option label="香蕉" value="banana" />
        <el-option label="橙子" value="orange" />
      </el-select>
      <p>当前值: {{ value3 }}</p>
    </div>

    <div class="test-section">
      <h4>带图标的选择器</h4>
      <el-select v-model="value4" placeholder="选择图标">
        <el-option label="搜索" value="search">
          <el-icon><Search /></el-icon>
          <span style="margin-left: 8px">搜索</span>
        </el-option>
        <el-option label="编辑" value="edit">
          <el-icon><Edit /></el-icon>
          <span style="margin-left: 8px">编辑</span>
        </el-option>
      </el-select>
      <p>当前值: {{ value4 }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, Edit } from '@element-plus/icons-vue'

const value1 = ref('')
const value2 = ref([])
const value3 = ref('')
const value4 = ref('')
</script>

<style scoped>
.select-test {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fff;
}

.test-section h4 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
}

.test-section p {
  margin: 10px 0 0 0;
  color: #606266;
  font-size: 14px;
}

.el-select {
  width: 100%;
  margin-bottom: 10px;
}

/* 确保选择器在暗色主题下也可见 */
html.dark .test-section {
  background: #1d1e1f;
  border-color: #4c4d4f;
}

html.dark .test-section h4 {
  color: #e5eaf3;
}

html.dark .test-section p {
  color: #cfd3dc;
}
</style>
