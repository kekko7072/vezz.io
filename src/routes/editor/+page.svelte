<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { marked } from 'marked';
	import type { Article } from '$lib/types/article';

	type EditableArticle = Article & {
		tagsInput: string;
		dateInput: string;
	};

	let articles: (Article & { fileName?: string })[] = [];
	let selectedSlug: string | null = null;
	let form: EditableArticle | null = null;
	let editorHtml = '';
	let previewHtml = '';
	let loading = false;
	let saving = false;
	let status = '';
	let errorMessage = '';
	let isNewArticle = false;
	let editorRef: HTMLDivElement | null = null;
	let showImagePicker = false;
	let availableImages: string[] = [];
	let imageSearchQuery = '';
	let loadingImages = false;

	marked.setOptions({ breaks: true, gfm: true });

	onMount(() => {
		loadArticles();
	});

	const toInputDate = (iso: string) => {
		const date = iso ? new Date(iso) : new Date();
		const pad = (v: number) => v.toString().padStart(2, '0');
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
	};

	const fromInputDate = (value: string) => {
		if (!value) return new Date().toISOString();
		const date = new Date(value);
		return date.toISOString();
	};

	const normalizeTags = (value: string) =>
		value
			.split(',')
			.map((tag) => tag.trim())
			.filter(Boolean);

	const applyEditorHtml = async (html: string) => {
		editorHtml = html;
		previewHtml = marked.parse(htmlToMarkdown(html));
		await tick();
		if (editorRef) {
			editorRef.innerHTML = html;
		}
	};

	const loadArticles = async () => {
		loading = true;
		try {
			const response = await fetch('/api/editor/articles');
			if (!response.ok) throw new Error('Unable to load articles');
			const data = await response.json();
			articles = data.articles;
			if (!selectedSlug && articles.length) {
				await selectArticle(articles[0].slug);
			}
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to load articles';
		} finally {
			loading = false;
		}
	};

	const selectArticle = async (slug: string) => {
		if (saving) return;
		selectedSlug = slug;
		isNewArticle = false;
		status = '';
		errorMessage = '';

		const response = await fetch(`/api/editor/articles/${slug}`);
		if (!response.ok) {
			errorMessage = 'Unable to load this article';
			return;
		}

		const { article } = await response.json();
		form = {
			...article,
			tagsInput: article.tags.join(', '),
			dateInput: toInputDate(article.date)
		};

		await applyEditorHtml(marked.parse(article.content || ''));
	};

	const createDraft = async () => {
		const draftSlug = `draft-${Date.now()}`;
		selectedSlug = draftSlug;
		isNewArticle = true;
		status = '';
		errorMessage = '';

		form = {
			id: draftSlug,
			slug: draftSlug,
			title: 'Untitled draft',
			excerpt: '',
			content: '',
			date: new Date().toISOString(),
			dateInput: toInputDate(new Date().toISOString()),
			tags: [],
			tagsInput: '',
			published: false,
			imageUrl: '',
			videoUrl: ''
		};

		await applyEditorHtml('<p>Start writing...</p>');
	};

	const handleEditorInput = () => {
		editorHtml = editorRef?.innerHTML ?? '';
		previewHtml = marked.parse(htmlToMarkdown(editorHtml));
	};

	const exec = (command: string, value?: string) => {
		if (!editorRef) return;
		editorRef.focus();
		document.execCommand(command, false, value);
		handleEditorInput();
	};

	const toggleCode = () => {
		if (!editorRef) return;
		editorRef.focus();
		const selection = window.getSelection();
		const range = selection?.getRangeAt(0);
		const text = selection?.toString() ?? '';
		if (range && text) {
			range.deleteContents();
			range.insertNode(document.createTextNode('`' + text + '`'));
			handleEditorInput();
		}
	};

	const loadAvailableImages = async () => {
		loadingImages = true;
		try {
			const response = await fetch('/api/editor/images');
			if (!response.ok) throw new Error('Unable to load images');
			const data = await response.json();
			availableImages = data.images;
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to load images';
		} finally {
			loadingImages = false;
		}
	};

	const openImagePicker = async () => {
		if (availableImages.length === 0) {
			await loadAvailableImages();
		}
		showImagePicker = true;
		imageSearchQuery = '';
	};

	const closeImagePicker = () => {
		showImagePicker = false;
		imageSearchQuery = '';
	};

	const filteredImages = () => {
		if (!imageSearchQuery) return availableImages;
		const query = imageSearchQuery.toLowerCase();
		return availableImages.filter((img) => img.toLowerCase().includes(query));
	};

	const selectImage = (imagePath: string) => {
		if (!editorRef) return;
		editorRef.focus();
		const img = document.createElement('img');
		img.src = imagePath;
		img.alt = imagePath.split('/').pop()?.replace(/\.[^/.]+$/, '') || '';
		const selection = window.getSelection();
		const range = selection?.getRangeAt(0);
		if (range) {
			range.insertNode(img);
			handleEditorInput();
		}
		closeImagePicker();
	};

	const insertImage = () => {
		openImagePicker();
	};

	const htmlToMarkdown = (html: string): string => {
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');

		const walk = (node: Node, inPre = false): string => {
			if (node.nodeType === Node.TEXT_NODE) {
				const text = node.textContent || '';
				return inPre ? text : text.replace(/\s+/g, ' ');
			}

			if (node.nodeType !== Node.ELEMENT_NODE) return '';

			const el = node as HTMLElement;
			const tag = el.tagName.toLowerCase();
			const children = Array.from(el.childNodes)
				.map((child) => walk(child, inPre || tag === 'pre'))
				.join('');

			switch (tag) {
				case 'strong':
				case 'b':
					return `**${children}**`;
				case 'em':
				case 'i':
					return `*${children}*`;
				case 'code':
					return el.parentElement?.tagName.toLowerCase() === 'pre' ? children : `\`${children}\``;
				case 'pre':
					return `\n\`\`\`\n${children}\n\`\`\`\n\n`;
				case 'h1':
					return `# ${children}\n\n`;
				case 'h2':
					return `## ${children}\n\n`;
				case 'h3':
					return `### ${children}\n\n`;
				case 'ul':
					return `${Array.from(el.children)
						.map((child) => `- ${walk(child)}`.trimEnd())
						.join('\n')}\n\n`;
				case 'ol':
					return `${Array.from(el.children)
						.map((child, idx) => `${idx + 1}. ${walk(child)}`.trimEnd())
						.join('\n')}\n\n`;
				case 'li':
					return children;
				case 'a': {
					const href = el.getAttribute('href') || '#';
					return `[${children}](${href})`;
				}
				case 'img': {
					const src = el.getAttribute('src') || '';
					const alt = el.getAttribute('alt') || '';
					return `![${alt}](${src})\n\n`;
				}
				case 'iframe': {
					const src = el.getAttribute('src') || '';
					const style = el.getAttribute('style') || '';
					const width = el.getAttribute('width') || '100%';
					const height = el.getAttribute('height') || '352';
					const allow = el.getAttribute('allow') || '';
					const allowfullscreen = el.getAttribute('allowfullscreen') || '';
					const loading = el.getAttribute('loading') || '';
					const frameBorder = el.getAttribute('frameBorder') || '0';
					const attrs = [];
					if (style) attrs.push(`style="${style}"`);
					if (width) attrs.push(`width="${width}"`);
					if (height) attrs.push(`height="${height}"`);
					if (frameBorder) attrs.push(`frameBorder="${frameBorder}"`);
					if (allowfullscreen) attrs.push(`allowfullscreen="${allowfullscreen}"`);
					if (allow) attrs.push(`allow="${allow}"`);
					if (loading) attrs.push(`loading="${loading}"`);
					return `<iframe src="${src}" ${attrs.join(' ')}></iframe>\n\n`;
				}
				case 'div': {
					const className = el.getAttribute('class') || '';
					if (className.includes('song-embed')) {
						return `<div class="${className}">${children}</div>\n\n`;
					}
					return `${children}\n\n`;
				}
				case 'br':
					return '  \n';
				default:
					if (tag === 'p') {
						return `${children}\n\n`;
					}
					return children;
			}
		};

		const markdown = walk(doc.body)
			.replace(/\n{3,}/g, '\n\n')
			.trim();

		return markdown;
	};

	const saveArticle = async () => {
		if (!form) return;
		saving = true;
		status = '';
		errorMessage = '';

		const contentMarkdown = htmlToMarkdown(editorHtml).trim();
		const payload: Article = {
			id: form.id || form.slug,
			slug: form.slug.trim(),
			title: form.title.trim(),
			excerpt: form.excerpt.trim(),
			content: contentMarkdown,
			date: fromInputDate(form.dateInput),
			tags: normalizeTags(form.tagsInput),
			published: form.published,
			imageUrl: form.imageUrl?.trim() || '',
			videoUrl: form.videoUrl?.trim() || ''
		};

		const endpoint = isNewArticle ? '/api/editor/articles' : `/api/editor/articles/${selectedSlug ?? form.slug}`;
		const method = isNewArticle ? 'POST' : 'PUT';

		const response = await fetch(endpoint, {
			method,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			const message = await response.text();
			errorMessage = message || 'Unable to save article';
			saving = false;
			return;
		}

		const data = await response.json();
		status = 'Article saved';
		isNewArticle = false;
		selectedSlug = data.article.slug;
		saving = false;
		await loadArticles();
		await selectArticle(data.article.slug);
	};
</script>

<section class="editor-page">
	<div class="editor-header">
		<div>
			<p class="eyebrow">Dev only</p>
			<h1>Article editor</h1>
			<p class="lede">Local WYSIWYG to update the JSON articles. Run with npm run edit only.</p>
		</div>
		<div class="actions">
			<button class="ghost" on:click={createDraft}>+ New article</button>
			<button class="primary" on:click={saveArticle} disabled={saving || !form}>
				{saving ? 'Saving…' : 'Save changes'}
			</button>
		</div>
	</div>

	{#if loading}
		<p class="status">Loading articles…</p>
	{:else}
		<div class="editor-layout">
			<aside class="sidebar">
				<div class="sidebar-header">
					<div>
						<p class="label">Articles</p>
						<p class="muted">Click to edit. Drafts stay local.</p>
					</div>
					<button class="small ghost" on:click={loadArticles}>Refresh</button>
				</div>
				<div class="list">
					{#if !articles.length}
						<p class="muted">No articles yet.</p>
					{:else}
						{#each articles as article}
							<button
								class:selected={article.slug === selectedSlug}
								class="list-item"
								on:click={() => selectArticle(article.slug)}
							>
								<div>
									<p class="item-title">{article.title}</p>
									<p class="muted">{article.slug}</p>
								</div>
								<span class={article.published ? 'pill live' : 'pill'}>{article.published ? 'Published' : 'Draft'}</span>
							</button>
						{/each}
					{/if}
				</div>
			</aside>

			<div class="main">
				{#if form}
					<div class="form-grid">
						<label>
							<span>Title</span>
							<input type="text" bind:value={form.title} placeholder="Article title" />
						</label>
						<label>
							<span>Slug</span>
							<input type="text" bind:value={form.slug} placeholder="my-article" />
						</label>
						<label>
							<span>Excerpt</span>
							<input type="text" bind:value={form.excerpt} placeholder="Short description" />
						</label>
						<label>
							<span>Tags (comma separated)</span>
							<input type="text" bind:value={form.tagsInput} placeholder="svelte, dev" />
						</label>
						<label>
							<span>Date</span>
							<input type="datetime-local" bind:value={form.dateInput} />
						</label>
						<label class="checkbox">
							<input type="checkbox" bind:checked={form.published} />
							<span>Published</span>
						</label>
						<label>
							<span>Image URL</span>
							<input type="url" bind:value={form.imageUrl} placeholder="https://..." />
						</label>
						<label>
							<span>Video URL</span>
							<input type="url" bind:value={form.videoUrl} placeholder="https://youtube.com/..." />
						</label>
					</div>

					<div class="panes">
						<div class="editor-pane">
							<div class="toolbar">
								<button on:click={() => exec('bold')} type="button"><strong>B</strong></button>
								<button on:click={() => exec('italic')} type="button"><em>I</em></button>
								<button on:click={() => exec('formatBlock', '<h2>')} type="button">H2</button>
								<button on:click={() => exec('formatBlock', '<h3>')} type="button">H3</button>
								<button on:click={() => exec('insertUnorderedList')} type="button">• List</button>
								<button on:click={() => exec('insertOrderedList')} type="button">1. List</button>
								<button on:click={toggleCode} type="button">Code</button>
								<button
									on:click={() => {
										const url = prompt('Link URL');
										if (url) exec('createLink', url);
									}}
									type="button"
								>
									Link
								</button>
								<button on:click={insertImage} type="button">Image</button>
							</div>
							<div
								class="editor-surface"
								contenteditable="true"
								bind:this={editorRef}
								on:input={handleEditorInput}
								spellcheck="true"
							></div>
						</div>

						<div class="preview-pane">
							<div class="preview-header">
								<p class="label">Preview</p>
								<p class="muted">Markdown is saved to disk</p>
							</div>
							<div class="preview markdown">{@html previewHtml}</div>
						</div>
					</div>
				{:else}
					<p class="muted">Select or create an article to get started.</p>
				{/if}

				{#if status}
					<div class="toast success">{status}</div>
				{/if}
				{#if errorMessage}
					<div class="toast error">{errorMessage}</div>
				{/if}
			</div>
		</div>
	{/if}
</section>

{#if showImagePicker}
	<div class="modal-overlay" on:click={closeImagePicker} on:keydown={(e) => e.key === 'Escape' && closeImagePicker()}>
		<div class="image-picker-modal" on:click|stopPropagation>
			<div class="image-picker-header">
				<h2>Select Image</h2>
				<button class="close-button" on:click={closeImagePicker}>×</button>
			</div>
			<div class="image-picker-search">
				<input
					type="text"
					placeholder="Search images..."
					bind:value={imageSearchQuery}
					class="search-input"
				/>
			</div>
			<div class="image-picker-content">
				{#if loadingImages}
					<p class="muted">Loading images...</p>
				{:else if filteredImages().length === 0}
					<p class="muted">No images found</p>
				{:else}
					<div class="image-grid">
						{#each filteredImages() as imagePath}
							<button
								class="image-item"
								on:click={() => selectImage(imagePath)}
								type="button"
							>
								<img src={imagePath} alt={imagePath} loading="lazy" />
								<span class="image-path">{imagePath}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.editor-page {
		min-height: 100vh;
		padding: 3rem clamp(1.5rem, 3vw, 3rem);
		background: #f8f9fb;
		color: #000000;
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.editor-header h1 {
		font-size: clamp(2rem, 3vw, 3rem);
		margin-bottom: 0.25rem;
	}

	.eyebrow {
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.75rem;
		color: #666;
		margin-bottom: 0.5rem;
	}

	.lede {
		color: #4a5563;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
	}

	.editor-layout {
		display: grid;
		grid-template-columns: 280px 1fr;
		gap: 1.5rem;
	}

	.sidebar {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 1rem;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.sidebar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.label {
		font-weight: 600;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.list-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		text-align: left;
		border: 1px solid #e5e7eb;
		background: #ffffff;
		border-radius: 10px;
		padding: 0.85rem 0.9rem;
		cursor: pointer;
		transition: border 0.2s, box-shadow 0.2s, transform 0.1s;
	}

	.list-item.selected {
		border-color: #0066cc;
		box-shadow: 0 6px 12px rgba(0, 102, 204, 0.12);
		transform: translateY(-1px);
	}

	.item-title {
		font-weight: 600;
		margin-bottom: 0.2rem;
	}

	.muted {
		color: #6b7280;
		font-size: 0.95rem;
	}

	.pill {
		border: 1px solid #e5e7eb;
		border-radius: 999px;
		padding: 0.25rem 0.6rem;
		font-size: 0.85rem;
		color: #111827;
		background: #f9fafb;
	}

	.pill.live {
		border-color: #0ea5e9;
		background: #e0f2fe;
		color: #075985;
	}

	.main {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 14px;
		padding: 1.5rem;
		box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
		min-height: 70vh;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-weight: 600;
		color: #111827;
	}

	label input[type='text'],
	label input[type='url'],
	label input[type='datetime-local'] {
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		padding: 0.75rem;
		font-size: 1rem;
		color: #111827;
		outline: none;
		transition: border 0.2s, box-shadow 0.2s;
	}

	label input:focus {
		border-color: #0066cc;
		box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.15);
	}

	.checkbox {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}

	.panes {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		align-items: start;
	}

	.editor-pane,
	.preview-pane {
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		overflow: hidden;
		background: #fdfdfd;
		display: flex;
		flex-direction: column;
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 0.75rem;
		border-bottom: 1px solid #e5e7eb;
		background: #f8fafc;
	}

	.toolbar button {
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		background: #ffffff;
		padding: 0.35rem 0.6rem;
		cursor: pointer;
		transition: background 0.2s, border 0.2s, transform 0.1s;
		font-weight: 600;
	}

	.toolbar button:hover {
		background: #e0f2fe;
		border-color: #0ea5e9;
		transform: translateY(-1px);
	}

	.editor-surface {
		min-height: 320px;
		padding: 1rem;
		outline: none;
	}

	.editor-surface:focus {
		box-shadow: inset 0 0 0 1px #0066cc;
	}

	.editor-surface img {
		max-width: 100%;
		height: auto;
		border-radius: 8px;
		margin: 1rem 0;
		display: block;
	}

	.preview-pane {
		padding: 1rem;
	}

	.preview-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}

	.preview {
		border: 1px dashed #e5e7eb;
		border-radius: 10px;
		padding: 1rem;
		background: #ffffff;
		max-height: 420px;
		overflow: auto;
	}

	.actions button,
	.ghost,
	.primary,
	.small {
		border-radius: 10px;
		border: 1px solid transparent;
		font-weight: 600;
		cursor: pointer;
	}

	.primary {
		background: #0066cc;
		color: #ffffff;
		padding: 0.85rem 1.2rem;
		border-color: #005bb5;
		box-shadow: 0 8px 16px rgba(0, 102, 204, 0.25);
	}

	.primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		box-shadow: none;
	}

	.ghost {
		background: #ffffff;
		color: #111827;
		border-color: #e5e7eb;
		padding: 0.85rem 1rem;
	}

	.small {
		padding: 0.45rem 0.75rem;
		font-size: 0.9rem;
	}

	.toast {
		padding: 0.85rem 1rem;
		border-radius: 10px;
		font-weight: 600;
		border: 1px solid #e5e7eb;
	}

	.toast.success {
		border-color: #a7f3d0;
		background: #ecfdf3;
		color: #065f46;
	}

	.toast.error {
		border-color: #fecdd3;
		background: #fff1f2;
		color: #9f1239;
	}

	.status {
		color: #4a5563;
	}

	.markdown :global(p) {
		margin-bottom: 1rem;
		line-height: 1.6;
	}

	.markdown :global(h2),
	.markdown :global(h3) {
		margin: 1.2rem 0 0.6rem;
	}

	.markdown :global(code) {
		background: #f3f4f6;
		padding: 0.2rem 0.4rem;
		border-radius: 6px;
	}

	.markdown :global(pre) {
		background: #0b1222;
		color: #e5e7eb;
		padding: 1rem;
		border-radius: 10px;
		overflow: auto;
	}

	.markdown :global(ul),
	.markdown :global(ol) {
		margin-left: 1.25rem;
		margin-bottom: 1rem;
	}

	.markdown :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: 8px;
		margin: 1.5rem 0;
		display: block;
	}

	@media (max-width: 1024px) {
		.editor-layout {
			grid-template-columns: 1fr;
		}
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 2rem;
	}

	.image-picker-modal {
		background: #ffffff;
		border-radius: 16px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		width: 100%;
		max-width: 900px;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.image-picker-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.image-picker-header h2 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 600;
		color: #000000;
	}

	.close-button {
		background: none;
		border: none;
		font-size: 2rem;
		color: #6b7280;
		cursor: pointer;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		transition: background 0.2s, color 0.2s;
	}

	.close-button:hover {
		background: #f3f4f6;
		color: #000000;
	}

	.image-picker-search {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.search-input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		font-size: 1rem;
		outline: none;
		transition: border 0.2s, box-shadow 0.2s;
	}

	.search-input:focus {
		border-color: #0066cc;
		box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.15);
	}

	.image-picker-content {
		flex: 1;
		overflow-y: auto;
		padding: 1.5rem;
	}

	.image-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.image-item {
		background: #ffffff;
		border: 2px solid #e5e7eb;
		border-radius: 12px;
		padding: 0.75rem;
		cursor: pointer;
		transition: border 0.2s, box-shadow 0.2s, transform 0.1s;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		overflow: hidden;
	}

	.image-item:hover {
		border-color: #0066cc;
		box-shadow: 0 8px 16px rgba(0, 102, 204, 0.15);
		transform: translateY(-2px);
	}

	.image-item img {
		width: 100%;
		height: 150px;
		object-fit: cover;
		border-radius: 8px;
		background: #f5f5f7;
	}

	.image-path {
		font-size: 0.75rem;
		color: #6b7280;
		text-align: center;
		word-break: break-all;
		line-height: 1.3;
	}

	@media (max-width: 768px) {
		.actions {
			flex-direction: column;
			align-items: stretch;
		}

		.panes {
			grid-template-columns: 1fr;
		}

		.modal-overlay {
			padding: 1rem;
		}

		.image-grid {
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		}
	}
</style>
