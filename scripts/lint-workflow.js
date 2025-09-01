#!/usr/bin/env node

const { execSync } = require('node:child_process');

console.log('🔍 开始双重语法检查工作流...\n');

// 颜色输出函数
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
};

// 执行命令并处理错误
function runCommand(command, description) {
  console.log(colors.blue(`📋 ${description}...`));
  try {
    const output = execSync(command, {
      stdio: 'pipe',
      encoding: 'utf8',
      cwd: process.cwd(),
    });
    console.log(colors.green(`✅ ${description} 完成`));
    return { success: true, output };
  } catch (error) {
    console.log(colors.red(`❌ ${description} 失败`));
    console.log(colors.yellow(`错误信息: ${error.message}`));
    return { success: false, error: error.message };
  }
}

// 第一步：Biome 自动修复
console.log(colors.blue('🔄 第一步：Biome 自动修复'));
const biomeResult = runCommand('pnpm lint:biome:fix', 'Biome 自动修复');

if (!biomeResult.success) {
  console.log(colors.yellow('⚠️  Biome 修复失败，但继续执行...\n'));
}

// 第二步：Ultracite 检查
console.log(colors.blue('🔄 第二步：Ultracite 检查'));
const ultraciteCheckResult = runCommand('pnpm lint:ultracite', 'Ultracite 检查');

if (ultraciteCheckResult.success) {
  console.log(colors.green('✅ Ultracite 检查通过'));
} else {
  console.log(colors.yellow('⚠️  Ultracite 发现问题，尝试自动修复...'));

  // 第三步：Ultracite 自动修复
  const ultraciteFixResult = runCommand('pnpm lint:ultracite:fix', 'Ultracite 自动修复');

  if (ultraciteFixResult.success) {
    console.log(colors.green('✅ Ultracite 自动修复完成'));
  } else {
    console.log(colors.red('❌ Ultracite 自动修复失败'));
  }
}

// 第四步：最终检查
console.log(colors.blue('🔄 第四步：最终检查'));
const finalBiomeCheck = runCommand('pnpm lint:biome', '最终 Biome 检查');
const finalUltraciteCheck = runCommand('pnpm lint:ultracite', '最终 Ultracite 检查');

// 总结
console.log(`\n${colors.blue('📊 检查结果总结:')}`);
console.log(
  `Biome 检查: ${finalBiomeCheck.success ? colors.green('✅ 通过') : colors.red('❌ 失败')}`
);
console.log(
  `Ultracite 检查: ${finalUltraciteCheck.success ? colors.green('✅ 通过') : colors.red('❌ 失败')}`
);

if (finalBiomeCheck.success && finalUltraciteCheck.success) {
  console.log(colors.green('\n🎉 双重语法检查全部通过！'));
  process.exit(0);
} else {
  console.log(colors.red('\n⚠️  仍有问题需要手动修复'));
  process.exit(1);
}
