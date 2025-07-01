#!/usr/bin/env node

/**
 * 测试MCP服务器基本功能
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 设置测试环境变量
process.env.BAIDU_API_KEY = 'bce-v3/ALTAK-test123/secret456';
process.env.LOG_LEVEL = 'info';

console.log('🚀 启动MCP服务器测试...');

// 启动服务器进程
const serverPath = join(__dirname, 'dist', 'index.js');
const serverProcess = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env
});

let output = '';
let hasStarted = false;

// 监听服务器输出
serverProcess.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  console.log('📤 服务器输出:', text.trim());
  
  if (text.includes('MCP服务器已启动')) {
    hasStarted = true;
    console.log('✅ 服务器启动成功！');
    
    // 等待一秒后关闭服务器
    setTimeout(() => {
      console.log('🛑 关闭服务器...');
      serverProcess.kill('SIGTERM');
    }, 1000);
  }
});

serverProcess.stderr.on('data', (data) => {
  const text = data.toString();
  console.log('❌ 服务器错误:', text.trim());
});

serverProcess.on('close', (code) => {
  console.log(`\n📊 测试结果:`);
  console.log(`- 退出代码: ${code}`);
  console.log(`- 服务器启动: ${hasStarted ? '✅ 成功' : '❌ 失败'}`);

  if (hasStarted) {
    console.log('\n🎉 MCP服务器测试通过！');
    process.exit(0);
  } else {
    console.log('\n💥 MCP服务器测试失败！');
    process.exit(1);
  }
});

// 超时处理
setTimeout(() => {
  console.log('\n⏰ 测试超时，强制关闭服务器...');
  serverProcess.kill('SIGKILL');
  process.exit(1);
}, 10000);
