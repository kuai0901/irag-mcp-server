# 使用示例

本文档提供了百度iRAG MCP服务器的详细使用示例。

## 基础图片生成

### 简单文本生成图片

```json
{
  "name": "generate_image",
  "arguments": {
    "prompt": "一只可爱的小猫咪坐在花园里"
  }
}
```

**说明**: 当不指定模型时，将使用配置文件中设置的默认模型（通过`MODEL`环境变量配置）。

### 指定模型和尺寸

```json
{
  "name": "generate_image",
  "arguments": {
    "prompt": "现代简约风格的客厅设计",
    "model": "irag-1.0",
    "size": "1024x768",
    "n": 2
  }
}
```

**说明**: 显式指定模型会覆盖默认配置。如果配置了`MODEL=flux.1-schnell`，但请求中指定了`"model": "irag-1.0"`，则会使用irag-1.0模型。

## 模型配置示例

### 使用默认模型配置

在`.env`文件中设置默认模型：
```env
MODEL=irag-1.0
```

然后在请求中无需指定模型：
```json
{
  "name": "generate_image",
  "arguments": {
    "prompt": "美丽的日落风景"
  }
}
```

### 切换默认模型

将默认模型改为flux.1-schnell：
```env
MODEL=flux.1-schnell
```

现在所有不指定模型的请求都会使用flux.1-schnell：
```json
{
  "name": "generate_image",
  "arguments": {
    "prompt": "科幻风格的机器人",
    "steps": 20,
    "guidance": 7.5
  }
}
```

### 临时覆盖默认模型

即使配置了`MODEL=flux.1-schnell`，仍可在请求中指定其他模型：
```json
{
  "name": "generate_image",
  "arguments": {
    "prompt": "快速生成的概念图",
    "model": "irag-1.0"
  }
}
```

## 高级参数使用

### 使用flux.1-schnell模型

```json
{
  "name": "generate_image",
  "arguments": {
    "prompt": "A futuristic cityscape at sunset with flying cars",
    "model": "flux.1-schnell",
    "size": "2048x1152",
    "steps": 20,
    "seed": 12345,
    "guidance": 7.5
  }
}
```

### 参考图片生成

```json
{
  "name": "generate_image",
  "arguments": {
    "prompt": "将这张图片转换为水彩画风格",
    "model": "irag-1.0",
    "refer_image": "https://example.com/reference-image.jpg",
    "size": "1024x1024"
  }
}
```

## 不同场景的提示词示例

### 人物肖像

```json
{
  "name": "generate_image",
  "arguments": {
    "prompt": "一位优雅的女性，穿着白色连衣裙，站在海边，夕阳西下，微风吹动头发，电影级别的光影效果",
    "size": "768x1024"
  }
}
```

### 风景摄影

```json
{
  "name": "generate_image",
  "arguments": {
    "prompt": "壮丽的山脉景色，雪山倒映在湖水中，清晨的薄雾，专业摄影，高清画质",
    "size": "2048x1152"
  }
}
```

### 产品设计

```json
{
  "name": "generate_image",
  "arguments": {
    "prompt": "现代简约的智能手机设计，白色背景，产品摄影风格，专业打光",
    "size": "1024x1024"
  }
}
```

### 艺术创作

```json
{
  "name": "generate_image",
  "arguments": {
    "prompt": "抽象艺术作品，色彩丰富的几何图形，现代艺术风格，充满活力的色彩搭配",
    "size": "1536x1536"
  }
}
```

## 批量生成

### 生成多张相似图片

```json
{
  "name": "generate_image",
  "arguments": {
    "prompt": "可爱的卡通动物角色设计，适合儿童书籍插图",
    "n": 4,
    "size": "768x768"
  }
}
```

### 使用固定种子生成一致风格

```json
{
  "name": "generate_image",
  "arguments": {
    "prompt": "科幻风格的机器人设计",
    "model": "flux.1-schnell",
    "seed": 42,
    "n": 3,
    "size": "1024x1024"
  }
}
```

## 提示词优化技巧

### 详细描述

❌ 不好的提示词：
```
"一只猫"
```

✅ 好的提示词：
```
"一只橘色的长毛猫，绿色的眼睛，坐在阳光明媚的窗台上，背景是模糊的花园景色，温暖的光线，高清摄影"
```

### 风格指定

```json
{
  "name": "generate_image",
  "arguments": {
    "prompt": "日本动漫风格的少女角色，大眼睛，粉色头发，校服，樱花背景，细腻的线条，鲜艳的色彩"
  }
}
```

### 技术参数

```json
{
  "name": "generate_image",
  "arguments": {
    "prompt": "专业人像摄影，85mm镜头，浅景深，柔和的自然光，高分辨率，商业摄影质量"
  }
}
```

## 错误处理示例

### 参数验证错误

如果提供了无效参数，服务器会返回详细的错误信息：

```json
{
  "content": [
    {
      "type": "text",
      "text": "错误: 参数验证失败: size: Invalid enum value. Expected '512x512' | '768x768' | ..., received 'invalid-size'"
    }
  ],
  "isError": true
}
```

### API调用错误

如果API调用失败，会返回相应的错误信息：

```json
{
  "content": [
    {
      "type": "text",
      "text": "错误: API错误 (401): Invalid API key"
    }
  ],
  "isError": true
}
```

## 性能优化建议

### 1. 合理选择图片尺寸

- 小尺寸（512x512）：生成速度快，适合预览
- 中等尺寸（1024x1024）：平衡质量和速度
- 大尺寸（2048x2048）：高质量，但生成时间较长

### 2. 批量生成

使用 `n` 参数一次生成多张图片比多次单独调用更高效：

```json
{
  "name": "generate_image",
  "arguments": {
    "prompt": "产品设计概念图",
    "n": 4
  }
}
```

### 3. 模型选择

- `irag-1.0`：通用模型，适合大多数场景
- `flux.1-schnell`：支持更多参数，适合需要精细控制的场景

## 集成到应用中

### Claude Desktop使用

1. 配置MCP服务器
2. 在对话中直接请求生成图片：

```
请帮我生成一张现代办公室的设计图，要求简约风格，采光良好。
```

Claude会自动调用图片生成工具并显示结果。

### 图片保存功能

如果在`.env`中配置了 `RESOURCE_MODE=local`，生成的图片会自动保存到本地：

```
请生成一张现代办公室设计图
```

**响应示例：**
```
图片 1 生成成功
📁 已保存到: C:\Users\YourName\Desktop\irag-images\irag-2025-06-30-16-30-45-123-1.png

[显示生成的图片]
```

**文件命名规则：**
- 格式：`irag-{时间戳}-{序号}.png`
- 时间戳：`YYYY-MM-DD-HH-mm-ss-SSS`
- 序号：同一次请求中的图片编号

### 自定义MCP客户端

如果你在开发自己的MCP客户端，可以参考以下调用方式：

```typescript
const result = await mcpClient.callTool('generate_image', {
  prompt: '你的提示词',
  model: 'irag-1.0',
  size: '1024x1024'
});
```

## 最佳实践

1. **提示词要具体明确**：包含风格、色彩、构图等详细信息
2. **合理使用参考图片**：可以提供更准确的生成结果
3. **测试不同参数组合**：找到最适合你需求的配置
4. **监控API使用量**：避免超出配额限制
5. **保存成功的配置**：建立自己的提示词和参数库
