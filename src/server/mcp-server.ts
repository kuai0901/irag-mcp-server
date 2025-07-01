import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolResult,
  TextContent,
  ImageContent,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import { IragClient } from '../client/irag-client.js';
import { logger } from '../utils/logger.js';
import { processImages } from '../utils/image-saver.js';
import type { GenerateImageParams, ServerConfig, IragGenerationRequest } from '../types/index.js';

// 工具参数验证schema
const generateImageParamsSchema = z.object({
  prompt: z.string().min(1, '提示词不能为空'),
  model: z.enum(['irag-1.0', 'flux.1-schnell']).optional(),
  refer_image: z.string().url().optional(),
  n: z.number().int().min(1).max(4).optional(),
  size: z.enum([
    '512x512', '768x768', '1024x768', '1024x1024', '1536x1536',
    '2048x1152', '2048x1536', '2048x2048', '576x1024', '1152x2048'
  ]).optional(),
  steps: z.number().int().min(1).max(50).optional(),
  seed: z.number().int().min(0).max(4294967295).optional(),
  guidance: z.number().min(0).max(30).optional(),
});



/**
 * MCP服务器类
 */
export class McpServer {
  private readonly server: Server;
  private readonly iragClient: IragClient;
  private readonly config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
    this.iragClient = new IragClient(
      config.apiKey,
      config.apiTimeout,
      config.maxRetries
    );

    // 创建MCP服务器实例
    this.server = new Server(
      {
        name: config.serverName,
        version: config.serverVersion,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  /**
   * 设置MCP处理器
   */
  private setupHandlers(): void {
    // 工具列表处理器
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.debug('收到工具列表请求');
      
      const tools: Tool[] = [
        {
          name: 'generate_image',
          description: '使用百度iRAG API生成图片',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: '图片生成提示词，描述要生成的图片内容',
              },
              model: {
                type: 'string',
                enum: ['irag-1.0', 'flux.1-schnell'],
                description: `使用的模型，默认为${this.config.defaultModel}`,
                default: this.config.defaultModel,
              },
              refer_image: {
                type: 'string',
                format: 'uri',
                description: '参考图片URL（可选）',
              },
              n: {
                type: 'integer',
                minimum: 1,
                maximum: 4,
                description: '生成图片数量，默认为1',
                default: 1,
              },
              size: {
                type: 'string',
                enum: [
                  '512x512', '768x768', '1024x768', '1024x1024', '1536x1536',
                  '2048x1152', '2048x1536', '2048x2048', '576x1024', '1152x2048'
                ],
                description: '图片尺寸，默认为1024x1024',
                default: '1024x1024',
              },
              steps: {
                type: 'integer',
                minimum: 1,
                maximum: 50,
                description: '采样步数（仅flux.1-schnell模型支持）',
              },
              seed: {
                type: 'integer',
                minimum: 0,
                maximum: 4294967295,
                description: '随机种子（仅flux.1-schnell模型支持）',
              },
              guidance: {
                type: 'number',
                minimum: 0,
                maximum: 30,
                description: '指导密度值（仅flux.1-schnell模型支持），默认为3.5',
                default: 3.5,
              },
            },
            required: ['prompt'],
          },
        },
      ];

      logger.info(`返回工具列表，共${tools.length}个工具`);
      return { tools };
    });

    // 工具调用处理器
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      logger.info(`收到工具调用请求: ${name}`, args);

      try {
        switch (name) {
        case 'generate_image':
          return await this.handleGenerateImage(args as unknown as GenerateImageParams);
        default:
          throw new Error(`未知的工具: ${name}`);
        }
      } catch (error) {
        logger.error(`工具调用失败: ${name}`, error);
        
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        return {
          content: [
            {
              type: 'text',
              text: `错误: ${errorMessage}`,
            } as TextContent,
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * 处理图片生成工具调用
   */
  private async handleGenerateImage(params: GenerateImageParams): Promise<CallToolResult> {
    // 验证参数
    const validatedParams = generateImageParamsSchema.parse(params);
    
    logger.info('开始处理图片生成请求', validatedParams);

    try {
      // 调用百度iRAG API
      const requestParams: IragGenerationRequest = {
        model: validatedParams.model || this.config.defaultModel,
        prompt: validatedParams.prompt,
        n: validatedParams.n || 1,
        size: validatedParams.size || '1024x1024',
      };

      // 只有当参数存在时才添加可选参数
      if (validatedParams.refer_image !== undefined) {
        requestParams.refer_image = validatedParams.refer_image;
      }
      if (validatedParams.steps !== undefined) {
        requestParams.steps = validatedParams.steps;
      }
      if (validatedParams.seed !== undefined) {
        requestParams.seed = validatedParams.seed;
      }
      if (validatedParams.guidance !== undefined) {
        requestParams.guidance = validatedParams.guidance;
      }

      const response = await this.iragClient.generateImage(requestParams);

      // 构建响应内容
      const content: (TextContent | ImageContent)[] = [
        {
          type: 'text',
          text: `成功生成${response.data.length}张图片`,
        } as TextContent,
      ];

      // 处理图片
      const imageUrls = response.data.map(item => item.url);
      const imageResults = await processImages(
        imageUrls,
        this.config.resourceMode,
        this.config.basePath
      );

      // 添加图片内容
      for (const [index, result] of imageResults.entries()) {
        if (result.success && result.base64) {
          // 添加图片内容
          content.push({
            type: 'image',
            data: result.base64,
            mimeType: 'image/png',
          } as ImageContent);

          // 添加文本说明
          let textMessage = `图片 ${index + 1} 生成成功`;
          if (result.localPath) {
            textMessage += `\n📁 已保存到: ${result.localPath}`;
          }
          if (this.config.resourceMode === 'url') {
            textMessage += `\n🔗 原始URL: ${result.url}`;
          }

          content.push({
            type: 'text',
            text: textMessage,
          } as TextContent);
        } else {
          // 处理失败的情况
          logger.error(`图片 ${index + 1} 处理失败`, result.error);
          content.push({
            type: 'text',
            text: `图片 ${index + 1} 处理失败: ${result.error || '未知错误'}\n🔗 原始URL: ${result.url}`,
          } as TextContent);
        }
      }

      logger.info('图片生成成功', {
        requestId: response.id,
        imageCount: response.data.length,
      });

      return { content };
    } catch (error) {
      logger.error('图片生成失败', error);
      throw error;
    }
  }

  /**
   * 启动服务器
   */
  async start(): Promise<void> {
    logger.info(`启动MCP服务器: ${this.config.serverName} v${this.config.serverVersion}`);

    // 创建stdio传输
    const transport = new StdioServerTransport();

    // 连接服务器到传输
    await this.server.connect(transport);

    logger.info('MCP服务器已启动，等待客户端连接...');
  }

  /**
   * 获取服务器实例
   */
  getServer(): Server {
    return this.server;
  }
}
