#!/usr/bin/env node

/**
 * 百度iRAG MCP服务器主入口
 */

import { getConfig, validateApiKey } from './config/index.js';
import { initializeLogger, logger } from './utils/logger.js';
import { McpServer } from './server/mcp-server.js';

/**
 * 主函数
 */
async function main(): Promise<void> {
  try {
    // 加载配置
    const config = getConfig();
    
    // 初始化日志器
    await initializeLogger(config.logLevel, config.logFile);
    
    logger.info('='.repeat(50));
    logger.info(`启动 ${config.serverName} v${config.serverVersion}`);
    logger.info('='.repeat(50));
    
    // 验证API Key
    if (!validateApiKey(config.apiKey)) {
      throw new Error('无效的百度API Key格式，请检查配置');
    }
    
    logger.info('配置验证通过');
    logger.debug('服务器配置', {
      serverName: config.serverName,
      serverVersion: config.serverVersion,
      logLevel: config.logLevel,
      apiTimeout: config.apiTimeout,
      maxRetries: config.maxRetries,
    });
    
    // 创建并启动MCP服务器
    const mcpServer = new McpServer(config);
    await mcpServer.start();
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    
    // 如果日志器还未初始化，直接输出到控制台
    if (logger) {
      logger.error('服务器启动失败', error);
    } else {
      console.error(`服务器启动失败: ${errorMessage}`);
      console.error(error);
    }
    
    process.exit(1);
  }
}

/**
 * 处理未捕获的异常
 */
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});

/**
 * 处理进程信号
 */
process.on('SIGINT', () => {
  logger?.info('收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger?.info('收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

// 启动应用
main().catch((error) => {
  console.error('应用启动失败:', error);
  process.exit(1);
});
