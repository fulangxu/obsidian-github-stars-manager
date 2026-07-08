# GitHub Stars Manager Usage Guide

## Quick Start

1. Install and enable the plugin.
2. Add a GitHub account and Personal Access Token in settings.
3. Open the GitHub Stars Manager view.
4. Click Sync to fetch starred repositories.
5. Use Home for overview and Inbox for triage.

## Home Dashboard

Home is a dashboard for knowledge-base health. It shows:

- Total stars
- Inbox count
- Classified count
- Linked note count
- Archived count
- Recently added count
- Category distribution
- Language distribution
- Review status
- Top tags
- Inbox queue
- Recently organized projects

## Inbox Workflow

Unclassified repositories enter Inbox by default.

Recommended triage flow:

1. Open Inbox.
2. Click a repository card.
3. Choose a category.
4. Add tags.
5. Set status and rating.
6. Add personal summary, evaluation, notes, and links.
7. Create or link an Obsidian note.

Once a repository has a category, it becomes part of the formal library.

## Multi-Level Categories

Categories are shown in the left sidebar.

- Right-click the empty category area to create a top-level category.
- Right-click a category to create a subcategory or delete it.
- Deleting a category moves affected projects back to Inbox.
- Repository details can only select existing categories.
- Typing in the category search box does not create a category by itself.

Example categories:

```text
Robotics / PX4 / Flight Control
AI / Agents / Tools
Simulation / Robot Learning
```

## Tags

Tags are horizontal filters. They do not control note paths.

### Add Tags In Repository Details

1. Type in the Tags search box.
2. Select a matching existing tag.
3. If no tag matches, type a new tag and press Enter.
4. Click a tag chip to remove it.

Repository details auto-save changes.

### Tag Manager

Open Settings -> Tag manager:

- Search or add tags from one input.
- Press Enter or click Add to create a tag.
- Results are shown as compact chips.
- Click to select a tag.
- Ctrl/Cmd-click to multi-select.
- Right-click selected tags or click Delete selected to delete.
- Tags used by repositories are protected from direct deletion.

## Repository Details

Click a repository card to open the right detail panel. Editable fields:

- Category
- Tags
- Status
- Rating
- Personal Summary
- Personal Review
- Notes
- Project Links
- Linked Note

The detail panel can be resized by dragging its left edge. All fields auto-save.

Click a rating star to set the rating. Click the current rating again to clear it.

## Linked Notes

Linked Note connects a GitHub repository to an Obsidian Markdown file.

- Existing note files open directly.
- Deleted note files are treated as missing.
- Opening a missing note does not create a blank file.
- Creating a note uses the configured note template.

## Note Settings And Templates

Open Settings -> Note settings to configure:

- Root folder
- Filename rule
- Template type
- Custom template
- Open after create
- Category links
- Tag links

Built-in templates:

- Default project properties
- Research review
- Implementation notes
- Custom template

Common variables:

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

## Search And Filters

The search box matches repository name, description, language, tags, and personal fields.

The top smart view bar is intentionally compact. Use Add filter and the Filter drawer for advanced dimensions:

- Inbox
- Needs Review
- Unclassified
- No Notes
- No Links
- Low Rating
- Tag
- Category
- Language
- Note status

## Accounts And Sync

Account management lives in Settings. Multiple GitHub accounts are supported.

Recommended GitHub token scopes:

- `read:user`
- `public_repo`

Use `repo` only if private repository-related data is needed.

## Manual Installation

Copy release files to:

```text
VaultFolder/.obsidian/plugins/github-stars-manager/
```

Required files:

```text
main.js
manifest.json
styles.css
```

Restart Obsidian and enable the plugin.

## Data Safety

Plugin data is stored locally in Obsidian plugin data. Regularly back up:

```text
VaultFolder/.obsidian/plugins/github-stars-manager/data.json
```

The plugin does not upload note content, collect telemetry, or send your GitHub token to services other than GitHub.
