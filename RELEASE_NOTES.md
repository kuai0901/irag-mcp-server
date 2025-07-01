# 百度iRAG MCP服务器 v1.0.0 发布说明

## 🎉 首次发布

我们很高兴地宣布百度iRAG MCP服务器的首次发布！这是一个功能完整的MCP（Model Context Protocol）服务器，为百度iRAG图片生成API提供标准化接口。

## ✨ 主要功能

### 🎨 图片生成
- **多模型支持**: 支持`irag-1.0`和`flux.1-schnell`两种模型
- **灵活参数**: 支持自定义尺寸、批量生成、参考图片等
- **高级控制**: 支持采样步数、随机种子、指导密度等参数

### 💾 图片保存
- **本地保存**: 自动保存图片到本地文件系统
- **智能命名**: 基于时间戳的唯一文件名
- **路径配置**: 支持自定义保存路径
- **双重输出**: 同时提供base64显示和本地文件

### ⚙️ 配置管理
- **资源模式**: `RESOURCE_MODE` (local/url)
- **保存路径**: `BASE_PATH` (自定义保存目录)
- **默认模型**: `MODEL` (irag-1.0/flux.1-schnell)
- **服务器配置**: 超时、重试、日志等

### 🔧 开发特性
- **TypeScript**: 完整的类型安全
- **参数验证**: 使用Zod进行运行时验证
- **错误处理**: 完善的错误处理和重试机制
- **日志记录**: 结构化日志，支持文件输出
- **测试覆盖**: 单元测试和集成测试

## 🚀 快速开始

### 1. 安装
```bash
git clone https://github.com/kuai0901/irag-mcp-server.git
cd irag-mcp-server
npm install
npm run build
```

### 2. 配置
```bash
cp .env.example .env
# 编辑 .env 文件，设置您的百度API Key
```

### 3. 测试
```bash
# 基础测试
npm test

# 真实API测试（需要真实API Key）
npm run test:api

# 图片保存测试
npm run test:images
```

### 4. 配置Claude Desktop
在Claude Desktop配置文件中添加：
```json
{
  "mcpServers": {
    "irag-image-generator": {
      "command": "node",
      "args": ["/path/to/irag-mcp-server/dist/index.js"],
      "env": {
        "BAIDU_API_KEY": "your-api-key"
      }
    }
  }
}
```

## 📊 技术规格

- **Node.js**: >= 18.0.0
- **TypeScript**: 5.x
- **MCP SDK**: @modelcontextprotocol/sdk
- **HTTP客户端**: Axios
- **日志**: Winston
- **验证**: Zod
- **测试**: Jest

## 🧪 测试命令

| 命令 | 描述 |
|------|------|
| `npm test` | 基础单元测试 |
| `npm run test:server` | 服务器启动测试 |
| `npm run test:api` | 真实API调用测试 |
| `npm run test:images` | 图片保存功能测试 |
| `npm run test:config` | 配置参数测试 |
| `npm run validate` | 基础验证 |
| `npm run validate:full` | 完整验证（包括API） |

## 📚 文档

- [README.md](README.md) - 主要文档
- [QUICKSTART.md](QUICKSTART.md) - 快速开始指南
- [EXAMPLES.md](EXAMPLES.md) - 使用示例
- [FINAL_SETUP.md](FINAL_SETUP.md) - 完整设置指南
- [FEATURE_DEMO.md](FEATURE_DEMO.md) - 功能演示
- [TESTING.md](TESTING.md) - 测试指南
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - 故障排除

## 🔧 配置选项

### 环境变量

| 变量 | 默认值 | 描述 |
|------|--------|------|
| `BAIDU_API_KEY` | - | 百度API Key（必需） |
| `RESOURCE_MODE` | local | 资源模式：local/url |
| `BASE_PATH` | 桌面/irag-images | 图片保存路径 |
| `MODEL` | irag-1.0 | 默认模型 |
| `LOG_LEVEL` | info | 日志级别 |
| `API_TIMEOUT` | 30000 | API超时（毫秒） |
| `MAX_RETRIES` | 3 | 最大重试次数 |

## 🎯 使用场景

### 个人创作
- 设置`MODEL=irag-1.0`，快速生成创意图片
- 使用`RESOURCE_MODE=local`保存作品集

### 专业设计
- 设置`MODEL=flux.1-schnell`，获得高质量输出
- 自定义`BASE_PATH`，按项目分类保存

### 开发集成
- 使用`RESOURCE_MODE=url`，仅获取图片数据
- 集成到自己的应用中

## 🐛 已知限制

1. 图片URL有效期为24小时（百度API限制）
2. 依赖网络连接稳定性
3. API调用有配额限制
4. 仅支持PNG格式输出

## 🔮 未来计划

- [ ] 支持更多图片格式（JPEG、WebP）
- [ ] 添加图片编辑功能
- [ ] 集成云存储服务
- [ ] 支持图片批量管理
- [ ] 添加图片质量评估

## 🤝 贡献

欢迎提交Issue和Pull Request！

### 开发环境设置
```bash
git clone https://github.com/kuai0901/irag-mcp-server.git
cd irag-mcp-server
npm install
npm run dev
```

### 提交规范
- feat: 新功能
- fix: 修复
- docs: 文档
- test: 测试
- refactor: 重构

## 📄 许可证

MIT License

## 🙏 致谢

感谢百度智能云提供的iRAG图片生成API服务。
感谢Anthropic提供的MCP协议标准。

---

**仓库地址**: https://github.com/kuai0901/irag-mcp-server
**发布日期**: 2025-06-30
**版本**: v1.0.0
