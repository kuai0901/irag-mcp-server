/**
 * 百度iRAG API相关类型定义
 */

// 支持的模型类型
export type SupportedModel = 'irag-1.0' | 'flux.1-schnell';

// 图片尺寸类型
export type ImageSize = 
  | '512x512' | '768x768' | '1024x768' | '1024x1024' | '1536x1536' 
  | '2048x1152' | '2048x1536' | '2048x2048' | '576x1024' | '1152x2048';

// 百度iRAG API请求参数
export interface IragGenerationRequest {
  model: SupportedModel;
  prompt: string;
  refer_image?: string | undefined;
  user?: string | undefined;
  n?: number | undefined;
  size?: ImageSize | undefined;
  steps?: number | undefined;
  seed?: number | undefined;
  guidance?: number | undefined;
}

// 百度iRAG API响应数据
export interface IragImageData {
  url: string;
}

export interface IragGenerationResponse {
  id: string;
  created: number;
  data: IragImageData[];
}

// 错误响应
export interface IragErrorResponse {
  code: string;
  message: string;
  type: string;
}

// MCP工具参数
export interface GenerateImageParams {
  prompt: string;
  model?: SupportedModel | undefined;
  refer_image?: string | undefined;
  n?: number | undefined;
  size?: ImageSize | undefined;
  steps?: number | undefined;
  seed?: number | undefined;
  guidance?: number | undefined;
}

// 资源模式类型
export type ResourceMode = 'url' | 'local';

// 配置接口
export interface ServerConfig {
  apiKey: string;
  serverName: string;
  serverVersion: string;
  logLevel: LogLevel;
  logFile?: string | undefined;
  apiTimeout: number;
  maxRetries: number;
  resourceMode: ResourceMode;
  basePath?: string | undefined;
  defaultModel: SupportedModel;
}

// 日志级别
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
