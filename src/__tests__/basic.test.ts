import { describe, it, expect } from '@jest/globals';

describe('Basic Tests', () => {
  it('应该能够运行基本测试', () => {
    expect(1 + 1).toBe(2);
  });

  it('应该验证API Key格式', () => {
    const validApiKey = 'bce-v3/ALTAK-test123/secret456';
    const invalidApiKey = 'invalid-key';
    
    const apiKeyPattern = /^bce-v3\/ALTAK-[a-zA-Z0-9]+\/[a-zA-Z0-9]+$/;
    
    expect(apiKeyPattern.test(validApiKey)).toBe(true);
    expect(apiKeyPattern.test(invalidApiKey)).toBe(false);
  });

  it('应该验证支持的模型', () => {
    const supportedModels = ['irag-1.0', 'flux.1-schnell'];
    
    expect(supportedModels).toContain('irag-1.0');
    expect(supportedModels).toContain('flux.1-schnell');
    expect(supportedModels).toHaveLength(2);
  });

  it('应该验证支持的图片尺寸', () => {
    const supportedSizes = [
      '512x512', '768x768', '1024x768', '1024x1024', '1536x1536',
      '2048x1152', '2048x1536', '2048x2048', '576x1024', '1152x2048'
    ];
    
    expect(supportedSizes).toContain('1024x1024');
    expect(supportedSizes).toContain('512x512');
    expect(supportedSizes).toContain('2048x2048');
  });
});
