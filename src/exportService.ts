import { TFile, Vault, normalizePath, Modal, App } from 'obsidian';
import { GithubRepository, UserRepoEnhancements, ExportOptions, ExportResult, RepoExportData, DEFAULT_EXPORT_OPTIONS, NoteSettings } from './types';
import { EmojiUtils } from './emojiUtils';
import { t } from './i18n';

/**
 * GitHub Stars 导出服务
 * 负责将星标仓库导出为Markdown文件
 */
export class ExportService {
    private vault: Vault;
    private app: App;
    private overwriteAll: boolean | null = null; // 用于跟踪"覆盖全部"的状态

    constructor(app: App) {
        this.app = app;
        this.vault = app.vault;
    }


    /**
     * 导出所有仓库
     */
    async exportAllRepositories(
        repositories: GithubRepository[],
        userEnhancements: { [repoId: number]: UserRepoEnhancements },
        options: Partial<ExportOptions> = {}
    ): Promise<ExportResult> {
        const exportOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options };
        this.overwriteAll = null; // 重置覆盖状态
        const result: ExportResult = {
            success: true,
            exportedCount: 0,
            skippedCount: 0,
            errors: [],
            exportedFiles: []
        };

        try {
            // 确保目标文件夹存在
            await this.ensureFolderExists(exportOptions.targetFolder);

            // 为每个仓库生成导出数据
            const exportDataList = repositories.map(repo => 
                this.generateRepoExportData(repo, userEnhancements[repo.id], exportOptions)
            );

            // 执行导出
            for (const exportData of exportDataList) {
                try {
                    const success = await this.exportSingleRepository(exportData, exportOptions);
                    if (success) {
                        result.exportedCount++;
                        result.exportedFiles.push(exportData.filename);
                    } else {
                        result.skippedCount++;
                    }
                } catch (error) {
                    result.errors.push(t('export.repoExportFailed', {
                        name: exportData.repository.full_name,
                        error: error.message
                    }));
                    result.skippedCount++;
                }
            }

            if (result.errors.length > 0) {
                result.success = false;
            }

        } catch (error) {
            result.success = false;
            result.errors.push(t('export.processExportFailed', { error: error.message }));
        }

        return result;
    }

    /**
     * 导出单个仓库
     */
    async exportSingleRepositoryById(
        repository: GithubRepository,
        userEnhancements: UserRepoEnhancements | undefined,
        options: Partial<ExportOptions> = {}
    ): Promise<boolean> {
        const exportOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options };
        
        try {
            // 确保目标文件夹存在
            await this.ensureFolderExists(exportOptions.targetFolder);

            // 生成导出数据
            const exportData = this.generateRepoExportData(repository, userEnhancements, exportOptions);

            // 执行导出
            return await this.exportSingleRepository(exportData, exportOptions);
        } catch (error) {
            // 静默处理单个仓库导出错误
            console.debug('Export single repository failed:', error);
            return false;
        }
    }

    async createRepositoryDetailNote(
        repository: GithubRepository,
        userEnhancements: UserRepoEnhancements | undefined,
        options: Partial<ExportOptions> = {},
        noteSettings?: NoteSettings
    ): Promise<string | null> {
        const exportOptions = {
            ...DEFAULT_EXPORT_OPTIONS,
            ...options,
            targetFolder: noteSettings?.rootFolder || options.targetFolder || DEFAULT_EXPORT_OPTIONS.targetFolder,
            filenameTemplate: noteSettings?.filenameTemplate || options.filenameTemplate || DEFAULT_EXPORT_OPTIONS.filenameTemplate,
            noteTemplateId: noteSettings?.templateId || 'default',
            customNoteTemplate: noteSettings?.customTemplate || '',
            overwriteExisting: true
        };

        try {
            const exportData = this.generateRepoExportData(repository, userEnhancements, exportOptions);
            const filePath = this.generateRepositoryNotePath(exportData, exportOptions);
            await this.ensureFolderExists(filePath.split('/').slice(0, -1).join('/'));
            const content = await this.mergeWithExistingUserSection(filePath, exportData.content);
            const existingFile = this.vault.getAbstractFileByPath(filePath);
            if (existingFile instanceof TFile) {
                await this.vault.modify(existingFile, content);
            } else {
                await this.vault.create(filePath, content);
            }
            return filePath;
        } catch (error) {
            console.error('Create repository detail note failed:', error);
            return null;
        }
    }

    /**
     * 生成单个仓库的导出数据
     */
    private generateRepoExportData(
        repository: GithubRepository,
        enhancements: UserRepoEnhancements | undefined,
        options: ExportOptions
    ): RepoExportData {
        const filename = this.generateFilename(repository, options.filenameTemplate);
        const content = this.generateMarkdownContent(repository, enhancements, options);

        return {
            repository,
            enhancements,
            filename,
            content
        };
    }

    /**
     * 执行单个仓库的导出
     */
    private async exportSingleRepository(
        exportData: RepoExportData,
        options: ExportOptions
    ): Promise<boolean> {
        const filePath = this.generateRepositoryNotePath(exportData, options);

        // 检查文件是否已存在
        const existingFile = this.vault.getAbstractFileByPath(filePath);
        if (existingFile && !options.overwriteExisting) {
            if (this.overwriteAll === true) {
                // 用户已选择"覆盖全部"
            } else if (this.overwriteAll === false) {
                // 用户已选择"跳过全部"
                return false;
            } else {
                // 询问用户
                const userChoice = await this.confirmOverwrite(filePath);
                    if (userChoice === 'overwriteAll') {
                        this.overwriteAll = true;
                    } else if (userChoice === 'skipAll') {
                        this.overwriteAll = false;
                        return false;
                    } else if (userChoice === 'skip') {
                        return false;
                    }
                    // 如果是 'overwrite'，则继续执行
                }
            }

        // 创建或更新文件
        if (existingFile instanceof TFile) {
            await this.vault.modify(existingFile, exportData.content);
        } else {
            await this.vault.create(filePath, exportData.content);
        }

        return true;
    }

    /**
     * 确认是否覆盖现有文件
     */
    private async confirmOverwrite(filePath: string): Promise<'overwrite' | 'skip' | 'overwriteAll' | 'skipAll'> {
        return new Promise((resolve) => {
            const modal = new OverwriteConfirmModal(this.app, filePath, resolve);
            modal.open();
        });
    }

    /**
     * 生成文件名
     */
    private generateFilename(repository: GithubRepository, template: string): string {
        let filename = template
            .replace(/\{\{owner\}\}/g, repository.owner?.login || 'unknown')
            .replace(/\{\{name\}\}/g, repository.name || 'unnamed')
            .replace(/\{\{full_name\}\}/g, repository.full_name || 'unknown/unnamed')
            .replace(/\{\{id\}\}/g, repository.id.toString());

        // 清理文件名中的非法字符
        filename = filename.replace(/[<>:"/\\|?*]/g, '-');
        
        return filename;
    }

    /**
     * 生成Markdown内容
     */
    private generateMarkdownContent(
        repository: GithubRepository,
        enhancements: UserRepoEnhancements | undefined,
        options: ExportOptions
    ): string {
        const lines: string[] = [];

        // 只生成Properties YAML前置内容，不生成正文
        if (options.includeProperties && options.propertiesTemplate && options.propertiesTemplate.length > 0) {
            lines.push('---');
            for (const property of options.propertiesTemplate) {
                // 只处理启用的属性
                if (property.enabled) {
                    let value = this.resolvePropertyValue(property.value, repository, enhancements, options);
                    
                    // 应用emoji保护和恢复
                    value = EmojiUtils.restoreEmojis(value);
                    
                    // For checkbox type, the value can be 'true' or 'false', so we don't check trim()
                    if (property.type === 'checkbox' || value.trim()) {
                        lines.push(`${property.key}: ${this.formatYamlPropertyValue(value, property.type)}`);
                    }
                }
            }
            lines.push('---');
        }

        // 对整个内容应用emoji保护
        let content = lines.join('\n');
        content = EmojiUtils.restoreEmojis(content);

        const body = this.generateMarkdownBody(repository, enhancements, options);
        return [content, body].filter((part) => part.trim().length > 0).join('\n\n');
    }

    private generateRepositoryNotePath(exportData: RepoExportData, options: ExportOptions): string {
        const categoryPath = Array.isArray(exportData.enhancements?.categoryPath)
            ? exportData.enhancements.categoryPath
                .map((segment) => this.sanitizePathSegment(segment))
                .filter((segment) => segment.length > 0)
            : [];
        return normalizePath([
            options.targetFolder,
            ...categoryPath,
            `${exportData.filename}.md`
        ].join('/'));
    }

    private sanitizePathSegment(segment: string): string {
        return segment.trim().replace(/[<>:"\\|?*]/g, '-').replace(/\//g, '-');
    }

    private async mergeWithExistingUserSection(filePath: string, nextContent: string): Promise<string> {
        const existingFile = this.vault.getAbstractFileByPath(filePath);
        if (!(existingFile instanceof TFile)) {
            return nextContent;
        }
        const existingContent = await this.vault.read(existingFile);
        const marker = '## My notes';
        const existingMarkerIndex = existingContent.indexOf(marker);
        if (existingMarkerIndex === -1) {
            return nextContent;
        }
        const nextMarkerIndex = nextContent.indexOf(marker);
        if (nextMarkerIndex === -1) {
            return nextContent;
        }
        return `${nextContent.slice(0, nextMarkerIndex).trimEnd()}\n\n${existingContent.slice(existingMarkerIndex).trimStart()}`;
    }

    private generateMarkdownBody(
        repository: GithubRepository,
        enhancements: UserRepoEnhancements | undefined,
        options: ExportOptions
    ): string {
        const lines: string[] = [];
        const categoryPath = Array.isArray(enhancements?.categoryPath)
            ? enhancements.categoryPath.filter((segment) => segment.trim().length > 0)
            : [];
        const tags = Array.isArray(enhancements?.tags) ? enhancements.tags : [];
        const projectLinks = Array.isArray(enhancements?.project_links) ? enhancements.project_links : [];

        const renderedTemplate = this.renderConfiguredNoteTemplate(repository, enhancements, options, categoryPath, tags, projectLinks);
        if (renderedTemplate) {
            return EmojiUtils.restoreEmojis(renderedTemplate);
        }

        lines.push(`# ${repository.full_name || repository.name}`);
        lines.push('');
        if (repository.description) {
            lines.push(`> ${repository.description}`);
            lines.push('');
        }

        lines.push('## Project overview');
        lines.push('');
        lines.push(`- GitHub: ${repository.html_url}`);
        lines.push(`- Owner: ${repository.owner?.login || ''}`);
        lines.push(`- Language: ${repository.language || 'Unknown'}`);
        if (options.includeStats) {
            lines.push(`- Stars: ${repository.stargazers_count || 0}`);
            lines.push(`- Forks: ${repository.forks_count || 0}`);
            lines.push(`- Open issues: ${repository.open_issues_count || 0}`);
        }
        if (categoryPath.length > 0) {
            lines.push(`- Category: ${categoryPath.join(' / ')}`);
        }
        if (repository.starred_at) {
            lines.push(`- Starred at: ${this.formatDate(repository.starred_at)}`);
        }
        lines.push('');

        if (options.includeTopics && repository.topics && repository.topics.length > 0) {
            lines.push('## GitHub topics');
            lines.push('');
            repository.topics.forEach((topic) => lines.push(`- ${topic}`));
            lines.push('');
        }

        if (options.includeEnhancements) {
            lines.push('## Personal interpretation');
            lines.push('');
            if (enhancements?.personalSummary?.trim()) {
                lines.push(`**Summary:** ${enhancements.personalSummary.trim()}`);
                lines.push('');
            }
            if (enhancements?.personalReview?.trim()) {
                lines.push(enhancements.personalReview.trim());
            } else {
                lines.push('- Why this project matters: ');
                lines.push('- Best use case: ');
                lines.push('- Integration idea: ');
                lines.push('- Risks or limitations: ');
            }
            lines.push('');

            lines.push('## Local tags');
            lines.push('');
            if (tags.length > 0) {
                tags.forEach((tag) => lines.push(`- ${tag}`));
            } else {
                lines.push('- ');
            }
            lines.push('');

            lines.push('## Related links');
            lines.push('');
            if (projectLinks.length > 0) {
                projectLinks.forEach((link) => lines.push(`- [${link.label}](${link.url})`));
            } else {
                lines.push('- ');
            }
            lines.push('');
        }

        lines.push('## Obsidian links');
        lines.push('');
        if (categoryPath.length > 0) {
            lines.push(`- Category: ${categoryPath.map((segment, index) => `[[${categoryPath.slice(0, index + 1).join('/')}|${segment}]]`).join(' / ')}`);
        }
        if (tags.length > 0) {
            lines.push(`- Tags: ${tags.map((tag) => `[[${tag}]]`).join(', ')}`);
        }
        if (categoryPath.length === 0 && tags.length === 0) {
            lines.push('- ');
        }
        lines.push('');

        lines.push('## Review checklist');
        lines.push('');
        lines.push('- [ ] Read README and installation docs');
        lines.push('- [ ] Identify core dependency or runtime requirements');
        lines.push('- [ ] Check maintenance activity and issue health');
        lines.push('- [ ] Decide whether to keep, archive, or build a demo');
        lines.push('');
        lines.push('## My notes');
        lines.push('');
        if (enhancements?.notes?.trim()) {
            lines.push(enhancements.notes.trim());
        } else {
            lines.push('Write long-form usage notes, source reading records, experiments, and caveats here.');
        }

        return EmojiUtils.restoreEmojis(lines.join('\n'));
    }

    private renderConfiguredNoteTemplate(
        repository: GithubRepository,
        enhancements: UserRepoEnhancements | undefined,
        options: ExportOptions,
        categoryPath: string[],
        tags: string[],
        projectLinks: Array<{ label: string; url: string }>
    ): string | null {
        const templateId = options.noteTemplateId || 'default';
        const customTemplate = options.customNoteTemplate?.trim();
        const templates: Record<string, string> = {
            default: `# {{full_name}}

> {{description}}

## Project properties

- GitHub: {{github_url}}
- Owner: {{owner}}
- Language: {{language}}
- Stars: {{stars}}
- Forks: {{forks}}
- Category: {{category}}
- Tags: {{tags}}
- Status: {{status}}
- Rating: {{rating}}
- Starred at: {{starred_at}}

## Personal interpretation

**Summary:** {{personal_summary}}

{{personal_review}}

## Related links

{{project_links}}

## Obsidian links

{{obsidian_links}}

## My notes

{{notes}}`,
            research: `# {{full_name}} Research Review

## Why it matters

{{personal_summary}}

## Technical reading

- Core idea:
- Architecture:
- Important modules:
- Related papers:

## Evaluation

{{personal_review}}

## Reproduction notes

- Environment:
- Install:
- Test command:
- Known issues:

## Project properties

- URL: {{github_url}}
- Language: {{language}}
- Stars: {{stars}}
- Category: {{category}}
- Tags: {{tags}}

## My notes

{{notes}}`,
            implementation: `# {{full_name}} Implementation Notes

## Use case

{{personal_summary}}

## Quick facts

- GitHub: {{github_url}}
- Language: {{language}}
- Stars: {{stars}}
- Forks: {{forks}}
- Category: {{category}}
- Status: {{status}}
- Rating: {{rating}}

## How to use

- Install:
- Minimal example:
- Integration points:
- Version constraints:

## Links

{{project_links}}

## Review

{{personal_review}}

## My notes

{{notes}}`
        };
        const template = templateId === 'custom' ? customTemplate : templates[templateId];
        if (!template) return null;
        return this.replaceNoteTemplateVariables(template, repository, enhancements, categoryPath, tags, projectLinks);
    }

    private replaceNoteTemplateVariables(
        template: string,
        repository: GithubRepository,
        enhancements: UserRepoEnhancements | undefined,
        categoryPath: string[],
        tags: string[],
        projectLinks: Array<{ label: string; url: string }>
    ): string {
        const replacements: Record<string, string> = {
            repo_name: repository.name || '',
            name: repository.name || '',
            full_name: repository.full_name || '',
            owner: repository.owner?.login || '',
            description: repository.description || '',
            github_url: repository.html_url || '',
            url: repository.html_url || '',
            language: repository.language || 'Unknown',
            stars: String(repository.stargazers_count || 0),
            forks: String(repository.forks_count || 0),
            topics: (repository.topics || []).join(', '),
            category: categoryPath.length > 0 ? categoryPath.join(' / ') : 'Uncategorized',
            tags: tags.length > 0 ? tags.join(', ') : 'No tags',
            status: enhancements?.status || 'inbox',
            rating: String(enhancements?.rating || 0),
            personal_summary: enhancements?.personalSummary?.trim() || '',
            personal_review: enhancements?.personalReview?.trim() || '',
            notes: enhancements?.notes?.trim() || 'Write long-form usage notes, source reading records, experiments, and caveats here.',
            project_links: projectLinks.length > 0
                ? projectLinks.map((link) => `- [${link.label}](${link.url})`).join('\n')
                : '- ',
            obsidian_links: [
                categoryPath.length > 0 ? `- Category: ${categoryPath.map((segment, index) => `[[${categoryPath.slice(0, index + 1).join('/')}|${segment}]]`).join(' / ')}` : '',
                tags.length > 0 ? `- Tags: ${tags.map((tag) => `[[${tag}]]`).join(', ')}` : ''
            ].filter(Boolean).join('\n') || '- ',
            created_at: repository.created_at ? this.formatDate(repository.created_at) : '',
            updated_at: repository.updated_at ? this.formatDate(repository.updated_at) : '',
            starred_at: repository.starred_at ? this.formatDate(repository.starred_at) : '',
            note_created_at: this.formatDate(new Date().toISOString()),
            note_updated_at: this.formatDate(new Date().toISOString())
        };
        return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key: string) => replacements[key] ?? '');
    }

    private formatYamlPropertyValue(value: string, type: string): string {
        const trimmed = value.trim();
        if (type === 'number') {
            return /^-?\d+(\.\d+)?$/.test(trimmed) ? trimmed : '0';
        }
        if (type === 'checkbox') {
            return trimmed === 'true' ? 'true' : 'false';
        }
        if (type === 'tags') {
            if (!trimmed) return '[]';
            if (trimmed.startsWith('[') && trimmed.endsWith(']')) return trimmed;
            return `[${trimmed.split(',').map((item) => JSON.stringify(item.trim())).filter((item) => item !== '""').join(', ')}]`;
        }
        return JSON.stringify(trimmed);
    }

    /**
     * 格式化日期
     */
    private formatDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.debug('Date formatting failed:', error);
            return dateString;
        }
    }

    /**
     * 解析Properties模板变量
     */
    private resolvePropertyValue(
        template: string,
        repository: GithubRepository,
        enhancements: UserRepoEnhancements | undefined,
        options: ExportOptions
    ): string {
        let value = template;

        const placeholderToKey = (placeholder: string): string => {
            if (placeholder === 'full_name') return 'GSM-title';
            if (placeholder === 'id') return 'GSM-repo-id';
            if (placeholder === 'notes') return 'GSM-user-notes';
            if (placeholder === 'user_tags') return 'GSM-user-tags';
            if (placeholder === 'linked_note') return 'GSM-linked-note';
            return `GSM-${placeholder.replace(/_/g, '-')}`;
        };

        const isEnabled = (placeholder: string) => {
            const key = placeholderToKey(placeholder);
            const prop = options.propertiesTemplate.find(p => p.key === key);
            return prop ? prop.enabled : false; // Default to false if not found
        };

        const replacements: { [key: string]: () => string } = {
            'name': () => repository.name || '',
            'full_name': () => repository.full_name || '',
            'owner': () => repository.owner?.login || '',
            'description': () => repository.description || '',
            'language': () => repository.language || '',
            'url': () => repository.html_url || '',
            'id': () => repository.id.toString(),
            'stars': () => (repository.stargazers_count || 0).toString(),
            'forks': () => (repository.forks_count || 0).toString(),
            'watchers': () => (repository.watchers_count || 0).toString(),
            'issues': () => (repository.open_issues_count || 0).toString(),
            'created_at': () => repository.created_at ? this.formatDate(repository.created_at) : '',
            'updated_at': () => repository.updated_at ? this.formatDate(repository.updated_at) : '',
            'pushed_at': () => repository.pushed_at ? this.formatDate(repository.pushed_at) : '',
            'starred_at': () => repository.starred_at ? this.formatDate(repository.starred_at) : '',
            'is_private': () => repository.private ? 'true' : 'false',
            'is_fork': () => repository.fork ? 'true' : 'false',
            'topics': () => (repository.topics && repository.topics.length > 0) ? `[${repository.topics.map(t => `"${t}"`).join(', ')}]` : '[]',
            'notes': () => enhancements?.notes || '',
            'user_tags': () => (enhancements?.tags && enhancements.tags.length > 0) ? enhancements.tags.join(', ') : '[]',
            'category': () => (enhancements?.categoryPath && enhancements.categoryPath.length > 0) ? enhancements.categoryPath.join(' / ') : '',
            'status': () => enhancements?.status || ((enhancements?.categoryPath && enhancements.categoryPath.length > 0) ? 'active' : 'inbox'),
            'rating': () => String(enhancements?.rating || 0),
            'personal_summary': () => enhancements?.personalSummary || '',
            'personal_review': () => enhancements?.personalReview || '',
            'linked_note': () => enhancements?.linked_note || ''
        };

        for (const placeholder in replacements) {
            if (value.includes(`{{${placeholder}}}`)) {
                if (isEnabled(placeholder)) {
                    value = value.replace(new RegExp(`\\{\\{${placeholder}\\}\\}`, 'g'), replacements[placeholder]());
                } else {
                    value = value.replace(new RegExp(`\\{\\{${placeholder}\\}\\}`, 'g'), '');
                }
            }
        }

        return value;
    }

    /**
     * 格式化YAML值
     */
    private formatYamlValue(value: string): string {
        // 如果值包含特殊字符或空格，需要用引号包围
        if (value.includes(':') || value.includes('#') || value.includes('\n') || value.includes('"') || value.includes("'")) {
            return `"${value.replace(/"/g, '\\"')}"`;
        }
        
        // 如果值为空，返回空字符串
        if (!value.trim()) {
            return '""';
        }
        
        return value;
    }

    /**
     * 确保文件夹存在
     */
    private async ensureFolderExists(folderPath: string): Promise<void> {
        const normalizedPath = normalizePath(folderPath);
        if (!normalizedPath) return;

        const segments = normalizedPath.split('/').filter((segment) => segment.length > 0);
        let currentPath = '';
        for (const segment of segments) {
            currentPath = currentPath ? `${currentPath}/${segment}` : segment;
            if (!this.vault.getAbstractFileByPath(currentPath)) {
                await this.vault.createFolder(currentPath);
            }
        }
    }
}

/**
 * 文件覆盖确认对话框
 */
class OverwriteConfirmModal extends Modal {
    private filePath: string;
    private resolve: (value: 'overwrite' | 'skip' | 'overwriteAll' | 'skipAll') => void;

    constructor(app: App, filePath: string, resolve: (value: 'overwrite' | 'skip' | 'overwriteAll' | 'skipAll') => void) {
        super(app);
        this.filePath = filePath;
        this.resolve = resolve;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        // 标题
        contentEl.createEl('h2', { text: t('export.fileExists') });

        // 提示信息
        const messageEl = contentEl.createDiv('overwrite-confirm-message');
        messageEl.createEl('p', { text: t('export.fileExistsMessage') });
        messageEl.createEl('code', { text: this.filePath });
        messageEl.createEl('p', { text: t('export.fileExistsDesc') });

        // 按钮容器
        const buttonContainer = contentEl.createDiv('overwrite-confirm-buttons button-flex-container');

        // 跳过按钮
        const skipButton = buttonContainer.createEl('button', { text: t('export.skip') });
        skipButton.addEventListener('click', () => {
            this.resolve('skip');
            this.close();
        });

        // 跳过全部按钮
        const skipAllButton = buttonContainer.createEl('button', { text: t('export.skipAll') });
        skipAllButton.addEventListener('click', () => {
            this.resolve('skipAll');
            this.close();
        });

        // 覆盖按钮
        const overwriteButton = buttonContainer.createEl('button', { text: t('export.overwrite') });
        overwriteButton.addEventListener('click', () => {
            this.resolve('overwrite');
            this.close();
        });

        // 覆盖全部按钮
        const overwriteAllButton = buttonContainer.createEl('button', { text: t('export.overwriteAll'), cls: 'mod-cta' });
        overwriteAllButton.addEventListener('click', () => {
            this.resolve('overwriteAll');
            this.close();
        });

        // 默认焦点在跳过按钮上
        skipButton.focus();
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
