#!/usr/bin/env node

/**
 * 测试图片保存功能
 */

import { config } from 'dotenv';
import { processImages } from './dist/utils/image-saver.js';
import { initializeLogger } from './dist/utils/logger.js';
import { homedir } from 'os';
import { join } from 'path';
import { promises as fs } from 'fs';

// 加载环境变量
config();

async function testImageSaving() {
  try {
    // 初始化日志
    await initializeLogger('info');
    
    console.log('🖼️ 开始测试图片保存功能...');
    
    // 测试用的图片URL（使用一个公开的测试图片）
    const testImageUrls = [
      'https://picsum.photos/512/512?random=1',
      'https://picsum.photos/512/512?random=2'
    ];
    
    console.log('📋 测试配置:');
    console.log('- 测试图片数量:', testImageUrls.length);
    
    // 测试不同的保存模式
    const testCases = [
      {
        name: 'URL模式测试',
        mode: 'url',
        basePath: undefined
      },
      {
        name: '本地保存模式测试（默认路径）',
        mode: 'local',
        basePath: join(homedir(), 'Desktop', 'irag-images-test')
      },
      {
        name: '本地保存模式测试（自定义路径）',
        mode: 'local',
        basePath: join(process.cwd(), 'test-images')
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n🧪 ${testCase.name}`);
      console.log('- 模式:', testCase.mode);
      console.log('- 路径:', testCase.basePath || '无');
      
      try {
        const startTime = Date.now();
        const results = await processImages(
          testImageUrls,
          testCase.mode,
          testCase.basePath
        );
        const endTime = Date.now();
        
        console.log('⏱️ 处理耗时:', (endTime - startTime) / 1000, '秒');
        console.log('📊 处理结果:');
        
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          console.log(`\n  图片 ${i + 1}:`);
          console.log('  - 成功:', result.success ? '✅' : '❌');
          console.log('  - URL:', result.url);
          
          if (result.success) {
            console.log('  - Base64长度:', result.base64?.length || 0);
            if (result.localPath) {
              console.log('  - 本地路径:', result.localPath);
              
              // 验证文件是否存在
              try {
                const stats = await fs.stat(result.localPath);
                console.log('  - 文件大小:', stats.size, 'bytes');
                console.log('  - 文件验证: ✅');
              } catch (e) {
                console.log('  - 文件验证: ❌ 文件不存在');
              }
            }
          } else {
            console.log('  - 错误:', result.error);
          }
        }
        
        // 统计成功率
        const successCount = results.filter(r => r.success).length;
        const successRate = (successCount / results.length * 100).toFixed(1);
        console.log(`\n📈 成功率: ${successCount}/${results.length} (${successRate}%)`);
        
        if (testCase.mode === 'local' && testCase.basePath) {
          // 测试目录统计功能
          try {
            const { getImageStats } = await import('./dist/utils/image-saver.js');
            const stats = await getImageStats(testCase.basePath);
            console.log('📁 目录统计:');
            console.log('  - 图片总数:', stats.totalImages);
            console.log('  - 总大小:', (stats.totalSize / 1024).toFixed(1), 'KB');
            if (stats.newestImage) {
              console.log('  - 最新图片:', stats.newestImage);
            }
          } catch (e) {
            console.log('📁 目录统计失败:', e.message);
          }
        }
        
      } catch (error) {
        console.error('❌ 测试失败:', error.message);
      }
    }
    
    console.log('\n🎉 图片保存功能测试完成！');
    
    // 清理测试文件
    console.log('\n🧹 清理测试文件...');
    for (const testCase of testCases) {
      if (testCase.mode === 'local' && testCase.basePath) {
        try {
          await fs.rmdir(testCase.basePath, { recursive: true });
          console.log('✅ 已清理:', testCase.basePath);
        } catch (e) {
          console.log('⚠️ 清理失败:', testCase.basePath, '-', e.message);
        }
      }
    }
    
    console.log('\n💡 使用建议:');
    console.log('1. 在.env文件中设置 RESOURCE_MODE=local 启用本地保存');
    console.log('2. 设置 BASE_PATH 指定自定义保存路径');
    console.log('3. 生成的图片将同时返回base64数据和本地文件路径');
    console.log('4. 在Claude Desktop中可以看到图片和保存路径信息');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
testImageSaving().catch(console.error);
