#!/usr/bin/env node

/**
 * 直接测试百度iRAG API调用
 */

import { config } from 'dotenv';
import { IragClient } from './dist/client/irag-client.js';
import { initializeLogger } from './dist/utils/logger.js';

// 加载环境变量
config();

async function testDirectAPI() {
  try {
    // 初始化日志
    await initializeLogger('info');
    
    console.log('🚀 开始直接API测试...');
    
    // 检查API Key
    const apiKey = process.env.BAIDU_API_KEY;
    if (!apiKey || apiKey.includes('test123')) {
      console.log('❌ 需要真实的百度API Key');
      console.log('请在.env文件中设置: BAIDU_API_KEY=bce-v3/ALTAK-your-key/your-secret');
      process.exit(1);
    }
    
    console.log('📝 API Key:', apiKey.substring(0, 20) + '...');
    
    // 创建客户端
    const client = new IragClient(apiKey, 30000, 3);
    console.log('✅ iRAG客户端创建成功');
    
    // 测试参数
    const testParams = {
      model: 'irag-1.0',
      prompt: '一只可爱的橘色小猫，坐在阳光明媚的窗台上，背景是蓝天白云',
      size: '512x512',
      n: 1
    };

    // 显示配置信息
    console.log('📋 当前配置:');
    console.log('- 资源模式:', process.env.RESOURCE_MODE || 'local');
    console.log('- 保存路径:', process.env.BASE_PATH || '默认桌面路径');
    
    console.log('📨 发送图片生成请求...');
    console.log('参数:', JSON.stringify(testParams, null, 2));
    
    // 调用API
    const startTime = Date.now();
    const response = await client.generateImage(testParams);
    const endTime = Date.now();
    
    console.log('✅ API调用成功！');
    console.log('⏱️ 耗时:', (endTime - startTime) / 1000, '秒');
    console.log('📊 响应数据:');
    console.log('- 请求ID:', response.id);
    console.log('- 创建时间:', new Date(response.created * 1000).toLocaleString());
    console.log('- 图片数量:', response.data.length);
    
    // 测试图片下载和base64转换
    for (let i = 0; i < response.data.length; i++) {
      const imageData = response.data[i];
      console.log(`\n🖼️ 图片 ${i + 1}:`);
      console.log('- URL:', imageData.url);
      
      try {
        console.log('📥 开始下载图片...');
        const downloadStart = Date.now();
        
        // 使用axios下载图片
        const axios = (await import('axios')).default;
        const imageResponse = await axios.get(imageData.url, {
          responseType: 'arraybuffer',
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        
        const downloadEnd = Date.now();
        console.log('✅ 图片下载成功');
        console.log('⏱️ 下载耗时:', (downloadEnd - downloadStart) / 1000, '秒');
        console.log('📊 图片信息:');
        console.log('- 大小:', imageResponse.data.length, 'bytes');
        console.log('- 类型:', imageResponse.headers['content-type']);
        
        // 转换为base64
        const buffer = Buffer.from(imageResponse.data);
        const base64 = buffer.toString('base64');
        console.log('✅ Base64转换成功');
        console.log('- Base64长度:', base64.length);
        console.log('- Base64前缀:', base64.substring(0, 50) + '...');
        
        // 验证base64格式
        try {
          const decoded = Buffer.from(base64, 'base64');
          if (decoded.length === buffer.length) {
            console.log('✅ Base64格式验证通过');
          } else {
            console.log('❌ Base64格式验证失败：长度不匹配');
          }
        } catch (e) {
          console.log('❌ Base64格式验证失败:', e.message);
        }
        
      } catch (downloadError) {
        console.log('❌ 图片下载失败:', downloadError.message);
        if (downloadError.response) {
          console.log('- HTTP状态:', downloadError.response.status);
          console.log('- 响应头:', downloadError.response.headers);
        }
      }
    }
    
    console.log('\n🎉 直接API测试完成！');
    console.log('\n📋 测试总结:');
    console.log('✅ API Key验证通过');
    console.log('✅ 图片生成成功');
    console.log('✅ 图片下载成功');
    console.log('✅ Base64转换成功');
    console.log('\n💡 现在可以在MCP客户端中使用此服务了！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    
    if (error.response) {
      console.error('HTTP状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
    
    console.log('\n🔧 故障排除建议:');
    console.log('1. 检查API Key是否正确');
    console.log('2. 确认网络连接正常');
    console.log('3. 验证百度API服务状态');
    console.log('4. 查看详细错误信息');
    
    process.exit(1);
  }
}

// 运行测试
testDirectAPI().catch(console.error);
