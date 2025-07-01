# 配置说明：.env vs Claude Desktop配置

本文档解释`.env`文件配置和Claude Desktop配置文件中的环境变量配置的区别和使用场景。

## 配置方式对比

### 方式1：.env文件配置（推荐）

**文件位置**: 项目根目录的`.env`文件

```env
# .env文件内容
BAIDU_API_KEY=bce-v3/ALTAK-your-access-key/your-secret-key
RESOURCE_MODE=local
BASE_PATH=C:\Users\YourName\Pictures\AI-Images
MODEL=irag-1.0
LOG_LEVEL=info
```

**Claude Desktop配置**:
```json
{
  "mcpServers": {
    "irag-image-generator": {
      "command": "node",
      "args": ["/path/to/irag-mcp-server/dist/index.js"]
    }
  }
}
```

### 方式2：Claude Desktop环境变量配置

**Claude Desktop配置**:
```json
{
  "mcpServers": {
    "irag-image-generator": {
      "command": "node",
      "args": ["/path/to/irag-mcp-server/dist/index.js"],
      "env": {
        "BAIDU_API_KEY": "bce-v3/ALTAK-your-access-key/your-secret-key",
        "RESOURCE_MODE": "local",
        "BASE_PATH": "C:\\Users\\YourName\\Pictures\\AI-Images",
        "MODEL": "irag-1.0",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**项目中无需.env文件**

## 主要区别

| 特性 | .env文件配置 | Claude Desktop配置 |
|------|-------------|-------------------|
| **配置位置** | 项目根目录 | Claude Desktop配置文件 |
| **安全性** | 高（文件可设置权限） | 中（配置文件相对公开） |
| **便于管理** | 是（集中在项目中） | 否（分散在客户端） |
| **版本控制** | 可排除（.gitignore） | 不适用 |
| **多环境支持** | 是（.env.dev, .env.prod） | 否 |
| **配置复用** | 是（其他MCP客户端可复用） | 否（仅限Claude Desktop） |
| **修改便利性** | 高（直接编辑文件） | 中（需重启Claude Desktop） |

## 优先级规则

当两种配置方式同时存在时，**Claude Desktop的env配置优先级更高**：

1. Claude Desktop的`env`配置
2. 项目的`.env`文件配置
3. 系统环境变量
4. 代码中的默认值

## 推荐使用场景

### 推荐使用.env文件配置的情况：

1. **开发和测试阶段**
   - 便于快速修改配置
   - 可以使用不同的.env文件（.env.dev, .env.test）
   - 便于版本控制管理

2. **多个MCP客户端**
   - 如果使用多个支持MCP的客户端
   - 配置可以在不同客户端间复用

3. **安全性要求高**
   - API Key等敏感信息集中管理
   - 可以设置文件权限保护

4. **团队协作**
   - 使用.env.example模板
   - 便于团队成员快速配置

### 推荐使用Claude Desktop配置的情况：

1. **仅使用Claude Desktop**
   - 只在Claude Desktop中使用
   - 不需要其他MCP客户端

2. **简化部署**
   - 不想在项目中维护配置文件
   - 希望配置与客户端绑定

3. **多个MCP服务器**
   - 使用多个不同的MCP服务器
   - 每个服务器有不同的配置需求

## 配置示例

### 开发环境配置

**.env文件**:
```env
BAIDU_API_KEY=bce-v3/ALTAK-dev-key/dev-secret
RESOURCE_MODE=local
BASE_PATH=./dev-images
MODEL=irag-1.0
LOG_LEVEL=debug
```

### 生产环境配置

**Claude Desktop配置**:
```json
{
  "mcpServers": {
    "irag-image-generator": {
      "command": "node",
      "args": ["/opt/irag-mcp-server/dist/index.js"],
      "env": {
        "BAIDU_API_KEY": "bce-v3/ALTAK-prod-key/prod-secret",
        "RESOURCE_MODE": "local",
        "BASE_PATH": "/home/user/ai-images",
        "MODEL": "flux.1-schnell",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

## 最佳实践

### 1. 开发阶段
- 使用`.env`文件进行配置
- 将`.env`添加到`.gitignore`
- 提供`.env.example`模板

### 2. 部署阶段
- 根据需求选择配置方式
- 确保敏感信息安全
- 文档化配置选择的原因

### 3. 安全建议
- 不要在代码仓库中提交真实的API Key
- 定期轮换API Key
- 使用最小权限原则

### 4. 配置验证
```bash
# 验证配置是否正确
npm run test:config
```

## 故障排除

### 配置不生效
1. 检查配置文件路径是否正确
2. 确认环境变量名称拼写正确
3. 重启Claude Desktop应用
4. 查看服务器日志确认配置加载情况

### API Key问题
1. 确认API Key格式正确
2. 检查API Key是否有效
3. 验证API配额是否充足

### 路径问题
1. 使用绝对路径
2. 确认目录权限
3. 检查路径分隔符（Windows使用`\\`或`/`）

## 总结

- **推荐使用.env文件配置**：更安全、更灵活、更便于管理
- **Claude Desktop配置适合简单场景**：仅使用Claude Desktop且配置简单
- **两种方式可以混合使用**：Claude Desktop配置会覆盖.env文件配置
- **选择适合你的方式**：根据使用场景和团队需求选择最合适的配置方式
