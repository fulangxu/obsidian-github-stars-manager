# GitHub Stars Manager

[![GitHub release](https://img.shields.io/github/release/EmberSparks/obsidian-github-stars-manager.svg)](https://github.com/EmberSparks/obsidian-github-stars-manager/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22github-stars-manager%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=github-stars-manager)

[English README](README_en.md) | [使用指南](USAGE_GUIDE.md) | [English Guide](USAGE_GUIDE_EN.md)

一个功能强大的 Obsidian 插件，让您可以直接在 Obsidian 中管理和查看 GitHub 星标仓库，支持多账号管理、自定义标签、智能搜索和精美主题。

## ✨ 核心功能

### 📊 仓库管理
- 📋 在 Obsidian 中查看所有已加星标的 GitHub 仓库
- 👥 **多账号支持**：同时管理多个 GitHub 账号的星标
- ⭐ **星标统计**：实时显示仓库总数和星标数量
- 🔄 智能同步：自动或手动同步星标仓库
- 🔄 **账号管理**：可单独启用/禁用特定账号的同步

### 🏷️ 个性化标注
- 🏷️ **Tag Chips 组件**：直观的标签芯片输入，支持快速选择已有标签
- 📝 为仓库添加自定义标签和笔记
- 🔗 关联仓库到 Obsidian 笔记文件
- 💾 所有标注数据本地存储，保护隐私

### 🔍 智能搜索与筛选
- 🔎 通过名称、描述、语言、标签进行实时搜索
- 🎯 支持正则表达式和模糊匹配
- 📊 按星标时间、名称、语言、星标数等多维度排序
- 🏷️ 基于标签的高级筛选

### 🎨 精美主题
- 🎨 **默认主题**：简洁的卡片布局，与 Obsidian 原生主题完美融合
- 🌊 **液态玻璃主题**：iOS 风格的毛玻璃效果，支持动态背景和光泽动画
- 📱 响应式瀑布流布局：类似 Pinterest 的卡片展示方式
- ✨ 平滑动画和悬停效果

### 🔒 安全与隐私
- 🔐 使用 GitHub Personal Access Token 进行安全认证
- 💾 GitHub 令牌、仓库缓存、标签和笔记均保存在本地插件数据中
- 🌐 仅在同步或校验令牌时访问 GitHub 官方服务
- ✅ 通过 eslint-plugin-obsidianmd 全部规则验证

## 安全与隐私

GitHub Stars Manager 是本地优先的 GitHub 集成插件。插件只会在用户配置账号、校验令牌、手动同步或触发相关操作时访问 GitHub 服务。

运行时可能访问的外部服务：

- `api.github.com`：校验 GitHub 令牌、读取当前用户信息、获取已加星标仓库和仓库详情
- `github.com`：用户点击仓库链接时在浏览器中打开 GitHub 页面
- `avatars.githubusercontent.com` 或其他 GitHub 头像域名：显示 GitHub 用户和仓库所有者头像

插件不会：

- 上传保险库内容或笔记正文
- 收集分析数据或遥测数据
- 跟踪用户行为
- 下载或执行远程代码
- 将 GitHub 令牌发送到 GitHub 以外的服务

GitHub 个人访问令牌会保存在 Obsidian 插件设置数据中。该数据位于本地保险库配置内，不会由插件主动上传；但它不是加密密码库。建议为令牌设置过期时间，并尽量使用满足需求的最小权限。

## 配置

要使用此插件，您需要提供一个具有必要权限的 GitHub 个人访问令牌 (PAT)，以便读取您已加星标的仓库。

**如何获取 GitHub 个人访问令牌 (PAT):**

1.  **登录 GitHub:** 访问 [github.com](https://github.com) 并登录您的账户。
2.  **访问设置:** 点击页面右上角的个人头像，然后选择 "Settings"。
3.  **开发者设置:** 在左侧菜单栏中，滚动到底部，点击 "Developer settings"。
4.  **个人访问令牌:** 在左侧菜单中，选择 "Personal access tokens"，然后选择 "Tokens (classic)"。 *(注意：请选择 Classic Token，Fine-grained tokens 可能需要更复杂的权限设置)*
5.  **生成新令牌:** 点击 "Generate new token" 按钮，然后选择 "Generate new token (classic)"。
6.  **令牌描述:** 在 "Note" 字段中，为您的令牌添加一个描述性的名称，例如 "Obsidian Stars Manager"。
7.  **设置过期时间:** 选择一个合适的过期时间 (Expiration)。为了安全起见，建议不要选择 "No expiration"。
8.  **选择范围 (Scopes):** 建议优先使用最小权限。读取公开星标仓库通常使用 `read:user` 和 `public_repo` 即可；只有在确实需要访问私有仓库相关数据时，才考虑使用更宽泛的 `repo` 权限。
9.  **生成令牌:** 点击页面底部的 "Generate token" 按钮。
10. **复制令牌:** **重要！** GitHub 只会显示一次完整的令牌。请立即点击复制按钮将其复制下来，并妥善保管。**离开此页面后将无法再次看到完整的令牌。**
11. **在插件中使用:** 将复制的令牌粘贴到 Obsidian 中 "GitHub Stars Manager" 插件设置选项卡里的 "GitHub 个人访问令牌 (PAT)" 字段中。

## 使用说明

1. 安装并启用插件后，在左侧面板会出现一个 GitHub 星标图标
2. 点击图标打开星标仓库视图
3. 首次使用需要在设置中配置您的 GitHub PAT
4. 点击"同步"按钮获取您的星标仓库
5. 您可以为每个仓库添加个人笔记、标签，或关联到现有的 Obsidian 笔记

📖 **[查看详细使用指南](USAGE_GUIDE.md)** | [English Guide](USAGE_GUIDE_EN.md)

### 主题切换

插件提供两种视觉主题：

- **默认主题**：简洁的卡片布局，与 Obsidian 原生主题保持一致
- **液态玻璃主题**：iOS 风格的毛玻璃效果，具有以下特性：
  - 🌈 彩色渐变背景，提供更好的视觉对比度
  - ✨ 动态浮动动画背景效果
  - 🔍 增强的毛玻璃模糊效果
  - 💫 卡片悬停时的光泽扫过动画
  - 📱 瀑布流布局，类似小红书的卡片展示
  - 🎯 优化的字体渲染，避免悬停时的模糊问题

在插件界面顶部可以通过主题按钮快速切换。

## 安装

### 从 Obsidian 社区插件安装（推荐）

1. 打开 Obsidian 设置
2. 转到"社区插件"选项卡
3. 搜索 "GitHub Stars Manager"
4. 点击安装并启用插件

### 手动安装

1. 下载最新版本的 `main.js`、`manifest.json` 和 `styles.css`
2. 将这些文件复制到您的保险库文件夹：`VaultFolder/.obsidian/plugins/github-stars-manager/`
3. 重启 Obsidian
4. 在设置中启用插件

## 开发

### 环境要求

- Node.js 16+
- npm 或 yarn

### 开发命令

```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 生产构建
npm run build

# 版本升级
npm run version
```

### 技术栈

- **TypeScript**: 类型安全的 JavaScript 超集
- **Obsidian API**: 插件开发框架
- **GitHub REST API**: 通过 @octokit/rest 访问 GitHub 数据
- **CSS3**: 现代样式和动画效果
- **esbuild**: 快速的 JavaScript 打包工具

### 本地开发环境配置

为了在本地开发和调试插件，您需要配置一个环境变量，指向您的 Obsidian 插件目录。这样，当您运行 `npm run dev` 或 `npm run build` 时，插件文件会自动部署到您的 Obsidian Vault 中。

1.  **创建 `.env` 文件**: 复制项目根目录下的 `.env.example` 文件，并将其重命名为 `.env`。
2.  **配置插件目录**: 打开 `.env` 文件，将 `OBSIDIAN_PLUGIN_DIR` 的值修改为您本地的 Obsidian 插件目录的绝对路径。例如：
    ```
    OBSIDIAN_PLUGIN_DIR="D:/MyObsidianVault/.obsidian/plugins"
    ```
3.  **重启开发服务器**: 如果您正在运行 `npm run dev`，请重新启动它以加载新的环境变量。

### 项目结构

```
├── src/
│   ├── main.ts          # 主插件类
│   ├── view.ts          # 星标仓库视图
│   ├── settings.ts      # 插件设置
│   ├── modal.ts         # 编辑对话框
│   ├── githubService.ts # GitHub API 服务
│   └── types.ts         # TypeScript 类型定义
├── main.ts              # 插件入口点
├── manifest.json        # 插件清单
├── styles.css          # 样式文件
└── README.md           # 说明文档
```

## 更新日志

### v0.1.2 (当前版本)
- 🛡️ 将最低 Obsidian 版本声明更新为 1.7.2，匹配当前使用的官方 API 要求
- 🔒 补充安全与隐私说明，明确运行时访问的 GitHub 服务和本地数据存储方式
- 🔑 将 GitHub 令牌说明调整为最小权限优先，推荐 `read:user` 和 `public_repo`
- 📦 优化 Release 工作流，仅发布 Obsidian 支持的插件文件并生成构建来源证明
- 🔧 移除构建脚本中的 `builtin-modules` 和 `dotenv` 依赖，降低审核警告

### v0.1.1
- 🏷️ 新增 Tag Chips 输入组件，支持快速选择标签
- ⭐ 添加星标总数显示功能
- 🎨 增强笔记卡片可见性和 UI 样式
- 🔧 启用全部 25 个 eslint-plugin-obsidianmd 规则
- 🐛 修复 token 错误处理和提示信息
- 🛡️ 补充安全与隐私说明，便于 Obsidian Community 审核识别网络与数据行为
- 🤖 配置 pre-commit hook 和 GitHub Actions CI/CD

### v0.1.0
- ✨ 初始版本发布
- 🎯 多账号 GitHub Stars 管理
- 🎨 液态玻璃主题支持
- 📱 响应式瀑布流布局
- 🔍 高级搜索和筛选功能
- 🏷️ 自定义标签和笔记功能

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 支持

如果您觉得这个插件对您有帮助，可以考虑：

- ⭐ 给项目点个星标
- 🐛 报告 Bug 或提出改进建议
- 💡 分享给其他 Obsidian 用户
- 💖 [赞助开发者](https://github.com/sponsors/EmberSparks)

## 相关链接

- [Obsidian 官网](https://obsidian.md)
- [GitHub API 文档](https://docs.github.com/en/rest)
- [插件开发文档](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
