<template>
  <div class="plugin-manager">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>插件管理</span>
          <div class="header-actions">
            <el-button @click="exportConfig">导出配置</el-button>
            <el-button @click="importConfig">导入配置</el-button>
            <el-button type="primary" @click="refreshPlugins">刷新插件</el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="pluginList" style="width: 100%">
        <el-table-column prop="name" label="插件名称" width="150" />
        <el-table-column prop="plugin.description" label="描述" />
        <el-table-column prop="plugin.version" label="版本" width="100" />
        <el-table-column prop="plugin.author" label="作者" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.config.enabled"
              @change="togglePlugin(scope.row.name, $event)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button
              size="small"
              @click="configurePlugin(scope.row.name)"
            >
              配置
            </el-button>
            <el-button
              size="small"
              type="warning"
              @click="resetPlugin(scope.row.name)"
            >
              重置
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="uninstallPlugin(scope.row.name)"
            >
              卸载
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 插件配置对话框 -->
    <el-dialog
      v-model="configDialogVisible"
      title="插件配置"
      width="600px"
    >
      <el-form :model="currentConfig" label-width="100px">
        <el-form-item label="启用插件">
          <el-switch v-model="currentConfig.enabled" />
        </el-form-item>
        <el-form-item label="配置参数">
          <el-input
            v-model="configJson"
            type="textarea"
            :rows="15"
            placeholder="请输入JSON格式的配置"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="configDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveConfig">保存</el-button>
      </template>
    </el-dialog>

    <!-- 导入配置对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入配置"
      width="500px"
    >
      <el-form>
        <el-form-item label="配置JSON">
          <el-input
            v-model="importConfigJson"
            type="textarea"
            :rows="15"
            placeholder="请输入要导入的配置JSON"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleImportConfig">导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { pluginManager } from '../manager';
import { pluginConfigManager } from '../config';

const configDialogVisible = ref(false);
const importDialogVisible = ref(false);
const currentPluginName = ref('');
const currentConfig = ref({ enabled: true, settings: {} });
const importConfigJson = ref('');

const pluginList = computed(() => {
  return pluginManager.getPlugins().map(({ name, plugin, config }) => ({
    name,
    plugin,
    config: pluginConfigManager.getPluginConfig(name)
  }));
});

const configJson = computed({
  get: () => JSON.stringify(currentConfig.value.settings, null, 2),
  set: (value: string) => {
    try {
      currentConfig.value.settings = JSON.parse(value);
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  }
});

const refreshPlugins = async () => {
  try {
    await pluginManager.reloadPlugins();
    ElMessage.success('插件刷新成功');
  } catch (error) {
    ElMessage.error('插件刷新失败');
    console.error('Failed to refresh plugins:', error);
  }
};

const togglePlugin = (name: string, enabled: boolean) => {
  if (enabled) {
    pluginConfigManager.enablePlugin(name);
    ElMessage.success(`插件 ${name} 已启用`);
  } else {
    pluginConfigManager.disablePlugin(name);
    ElMessage.warning(`插件 ${name} 已禁用`);
  }
};

const configurePlugin = (name: string) => {
  currentPluginName.value = name;
  currentConfig.value = pluginConfigManager.getPluginConfig(name);
  configDialogVisible.value = true;
};

const saveConfig = () => {
  try {
    pluginConfigManager.updatePluginConfig(currentPluginName.value, currentConfig.value);
    configDialogVisible.value = false;
    ElMessage.success('配置保存成功');
  } catch (error) {
    ElMessage.error('配置保存失败');
    console.error('Failed to save config:', error);
  }
};

const resetPlugin = (name: string) => {
  try {
    pluginConfigManager.resetPluginConfig(name);
    ElMessage.success(`插件 ${name} 配置已重置`);
  } catch (error) {
    ElMessage.error('配置重置失败');
    console.error('Failed to reset plugin config:', error);
  }
};

const uninstallPlugin = (name: string) => {
  // 这里可以实现插件卸载逻辑
  ElMessage.warning(`插件 ${name} 卸载功能待实现`);
};

const exportConfig = () => {
  try {
    const config = pluginConfigManager.exportConfig();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plugin-config.json';
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success('配置导出成功');
  } catch (error) {
    ElMessage.error('配置导出失败');
    console.error('Failed to export config:', error);
  }
};

const importConfig = () => {
  importDialogVisible.value = true;
};

const handleImportConfig = () => {
  try {
    if (pluginConfigManager.validateConfig(importConfigJson.value)) {
      const success = pluginConfigManager.importConfig(importConfigJson.value);
      if (success) {
        importDialogVisible.value = false;
        importConfigJson.value = '';
        ElMessage.success('配置导入成功');
      } else {
        ElMessage.error('配置导入失败');
      }
    } else {
      ElMessage.error('配置格式无效');
    }
  } catch (error) {
    ElMessage.error('配置导入失败');
    console.error('Failed to import config:', error);
  }
};
</script>

<style scoped>
.plugin-manager {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}
</style>
