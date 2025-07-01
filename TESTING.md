# 测试指南

本文档说明如何测试百度iRAG MCP服务器的各种功能。

## 测试类型

### 1. 基础单元测试

测试基本功能和参数验证：

```bash
npm test
```

**测试内容：**
- API Key格式验证
- 支持的模型列表
- 支持的图片尺寸
- 基本功能验证

### 2. 服务器启动测试

测试MCP服务器是否能正常启动：

```bash
npm run test:server
```

**测试内容：**
- 配置加载
- 服务器启动
- MCP协议初始化
- 基本连接测试

### 3. 直接API测试

**⚠️ 需要真实API Key，会产生实际费用**

测试百度iRAG API的直接调用：

```bash
npm run test:api
```

**测试内容：**
- API Key验证
- 图片生成请求
- 图片下载
- Base64转换
- 完整流程验证

**前置条件：**
- 在`.env`文件中配置真实的百度API Key
- 确保网络连接正常
- 确认API Key有足够的配额

### 4. 端到端测试

**⚠️ 需要真实API Key，会产生实际费用**

测试完整的MCP工具调用流程：

```bash
npm run test:e2e
```

**测试内容：**
- MCP服务器启动
- 工具调用模拟
- 图片生成和处理
- Base64响应验证
- 完整MCP协议流程

## 测试脚本说明

### npm run validate

基础验证，不调用真实API：
```bash
npm run validate
```
包含：代码检查 + 单元测试 + 服务器启动测试

### npm run validate:full

完整验证，包括真实API调用：
```bash
npm run validate:full
```
包含：基础验证 + 直接API测试

## 测试环境配置

### 开发测试

使用测试API Key（不会实际调用API）：
```env
BAIDU_API_KEY=bce-v3/ALTAK-test123/secret456
LOG_LEVEL=debug
```

### 生产测试

使用真实API Key：
```env
BAIDU_API_KEY=bce-v3/ALTAK-your-real-key/your-real-secret
LOG_LEVEL=info
API_TIMEOUT=30000
MAX_RETRIES=3
```

## 测试结果解读

### 成功示例

```
🎉 直接API测试完成！

📋 测试总结:
✅ API Key验证通过
✅ 图片生成成功
✅ 图片下载成功
✅ Base64转换成功

💡 现在可以在MCP客户端中使用此服务了！
```

### 失败示例

```
❌ 测试失败: API错误 (401): Invalid API key

🔧 故障排除建议:
1. 检查API Key是否正确
2. 确认网络连接正常
3. 验证百度API服务状态
4. 查看详细错误信息
```

## 常见测试问题

### 1. API Key相关

**问题：** `配置验证失败: BAIDU_API_KEY: 百度API Key不能为空`

**解决：**
- 检查`.env`文件是否存在
- 确认API Key格式正确
- 验证环境变量加载

### 2. 网络连接

**问题：** `图片下载失败: timeout of 30000ms exceeded`

**解决：**
- 检查网络连接
- 增加超时时间
- 检查防火墙设置

### 3. API配额

**问题：** `API错误 (429): Rate limit exceeded`

**解决：**
- 检查API使用配额
- 等待配额重置
- 联系百度客服增加配额

## 测试最佳实践

### 1. 测试顺序

建议按以下顺序进行测试：

1. `npm test` - 基础功能
2. `npm run test:server` - 服务器启动
3. `npm run test:api` - API调用（需要真实Key）
4. 配置Claude Desktop
5. 在Claude Desktop中实际使用

### 2. 调试技巧

启用详细日志：
```env
LOG_LEVEL=debug
LOG_FILE=logs/test.log
```

查看网络请求：
```bash
# 设置代理查看HTTP请求
export HTTP_PROXY=http://localhost:8888
npm run test:api
```

### 3. 自动化测试

在CI/CD中运行基础测试：
```bash
# 只运行不需要真实API Key的测试
npm run validate
```

在部署前运行完整测试：
```bash
# 需要配置真实API Key
npm run validate:full
```

## 性能测试

### 测试图片生成性能

```bash
# 测试不同尺寸的生成时间
time npm run test:api

# 测试批量生成
# 修改test-api-direct.js中的n参数为4
```

### 测试并发性能

创建多个并发请求测试服务器性能：

```javascript
// concurrent-test.js
const promises = [];
for (let i = 0; i < 5; i++) {
  promises.push(testImageGeneration());
}
await Promise.all(promises);
```

## 测试报告

每次测试后，检查以下指标：

- **响应时间**：图片生成耗时
- **成功率**：API调用成功率
- **错误类型**：失败原因分析
- **资源使用**：内存和CPU使用情况

## 持续集成

在GitHub Actions中配置测试：

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run validate
      # 只在有API Key时运行完整测试
      - run: npm run validate:full
        if: ${{ secrets.BAIDU_API_KEY }}
        env:
          BAIDU_API_KEY: ${{ secrets.BAIDU_API_KEY }}
```
