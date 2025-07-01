import axios, { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';
import type {
  IragGenerationRequest,
  IragGenerationResponse,
  IragErrorResponse,
  SupportedModel,
  ImageSize
} from '../types/index.js';
import { logger } from '../utils/logger.js';

// 请求参数验证schema
const generationRequestSchema = z.object({
  model: z.enum(['irag-1.0', 'flux.1-schnell']),
  prompt: z.string().min(1, '提示词不能为空').max(512, '提示词长度不能超过512个字符'),
  refer_image: z.string().url().optional(),
  user: z.string().optional(),
  n: z.number().int().min(1).max(4).optional(),
  size: z.enum([
    '512x512', '768x768', '1024x768', '1024x1024'
  ]).optional(),
  steps: z.number().int().min(1).max(50).optional(),
  seed: z.number().int().min(0).max(4294967295).optional(),
  guidance: z.number().min(0).max(30).optional(),
});

/**
 * 百度iRAG API客户端
 */
export class IragClient {
  private readonly client: AxiosInstance;
  private readonly apiKey: string;
  private readonly baseURL = 'https://qianfan.baidubce.com';
  private readonly timeout: number;
  private readonly maxRetries: number;

  constructor(apiKey: string, timeout = 30000, maxRetries = 3) {
    this.apiKey = apiKey;
    this.timeout = timeout;
    this.maxRetries = maxRetries;

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('发送API请求', {
          url: config.url,
          method: config.method,
          data: config.data,
        });
        return config;
      },
      (error) => {
        logger.error('请求拦截器错误', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('收到API响应', {
          status: response.status,
          data: response.data,
        });
        return response;
      },
      (error) => {
        logger.error('响应拦截器错误', {
          status: error.response?.status,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * 验证请求参数
   */
  private validateRequest(params: IragGenerationRequest): IragGenerationRequest {
    try {
      return generationRequestSchema.parse(params);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        throw new Error(`参数验证失败: ${errorMessages}`);
      }
      throw error;
    }
  }

  /**
   * 重试机制
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    retries = this.maxRetries
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        logger.warn(`操作失败，剩余重试次数: ${retries}`, error);
        await this.delay(1000 * (this.maxRetries - retries + 1));
        return this.withRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  /**
   * 判断是否为可重试的错误
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      // 5xx服务器错误和部分4xx错误可以重试
      return !status || status >= 500 || status === 429 || status === 408;
    }
    return false;
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 生成图片
   */
  async generateImage(params: IragGenerationRequest): Promise<IragGenerationResponse> {
    const validatedParams = this.validateRequest(params);
    
    logger.info('开始生成图片', { params: validatedParams });

    return this.withRetry(async () => {
      try {
        const response = await this.client.post<IragGenerationResponse>(
          '/v2/images/generations',
          validatedParams
        );

        logger.info('图片生成成功', {
          id: response.data.id,
          imageCount: response.data.data.length,
        });

        return response.data;
      } catch (error) {
        if (error instanceof AxiosError && error.response) {
          const errorData = error.response.data as IragErrorResponse;
          const errorMessage = `API错误 (${error.response.status}): ${errorData.message || error.message}`;
          logger.error(errorMessage, errorData);
          throw new Error(errorMessage);
        }
        throw error;
      }
    });
  }

  /**
   * 获取支持的模型列表
   */
  getSupportedModels(): SupportedModel[] {
    return ['irag-1.0', 'flux.1-schnell'];
  }

  /**
   * 获取支持的图片尺寸
   */
  getSupportedSizes(): ImageSize[] {
    return [
      '512x512', '768x768', '1024x768', '1024x1024'
    ];
  }

  /**
   * 验证API Key格式
   */
  static validateApiKey(apiKey: string): boolean {
    const apiKeyPattern = /^bce-v3\/ALTAK-[a-zA-Z0-9]+\/[a-zA-Z0-9]+$/;
    return apiKeyPattern.test(apiKey);
  }
}
