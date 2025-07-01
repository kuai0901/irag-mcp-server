# 快速开始指南

## 1. 安装依赖

```bash
npm install
```

## 2. 配置环境变量

复制环境变量模板：
```bash
cp .env.example .env
```

编辑 `.env` 文件，设置你的百度API Key和图片保存配置：
```env
# 百度API Key
BAIDU_API_KEY=bce-v3/ALTAK-your-access-key/your-secret-key

# 图片保存配置
RESOURCE_MODE=local          # 推荐设置为local，图片会保存到本地
BASE_PATH=                   # 可选：自定义保存路径
MODEL=irag-1.0              # 默认模型，可选：irag-1.0 | flux.1-schnell
```

### 获取百度API Key

1. 访问 [百度智能云控制台](https://console.bce.baidu.com/iam/#/iam/apikey/list)
2. 点击"创建API Key"
3. 选择"千帆ModelBuilder"
4. 配置应用资源
5. 复制生成的API Key

## 3. 构建项目

```bash
npm run build
```

## 4. 测试服务器

```bash
# 运行基本测试
npm test

# 测试服务器启动
npm run test:server

# 测试真实API调用（需要真实API Key）
npm run test:api

# 测试图片保存功能
npm run test:images

# 测试配置参数
npm run test:config

# 完整验证（包括API测试）
npm run validate:full
```

**注意：** `test:api` 需要真实的百度API Key，会实际调用百度API生成图片。

## 5. 配置Claude Desktop

### Windows
编辑文件：`%APPDATA%\Claude\claude_desktop_config.json`

### macOS
编辑文件：`~/Library/Application Support/Claude/claude_desktop_config.json`

### 配置内容
```json
{
  "mcpServers": {
    "irag-image-generator": {
      "command": "node",
      "args": ["/完整路径/irag-mcp-server/dist/index.js"],
      "env": {
        "BAIDU_API_KEY": "bce-v3/ALTAK-your-access-key/your-secret-key"
      }
    }
  }
}
```

**注意：** 请将 `/完整路径/irag-mcp-server` 替换为你的实际项目路径。

## 6. 重启Claude Desktop

配置完成后，重启Claude Desktop应用。

## 7. 测试功能

在Claude Desktop中输入：

```
请帮我生成一张可爱小猫的图片
```

Claude会自动调用百度iRAG API生成图片。

### 期望结果

如果配置了 `RESOURCE_MODE=local`，你将看到：
- 生成的图片（以base64格式显示）
- 图片保存路径信息，例如：`📁 已保存到: C:\Users\YourName\Desktop\irag-images\irag-2025-06-30-xxx.png`
- 可以在指定路径找到保存的图片文件

## 故障排除

### 常见问题

1. **Base64验证错误** - 已修复，确保使用最新版本
2. **API Key无效** - 检查格式和配置
3. **模块找不到** - 运行 `npm run build`
4. **权限问题** - 检查Node.js权限

### 详细故障排除

如果遇到问题，请查看 [TROUBLESHOOTING.md](TROUBLESHOOTING.md) 获取详细的解决方案。

### 调试模式

设置环境变量启用调试：
```env
LOG_LEVEL=debug
```

查看详细的运行日志。

## 支持的功能

- ✅ 文本生成图片
- ✅ 多种模型支持（irag-1.0, flux.1-schnell）
- ✅ 自定义图片尺寸
- ✅ 批量生成（1-4张）
- ✅ 参考图片生成
- ✅ 高级参数控制

## 下一步

查看 [README.md](README.md) 了解完整功能和API参考。
查看 [EXAMPLES.md](EXAMPLES.md) 了解更多使用示例。
