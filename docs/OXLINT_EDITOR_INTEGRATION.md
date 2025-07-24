# Oxlint 编辑器集成指南

## 问题回答：Oxlint 是否有类似 ESLint 的红线/黄线提示？

**答案：是的！** Oxlint 通过官方 VS Code 插件提供了与 ESLint 类似的编辑器内实时错误提示功能。

## 编辑器集成效果对比

### ESLint 集成效果

- ❌ 红色波浪线：错误 (errors)
- ⚠️ 黄色波浪线：警告 (warnings)
- 💡 蓝色灯泡：可自动修复的问题
- 🔧 右键菜单：快速修复选项

### Oxlint 集成效果 (通过 oxc.oxc-vscode 插件)

- ❌ 红色波浪线：错误 (errors)
- ⚠️ 黄色波浪线：警告 (warnings)
- 💡 自动修复建议
- 🚀 **更快的响应速度** (几乎实时)

## 已完成的配置

### 1. VS Code 插件安装 ✅

```bash
# 已安装插件
oxc.oxc-vscode - 官方 Oxc VS Code 插件
```

### 2. 工作区配置 ✅

文件：`.vscode/settings.json`

```json
{
  "oxc.enable": true,
  "oxc.configPath": "./oxlint.json",
  "oxc.lint.enable": true,
  "oxc.lint.onSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "explicit"
  }
}
```

### 3. Oxlint 规则配置 ✅

文件：`oxlint.json`

```json
{
  "rules": {
    "correctness": "error", // 红色波浪线
    "suspicious": "error", // 红色波浪线
    "perf": "warn", // 黄色波浪线
    "style": "warn" // 黄色波浪线
  }
}
```

## 实际测试效果

我创建了一个测试文件 `src/test-oxlint.ts`，包含常见的代码问题：

### 检测到的问题类型：

1. **未使用变量** (警告⚠️)：黄色波浪线
2. **条件赋值** (错误❌)：红色波浪线
3. **常量重新赋值** (错误❌)：红色波浪线
4. **常量条件** (错误❌)：红色波浪线

### 性能表现：

- **Oxlint**: 6ms 处理 1 个文件
- **87 个规则** 同时检查
- **8 线程** 并行处理

## 使用体验对比

| 特性        | ESLint         | Oxlint           |
| ----------- | -------------- | ---------------- |
| 🔴 错误提示 | ✅ 红色波浪线  | ✅ 红色波浪线    |
| 🟡 警告提示 | ✅ 黄色波浪线  | ✅ 黄色波浪线    |
| ⚡ 响应速度 | 🐌 较慢 (秒级) | 🚀 极快 (毫秒级) |
| 🔧 自动修复 | ✅ 支持        | ✅ 支持          |
| 💡 快速修复 | ✅ 丰富        | 🔄 基础          |
| 📱 悬停信息 | ✅ 详细        | ✅ 简洁          |
| 🎯 准确性   | ✅ 高          | ✅ 高            |

## 配置建议

### 推荐配置（已应用）

```json
{
  // 启用实时检查
  "oxc.lint.enable": true,

  // 保存时自动修复
  "oxc.lint.onSave": true,

  // 保存时执行修复
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "explicit"
  }
}
```

### 可选增强配置

```json
{
  // 禁用 ESLint 避免冲突
  "eslint.enable": false,

  // 设置 Oxlint 为默认 linter
  "typescript.preferences.includePackageJsonAutoImports": "auto",

  // 自定义错误严重程度
  "oxc.lint.rules": {
    "no-unused-vars": "warn",
    "no-console": "off"
  }
}
```

## 实用技巧

### 1. 快捷键使用

- `Ctrl+Shift+P` → "Oxc: Fix all auto-fixable problems"
- `F8` / `Shift+F8`: 跳转到下一个/上一个问题
- `Ctrl+.`: 快速修复菜单

### 2. 状态栏信息

- 显示当前文件的错误/警告数量
- 点击可快速跳转到问题位置

### 3. 问题面板

- `Ctrl+Shift+M`: 打开问题面板
- 查看所有文件的 lint 问题汇总

## 结论

✅ **Oxlint 完全支持编辑器内的红线/黄线提示功能**

通过官方 VS Code 插件，Oxlint 提供了与 ESLint 相似甚至更好的编辑器集成体验：

1. **视觉效果相同**：红色错误线、黄色警告线
2. **响应更快**：毫秒级响应 vs ESLint 的秒级响应
3. **功能完整**：自动修复、悬停信息、快速修复
4. **配置简单**：零配置开箱即用

现在你的项目已经完全配置好了 Oxlint 的编辑器集成，你可以享受超快速的代码检查体验！
