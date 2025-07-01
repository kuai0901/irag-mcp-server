#!/usr/bin/env node

/**
 * 端到端测试：实际调用百度iRAG API生成图片
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 检查是否提供了真实的API Key
if (!process.env.BAIDU_API_KEY || process.env.BAIDU_API_KEY.includes('test123')) {
  console.log('❌ 需要真实的百度API Key来进行端到端测试');
  console.log('请设置环境变量: BAIDU_API_KEY=bce-v3/ALTAK-your-key/your-secret');
  console.log('或在.env文件中配置真实的API Key');
  process.exit(1);
}

console.log('🚀 启动端到端图片生成测试...');
console.log('📝 API Key:', process.env.BAIDU_API_KEY.substring(0, 20) + '...');

// 启动服务器进程
const serverPath = join(__dirname, 'dist', 'index.js');
const serverProcess = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env
});

let serverReady = false;
let testResult = {
  serverStarted: false,
  toolCalled: false,
  imageGenerated: false,
  base64Received: false,
  error: null
};

// 监听服务器输出
serverProcess.stdout.on('data', (data) => {
  const text = data.toString();
  console.log('📤 服务器:', text.trim());
  
  if (text.includes('MCP服务器已启动')) {
    testResult.serverStarted = true;
    serverReady = true;
    console.log('✅ 服务器启动成功，开始测试图片生成...');
    
    // 等待1秒后开始测试
    setTimeout(testImageGeneration, 1000);
  }
});

serverProcess.stderr.on('data', (data) => {
  const text = data.toString();
  console.log('❌ 服务器错误:', text.trim());
  testResult.error = text;
});

// 模拟MCP客户端调用
async function testImageGeneration() {
  try {
    console.log('🎨 开始测试图片生成...');
    
    // 构造MCP工具调用请求
    const toolRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'generate_image',
        arguments: {
          prompt: '一只可爱的小猫咪，坐在阳光明媚的花园里',
          model: 'irag-1.0',
          size: '512x512',
          n: 1
        }
      }
    };
    
    console.log('📨 发送工具调用请求:', JSON.stringify(toolRequest, null, 2));
    
    // 发送请求到服务器
    serverProcess.stdin.write(JSON.stringify(toolRequest) + '\n');
    testResult.toolCalled = true;
    
    // 设置响应监听器
    let responseBuffer = '';
    const responseHandler = (data) => {
      responseBuffer += data.toString();
      
      // 尝试解析JSON响应
      const lines = responseBuffer.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          try {
            const response = JSON.parse(line);
            console.log('📥 收到响应:', JSON.stringify(response, null, 2));
            
            if (response.id === 1) {
              handleToolResponse(response);
              serverProcess.stdout.removeListener('data', responseHandler);
              return;
            }
          } catch (e) {
            // 忽略JSON解析错误，继续等待完整响应
          }
        }
      }
    };
    
    serverProcess.stdout.on('data', responseHandler);
    
    // 30秒超时
    setTimeout(() => {
      if (!testResult.imageGenerated) {
        console.log('⏰ 图片生成测试超时');
        finishTest();
      }
    }, 30000);
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    testResult.error = error.message;
    finishTest();
  }
}

function handleToolResponse(response) {
  try {
    if (response.error) {
      console.log('❌ 工具调用失败:', response.error);
      testResult.error = response.error.message || JSON.stringify(response.error);
    } else if (response.result) {
      console.log('✅ 工具调用成功！');
      testResult.imageGenerated = true;
      
      // 检查响应内容
      const content = response.result.content || [];
      console.log(`📊 响应包含 ${content.length} 个内容项`);
      
      let hasImage = false;
      let hasText = false;
      
      for (const item of content) {
        if (item.type === 'image') {
          hasImage = true;
          if (item.data && typeof item.data === 'string' && item.data.length > 100) {
            testResult.base64Received = true;
            console.log('✅ 收到base64图片数据，长度:', item.data.length);
            console.log('🖼️ MIME类型:', item.mimeType);
            
            // 验证base64格式
            try {
              Buffer.from(item.data, 'base64');
              console.log('✅ Base64格式验证通过');
            } catch (e) {
              console.log('❌ Base64格式验证失败:', e.message);
            }
          } else {
            console.log('❌ 图片数据无效或为空');
          }
        } else if (item.type === 'text') {
          hasText = true;
          console.log('📝 文本内容:', item.text);
        }
      }
      
      if (!hasImage) {
        console.log('❌ 响应中没有图片内容');
      }
      if (!hasText) {
        console.log('❌ 响应中没有文本内容');
      }
    }
  } catch (error) {
    console.error('❌ 处理响应时发生错误:', error);
    testResult.error = error.message;
  }
  
  finishTest();
}

function finishTest() {
  console.log('\n📊 测试结果汇总:');
  console.log('- 服务器启动:', testResult.serverStarted ? '✅ 成功' : '❌ 失败');
  console.log('- 工具调用:', testResult.toolCalled ? '✅ 成功' : '❌ 失败');
  console.log('- 图片生成:', testResult.imageGenerated ? '✅ 成功' : '❌ 失败');
  console.log('- Base64接收:', testResult.base64Received ? '✅ 成功' : '❌ 失败');
  
  if (testResult.error) {
    console.log('- 错误信息:', testResult.error);
  }
  
  console.log('\n🛑 关闭服务器...');
  serverProcess.kill('SIGTERM');
  
  // 判断测试是否成功
  const success = testResult.serverStarted && 
                 testResult.toolCalled && 
                 testResult.imageGenerated && 
                 testResult.base64Received && 
                 !testResult.error;
  
  if (success) {
    console.log('\n🎉 端到端测试完全成功！');
    process.exit(0);
  } else {
    console.log('\n💥 端到端测试失败！');
    process.exit(1);
  }
}

// 超时处理
setTimeout(() => {
  console.log('\n⏰ 整体测试超时，强制关闭...');
  serverProcess.kill('SIGKILL');
  process.exit(1);
}, 60000);

// 进程退出处理
serverProcess.on('close', (code) => {
  if (!testResult.imageGenerated) {
    console.log(`\n服务器进程退出，代码: ${code}`);
    finishTest();
  }
});
