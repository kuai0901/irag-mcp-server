# 最终设置和验证指南

本指南将帮助您完成百度iRAG MCP服务器的最终设置和验证。

## 🚨 重要提醒

**之前的测试只验证了服务器启动，没有真正调用百度API生成图片。**

要确保MCP服务器完全可用，您需要：

1. **获取真实的百度API Key**
2. **运行真实的API测试**
3. **验证图片生成和Base64转换**
4. **在Claude Desktop中实际测试**

## 步骤1：获取真实API Key

### 1.1 访问百度智能云控制台
- 访问：https://console.bce.baidu.com/iam/#/iam/apikey/list
- 登录您的百度账号

### 1.2 创建API Key
1. 点击"创建API Key"
2. 选择"千帆ModelBuilder"
3. 配置应用资源（选择您的应用）
4. 复制生成的API Key

### 1.3 验证API Key格式
API Key应该类似：`bce-v3/ALTAK-xxxxxxxxx/yyyyyyyyyyy`

## 步骤2：配置环境

### 2.1 更新.env文件
```env
# 替换为您的真实API Key
BAIDU_API_KEY=bce-v3/ALTAK-your-real-key/your-real-secret

# 图片保存配置（重要！）
RESOURCE_MODE=local          # 推荐设置为local，图片会保存到本地文件
BASE_PATH=                   # 可选：自定义保存路径，留空使用默认桌面路径
MODEL=irag-1.0              # 默认模型：irag-1.0（快速）| flux.1-schnell（高质量）

# 其他配置
SERVER_NAME=irag-mcp-server
SERVER_VERSION=1.0.0
LOG_LEVEL=info
API_TIMEOUT=30000
MAX_RETRIES=3
```

### 2.2 图片保存配置说明

- **RESOURCE_MODE=local**:
  - 图片会保存到本地文件系统
  - 同时返回base64数据供MCP客户端显示
  - 在响应中包含本地文件路径信息

- **RESOURCE_MODE=url**:
  - 仅返回图片URL和base64数据
  - 不保存本地文件
  - 适合不需要持久化存储的场景

- **BASE_PATH**:
  - 自定义图片保存路径
  - 留空则使用默认路径：`用户桌面/irag-images`
  - 示例：`C:\Users\YourName\Pictures\AI-Images`

- **MODEL**:
  - 设置默认使用的图片生成模型
  - `irag-1.0`: 百度自研模型，通用性好，速度快，适合日常使用
  - `flux.1-schnell`: 支持更多高级参数，质量更高，适合专业创作
  - 用户仍可在请求中覆盖默认模型

### 2.3 测试图片保存功能

在运行真实API测试前，先测试图片保存功能：

```bash
npm run test:images
```

这将测试不同的保存模式，确保图片能正确保存到本地。

### 2.4 重新构建项目
```bash
npm run build
```

## 步骤3：运行真实API测试

### 3.1 直接API测试
```bash
npm run test:api
```

**期望输出：**
```
🚀 开始直接API测试...
📝 API Key: bce-v3/ALTAK-xxxxx...
✅ iRAG客户端创建成功
📨 发送图片生成请求...
✅ API调用成功！
⏱️ 耗时: 3.2 秒
📊 响应数据:
- 请求ID: as-xxxxxxxxx
- 创建时间: 2025-06-30 16:xx:xx
- 图片数量: 1

🖼️ 图片 1:
- URL: http://qianfan-modelbuilder-img-gen.bj.bcebos.com/...
📥 开始下载图片...
✅ 图片下载成功
⏱️ 下载耗时: 1.5 秒
📊 图片信息:
- 大小: 245678 bytes
- 类型: image/png
✅ Base64转换成功
- Base64长度: 327570
✅ Base64格式验证通过

🎉 直接API测试完成！
```

### 3.2 如果测试失败

**常见错误及解决方案：**

1. **API Key无效**
   ```
   ❌ 测试失败: API错误 (401): Invalid API key
   ```
   - 检查API Key格式
   - 确认已配置千帆ModelBuilder资源

2. **网络连接问题**
   ```
   ❌ 图片下载失败: timeout of 30000ms exceeded
   ```
   - 检查网络连接
   - 尝试增加超时时间

3. **配额不足**
   ```
   ❌ 测试失败: API错误 (429): Rate limit exceeded
   ```
   - 检查API使用配额
   - 等待配额重置

## 步骤4：配置Claude Desktop

### 4.1 找到配置文件
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

### 4.2 添加MCP服务器配置
```json
{
  "mcpServers": {
    "irag-image-generator": {
      "command": "node",
      "args": ["/完整绝对路径/irag-mcp-server/dist/index.js"],
      "env": {
        "BAIDU_API_KEY": "bce-v3/ALTAK-your-real-key/your-real-secret"
      }
    }
  }
}
```

**⚠️ 重要提醒：**
- 必须使用完整的绝对路径
- 确保路径中的`dist/index.js`文件存在
- API Key必须是真实有效的

### 4.3 验证配置
```bash
# 检查文件是否存在
ls -la /完整路径/irag-mcp-server/dist/index.js

# 测试Node.js能否执行
node /完整路径/irag-mcp-server/dist/index.js
```

## 步骤5：重启Claude Desktop

1. 完全关闭Claude Desktop应用
2. 重新启动Claude Desktop
3. 等待应用完全加载

## 步骤6：在Claude Desktop中测试

### 6.1 发送测试请求
在Claude Desktop中输入：
```
请帮我生成一张可爱小猫的图片
```

### 6.2 期望结果
Claude应该：
1. 识别到图片生成工具
2. 调用百度iRAG API
3. 返回生成的图片（以base64格式显示）
4. 显示成功消息和文件保存路径

**示例响应：**
```
图片 1 生成成功
📁 已保存到: C:\Users\YourName\Desktop\irag-images\irag-2025-06-30-16-30-45-123-1.png

[显示生成的图片]
```

您可以在指定路径找到保存的PNG图片文件。

### 6.3 如果失败
查看Claude Desktop的日志或错误信息，常见问题：
- MCP服务器未启动
- 配置文件格式错误
- 路径不正确
- API Key无效

## 步骤7：高级测试

### 7.1 测试不同参数
```
请生成一张1024x1024的现代简约风格客厅设计图，使用irag-1.0模型
```

### 7.2 测试批量生成
```
请生成3张不同风格的风景画
```

### 7.3 测试flux.1-schnell模型
```
请使用flux.1-schnell模型生成一张科幻风格的城市景观，设置采样步数为20
```

## 故障排除

### 检查服务器日志
如果启用了日志文件：
```bash
tail -f logs/server.log
```

### 手动测试MCP连接
```bash
# 启动服务器并查看输出
BAIDU_API_KEY=your-key node dist/index.js
```

### 验证完整流程
```bash
# 运行端到端测试
npm run test:e2e
```

## 成功标志

当以下所有测试都通过时，您的MCP服务器就完全可用了：

- ✅ `npm run test:api` 成功
- ✅ Claude Desktop配置正确
- ✅ 在Claude Desktop中能生成图片
- ✅ 图片以正确的base64格式显示
- ✅ 不同参数和模型都能正常工作

## 下一步

一旦验证成功，您可以：

1. **探索更多功能** - 查看 [EXAMPLES.md](EXAMPLES.md)
2. **优化配置** - 调整超时、重试等参数
3. **监控使用** - 查看API使用情况和日志
4. **扩展功能** - 基于现有代码添加新特性

## 获取帮助

如果遇到问题：
1. 查看 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. 检查 [TESTING.md](TESTING.md) 中的测试指南
3. 确保按照本指南的每个步骤操作
4. 收集详细的错误信息和日志
