const sass = require('sass');
const fs = require('fs');
const path = require('path');

try {
  // 确保 dist 目录存在
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  
  // 编译 SCSS
  const result = sass.compile('src/index.scss', {
    style: 'compressed'
  });
  
  // 写入 CSS 文件
  fs.writeFileSync('dist/index.css', result.css);
  
  console.log('Styles built successfully');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
