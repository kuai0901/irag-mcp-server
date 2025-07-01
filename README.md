# 百度iRAG MCP服务器

一个基于百度iRAG图片生成API的MCP（Model Context Protocol）服务器，允许MCP客户端（如Claude Desktop）通过标准化接口调用百度的图片生成服务。

## 🚨 重要提醒

**在使用前，请务必进行真实API测试！**

基础测试只验证服务器启动，要确保完全可用，需要：
1. 获取真实的百度API Key
2. 运行 `npm run test:api` 进行真实API测试
3. 验证图片生成和Base64转换功能

详细设置指南请查看：[FINAL_SETUP.md](FINAL_SETUP.md)

## 功能特性

- 🎨 支持百度iRAG图片生成API
- 🔧 完整的MCP协议实现
- 📝 支持多种模型（irag-1.0, flux.1-schnell）
- 🖼️ 灵活的图片尺寸配置
- 🔄 自动重试机制
- 📊 完善的日志记录
- ✅ 全面的参数验证
- 🧪 完整的测试覆盖

## 支持的模型

- **irag-1.0**: 百度自研的图片生成模型
- **flux.1-schnell**: 支持更多高级参数的快速生成模型

## 安装

### 前置要求

- Node.js >= 18.0.0
- npm 或 yarn

### 克隆项目

```bash
git clone <repository-url>
cd irag-mcp-server
```

### 安装依赖

```bash
npm install
```

### 构建项目

```bash
npm run build
```

## 配置

### 1. 获取百度API Key

1. 访问[百度智能云控制台](https://console.bce.baidu.com/iam/#/iam/apikey/list)
2. 创建API Key并选择千帆ModelBuilder
3. 配置对应的应用资源
4. 复制API Key（格式：`bce-v3/ALTAK-****/****`）

### 2. 环境变量配置

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 必需配置
BAIDU_API_KEY=bce-v3/ALTAK-your-access-key/your-secret-key

# 图片资源配置
RESOURCE_MODE=local          # local: 保存到本地文件 | url: 仅返回URL和base64
BASE_PATH=                   # 自定义保存路径（可选，默认为桌面/irag-images）
MODEL=irag-1.0              # 默认模型: irag-1.0 | flux.1-schnell

# 可选配置
SERVER_NAME=irag-mcp-server
SERVER_VERSION=1.0.0
LOG_LEVEL=info
LOG_FILE=logs/server.log
API_TIMEOUT=30000
MAX_RETRIES=3
```

#### 图片保存配置说明

- **RESOURCE_MODE=local**: 图片将保存到本地文件系统，同时返回base64数据和文件路径
- **RESOURCE_MODE=url**: 仅返回图片URL和base64数据，不保存本地文件
- **BASE_PATH**: 自定义图片保存路径，留空则使用默认路径（用户桌面/irag-images文件夹）
- **MODEL**: 设置默认使用的图片生成模型
  - `irag-1.0`: 百度自研模型，通用性好，速度快
  - `flux.1-schnell`: 支持更多高级参数，质量更高

## 使用方法

### 启动服务器

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### MCP客户端配置

#### Claude Desktop配置

在Claude Desktop的配置文件中添加：

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "irag-image-generator": {
      "command": "node",
      "args": ["/path/to/irag-mcp-server/dist/index.js"],
      "env": {
        "BAIDU_API_KEY": "bce-v3/ALTAK-your-access-key/your-secret-key"
      }
    }
  }
}
```

## API参考

### generate_image 工具

生成图片的MCP工具。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
| `prompt` | string | ✅ | - | 图片生成提示词 |
| `model` | string | ❌ | irag-1.0 | 使用的模型 |
| `refer_image` | string | ❌ | - | 参考图片URL |
| `n` | integer | ❌ | 1 | 生成图片数量(1-4) |
| `size` | string | ❌ | 1024x1024 | 图片尺寸 |
| `steps` | integer | ❌ | - | 采样步数(1-50，仅flux.1-schnell) |
| `seed` | integer | ❌ | - | 随机种子(仅flux.1-schnell) |
| `guidance` | number | ❌ | 3.5 | 指导密度值(0-30，仅flux.1-schnell) |

#### 支持的图片尺寸

- `512x512`, `768x768`, `1024x768`, `1024x1024`, `1536x1536`
- `2048x1152`, `2048x1536`, `2048x2048`, `576x1024`, `1152x2048`

#### 使用示例

```json
{
  "name": "generate_image",
  "arguments": {
    "prompt": "一只可爱的橘猫坐在窗台上，阳光透过窗户洒在它身上",
    "model": "irag-1.0",
    "size": "1024x1024",
    "n": 2
  }
}
```

## 开发

### 项目结构

```
src/
├── client/          # API客户端
├── config/          # 配置管理
├── server/          # MCP服务器
├── types/           # 类型定义
├── utils/           # 工具函数
├── __tests__/       # 测试文件
└── index.ts         # 主入口
```

### 开发命令

```bash
# 开发模式运行
npm run dev

# 构建项目
npm run build

# 运行测试
npm test

# 监听测试
npm run test:watch

# 代码检查
npm run lint

# 修复代码风格
npm run lint:fix

# 清理构建文件
npm run clean
```

### 测试

运行所有测试：

```bash
npm test
```

查看测试覆盖率：

```bash
npm test -- --coverage
```

## 故障排除

### 常见问题

1. **API Key无效**
   - 确保API Key格式正确：`bce-v3/ALTAK-****/****`
   - 检查API Key是否已配置千帆ModelBuilder资源

2. **连接超时**
   - 检查网络连接
   - 增加 `API_TIMEOUT` 配置值

3. **图片生成失败**
   - 检查提示词是否符合要求
   - 确认模型参数配置正确

4. **Base64验证错误**
   - 服务器会自动下载图片并转换为base64格式
   - 如果下载失败，会返回错误信息和原始URL
   - 检查网络连接和图片URL的可访问性

5. **MCP客户端连接问题**
   - 确保Claude Desktop配置文件路径正确
   - 检查Node.js版本（需要>=18.0.0）
   - 验证项目已正确构建（运行`npm run build`）

### 日志调试

设置日志级别为debug：

```env
LOG_LEVEL=debug
```

查看详细的API调用日志和图片下载过程。

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 更新日志

### v1.0.0
- 初始版本发布
- 支持百度iRAG图片生成API
- 完整的MCP协议实现
- 支持多种模型和参数配置
