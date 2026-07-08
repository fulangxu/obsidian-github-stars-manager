# GitHub Stars Manager

[English README](README.md) | [使用指南](USAGE_GUIDE.md) | [English Guide](USAGE_GUIDE_EN.md)

GitHub Stars Manager 是一个面向 Obsidian 的 GitHub Star 知识管理插件。它不是简单的收藏同步工具，而是帮助你把 GitHub Stars 中零散的开源项目，整理成可分类、可检索、可评价、可沉淀笔记的长期知识库。

## 核心能力

- **Dashboard 仪表盘**：查看收藏总数、Inbox、已分类、已关联 Note、归档、最近新增、语言分布、整理状态、标签和 Note 覆盖率。
- **Inbox 工作流**：同步后未分类项目默认进入 Inbox，适合集中整理。
- **多级分类目录**：支持一级、二级、三级及更深层级分类，左侧目录树直接展示。
- **标签系统**：标签用于横向筛选，不再和分类混在一起。支持搜索、添加、选择、删除。
- **项目详情面板**：点击项目后在右侧编辑分类、标签、状态、评分、个人说明、个人评价、Notes、Links 和 Linked Note。
- **自动保存**：项目详情中的修改会自动保存，不需要手动点 Save。
- **Note 生成**：按分类路径生成 Obsidian Markdown 笔记，支持默认模板、研究模板、实现模板和自定义模板。
- **Obsidian 原生风格**：界面使用 Obsidian 主题变量，不强行覆盖你的主题颜色。
- **本地优先**：Token、仓库缓存、分类、标签、评价和笔记链接都保存在本地插件数据中。

## 推荐工作流

1. 同步 GitHub Stars。
2. 新增或未分类项目进入 Inbox。
3. 从 Inbox 中筛选待整理项目。
4. 为项目选择多级分类和标签。
5. 填写个人说明、个人评价、使用记录、链接和评分。
6. 生成或关联 Obsidian Note。
7. 通过分类、标签、搜索、双链和 Note 复盘项目。

## 界面结构

- **Home**：知识库仪表盘，不再平铺所有仓库。
- **Inbox**：待整理项目队列。
- **All**：全部项目列表。
- **Recently added**：最近新增项目。
- **Archived**：归档项目。
- **Categories**：多级分类树。空白处右键创建一级分类；分类上右键创建子分类或删除分类。
- **Filter**：右上角筛选抽屉，按状态、分类、标签、语言、活跃度和 Note 状态筛选。
- **Settings**：设置语言、账号、标签管理器、Note 根目录、模板和同步策略。

## Note 与模板

可以在设置中配置 Note 根目录、文件命名规则、模板类型和自定义模板。默认路径会跟随分类：

```text
GitHub Stars/Robotics/PX4/Flight Control/PX4-PX4-Autopilot.md
```

默认模板包含项目属性、GitHub 信息、分类、标签、状态、评分、个人说明、个人评价、链接和笔记内容。支持变量：

```text
{{repo_name}}, {{full_name}}, {{owner}}, {{description}}, {{github_url}},
{{language}}, {{stars}}, {{forks}}, {{topics}}, {{category}}, {{tags}},
{{status}}, {{rating}}, {{personal_summary}}, {{personal_review}},
{{project_links}}, {{notes}}, {{created_at}}, {{updated_at}},
{{note_created_at}}, {{note_updated_at}}
```

插件会检查 Linked Note 文件是否真实存在。Note 被删除后，插件不会继续把它当作已存在，也不会在打开时创建空白 Note。

## 安全与隐私

插件只会在配置账号、校验 Token、同步仓库或打开 GitHub 链接时访问 GitHub。

可能访问的外部服务：

- `api.github.com`：校验 Token、读取用户信息和同步 Star 仓库。
- `github.com`：打开仓库页面。
- GitHub 头像域名：显示仓库 owner 头像。

使用的 Obsidian 能力：

- 读取 Vault 文件：检查 Linked Note 是否存在、打开已有笔记。
- 写入 Vault 文件：创建项目 Note 或导出文件。
- 写入剪贴板：仅在用户复制链接时使用。

插件不会上传你的 Vault 内容，不收集分析数据，不执行远程代码，也不会把 GitHub Token 发给 GitHub 之外的服务。

## GitHub Token

在 <https://github.com/settings/tokens> 创建 GitHub Personal Access Token。公开 Star 仓库通常只需要：

- `read:user`
- `public_repo`

只有确实需要访问私有仓库相关数据时，才考虑使用 `repo` 权限。建议设置过期时间，并使用最小权限。

## 安装

### Obsidian 社区插件

1. 打开 Obsidian 设置。
2. 进入社区插件。
3. 搜索 `GitHub Stars Manager`。
4. 安装并启用。

### 手动安装

1. 下载发布包中的 `main.js`、`manifest.json`、`styles.css`。
2. 复制到：

```text
VaultFolder/.obsidian/plugins/github-stars-manager/
```

3. 重启 Obsidian。
4. 在社区插件中启用。

## 更新日志

### v0.2.0

- 将插件定位升级为 GitHub Star 知识管理系统。
- 新增 Dashboard、Inbox 工作流、智能视图和多级分类。
- 新增可编辑的项目详情面板，支持自动保存和拖拽调整宽度。
- 新增标签管理器，支持添加、检索、选择和删除。
- 新增 Note 设置、内置模板、自定义模板和分类路径生成 Note。
- 修复 Linked Note 文件删除后仍显示存在的问题。
- 更新 README 和使用说明。

## 许可证

MIT License。详见 [LICENSE](LICENSE)。
