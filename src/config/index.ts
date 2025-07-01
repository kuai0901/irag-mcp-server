import { config } from 'dotenv';
import { z } from 'zod';
import { homedir } from 'os';
import { join } from 'path';
import type { ServerConfig, LogLevel, ResourceMode, SupportedModel } from '../types/index.js';

// 加载环境变量
config();

// 环境变量验证schema
const envSchema = z.object({
  BAIDU_API_KEY: z.string().min(1, '百度API Key不能为空'),
  SERVER_NAME: z.string().default('irag-mcp-server'),
  SERVER_VERSION: z.string().default('1.0.0'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().optional(),
  API_TIMEOUT: z.string().transform(val => parseInt(val, 10)).default('30000'),
  MAX_RETRIES: z.string().transform(val => parseInt(val, 10)).default('3'),
  RESOURCE_MODE: z.enum(['url', 'local']).default('local'),
  BASE_PATH: z.string().optional(),
  MODEL: z.enum(['irag-1.0', 'flux.1-schnell']).default('irag-1.0'),
});

/**
 * 验证并获取配置
 */
function validateConfig(): ServerConfig {
  try {
    const env = envSchema.parse(process.env);

    // 处理BASE_PATH默认值
    let basePath = env.BASE_PATH;
    if (!basePath && env.RESOURCE_MODE === 'local') {
      // 默认保存到用户桌面的irag-images文件夹
      basePath = join(homedir(), 'Desktop', 'irag-images');
    }

    return {
      apiKey: env.BAIDU_API_KEY,
      serverName: env.SERVER_NAME,
      serverVersion: env.SERVER_VERSION,
      logLevel: env.LOG_LEVEL as LogLevel,
      logFile: env.LOG_FILE,
      apiTimeout: env.API_TIMEOUT,
      maxRetries: env.MAX_RETRIES,
      resourceMode: env.RESOURCE_MODE as ResourceMode,
      basePath: basePath,
      defaultModel: env.MODEL as SupportedModel,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err =>
        `${err.path.join('.')}: ${err.message}`
      ).join('\n');
      throw new Error(`配置验证失败:\n${errorMessages}`);
    }
    throw error;
  }
}

/**
 * 获取服务器配置
 */
export function getConfig(): ServerConfig {
  return validateConfig();
}

/**
 * 验证API Key格式
 */
export function validateApiKey(apiKey: string): boolean {
  // 百度API Key格式: bce-v3/ALTAK-xxx/xxx
  const apiKeyPattern = /^bce-v3\/ALTAK-[a-zA-Z0-9]+\/[a-zA-Z0-9]+$/;
  return apiKeyPattern.test(apiKey);
}

/**
 * 获取默认配置
 */
export function getDefaultConfig(): Partial<ServerConfig> {
  return {
    serverName: 'irag-mcp-server',
    serverVersion: '1.0.0',
    logLevel: 'info',
    apiTimeout: 30000,
    maxRetries: 3,
    resourceMode: 'local',
    basePath: join(homedir(), 'Desktop', 'irag-images'),
    defaultModel: 'irag-1.0',
  };
}
