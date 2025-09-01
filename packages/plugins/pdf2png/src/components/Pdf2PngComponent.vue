<template>
  <div class="pdf2png-component">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>PDF转PNG工具</span>
        </div>
      </template>
      
      <el-form :model="form" label-width="100px">
        <el-form-item label="PDF文件">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="handleFileChange"
            :before-upload="beforeUpload"
            accept=".pdf"
            drag
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将PDF文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                只能上传PDF文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="输出质量">
          <el-slider
            v-model="form.quality"
            :min="0.1"
            :max="1.0"
            :step="0.1"
            show-input
          />
        </el-form-item>
        
        <el-form-item label="缩放比例">
          <el-slider
            v-model="form.scale"
            :min="0.5"
            :max="3.0"
            :step="0.1"
            show-input
          />
        </el-form-item>
        
        <el-form-item label="输出格式">
          <el-select v-model="form.format">
            <el-option label="PNG" value="png" />
            <el-option label="JPEG" value="jpeg" />
            <el-option label="WebP" value="webp" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="converting"
            @click="convertFile"
            :disabled="!selectedFile"
          >
            开始转换
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 转换结果 -->
      <div v-if="convertedImages.length > 0" class="conversion-results">
        <h3>转换结果</h3>
        <div class="image-grid">
          <div
            v-for="(image, index) in convertedImages"
            :key="index"
            class="image-item"
          >
            <img :src="image.url" :alt="`Page ${index + 1}`" />
            <div class="image-actions">
              <el-button size="small" @click="downloadImage(image)">
                下载
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

interface ConvertedImage {
  url: string;
  filename: string;
  page: number;
}

const uploadRef = ref();
const selectedFile = ref<File | null>(null);
const converting = ref(false);
const convertedImages = ref<ConvertedImage[]>([]);

const form = reactive({
  quality: 0.8,
  scale: 1.0,
  format: 'png'
});

const handleFileChange = (file: any) => {
  selectedFile.value = file.raw;
};

const beforeUpload = (file: File) => {
  const isPDF = file.type === 'application/pdf';
  if (!isPDF) {
    ElMessage.error('只能上传PDF文件！');
    return false;
  }
  return false; // 阻止自动上传
};

const convertFile = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择PDF文件');
    return;
  }
  
  converting.value = true;
  
  try {
    // 模拟转换过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 模拟转换结果
    const mockImages: ConvertedImage[] = [
      {
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        filename: `page-1.${form.format}`,
        page: 1
      },
      {
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        filename: `page-2.${form.format}`,
        page: 2
      }
    ];
    
    convertedImages.value = mockImages;
    ElMessage.success('转换完成！');
  } catch (error) {
    ElMessage.error('转换失败');
    console.error('Conversion failed:', error);
  } finally {
    converting.value = false;
  }
};

const resetForm = () => {
  form.quality = 0.8;
  form.scale = 1.0;
  form.format = 'png';
  selectedFile.value = null;
  convertedImages.value = [];
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
};

const downloadImage = (image: ConvertedImage) => {
  const link = document.createElement('a');
  link.href = image.url;
  link.download = image.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  ElMessage.success('下载开始');
};
</script>

<style scoped>
.pdf2png-component {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.conversion-results {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.image-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.image-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.image-actions {
  padding: 8px;
  text-align: center;
  background: #f5f5f5;
}
</style>
