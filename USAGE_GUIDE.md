# GitHub Stars Manager 使用指南

## 快速开始

1. 安装并启用插件。
2. 在插件设置中添加 GitHub 账号和 Personal Access Token。
3. 打开 GitHub Stars Manager 视图。
4. 点击同步按钮获取 Star 仓库。
5. 从 Home 查看整理概览，从 Inbox 开始整理项目。

## Home Dashboard

Home 是知识库仪表盘，不是普通仓库列表。它用于查看：

- 总 Star 数
- Inbox 数量
- 已分类数量
- 已关联 Note 数量
- 已归档数量
- 最近新增数量
- 分类分布
- 语言分布
- Review 状态
- Top Tags
- Inbox queue
- Recently organized

## Inbox 工作流

未分类项目默认进入 Inbox。建议按以下顺序整理：

1. 打开 Inbox。
2. 点击项目卡片打开右侧详情。
3. 选择分类目录。
4. 添加标签。
5. 设置状态和评分。
6. 填写个人说明、个人评价和 Notes。
7. 添加项目相关链接。
8. 创建或关联 Obsidian Note。

项目设置分类后，会从 Inbox 进入正式知识库结构。

## 多级分类

左侧 Categories 是长期知识结构。

- 在分类区域空白处右键：创建一级分类。
- 在已有分类上右键：创建子分类或删除分类。
- 删除分类时，受影响项目会回到 Inbox。
- 项目详情中的 Category 只能从已创建分类中检索选择。
- 输入检索词不会自动创建新分类，避免误分类。

分类适合表达主要归属，例如：

```text
Robotics / PX4 / Flight Control
AI / Agents / Tools
Simulation / Robot Learning
```

## 标签

标签用于横向筛选，不用于决定 Note 文件路径。

### 项目详情中添加标签

1. 在 Tags 搜索框输入关键字。
2. 从匹配结果中选择已有标签。
3. 如果没有匹配标签，输入新标签后按 Enter 创建。
4. 点击已有 tag chip 可以移除。

详情面板会自动保存，不需要点 Save。

### 设置中的标签管理器

进入 Settings -> Tag manager：

- 输入框用于搜索或新增标签。
- 按 Enter 或点击 Add 新增标签。
- 搜索结果以紧凑 chip 形式显示。
- 单击选择标签。
- 按 Ctrl/Cmd 单击可多选。
- 右键选中标签或点击 Delete selected 删除。
- 已被项目使用的标签不会被直接删除。

## 项目详情

点击项目卡片后，右侧打开项目详情面板。可编辑：

- Category
- Tags
- Status
- Rating
- Personal Summary
- Personal Review
- Notes
- Project Links
- Linked Note

详情面板支持拖拽调整宽度。所有字段会自动保存。

Rating 点击星星设置评分；再次点击当前评分星级可清空评分。

## Linked Note

Linked Note 用于把 GitHub 项目连接到 Obsidian Markdown 笔记。

- 如果 Note 文件存在，点击可打开真实文件。
- 如果 Note 文件已删除，插件会将其视为未创建。
- 打开缺失 Note 不会自动生成空白文件。
- 点击创建 Note 会按当前 Note 设置和模板生成新文件。

## Note 设置与模板

进入 Settings -> Note settings 可配置：

- Note 根目录
- 文件命名规则
- 模板类型
- 自定义模板
- 创建后是否打开
- 是否写入分类链接
- 是否写入标签链接

内置模板：

- Default project properties
- Research review
- Implementation notes
- Custom template

常用变量：

```text
{{full_name}}
{{description}}
{{github_url}}
{{language}}
{{stars}}
{{forks}}
{{category}}
{{tags}}
{{status}}
{{rating}}
{{personal_summary}}
{{personal_review}}
{{project_links}}
{{notes}}
```

## 筛选与搜索

顶部搜索框可以检索仓库名称、描述、语言、标签和个人内容。

顶部默认只显示 All。更多高频视图可以通过 Add filter 添加，普通标签和复杂条件放在 Filter 抽屉中。

常用筛选：

- Inbox
- Needs Review
- Unclassified
- No Notes
- No Links
- Low Rating
- 标签
- 分类
- 语言
- Note 状态

## 账号与同步

账号管理放在 Settings 中。可以配置多个 GitHub 账号，并控制每个账号是否参与同步。

GitHub Token 推荐最小权限：

- `read:user`
- `public_repo`

如果要同步私有仓库相关信息，再考虑 `repo` 权限。

## 手动安装

将以下文件复制到你的 Vault 插件目录：

```text
VaultFolder/.obsidian/plugins/github-stars-manager/
```

需要复制：

```text
main.js
manifest.json
styles.css
```

重启 Obsidian 后，在社区插件中启用 GitHub Stars Manager。

## 数据安全

插件数据保存在本地 Obsidian 插件数据中。建议定期备份：

```text
VaultFolder/.obsidian/plugins/github-stars-manager/data.json
```

插件不会上传你的笔记内容，不收集遥测数据，也不会把 Token 发送给 GitHub 之外的服务。
