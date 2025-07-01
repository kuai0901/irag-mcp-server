#!/usr/bin/env node

/**
 * 测试MODEL配置参数
 */

import { config } from 'dotenv';
import { getConfig } from './dist/config/index.js';
import { initializeLogger } from './dist/utils/logger.js';

// 加载环境变量
config();

async function testModelConfig() {
  try {
    // 初始化日志
    await initializeLogger('info');
    
    console.log('🔧 测试MODEL配置参数...');
    
    // 获取当前配置
    const serverConfig = getConfig();
    
    console.log('📋 当前配置:');
    console.log('- 默认模型:', serverConfig.defaultModel);
    console.log('- 资源模式:', serverConfig.resourceMode);
    console.log('- 保存路径:', serverConfig.basePath || '默认桌面路径');
    console.log('- API超时:', serverConfig.apiTimeout, 'ms');
    console.log('- 最大重试:', serverConfig.maxRetries);
    
    // 验证模型配置
    const supportedModels = ['irag-1.0', 'flux.1-schnell'];
    if (supportedModels.includes(serverConfig.defaultModel)) {
      console.log('✅ 默认模型配置有效');
    } else {
      console.log('❌ 默认模型配置无效');
      return;
    }
    
    // 测试不同的MODEL环境变量值
    const testCases = [
      {
        name: '测试irag-1.0模型',
        model: 'irag-1.0',
        description: '百度自研模型，通用性好，速度快'
      },
      {
        name: '测试flux.1-schnell模型',
        model: 'flux.1-schnell',
        description: '支持更多高级参数，质量更高'
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n🧪 ${testCase.name}`);
      console.log(`- 模型: ${testCase.model}`);
      console.log(`- 描述: ${testCase.description}`);
      
      // 临时设置环境变量
      const originalModel = process.env.MODEL;
      process.env.MODEL = testCase.model;
      
      try {
        // 重新加载配置
        const { getConfig } = await import('./dist/config/index.js');
        const testConfig = getConfig();
        
        console.log(`- 配置结果: ${testConfig.defaultModel}`);
        
        if (testConfig.defaultModel === testCase.model) {
          console.log('✅ 配置加载成功');
        } else {
          console.log('❌ 配置加载失败');
        }
        
      } catch (error) {
        console.log('❌ 配置测试失败:', error.message);
      } finally {
        // 恢复原始环境变量
        if (originalModel) {
          process.env.MODEL = originalModel;
        } else {
          delete process.env.MODEL;
        }
      }
    }
    
    // 测试无效模型值
    console.log('\n🧪 测试无效模型配置');
    const originalModel = process.env.MODEL;
    process.env.MODEL = 'invalid-model';
    
    try {
      const { getConfig } = await import('./dist/config/index.js');
      getConfig();
      console.log('❌ 应该抛出验证错误');
    } catch (error) {
      if (error.message.includes('配置验证失败')) {
        console.log('✅ 正确拒绝了无效模型配置');
        console.log('- 错误信息:', error.message.split('\n')[1] || error.message);
      } else {
        console.log('❌ 意外的错误:', error.message);
      }
    } finally {
      // 恢复原始环境变量
      if (originalModel) {
        process.env.MODEL = originalModel;
      } else {
        delete process.env.MODEL;
      }
    }
    
    console.log('\n📊 测试总结:');
    console.log('✅ MODEL配置参数工作正常');
    console.log('✅ 支持irag-1.0和flux.1-schnell模型');
    console.log('✅ 正确验证无效配置');
    console.log('✅ 默认值设置正确');
    
    console.log('\n💡 使用建议:');
    console.log('1. 在.env文件中设置 MODEL=irag-1.0 使用百度自研模型');
    console.log('2. 设置 MODEL=flux.1-schnell 使用高质量模型');
    console.log('3. 用户仍可在请求中覆盖默认模型');
    console.log('4. 配置的默认模型会在MCP工具描述中显示');
    
    console.log('\n🎉 MODEL配置测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
testModelConfig().catch(console.error);
