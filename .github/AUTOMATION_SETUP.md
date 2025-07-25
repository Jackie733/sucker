# GitHub Actions 自动发布设置指南

这个指南将帮你设置从 GitHub 到 npm 的自动发布流程。

## 🔧 前置要求

### 1. npm 访问令牌 (NPM_TOKEN)

首先需要创建一个 npm 访问令牌：

1. 登录 [npmjs.com](https://www.npmjs.com)
2. 点击头像 → **Access Tokens**
3. 点击 **Generate New Token**
4. 选择 **Automation** 类型
5. 复制生成的令牌

### 2. 设置 GitHub Secrets

在你的 GitHub 仓库中设置密钥：

1. 进入 GitHub 仓库页面
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加以下密钥：
   - **名称**: `NPM_TOKEN`
   - **值**: 你从 npm 复制的访问令牌

## 🚀 工作流说明

我们创建了 3 个工作流文件：

### 1. `ci-cd.yml` - 主 CI/CD 流程

- **触发条件**: 推送到 main/master 分支、创建 PR、创建 Release
- **功能**:
  - 在多个 Node.js 版本上测试
  - 运行代码检查和构建
  - 在创建 GitHub Release 时自动发布到 npm

### 2. `auto-publish.yml` - 版本自动发布

- **触发条件**: package.json 中的版本号发生变化
- **功能**:
  - 检测版本变更
  - 自动创建 git 标签
  - 发布到 npm
  - 创建 GitHub Release

### 3. `manual-release.yml` - 手动发布

- **触发条件**: 手动触发
- **功能**:
  - 通过 GitHub 界面手动选择版本类型 (patch/minor/major)
  - 自动更新版本号
  - 发布到 npm

## 📋 使用方式

### 方式 1: 版本号自动发布 (推荐)

1. **更新版本号**:

   ```bash
   # 补丁版本 (0.1.0 → 0.1.1)
   npm version patch

   # 次要版本 (0.1.0 → 0.2.0)
   npm version minor

   # 主要版本 (0.1.0 → 1.0.0)
   npm version major
   ```

2. **推送到 GitHub**:

   ```bash
   git push origin main
   ```

3. **自动执行**: GitHub Actions 检测到版本变更后自动发布

### 方式 2: GitHub Release 发布

1. **在 GitHub 创建 Release**:
   - 进入仓库页面
   - 点击 **Releases** → **Create a new release**
   - 输入标签版本 (如 `v0.1.1`)
   - 填写发布说明
   - 点击 **Publish release**

2. **自动执行**: 创建 Release 后自动触发发布

### 方式 3: 手动发布

1. **触发工作流**:
   - 进入 GitHub 仓库
   - 点击 **Actions** → **Manual Release**
   - 点击 **Run workflow**
   - 选择版本类型和是否发布到 npm

## 🔍 监控和调试

### 查看工作流状态

- 在 GitHub 仓库的 **Actions** 标签页查看所有工作流运行状态
- 点击具体的工作流查看详细日志

### 常见问题

1. **NPM_TOKEN 无效**:
   - 检查令牌是否正确设置
   - 确认令牌类型为 **Automation**
   - 检查令牌是否有发布权限

2. **版本冲突**:
   - 确保 package.json 中的版本号是新的
   - 检查 npm 上是否已存在相同版本

3. **权限问题**:
   - 确认 GitHub Actions 有推送权限
   - 检查分支保护规则

## 🎯 最佳实践

1. **使用语义化版本**: 遵循 [Semantic Versioning](https://semver.org/)
2. **编写 Changelog**: 每次发布都记录变更内容
3. **测试**: 确保所有测试通过后再发布
4. **回滚计划**: 准备好版本回滚策略

## 📊 发布流程图

```
代码变更 → git push → GitHub Actions 检测
    ↓
版本号检查 → 构建测试 → 创建标签
    ↓
发布到 npm → 创建 GitHub Release → 通知完成
```

设置完成后，你只需要专注于代码开发，版本发布将完全自动化！🎉
