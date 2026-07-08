# GitHub Star Knowledge Management System Roadmap

## Product Positioning

This plugin should be treated as a GitHub Star knowledge management system, not only a starred repository sync tool. Its goal is to turn unorganized GitHub stars into a maintainable open-source project knowledge base inside Obsidian.

The core workflow is:

1. Sync GitHub stars.
2. Put unorganized repositories into Inbox.
3. Triage and classify repositories.
4. Add tags, status, rating, personal summary, and personal review.
5. Generate or link an Obsidian note.
6. Preserve long-form user notes and connect projects through backlinks.
7. Review Dashboard health metrics over time.

## Information Architecture

The primary interface should be organized as a knowledge workspace:

- Library: Home, Inbox, All, Recently added, Archived.
- Categories: a multi-level project taxonomy used as the long-term directory structure.
- Tags: horizontal filters, not navigation hierarchy.
- Repository cards: compact summaries with GitHub metadata plus user knowledge fields.
- Detail editor: structured repository knowledge card editor.
- Note settings: controls for generated note paths, templates, metadata updates, and backlink behavior.

## Current Implementation Baseline

The current implementation has established the first KMS layer:

- Dashboard mode for Home.
- Library navigation states: Home, Inbox, All, Recently added, Archived.
- Multi-level category paths.
- Category-filtered repository view.
- Tags retained as horizontal filters.
- Repository knowledge fields:
  - status
  - rating
  - personal summary
  - personal review
  - long notes
  - linked note
  - project links
- Generated notes are stored under the configured note root and category path.
- Generated notes preserve the `## My notes` user section on update.
- Settings include note root folder, filename template, move strategy, open-after-create, and backlink toggles.

## Next Phases

### Phase 1: Inbox Triage

- Add bulk selection to Inbox.
- Support batch category assignment.
- Support batch tag assignment.
- Support batch archive.
- Add Inbox filters for language, topics, stars, update age, archived GitHub repo state, and stale projects.

### Phase 2: Management Center

- Move category management and tag management into one modal.
- Add tabs: Categories and Tags.
- Support category create, rename, merge, delete, and move.
- Support tag rename, merge, color, and delete.

### Phase 3: Detail Panel Redesign

- Replace the form-heavy modal with a structured detail workspace:
  - Repository header
  - Organization
  - Personal review
  - Notes
  - Links
  - Linked note
- Add category picker.
- Add markdown-friendly notes editing.
- Move low-frequency actions into a menu or side panel.

### Phase 4: Note System

- Add custom template editor.
- Support selecting an existing Obsidian template file.
- Add managed metadata section markers.
- Add category index note generation.
- Implement note migration when category changes.
- Add repository unstar handling policy: keep note, archive note, or move to archive folder.

### Phase 5: Knowledge Graph Integration

- Generate category backlinks.
- Generate tag backlinks.
- Optionally generate topic backlinks.
- Support category index notes that list child repositories.
- Keep user-written sections protected from sync overwrites.

## Design Principles

- Respect Obsidian theme variables.
- Avoid fixed custom color systems.
- Use layout, hierarchy, spacing, borders, and component grouping to improve usability.
- Keep the main list quiet and scannable.
- Treat categories as structure and tags as filters.
- Never overwrite user-written note content.
- Make automation reversible or user-configurable.
