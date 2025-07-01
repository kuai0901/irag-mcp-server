import { promises as fs } from 'fs';
import { join } from 'path';
import axios from 'axios';
import { logger } from './logger.js';
import type { ResourceMode } from '../types/index.js';

/**
 * 图片保存结果
 */
export interface ImageSaveResult {
  success: boolean;
  localPath?: string;
  url: string;
  error?: string;
}

/**
 * 确保目录存在
 */
async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    logger.error('创建目录失败', { dirPath, error });
    throw new Error(`无法创建目录: ${dirPath}`);
  }
}

/**
 * 生成唯一的文件名
 */
function generateFileName(index: number, extension: string = 'png'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `irag-${timestamp}-${index + 1}.${extension}`;
}

/**
 * 下载图片并根据模式处理
 */
export async function downloadAndSaveImage(
  url: string,
  index: number,
  mode: ResourceMode,
  basePath?: string
): Promise<ImageSaveResult> {
  try {
    logger.debug('开始处理图片', { url, index, mode, basePath });
    
    // 下载图片
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    const buffer = Buffer.from(response.data);

    logger.debug('图片下载成功', {
      url,
      size: buffer.length,
      contentType: response.headers['content-type']
    });

    const result: ImageSaveResult = {
      success: true,
      url,
    };
    
    // 如果是local模式，保存到本地文件
    if (mode === 'local' && basePath) {
      try {
        // 确保目录存在
        await ensureDirectory(basePath);
        
        // 生成文件名
        const fileName = generateFileName(index);
        const localPath = join(basePath, fileName);
        
        // 保存文件
        await fs.writeFile(localPath, buffer);
        
        result.localPath = localPath;
        
        logger.info('图片保存成功', { 
          url, 
          localPath, 
          size: buffer.length 
        });
        
      } catch (saveError) {
        logger.error('图片保存失败', { url, basePath, error: saveError });
        result.error = `保存失败: ${saveError instanceof Error ? saveError.message : '未知错误'}`;
        // 即使保存失败，仍然返回base64数据
      }
    }
    
    return result;
    
  } catch (error) {
    logger.error('图片处理失败', { url, error });
    
    return {
      success: false,
      url,
      error: `处理失败: ${error instanceof Error ? error.message : '未知错误'}`,
    };
  }
}

/**
 * 批量处理图片
 */
export async function processImages(
  imageUrls: string[],
  mode: ResourceMode,
  basePath?: string
): Promise<ImageSaveResult[]> {
  logger.info('开始批量处理图片', {
    count: imageUrls.length,
    mode,
    basePath
  });

  const results: ImageSaveResult[] = [];

  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    if (!url) {
      results.push({
        success: false,
        url: '',
        error: 'URL为空',
      });
      continue;
    }

    try {
      const result = await downloadAndSaveImage(url, i, mode, basePath);
      results.push(result);
    } catch (error) {
      logger.error(`处理第${i + 1}张图片失败`, { url, error });
      results.push({
        success: false,
        url,
        error: `处理失败: ${error instanceof Error ? error.message : '未知错误'}`,
      });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  logger.info('批量处理完成', { 
    total: imageUrls.length, 
    success: successCount, 
    failed: imageUrls.length - successCount 
  });
  
  return results;
}

/**
 * 获取图片保存统计信息
 */
export async function getImageStats(basePath: string): Promise<{
  totalImages: number;
  totalSize: number;
  oldestImage?: string;
  newestImage?: string;
}> {
  try {
    const files = await fs.readdir(basePath);
    const imageFiles = files.filter(file => 
      file.toLowerCase().endsWith('.png') || 
      file.toLowerCase().endsWith('.jpg') || 
      file.toLowerCase().endsWith('.jpeg')
    );
    
    let totalSize = 0;
    let oldestTime = Infinity;
    let newestTime = 0;
    let oldestImage: string | undefined;
    let newestImage: string | undefined;
    
    for (const file of imageFiles) {
      const filePath = join(basePath, file);
      const stats = await fs.stat(filePath);
      totalSize += stats.size;
      
      if (stats.mtime.getTime() < oldestTime) {
        oldestTime = stats.mtime.getTime();
        oldestImage = file;
      }
      
      if (stats.mtime.getTime() > newestTime) {
        newestTime = stats.mtime.getTime();
        newestImage = file;
      }
    }
    
    return {
      totalImages: imageFiles.length,
      totalSize,
      ...(oldestImage && { oldestImage }),
      ...(newestImage && { newestImage }),
    };
    
  } catch (error) {
    logger.error('获取图片统计失败', { basePath, error });
    return {
      totalImages: 0,
      totalSize: 0,
    };
  }
}
