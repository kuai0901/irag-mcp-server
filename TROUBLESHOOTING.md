# 故障排除指南

本文档提供了百度iRAG MCP服务器常见问题的解决方案。

## 常见错误及解决方案

### 1. Base64验证错误

**错误信息：**
```
Tool execution failed: [
  {
    "validation": "base64",
    "code": "invalid_string",
    "message": "Invalid base64",
    "path": ["content", 1, "data"]
  }
]
```

**原因：** MCP客户端期望接收base64格式的图片数据，但服务器返回了URL或无效的base64数据。

**解决方案：**
1. 确保使用最新版本的服务器（已修复此问题）
2. 检查网络连接，确保能够下载百度API返回的图片URL
3. 查看服务器日志，确认图片下载过程

**验证修复：**
```bash
# 重新构建项目
npm run build

# 测试服务器
npm run test:server
```

### 2. API Key配置问题

**错误信息：**
```
配置验证失败: BAIDU_API_KEY: 百度API Key不能为空
```

**解决方案：**
1. 检查`.env`文件是否存在
2. 确保API Key格式正确：`bce-v3/ALTAK-****/****`
3. 验证API Key是否有效

**验证API Key格式：**
```bash
# 在项目根目录运行
node -e "
const apiKey = process.env.BAIDU_API_KEY || 'your-api-key-here';
const pattern = /^bce-v3\/ALTAK-[a-zA-Z0-9]+\/[a-zA-Z0-9]+$/;
console.log('API Key格式:', pattern.test(apiKey) ? '✅ 有效' : '❌ 无效');
console.log('API Key:', apiKey);
"
```

### 3. Claude Desktop配置问题

**症状：** Claude Desktop中看不到图片生成工具

**解决方案：**

1. **检查配置文件位置**
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. **验证配置格式**
   ```json
   {
     "mcpServers": {
       "irag-image-generator": {
         "command": "node",
         "args": ["/完整绝对路径/irag-mcp-server/dist/index.js"],
         "env": {
           "BAIDU_API_KEY": "bce-v3/ALTAK-your-key/your-secret"
         }
       }
     }
   }
   ```

3. **常见配置错误**
   - 路径使用相对路径（必须使用绝对路径）
   - 路径分隔符错误（Windows使用`\\`或`/`）
   - JSON格式错误（缺少逗号、引号等）

4. **验证配置**
   ```bash
   # 检查文件是否存在
   node -e "console.log(require('fs').existsSync('./dist/index.js') ? '✅ 文件存在' : '❌ 文件不存在')"
   
   # 测试Node.js能否执行
   node dist/index.js --help
   ```

### 4. 网络连接问题

**症状：** 图片生成超时或连接失败

**解决方案：**

1. **检查网络连接**
   ```bash
   # 测试百度API连通性
   curl -I https://qianfan.baidubce.com
   ```

2. **调整超时设置**
   在`.env`文件中增加超时时间：
   ```env
   API_TIMEOUT=60000
   MAX_RETRIES=5
   ```

3. **代理设置**
   如果使用代理，设置环境变量：
   ```env
   HTTP_PROXY=http://your-proxy:port
   HTTPS_PROXY=http://your-proxy:port
   ```

### 5. 权限问题

**症状：** 无法启动服务器或访问文件

**解决方案：**

1. **检查Node.js版本**
   ```bash
   node --version  # 需要 >= 18.0.0
   ```

2. **检查文件权限**
   ```bash
   # Linux/macOS
   chmod +x dist/index.js
   
   # Windows (以管理员身份运行PowerShell)
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### 6. 模块导入错误

**错误信息：**
```
Cannot find module '@modelcontextprotocol/sdk'
```

**解决方案：**
```bash
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 重新构建
npm run build
```

## 调试技巧

### 1. 启用详细日志

在`.env`文件中设置：
```env
LOG_LEVEL=debug
LOG_FILE=logs/debug.log
```

### 2. 手动测试API

创建测试脚本 `test-api.js`：
```javascript
import { IragClient } from './dist/client/irag-client.js';

const client = new IragClient(process.env.BAIDU_API_KEY);

try {
  const result = await client.generateImage({
    model: 'irag-1.0',
    prompt: '测试图片生成'
  });
  console.log('API测试成功:', result);
} catch (error) {
  console.error('API测试失败:', error);
}
```

运行测试：
```bash
node test-api.js
```

### 3. 检查MCP连接

创建简单的MCP测试客户端来验证连接。

## 获取帮助

如果以上解决方案都无法解决问题，请：

1. **收集信息**
   - 错误信息的完整截图
   - 服务器日志（设置`LOG_LEVEL=debug`）
   - 系统信息（操作系统、Node.js版本）
   - 配置文件内容（隐藏敏感信息）

2. **检查已知问题**
   - 查看项目的GitHub Issues
   - 检查百度API服务状态

3. **联系支持**
   - 提交详细的问题报告
   - 包含重现步骤和环境信息

## 预防措施

1. **定期更新**
   - 保持依赖项最新
   - 关注API变更通知

2. **监控日志**
   - 定期检查错误日志
   - 监控API使用量

3. **备份配置**
   - 保存工作的配置文件
   - 记录成功的参数组合

4. **测试环境**
   - 在生产环境外测试新配置
   - 验证API Key的有效性
