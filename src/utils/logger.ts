import winston from 'winston';
import { promises as fs } from 'fs';
import { dirname } from 'path';
import type { LogLevel } from '../types/index.js';

/**
 * 创建日志目录
 */
async function ensureLogDirectory(logFile: string): Promise<void> {
  try {
    const logDir = dirname(logFile);
    await fs.mkdir(logDir, { recursive: true });
  } catch (error) {
    console.warn(`无法创建日志目录: ${error}`);
  }
}

/**
 * 创建Winston日志器
 */
export async function createLogger(
  level: LogLevel = 'info',
  logFile?: string
): Promise<winston.Logger> {
  const transports: winston.transport[] = [
    // 控制台输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length > 0 ? 
            `\n${JSON.stringify(meta, null, 2)}` : '';
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        })
      )
    })
  ];

  // 如果指定了日志文件，添加文件输出
  if (logFile) {
    try {
      await ensureLogDirectory(logFile);
      
      transports.push(
        new winston.transports.File({
          filename: logFile,
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.json()
          ),
          maxsize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
        })
      );
    } catch (error) {
      console.warn(`无法设置文件日志: ${error}`);
    }
  }

  return winston.createLogger({
    level,
    transports,
    exitOnError: false,
  });
}

/**
 * 默认日志器实例
 */
let defaultLogger: winston.Logger | null = null;

/**
 * 初始化默认日志器
 */
export async function initializeLogger(
  level: LogLevel = 'info',
  logFile?: string
): Promise<winston.Logger> {
  defaultLogger = await createLogger(level, logFile);
  return defaultLogger;
}

/**
 * 获取默认日志器
 */
export function getLogger(): winston.Logger {
  if (!defaultLogger) {
    throw new Error('日志器未初始化，请先调用 initializeLogger()');
  }
  return defaultLogger;
}

/**
 * 日志工具函数
 */
export const logger = {
  error: (message: string, meta?: unknown) => getLogger().error(message, meta),
  warn: (message: string, meta?: unknown) => getLogger().warn(message, meta),
  info: (message: string, meta?: unknown) => getLogger().info(message, meta),
  debug: (message: string, meta?: unknown) => getLogger().debug(message, meta),
};
