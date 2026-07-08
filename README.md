# GitHub Stars Manager

[![GitHub release](https://img.shields.io/github/release/EmberSparks/obsidian-github-stars-manager.svg)](https://github.com/EmberSparks/obsidian-github-stars-manager/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22github-stars-manager%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json)](https://obsidian.md/plugins?id=github-stars-manager)

[简体中文 README](README_zh.md) | [Usage Guide](USAGE_GUIDE_EN.md) | [使用指南](USAGE_GUIDE.md)

GitHub Stars Manager is an Obsidian plugin for turning GitHub Stars into a maintainable open-source project knowledge base. It syncs starred repositories into Obsidian, then helps you triage them through Inbox, multi-level categories, tags, personal reviews, linked notes, and reusable Markdown templates.

## Highlights

- Dashboard for collection health, Inbox size, classified projects, linked notes, archived projects, language distribution, review status, and note coverage.
- Inbox workflow for newly synced or unclassified repositories.
- Multi-level category tree for long-term knowledge organization.
- Tag search, tag chips, and a compact tag manager with add, search, select, and delete actions.
- Repository detail inspector with editable category, tags, status, rating, personal summary, review, notes, links, and linked note path.
- Auto-save in the repository detail panel.
- Note generation with configurable root folder, filename rule, built-in templates, and custom templates.
- Obsidian-native UI that follows the active Obsidian theme variables.
- Local-first storage. Tokens, repository cache, taxonomy, reviews, and note links stay in local plugin data.

## Knowledge Management Workflow

1. Sync GitHub Stars.
2. New unclassified repositories enter Inbox.
3. Review projects from Inbox or smart views such as No Notes, No Links, Needs Review, and Low Rating.
4. Assign a multi-level category and tags.
5. Add personal summary, evaluation, notes, links, and rating.
6. Generate or link an Obsidian Markdown note.
7. Use categories, tags, search, backlinks, and generated notes to revisit projects later.

## Interface

- **Home**: Dashboard metrics, charts, Inbox queue, and recently organized projects.
- **Library**: Home, Inbox, All, Recently added, and Archived.
- **Categories**: Multi-level category tree. Right-click the category area to create a top-level category. Right-click a category to create a subcategory or delete the category.
- **Filter**: Use the toolbar filter drawer for status, category, tag, language, activity, and note filters.
- **Project detail**: Click a repository card to open the editable detail panel. The panel can be resized with the mouse.
- **Settings**: Configure language, accounts, tag manager, note settings, templates, and note behavior.

## Notes And Templates

The plugin can create project notes under a configured root folder. By default, note paths follow the repository category:

```text
GitHub Stars/Robotics/PX4/Flight Control/PX4-PX4-Autopilot.md
```

The default note template includes repository metadata, category, tags, status, rating, personal summary, personal review, project links, and notes. The settings page also provides research, implementation, and custom template modes.

Template variables include:

```text
{{repo_name}}, {{full_name}}, {{owner}}, {{description}}, {{github_url}},
{{language}}, {{stars}}, {{forks}}, {{topics}}, {{category}}, {{tags}},
{{status}}, {{rating}}, {{personal_summary}}, {{personal_review}},
{{project_links}}, {{notes}}, {{created_at}}, {{updated_at}},
{{note_created_at}}, {{note_updated_at}}
```

The plugin updates controlled metadata when generating notes. User-written note content should be kept in the user-editable sections.

## Security And Privacy

GitHub Stars Manager is local-first. It connects to GitHub only when validating accounts, syncing repositories, or opening GitHub links.

Runtime external services:

- `api.github.com`: validates GitHub tokens and fetches starred repositories.
- `github.com`: opens repository pages.
- GitHub avatar hosts: display repository owner avatars.

Runtime Obsidian capabilities:

- Vault file reads: verify linked note existence and open existing notes.
- Vault writes: create generated repository notes and export files.
- Clipboard writes: copy repository URLs when requested.

The plugin does not upload vault content, collect analytics, track users, execute remote code, or send GitHub tokens to services other than GitHub.

## GitHub Token

Create a GitHub Personal Access Token from <https://github.com/settings/tokens>. For public starred repositories, prefer the minimum scopes:

- `read:user`
- `public_repo`

Use `repo` only if you need private repository-related data. Tokens are stored in local Obsidian plugin data and are not encrypted by this plugin, so use expiration dates and minimum permissions.

## Installation

### Community Plugin

1. Open Obsidian Settings.
2. Go to Community plugins.
3. Search for `GitHub Stars Manager`.
4. Install and enable the plugin.

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from a release.
2. Copy them to:

```text
VaultFolder/.obsidian/plugins/github-stars-manager/
```

3. Restart Obsidian.
4. Enable the plugin in Community plugins.

## Development

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Changelog

### v0.2.0

- Repositioned the plugin as a GitHub Star knowledge management system.
- Added Dashboard, Inbox workflow, smart views, and multi-level categories.
- Added editable repository detail panel with auto-save and resizable width.
- Added tag manager with compact search, selection, and delete workflow.
- Added note settings, built-in templates, custom template editing, and category-based note paths.
- Improved linked note handling so deleted notes are no longer treated as existing notes.
- Updated documentation for the new KMS workflow.

### v0.1.3

- Made the root README English-first for Obsidian Community review.
- Added clearer runtime capability disclosures.
- Standardized the UI on Obsidian's active appearance.

## License

MIT License. See [LICENSE](LICENSE).
