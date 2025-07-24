# Oxlint 配置指南

## 关于 Oxlint

Oxlint 是一个用 Rust 编写的超快速 JavaScript/TypeScript 代码检查工具，具有以下特点：

- ⚡ **极速**: 比 ESLint 快 50-100 倍
- 🛠️ **零配置**: 开箱即用，内置合理默认规则
- 📝 **TypeScript 原生支持**: 直接解析 TypeScript 代码
- 🔧 **自动修复**: 支持自动修复大部分问题
- 🎯 **ESLint 兼容**: 支持大部分 ESLint 规则

## 配置文件说明

### 主要配置 (oxlint.json)

```json
{
  "rules": {
    "correctness": "error", // 明显错误的代码
    "suspicious": "error", // 可疑或可能错误的代码
    "perf": "warn", // 性能相关问题
    "style": "warn", // 代码风格问题
    "pedantic": "off", // 严格但偶有误报的规则
    "nursery": "off", // 开发中的新规则
    "restriction": "off" // 限制性规则
  },
  "allow": [
    "no-console" // 允许 console.log 等
  ],
  "deny": [
    "no-unused-vars", // 禁止未使用变量
    "no-undef" // 禁止未定义变量
  ],
  "ignore": [
    "dist/**/*", // 忽略构建输出
    "node_modules/**/*", // 忽略依赖包
    "**/*.js", // 忽略 JS 文件
    "**/*.d.ts" // 忽略类型定义文件
  ]
}
```

## 使用方法

### 基本命令

```bash
# 检查代码
npm run lint                # 使用 oxlint 检查
npx oxlint src/            # 直接使用 oxlint

# 自动修复
npm run lint:fix           # 自动修复问题
npx oxlint --fix src/      # 直接使用自动修复

# 查看配置
npx oxlint --print-config  # 显示当前配置

# 列出所有规则
npx oxlint --rules         # 显示所有可用规则
```

### 高级用法

```bash
# 启用插件
npx oxlint --react-plugin --typescript-plugin src/

# 自定义规则
npx oxlint -D correctness -A no-console src/

# 指定配置文件
npx oxlint -c ./custom-oxlint.json src/

# 输出格式
npx oxlint --format json src/     # JSON 格式输出
npx oxlint --format github src/   # GitHub Actions 格式
```

## 与 ESLint 对比

| 特性            | Oxlint  | ESLint    |
| --------------- | ------- | --------- |
| 速度            | 🚀 极快 | 🐌 较慢   |
| 配置复杂度      | 🟢 简单 | 🟡 复杂   |
| 插件生态        | 🟡 有限 | 🟢 丰富   |
| TypeScript 支持 | 🟢 原生 | 🟡 需配置 |
| 自动修复        | 🟢 内置 | 🟢 支持   |

## 迁移建议

### 选项 1: 完全替换 ESLint

- 速度最快
- 配置最简单
- 适合新项目或对 ESLint 插件依赖较少的项目

### 选项 2: 双 Linter 策略

- 使用 Oxlint 进行快速日常检查
- 保留 ESLint 用于 CI/CD 或特殊规则
- 适合大型项目或有复杂 ESLint 配置的项目

### 选项 3: 渐进式迁移

- 先在开发环境使用 Oxlint
- 逐步减少对 ESLint 的依赖
- 适合谨慎迁移的团队

## 最佳实践

1. **开发阶段**: 使用 Oxlint 快速检查
2. **提交前**: 运行 `npm run check` 进行全面检查
3. **CI/CD**: 可同时运行两个 linter 确保兼容性
4. **团队协作**: 统一配置文件，确保规则一致

## 常见问题

### Q: Oxlint 不能自动修复某些问题

A: Oxlint 的自动修复功能还在完善中，可以配合 Prettier 使用

### Q: 如何处理 Oxlint 不支持的规则

A: 可以保留 ESLint 用于特殊规则，或等待 Oxlint 更新

### Q: 性能对比如何

A: 在我们的项目中，Oxlint 检查 6 个文件用时 13ms，相比 ESLint 提升显著

## 更新日志

- v1.8.0: 当前使用版本，支持大部分常用规则
- 后续版本会持续增加规则支持和自动修复能力
