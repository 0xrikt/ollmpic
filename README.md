# Ollmpic - 大模型竞技场

Ollmpic 是一个开源的大语言模型评测平台，让您能够方便地比较和评估不同大语言模型的表现。通过简洁直观的界面，您可以同时测试多个模型的输出效果，并由指定的模型担任裁判进行打分。

## ✨ 特点

- 🤖 支持多个主流大语言模型（如 DeepSeek、GLM 等）
- 💻 简洁直观的用户界面
- 🔐 注重 API 密钥安全，不保存敏感信息
- ⚡ 实时比较多个模型的输出
- 📊 自动评分和分析功能
- 💾 支持保存和查看历史测试记录
- 🌐 支持一键部署到 Vercel

## 🛠️ 技术栈

- Next.js 15
- React 19
- Tailwind CSS
- Zustand
- TypeScript
- Vercel Analytics

## 🚀 快速开始

### 本地开发

1. 克隆仓库
```bash
git clone https://github.com/你的用户名/ollmpic.git
cd ollmpic
```

2. 安装依赖
```bash
npm install
```

3. 创建环境变量文件
创建 `.env.local` 文件并添加以下内容：
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 部署到 Vercel

1. Fork 这个仓库
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 点击部署

## 💡 使用说明

1. **系统提示词设置**
   - 在顶部文本框中输入系统提示词
   - 这将作为所有模型的基础设定

2. **模型配置**
   - 在 2x2 网格中选择并配置最多 4 个模型
   - 为每个模型设置 API 密钥和参数
   - 目前支持的模型：
     - DeepSeek Chat v3
     - DeepSeek Coder v2.5
     - GLM-4-PLUS
     - GLM-4-FLASH

3. **裁判模型**
   - 选择一个模型作为裁判
   - 设置裁判模型的 API 密钥和参数
   - 裁判模型将根据系统提示词和用户输入对其他模型的回答进行评分

4. **运行测试**
   - 在底部输入框中输入测试内容
   - 点击"运行"按钮开始测试
   - 查看各模型输出和评分结果
   - 可以点击"保存此次结果"将结果保存到历史记录中

5. **历史记录**
   - 查看已保存的测试记录
   - 展开/折叠详细信息
   - 支持清空历史记录

## 🔑 支持的模型及 API 密钥获取

1. DeepSeek 系列
   - 访问 [DeepSeek 官网](https://platform.deepseek.com/)
   - 注册账号并生成 API 密钥

2. GLM 系列
   - 访问 [智谱 AI](https://open.bigmodel.cn/)
   - 注册账号并生成 API 密钥

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！在提交 PR 之前，请确保：

- 代码经过格式化
- 所有测试都通过
- 更新了相关文档
- 遵循现有的代码风格

## 📝 计划

- [ ] 支持更多主流大语言模型
- [ ] 添加更多评分维度
- [ ] 支持自定义评分规则
- [ ] 添加数据导出功能
- [ ] 支持批量测试

## 📄 许可证

[MIT License](./LICENSE)