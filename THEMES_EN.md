# Interface Style Notes

## Current Status

GitHub Stars Manager no longer provides an in-plugin theme switch. The plugin uses one consistent Obsidian-native interface style and follows Obsidian's active light or dark appearance.

On startup, the plugin removes legacy theme classes so older `github-stars-theme-default` or `github-stars-theme-ios-glass` styles do not affect the current interface.

## Design Principles

- **Follow Obsidian appearance**: Prefer Obsidian color variables and native visual semantics.
- **Readability first**: Repository names, descriptions, tags, stars, forks, and update metadata remain easy to scan.
- **High information density**: The masonry card layout supports browsing many repositories.
- **Low-distraction interaction**: Buttons, tags, and cards provide hover feedback without reshaping the layout.
- **Simple maintenance**: Avoid multiple theme paths that drift from implementation and documentation.

## Main Structure

- Top toolbar: sync, search, account filtering, statistics, tag management, and export actions.
- Tag area: colored tag chips for showing and filtering custom tags.
- Repository list: responsive masonry cards for repository information.
- Edit modal: manages tags, notes, and linked Obsidian notes.

## Historical Note

Earlier versions included a default theme and an iOS Glass theme with a toolbar theme switch. That feature has been removed. Current README and usage docs describe the present fixed interface.

If theme support is reintroduced later, update these files together:

- `README.md`
- `README_en.md`
- `README_zh.md`
- `USAGE_GUIDE.md`
- `USAGE_GUIDE_EN.md`
- `THEMES.md`
- `THEMES_EN.md`

---

*Last updated: June 10, 2026*
