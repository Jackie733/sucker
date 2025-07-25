# 🚀 快速设置 GitHub 自动发布

## 第一步：设置 npm 令牌

1. **获取 npm 令牌**：

   ```bash
   # 登录 npm (如果还没登录)
   npm login

   # 或者在 npmjs.com 网站上:
   # 1. 登录 npmjs.com
   # 2. 头像 → Access Tokens → Generate New Token
   # 3. 选择 "Automation" 类型
   # 4. 复制令牌
   ```

2. **在 GitHub 设置密钥**：
   - 进入你的 GitHub 仓库
   - Settings → Secrets and variables → Actions
   - New repository secret:
     - Name: `NPM_SUCKER_TOKEN`
     - Secret: 粘贴你的 npm 令牌

## 第二步：推送工作流文件到 GitHub

```bash
# 添加所有文件到 git
git add .

# 提交变更
git commit -m "feat: add GitHub Actions auto-publish workflows with pnpm support"

# 推送到 GitHub
git push origin main
```

## 第三步：测试自动发布

### 方法 1: 版本号自动发布 (推荐)

```bash
# 更新补丁版本 (0.1.0 → 0.1.1)
pnpm run release:patch

# 或者更新次要版本 (0.1.0 → 0.2.0)
pnpm run release:minor

# 或者更新主要版本 (0.1.0 → 1.0.0)
pnpm run release:major
```

这将会：

- 自动更新 package.json 中的版本号
- 创建 git 标签
- 推送到 GitHub
- 触发自动发布到 npm

### 方法 2: 手动在 GitHub 触发

1. 进入 GitHub 仓库页面
2. 点击 "Actions" 标签
3. 选择 "Manual Release" 工作流
4. 点击 "Run workflow"
5. 选择版本类型 (patch/minor/major)
6. 点击 "Run workflow"

## 🎯 验证设置

1. **检查 GitHub Actions**：
   - 在仓库的 Actions 标签查看工作流运行状态
   - 确保所有工作流都成功运行

2. **检查 npm 发布**：

   ```bash
   # 检查最新版本
   npm view @jackie733/sucker version

   # 或者访问 npm 页面
   # https://www.npmjs.com/package/@jackie733/sucker
   ```

3. **测试安装**：
   ```bash
   # 在新目录测试安装
   mkdir test-install && cd test-install
   pnpm init
   pnpm install @jackie733/sucker
   ```

## 📋 工作流说明

我们设置了 3 个自动化工作流：

1. **`ci-cd.yml`** - 主要的持续集成/部署
   - 在每次推送和 PR 时运行测试
   - 在创建 Release 时自动发布

2. **`auto-publish.yml`** - 版本变更自动发布
   - 检测 package.json 版本变更
   - 自动创建标签和发布

3. **`manual-release.yml`** - 手动发布控制
   - 通过 GitHub 界面手动触发
   - 可选择版本类型和发布选项

## 🔧 日常使用流程

```bash
# 1. 开发新功能
git checkout -b feature/new-feature
# ... 开发代码 ...
git commit -m "feat: add new feature"

# 2. 合并到主分支
git checkout main
git merge feature/new-feature

# 3. 发布新版本
pnpm run release:patch  # 自动更新版本并发布

# 4. 验证发布
pnpm view @jackie733/sucker version
```

## 🎉 完成！

现在你的框架已经具备了完整的自动化发布流程：

- ✅ 代码质量检查
- ✅ 自动化测试
- ✅ 版本管理
- ✅ npm 自动发布
- ✅ GitHub Release 创建

每次你更新版本号并推送到 GitHub，就会自动发布到 npm！
