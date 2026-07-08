import { App, Modal, Setting, Notice, TFile } from 'obsidian';
import { GithubRepository, InvalidUserEnhancementRecord, RepoProjectLink, UserRepoEnhancements } from './types';
import GithubStarsPlugin from './main';
import { EmojiUtils } from './emojiUtils';
import { t } from './i18n';
import { TagChipsInput } from './components/TagChipsInput';
import { buildEnhancementRepoSnapshot } from './userEnhancementCleanup';
import { shouldCaptureTextareaWheel } from './textareaWheelScroll';
import { appendProjectLink, normalizeProjectLinks, replaceProjectLink } from './projectLinks';

/**
 * 编辑仓库信息的模态框
 */
export class EditRepoModal extends Modal {
    plugin: GithubStarsPlugin;
    githubRepo: GithubRepository;
    tags: string;
    categoryPath: string;
    status: 'inbox' | 'active' | 'reviewed' | 'archived';
    rating: number;
    personalSummary: string;
    personalReview: string;
    notes: string;
    linkedNote: string;
    projectLinks: RepoProjectLink[];
    projectLinkLabelDraft: string;
    projectLinkUrlDraft: string;
    editingProjectLinkIndex: number | null;
    linkedNoteInputEl?: HTMLInputElement;
    tagChipsContainer?: HTMLElement;
    tagChipsInput?: TagChipsInput;
    projectLinksListEl?: HTMLElement;

    constructor(app: App, plugin: GithubStarsPlugin, githubRepo: GithubRepository) {
        super(app);
        this.plugin = plugin;
        this.githubRepo = githubRepo;

        const existingEnhancement = plugin.data.userEnhancements[githubRepo.id];
        this.tags = existingEnhancement?.tags?.join(', ') || '';
        this.categoryPath = existingEnhancement?.categoryPath?.join(' / ') || '';
        this.status = existingEnhancement?.status || (existingEnhancement?.categoryPath?.length ? 'active' : 'inbox');
        this.rating = existingEnhancement?.rating || 0;
        this.personalSummary = existingEnhancement?.personalSummary || '';
        this.personalReview = existingEnhancement?.personalReview || '';
        this.notes = existingEnhancement?.notes || '';
        this.linkedNote = existingEnhancement?.linked_note || '';
        this.projectLinks = normalizeProjectLinks(existingEnhancement?.project_links || []);
        this.projectLinkLabelDraft = '';
        this.projectLinkUrlDraft = '';
        this.editingProjectLinkIndex = null;
    }

    onOpen() {
        const { contentEl } = this;
        this.modalEl.addClass('github-stars-edit-modal');

        contentEl.createEl('h2', {
            text: `${t('modal.editRepo')}: ${this.githubRepo.name}`
        });

        const infoDiv = contentEl.createDiv('edit-repo-info');
        infoDiv.createEl('p', {
            text: `${this.githubRepo.full_name}`,
            cls: 'edit-repo-fullname'
        });
        if (this.githubRepo.description) {
            const descEl = infoDiv.createEl('p', { cls: 'edit-repo-description' });
            EmojiUtils.setEmojiText(descEl, this.githubRepo.description);
        }

        const tagsSetting = new Setting(contentEl)
            .setName(t('modal.tags'));
        tagsSetting.settingEl.addClass('edit-repo-tags-setting');
        tagsSetting.nameEl.createSpan({
            cls: 'edit-repo-tags-inline-desc',
            text: t('modal.tagsDesc')
        });

        this.tagChipsContainer = contentEl.createDiv('tag-chips-input-wrapper');
        this.renderTagChipsInput();

        const categorySetting = new Setting(contentEl)
            .setName(t('modal.categoryPath'))
            .setDesc(t('modal.categoryPathDesc'))
            .addText(text => {
                text.setPlaceholder(t('modal.categoryPathPlaceholder'))
                    .setValue(this.categoryPath)
                    .onChange(value => {
                        this.categoryPath = value;
                    });
            });
        categorySetting.settingEl.addClass('edit-repo-category-setting');

        const statusSetting = new Setting(contentEl)
            .setName(t('modal.status'))
            .setDesc(t('modal.statusDesc'))
            .addDropdown(dropdown => dropdown
                .addOption('inbox', t('view.status.inbox'))
                .addOption('active', t('view.status.active'))
                .addOption('reviewed', t('view.status.reviewed'))
                .addOption('archived', t('view.status.archived'))
                .setValue(this.status)
                .onChange((value: 'inbox' | 'active' | 'reviewed' | 'archived') => {
                    this.status = value;
                })
            )
            .addSlider(slider => {
                slider.setLimits(0, 5, 1)
                    .setValue(this.rating)
                    .setDynamicTooltip()
                    .onChange((value) => {
                        this.rating = value;
                    });
            });
        statusSetting.settingEl.addClass('edit-repo-status-setting');

        const summarySetting = new Setting(contentEl)
            .setName(t('modal.personalSummary'))
            .addTextArea(text => {
                const textareaEl = text.inputEl;
                textareaEl.addClass('edit-repo-summary-textarea');
                textareaEl.setAttribute('rows', '1');
                text.setPlaceholder(t('modal.personalSummaryPlaceholder'))
                    .setValue(this.personalSummary)
                    .onChange(value => {
                        this.personalSummary = value;
                    });
                this.attachAutoResizeTextareaBehavior(textareaEl);
            });
        summarySetting.settingEl.addClass('edit-repo-summary-setting');

        const reviewSetting = new Setting(contentEl)
            .setName(t('modal.personalReview'))
            .addTextArea(text => {
                const textareaEl = text.inputEl;
                textareaEl.addClass('edit-repo-review-textarea');
                textareaEl.setAttribute('rows', '2');
                text.setPlaceholder(t('modal.personalReviewPlaceholder'))
                    .setValue(this.personalReview)
                    .onChange(value => {
                        this.personalReview = value;
                    });
                this.attachAutoResizeTextareaBehavior(textareaEl);
            });
        reviewSetting.settingEl.addClass('edit-repo-review-setting');

        const notesSetting = new Setting(contentEl)
            .setName(t('modal.notes'))
            .addTextArea(text => {
                const notesTextareaEl = text.inputEl;
                notesTextareaEl.addClass('edit-repo-notes-textarea');
                notesTextareaEl.setAttribute('rows', '1');
                text.setPlaceholder(t('modal.notesPlaceholder'))
                    .setValue(this.notes)
                    .onChange(value => {
                        this.notes = value;
                    });
                this.attachAutoResizeTextareaBehavior(notesTextareaEl);
            });
        notesSetting.settingEl.addClass('edit-repo-notes-setting');

        const projectLinksSetting = new Setting(contentEl)
            .setName(t('modal.projectLinks'))
            .addText(text => {
                text.setPlaceholder(t('modal.projectLinkNamePlaceholder'))
                    .setValue(this.projectLinkLabelDraft)
                    .onChange(value => {
                        this.projectLinkLabelDraft = value;
                    });
                text.inputEl.addClass('edit-repo-project-link-name-input');
            })
            .addText(text => {
                text.setPlaceholder(t('modal.projectLinkUrlPlaceholder'))
                    .setValue(this.projectLinkUrlDraft)
                    .onChange(value => {
                        this.projectLinkUrlDraft = value;
                    });
                text.inputEl.addClass('edit-repo-project-link-url-input');
            })
            .addButton(button => {
                button.setButtonText(
                    this.editingProjectLinkIndex === null
                        ? t('modal.addProjectLink')
                        : t('modal.saveProjectLink')
                )
                    .setCta()
                    .onClick(() => {
                        this.handleSubmitProjectLink();
                    });
            });
        projectLinksSetting.settingEl.addClass('edit-repo-project-links-setting');
        this.projectLinksListEl = contentEl.createDiv('edit-repo-project-links-list');
        this.renderProjectLinksList();

        new Setting(contentEl)
            .setName(t('modal.linkedNote'))
            .setDesc(t('modal.linkedNoteDesc'))
            .addText(text => {
                text.setPlaceholder(t('modal.notePath'))
                    .setValue(this.linkedNote)
                    .onChange(value => {
                        this.linkedNote = value;
                    });
                this.linkedNoteInputEl = text.inputEl;
            })
            .addButton(button => button
                .setButtonText(t('modal.browse'))
                .onClick(() => {
                    this.openNoteBrowser();
                })
            )
            .addButton(button => button
                .setButtonText(t('modal.createDetailDoc'))
                .onClick(() => {
                    void this.createOrUpdateDetailDoc(button.buttonEl);
                })
            );

        const buttonDiv = contentEl.createDiv('edit-repo-buttons');
        const cancelButton = buttonDiv.createEl('button', { text: t('modal.cancel') });
        cancelButton.addEventListener('click', () => this.close());
        const saveButton = buttonDiv.createEl('button', { text: t('modal.save'), cls: 'mod-cta' });
        saveButton.addEventListener('click', () => {
            void this.saveChanges();
        });
    }

    onClose() {
        if (this.tagChipsInput) {
            this.tagChipsInput.destroy();
            this.tagChipsInput = undefined;
        }
        const { contentEl } = this;
        contentEl.empty();
    }

    /**
     * 渲染标签芯片输入组件
     */
    private renderTagChipsInput() {
        if (!this.tagChipsContainer) return;

        if (this.tagChipsInput) {
            this.tagChipsInput.destroy();
            this.tagChipsInput = undefined;
        }

        const initialTags = this.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
        const allTags = this.plugin.getAllTags();

        this.tagChipsInput = new TagChipsInput(
            this.tagChipsContainer,
            initialTags,
            allTags,
            (tags: string[]) => {
                this.tags = tags.join(', ');
            }
        );
    }

    /**
     * 自适应调整笔记输入框高度
     */
    private resizeNotesTextarea(textareaEl: HTMLTextAreaElement): void {
        textareaEl.setCssProps({ height: 'auto' });
        const nextHeight = textareaEl.scrollHeight;
        const maxHeight = Number.parseFloat(window.getComputedStyle(textareaEl).maxHeight);

        if (!Number.isNaN(maxHeight) && nextHeight > maxHeight) {
            textareaEl.setCssProps({
                height: `${maxHeight}px`,
                overflowY: 'auto'
            });
            return;
        }

        textareaEl.setCssProps({
            height: `${nextHeight}px`,
            overflowY: 'hidden'
        });
    }

    /**
     * 渲染已添加链接列表
     */
    private renderProjectLinksList(): void {
        if (!this.projectLinksListEl) return;

        this.projectLinksListEl.empty();
        if (this.projectLinks.length === 0) {
            return;
        }

        this.projectLinks.forEach((projectLink, index) => {
            const itemEl = this.projectLinksListEl!.createDiv('edit-repo-project-link-item');
            itemEl.createEl('div', {
                cls: 'edit-repo-project-link-title',
                text: projectLink.label
            });
            const actionsEl = itemEl.createDiv('edit-repo-project-link-actions');

            const editBtn = actionsEl.createEl('button', {
                cls: 'edit-repo-project-link-edit',
                text: t('common.edit')
            });
            editBtn.type = 'button';
            editBtn.addEventListener('click', () => {
                this.projectLinkLabelDraft = projectLink.label === projectLink.url ? '' : projectLink.label;
                this.projectLinkUrlDraft = projectLink.url;
                this.editingProjectLinkIndex = index;
                this.updateProjectLinkInputs();
            });

            const removeBtn = actionsEl.createEl('button', {
                cls: 'edit-repo-project-link-delete',
                text: t('common.delete')
            });
            removeBtn.type = 'button';
            removeBtn.addEventListener('click', () => {
                this.projectLinks.splice(index, 1);
                if (this.editingProjectLinkIndex === index) {
                    this.resetProjectLinkDrafts();
                } else if (
                    this.editingProjectLinkIndex !== null &&
                    this.editingProjectLinkIndex > index
                ) {
                    this.editingProjectLinkIndex -= 1;
                }
                this.renderProjectLinksList();
            });
        });
    }

    /**
     * 同步链接输入框与按钮文本
     */
    private updateProjectLinkInputs(): void {
        const labelInput = this.contentEl.querySelector<HTMLInputElement>('.edit-repo-project-link-name-input');
        const urlInput = this.contentEl.querySelector<HTMLInputElement>('.edit-repo-project-link-url-input');
        const submitButton = this.contentEl.querySelector<HTMLButtonElement>('.edit-repo-project-links-setting .mod-cta');

        if (labelInput) {
            labelInput.value = this.projectLinkLabelDraft;
        }
        if (urlInput) {
            urlInput.value = this.projectLinkUrlDraft;
        }
        if (submitButton) {
            submitButton.textContent = this.editingProjectLinkIndex === null
                ? t('modal.addProjectLink')
                : t('modal.saveProjectLink');
        }
    }

    /**
     * 重置链接草稿
     */
    private resetProjectLinkDrafts(): void {
        this.projectLinkLabelDraft = '';
        this.projectLinkUrlDraft = '';
        this.editingProjectLinkIndex = null;
        this.updateProjectLinkInputs();
    }

    /**
     * 添加或保存单条链接
     */
    private handleSubmitProjectLink(): void {
        const result = this.editingProjectLinkIndex === null
            ? appendProjectLink(
                this.projectLinks,
                this.projectLinkLabelDraft,
                this.projectLinkUrlDraft
            )
            : replaceProjectLink(
                this.projectLinks,
                this.editingProjectLinkIndex,
                this.projectLinkLabelDraft,
                this.projectLinkUrlDraft
            );

        if (result.error === 'missing_url') {
            new Notice(t('modal.projectLinkUrlRequired'));
            return;
        }
        if (result.error === 'duplicate') {
            new Notice(t('modal.projectLinkDuplicate'));
            return;
        }

        this.projectLinks = result.links;
        this.resetProjectLinkDrafts();
        this.renderProjectLinksList();

        const labelInput = this.contentEl.querySelector<HTMLInputElement>('.edit-repo-project-link-name-input');
        labelInput?.focus();
    }

    /**
     * 让多行输入框复用笔记区域的自动高度和滚轮行为
     */
    private attachAutoResizeTextareaBehavior(textareaEl: HTMLTextAreaElement): void {
        textareaEl.addEventListener('input', () => {
            this.resizeNotesTextarea(textareaEl);
        });
        textareaEl.addEventListener('wheel', (event) => {
            if (!shouldCaptureTextareaWheel({
                scrollTop: textareaEl.scrollTop,
                clientHeight: textareaEl.clientHeight,
                scrollHeight: textareaEl.scrollHeight,
                deltaY: event.deltaY
            })) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            textareaEl.scrollTop += event.deltaY;
        }, { passive: false });
        window.setTimeout(() => {
            this.resizeNotesTextarea(textareaEl);
        }, 0);
    }

    private parseCategoryPathInput(): string[] {
        return this.categoryPath
            .split(/[\/>\\|]+/g)
            .map((segment) => segment.trim())
            .filter((segment) => segment.length > 0);
    }

    private async createOrUpdateDetailDoc(buttonEl: HTMLButtonElement): Promise<void> {
        buttonEl.disabled = true;
        const previousText = buttonEl.textContent || t('modal.createDetailDoc');
        buttonEl.textContent = t('modal.creatingDetailDoc');
        try {
            await this.saveChanges({ closeAfterSave: false, showNotice: false });
            const path = await this.plugin.createRepositoryDetailNote(this.githubRepo);
            if (path) {
                this.linkedNote = path;
                if (this.linkedNoteInputEl) {
                    this.linkedNoteInputEl.value = path;
                }
                new Notice(t('modal.detailDocCreated', { path }));
            }
        } finally {
            buttonEl.disabled = false;
            buttonEl.textContent = previousText;
        }
    }

    /**
     * 打开笔记浏览器
     */
    openNoteBrowser() {
        const files = this.app.vault.getMarkdownFiles();
        const modal = new NoteSelectorModal(this.app, files, (file) => {
            this.linkedNote = file.path;
            if (this.linkedNoteInputEl) {
                this.linkedNoteInputEl.value = file.path;
            }
        });
        modal.open();
    }

    /**
     * 保存仓库信息变更
     */
    async saveChanges(options?: { closeAfterSave?: boolean; showNotice?: boolean }) {
        const repoId = this.githubRepo.id;
        const existingEnhancement = this.plugin.data.userEnhancements[repoId];

        const updatedEnhancement: UserRepoEnhancements = {
            ...existingEnhancement,
            notes: this.notes.trim(),
            tags: this.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0),
            categoryPath: this.parseCategoryPathInput(),
            status: this.status,
            rating: this.rating,
            personalSummary: this.personalSummary.trim(),
            personalReview: this.personalReview.trim(),
            archivedAt: this.status === 'archived'
                ? existingEnhancement?.archivedAt || new Date().toISOString()
                : undefined,
            linked_note: this.linkedNote.trim() || undefined,
            project_links: this.projectLinks,
            repoSnapshot: buildEnhancementRepoSnapshot(this.githubRepo, new Date().toISOString())
        };

        this.plugin.data.userEnhancements[repoId] = updatedEnhancement;
        await this.plugin.savePluginData();

        if (options?.showNotice !== false) {
            new Notice(t('notices.repoUpdated'));
        }
        if (options?.closeAfterSave !== false) {
            this.close();
        }
    }
}

/**
 * 笔记选择器模态框
 */
class NoteSelectorModal extends Modal {
    files: TFile[];
    onSelect: (file: TFile) => void;
    searchInput: HTMLInputElement;

    constructor(app: App, files: TFile[], onSelect: (file: TFile) => void) {
        super(app);
        this.files = files;
        this.onSelect = onSelect;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl('h2', { text: t('modal.selectNote') });

        const searchDiv = contentEl.createDiv('note-selector-search');
        this.searchInput = searchDiv.createEl('input', {
            type: 'text',
            placeholder: t('modal.searchNotes')
        });

        this.searchInput.addEventListener('input', () => {
            this.renderFiles();
        });

        const fileListDiv = contentEl.createDiv('note-selector-files');
        fileListDiv.addClass('note-selector-files');

        this.renderFiles();
    }

    /**
     * 渲染文件列表
     */
    renderFiles() {
        const fileListDiv = this.contentEl.querySelector('.note-selector-files');
        if (!fileListDiv) return;

        fileListDiv.empty();

        const searchTerm = this.searchInput.value.toLowerCase();

        const filteredFiles = this.files.filter(file =>
            file.path.toLowerCase().includes(searchTerm));

        if (filteredFiles.length === 0) {
            fileListDiv.createEl('div', {
                text: t('modal.noMatchingNotes'),
                cls: 'note-selector-empty'
            });
            return;
        }

        filteredFiles.forEach(file => {
            const fileDiv = fileListDiv.createEl('div', {
                cls: 'note-selector-file',
                text: file.path
            });

            fileDiv.addEventListener('click', () => {
                this.onSelect(file);
                this.close();
            });
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

class ConfirmInvalidDataDeleteAllModal extends Modal {
    private message: string;
    private resolve: (confirmed: boolean) => void;

    constructor(app: App, message: string, resolve: (confirmed: boolean) => void) {
        super(app);
        this.message = message;
        this.resolve = resolve;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h2', { text: t('settings.confirmActionTitle') });
        contentEl.createEl('p', { text: this.message });

        const buttonContainer = contentEl.createDiv('modal-button-container');
        const cancelButton = buttonContainer.createEl('button', { text: t('common.cancel') });
        cancelButton.addEventListener('click', () => {
            this.resolve(false);
            this.close();
        });

        const confirmButton = buttonContainer.createEl('button', {
            text: t('modal.invalidDataDeleteAllConfirmButton'),
            cls: 'mod-warning'
        });
        confirmButton.addEventListener('click', () => {
            this.resolve(true);
            this.close();
        });

        cancelButton.focus();
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

export class InvalidEnhancementRecordsModal extends Modal {
    plugin: GithubStarsPlugin;
    records: InvalidUserEnhancementRecord[] = [];
    listEl?: HTMLElement;
    summaryEl?: HTMLElement;
    deleteAllButton?: HTMLButtonElement;
    refreshSnapshotsButton?: HTMLButtonElement;
    isMutating: boolean = false;
    isRefreshingSnapshots: boolean = false;

    constructor(app: App, plugin: GithubStarsPlugin) {
        super(app);
        this.plugin = plugin;
        this.records = plugin.getInvalidUserEnhancementRecords();
    }

    onOpen() {
        const { contentEl } = this;
        this.modalEl.addClass('github-stars-invalid-data-modal');
        contentEl.createEl('h2', { text: t('modal.invalidDataTitle') });
        this.summaryEl = contentEl.createEl('p', { cls: 'github-stars-invalid-data-summary' });

        const actionsEl = contentEl.createDiv('github-stars-invalid-data-actions');
        const closeButton = actionsEl.createEl('button', { text: t('common.cancel') });
        closeButton.addEventListener('click', () => this.close());

        this.refreshSnapshotsButton = actionsEl.createEl('button', {
            text: t('modal.invalidDataRefreshSnapshots')
        });
        this.refreshSnapshotsButton.addEventListener('click', () => {
            void this.handleRefreshSnapshots();
        });

        this.deleteAllButton = actionsEl.createEl('button', {
            text: t('modal.invalidDataDeleteAll')
        });
        this.deleteAllButton.addClass('mod-warning');
        this.deleteAllButton.addEventListener('click', () => {
            void this.handleDeleteAll();
        });

        this.listEl = contentEl.createDiv('github-stars-invalid-data-list');
        this.renderRecords();
    }

    onClose() {
        this.contentEl.empty();
    }

    private renderRecords(): void {
        if (!this.listEl || !this.summaryEl || !this.deleteAllButton || !this.refreshSnapshotsButton) return;
        this.records = this.plugin.getInvalidUserEnhancementRecords();
        this.summaryEl.setText(t('modal.invalidDataSummary', { count: String(this.records.length) }));
        const isBusy = this.isMutating || this.isRefreshingSnapshots;
        const missingSnapshotCount = this.records.filter(
            (record) => !(record.repoSnapshot?.full_name?.trim() && record.repoSnapshot?.html_url?.trim())
        ).length;
        this.deleteAllButton.disabled = isBusy || this.records.length === 0;
        this.refreshSnapshotsButton.disabled = isBusy || missingSnapshotCount === 0;
        this.refreshSnapshotsButton.textContent = this.isRefreshingSnapshots
            ? t('modal.invalidDataRefreshRunning')
            : t('modal.invalidDataRefreshSnapshots');
        this.listEl.empty();

        if (this.records.length === 0) {
            this.listEl.createEl('div', {
                cls: 'github-stars-invalid-data-empty',
                text: t('modal.invalidDataEmpty')
            });
            return;
        }

        this.records.forEach((record) => {
            const snapshot = record.repoSnapshot;
            const itemEl = this.listEl!.createDiv('github-stars-invalid-data-item');
            const headerEl = itemEl.createDiv('github-stars-invalid-data-item-header');
            headerEl.createEl('div', {
                cls: 'github-stars-invalid-data-item-title',
                text: snapshot?.full_name?.trim() || t('modal.invalidDataRepoId', { repoId: String(record.repoId) })
            });

            const deleteButton = headerEl.createEl('button', {
                cls: 'github-stars-invalid-data-delete-one',
                text: t('common.delete')
            });
            deleteButton.disabled = isBusy;
            deleteButton.addEventListener('click', () => {
                void this.handleDeleteOne(record.repoId);
            });

            itemEl.createEl('div', {
                cls: 'github-stars-invalid-data-item-meta',
                text: t('modal.invalidDataRepoId', { repoId: String(record.repoId) })
            });

            if (snapshot?.html_url?.trim()) {
                const linkRow = itemEl.createDiv('github-stars-invalid-data-item-meta');
                linkRow.createSpan({ text: t('modal.invalidDataRepoLink') });
                const linkEl = linkRow.createEl('a', {
                    cls: 'github-stars-invalid-data-item-link',
                    text: snapshot.html_url.trim()
                });
                linkEl.href = snapshot.html_url.trim();
                linkEl.target = '_blank';
                linkEl.rel = 'noopener noreferrer';
            } else {
                itemEl.createEl('div', {
                    cls: 'github-stars-invalid-data-item-warning',
                    text: t('modal.invalidDataNoSnapshot')
                });
            }

            if (snapshot?.description?.trim()) {
                itemEl.createEl('div', {
                    cls: 'github-stars-invalid-data-item-meta',
                    text: t('modal.invalidDataDescription', { description: snapshot.description.trim() })
                });
            }

            if (snapshot?.last_seen_at?.trim()) {
                itemEl.createEl('div', {
                    cls: 'github-stars-invalid-data-item-meta',
                    text: t('modal.invalidDataSnapshotTime', {
                        time: this.formatSnapshotTime(snapshot.last_seen_at)
                    })
                });
            }

            itemEl.createEl('div', {
                cls: 'github-stars-invalid-data-item-tags',
                text: t('modal.invalidDataTags', {
                    tags: record.tags.length > 0 ? record.tags.join(', ') : t('modal.invalidDataNone')
                })
            });

            const notesText = record.notes.trim();
            itemEl.createEl('div', {
                cls: 'github-stars-invalid-data-item-meta',
                text: notesText
                    ? t('modal.invalidDataNotesPreview', { notes: notesText })
                    : t('modal.invalidDataNoNotes')
            });

            itemEl.createEl('div', {
                cls: 'github-stars-invalid-data-item-meta',
                text: record.linked_note?.trim()
                    ? t('modal.invalidDataLinkedNote', { path: record.linked_note.trim() })
                    : t('modal.invalidDataNoLinkedNote')
            });
        });
    }

    private formatSnapshotTime(timestamp: string): string {
        const parsed = new Date(timestamp);
        if (Number.isNaN(parsed.getTime())) {
            return timestamp;
        }
        return parsed.toLocaleString();
    }

    private async handleRefreshSnapshots(): Promise<void> {
        const repoIdsToRefresh = this.records
            .filter((record) => !(record.repoSnapshot?.full_name?.trim() && record.repoSnapshot?.html_url?.trim()))
            .map((record) => record.repoId);

        if (repoIdsToRefresh.length === 0) {
            new Notice(t('modal.invalidDataRefreshNoop'));
            return;
        }

        this.isRefreshingSnapshots = true;
        this.renderRecords();
        try {
            const result = await this.plugin.refreshInvalidUserEnhancementSnapshots(repoIdsToRefresh);
            if (result.requestedCount === 0) {
                new Notice(t('modal.invalidDataRefreshNoop'));
            } else {
                new Notice(t('modal.invalidDataRefreshDone', {
                    updated: String(result.updatedCount),
                    missing: String(result.unresolvedCount)
                }));
            }
        } finally {
            this.isRefreshingSnapshots = false;
            this.renderRecords();
        }
    }

    private async handleDeleteOne(repoId: number): Promise<void> {
        this.isMutating = true;
        this.renderRecords();
        try {
            const deletedCount = await this.plugin.deleteInvalidUserEnhancements([repoId]);
            if (deletedCount > 0) {
                new Notice(t('modal.invalidDataDeleteDone', { count: String(deletedCount) }));
            } else {
                new Notice(t('modal.invalidDataDeleteMissing'));
            }
        } finally {
            this.isMutating = false;
            this.renderRecords();
        }
    }

    private async handleDeleteAll(): Promise<void> {
        if (this.records.length === 0) return;
        const confirmed = await this.confirmDeleteAll();
        if (!confirmed) {
            return;
        }

        this.isMutating = true;
        this.renderRecords();
        try {
            const deletedCount = await this.plugin.deleteInvalidUserEnhancements(
                this.records.map((record) => record.repoId)
            );
            if (deletedCount > 0) {
                new Notice(t('modal.invalidDataDeleteDone', { count: String(deletedCount) }));
            } else {
                new Notice(t('modal.invalidDataDeleteMissing'));
            }
        } finally {
            this.isMutating = false;
            this.renderRecords();
        }
    }

    private async confirmDeleteAll(): Promise<boolean> {
        const message = t('modal.invalidDataDeleteAllConfirmMessage', {
            count: String(this.records.length)
        });
        return new Promise((resolve) => {
            new ConfirmInvalidDataDeleteAllModal(this.app, message, resolve).open();
        });
    }
}
