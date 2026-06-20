import { getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, Timestamp, type DocumentData } from 'firebase-admin/firestore';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'vezz-io';
const ARTICLES_COLLECTION = 'articles';
const METADATA_COLLECTION = 'metadata';
const PUBLIC_INDEX_DOC = 'articlesPublicIndex';
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

if (!getApps().length) {
	initializeApp({ projectId: PROJECT_ID });
}

const db = getFirestore();

export interface ArticleSource {
	type: 'manual' | 'postiz' | 'import';
	platform?: string;
	postUrl?: string;
	postId?: string;
}

export interface Article {
	id: string;
	slug: string;
	title: string;
	content: string;
	excerpt: string;
	date: string;
	tags: string[];
	published: boolean;
	imageUrl?: string;
	videoUrl?: string;
	source?: ArticleSource;
	createdAt?: string;
	updatedAt?: string;
}

export type ArticleSummary = Omit<Article, 'content'>;

export type ArticleInput = {
	id?: unknown;
	slug?: unknown;
	title?: unknown;
	content?: unknown;
	excerpt?: unknown;
	date?: unknown;
	tags?: unknown;
	published?: unknown;
	imageUrl?: unknown;
	videoUrl?: unknown;
	source?: unknown;
};

export type ListArticlesOptions = {
	includeDrafts?: boolean;
	limit?: number;
	query?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, field: string, maxLength: number): string {
	if (typeof value !== 'string') {
		throw new Error(`${field} must be a string`);
	}

	const trimmed = value.trim();
	if (!trimmed) {
		throw new Error(`${field} is required`);
	}

	if (trimmed.length > maxLength) {
		throw new Error(`${field} must be ${maxLength} characters or fewer`);
	}

	return trimmed;
}

function optionalString(value: unknown, field: string, maxLength: number): string | undefined {
	if (value === undefined || value === null || value === '') return undefined;
	return requiredString(value, field, maxLength);
}

function normalizeDate(value: unknown): string {
	const fallback = new Date().toISOString();
	const candidate = typeof value === 'string' && value.trim() ? value.trim() : fallback;
	const date = new Date(candidate);

	if (Number.isNaN(date.getTime())) {
		throw new Error('date must be a valid date string');
	}

	return date.toISOString();
}

function normalizeTags(value: unknown): string[] {
	if (value === undefined || value === null || value === '') return [];

	if (typeof value === 'string') {
		return value
			.split(',')
			.map((tag) => tag.trim())
			.filter(Boolean)
			.slice(0, 12);
	}

	if (!Array.isArray(value)) {
		throw new Error('tags must be an array or comma-separated string');
	}

	const tags = value
		.map((tag) => requiredString(tag, 'tag', 40))
		.filter(Boolean)
		.slice(0, 12);

	return [...new Set(tags)];
}

function normalizeUrl(value: unknown, field: string): string | undefined {
	const candidate = optionalString(value, field, 2048);
	if (!candidate) return undefined;

	if (candidate.startsWith('/')) return candidate;

	try {
		const parsed = new URL(candidate);
		if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
			return candidate;
		}
	} catch {
		throw new Error(`${field} must be an http(s) or root-relative URL`);
	}

	throw new Error(`${field} must be an http(s) or root-relative URL`);
}

function assertSafeMarkdown(content: string) {
	const unsafePatterns = [
		{ pattern: /<script\b/i, label: 'script tags' },
		{ pattern: /\son[a-z]+\s*=/i, label: 'inline event handlers' },
		{ pattern: /javascript:/i, label: 'javascript: URLs' }
	];

	for (const { pattern, label } of unsafePatterns) {
		if (pattern.test(content)) {
			throw new Error(`content cannot include ${label}`);
		}
	}
}

function normalizeSource(value: unknown): ArticleSource | undefined {
	if (value === undefined || value === null) return undefined;
	if (!isRecord(value)) throw new Error('source must be an object');

	const type = value.type;
	if (type !== 'manual' && type !== 'postiz' && type !== 'import') {
		throw new Error('source.type must be manual, postiz, or import');
	}

	return {
		type,
		platform: optionalString(value.platform, 'source.platform', 80),
		postUrl: normalizeUrl(value.postUrl, 'source.postUrl'),
		postId: optionalString(value.postId, 'source.postId', 160)
	};
}

function timestampToIso(value: unknown): string | undefined {
	if (value instanceof Timestamp) return value.toDate().toISOString();
	if (typeof value === 'string') return value;
	return undefined;
}

function normalizeStoredArticle(data: DocumentData): Article | null {
	try {
		const slug = requiredString(data.slug, 'slug', 120);
		if (!SLUG_PATTERN.test(slug)) return null;

		const content = requiredString(data.content, 'content', 120_000);
		assertSafeMarkdown(content);

		return {
			id: optionalString(data.id, 'id', 120) ?? slug,
			slug,
			title: requiredString(data.title, 'title', 160),
			content,
			excerpt: requiredString(data.excerpt, 'excerpt', 320),
			date: normalizeDate(data.date),
			tags: normalizeTags(data.tags),
			published: data.published === true,
			imageUrl: normalizeUrl(data.imageUrl, 'imageUrl'),
			videoUrl: normalizeUrl(data.videoUrl, 'videoUrl'),
			source: normalizeSource(data.source),
			createdAt: timestampToIso(data.createdAt),
			updatedAt: timestampToIso(data.updatedAt)
		};
	} catch {
		return null;
	}
}

function normalizeArticleInput(input: ArticleInput): Article {
	const slug = requiredString(input.slug, 'slug', 120).toLowerCase();
	if (!SLUG_PATTERN.test(slug)) {
		throw new Error('slug must use lowercase letters, numbers, and single hyphens');
	}

	const content = requiredString(input.content, 'content', 120_000);
	assertSafeMarkdown(content);

	return {
		id: optionalString(input.id, 'id', 120) ?? slug,
		slug,
		title: requiredString(input.title, 'title', 160),
		content,
		excerpt: requiredString(input.excerpt, 'excerpt', 320),
		date: normalizeDate(input.date),
		tags: normalizeTags(input.tags),
		published: input.published === true,
		imageUrl: normalizeUrl(input.imageUrl, 'imageUrl'),
		videoUrl: normalizeUrl(input.videoUrl, 'videoUrl'),
		source: normalizeSource(input.source)
	};
}

function toSummary(article: Article): ArticleSummary {
	const { content: _content, ...summary } = article;
	return summary;
}

function withoutUndefined<T>(value: T): T {
	if (Array.isArray(value)) {
		return value.map((item) => withoutUndefined(item)) as T;
	}

	if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
		return Object.fromEntries(
			Object.entries(value)
				.filter(([, entryValue]) => entryValue !== undefined)
				.map(([key, entryValue]) => [key, withoutUndefined(entryValue)])
		) as T;
	}

	return value;
}

function sortByDateDesc<T extends { date: string }>(articles: T[]): T[] {
	return [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function slugify(value: string): string {
	const slug = value
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/-{2,}/g, '-');

	return slug || `article-${Date.now()}`;
}

export async function refreshPublicIndex(): Promise<ArticleSummary[]> {
	const snapshot = await db.collection(ARTICLES_COLLECTION).where('published', '==', true).get();
	const summaries = sortByDateDesc(
		snapshot.docs
			.map((doc) => normalizeStoredArticle(doc.data()))
			.filter((article): article is Article => article !== null && article.published)
			.map(toSummary)
	);

	await db.collection(METADATA_COLLECTION).doc(PUBLIC_INDEX_DOC).set({
		articles: summaries.map((summary) => withoutUndefined(summary)),
		count: summaries.length,
		updatedAt: FieldValue.serverTimestamp()
	});

	return summaries;
}

export async function listArticles(options: ListArticlesOptions = {}): Promise<ArticleSummary[]> {
	const snapshot = options.includeDrafts
		? await db.collection(ARTICLES_COLLECTION).get()
		: await db.collection(ARTICLES_COLLECTION).where('published', '==', true).get();

	const query = options.query?.trim().toLowerCase();
	const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);

	return sortByDateDesc(
		snapshot.docs
			.map((doc) => normalizeStoredArticle(doc.data()))
			.filter((article): article is Article => article !== null)
			.filter((article) => {
				if (!query) return true;
				return (
					article.title.toLowerCase().includes(query) ||
					article.slug.includes(query) ||
					article.tags.some((tag) => tag.toLowerCase().includes(query))
				);
			})
			.map(toSummary)
	).slice(0, limit);
}

export async function getArticle(slug: string): Promise<Article> {
	if (!SLUG_PATTERN.test(slug)) throw new Error('slug is invalid');

	const snapshot = await db.collection(ARTICLES_COLLECTION).doc(slug).get();
	if (!snapshot.exists) throw new Error(`article not found: ${slug}`);

	const article = normalizeStoredArticle(snapshot.data() ?? {});
	if (!article) throw new Error(`article is invalid: ${slug}`);

	return article;
}

export async function upsertArticle(input: ArticleInput): Promise<Article> {
	const article = normalizeArticleInput(input);
	const ref = db.collection(ARTICLES_COLLECTION).doc(article.slug);
	const existing = await ref.get();
	const createdAt = existing.exists && existing.data()?.createdAt ? existing.data()?.createdAt : FieldValue.serverTimestamp();

	await ref.set(withoutUndefined({
		...article,
		createdAt,
		updatedAt: FieldValue.serverTimestamp()
	}));

	await refreshPublicIndex();
	return getArticle(article.slug);
}

export async function setArticlePublished(slug: string, published: boolean): Promise<Article> {
	if (!SLUG_PATTERN.test(slug)) throw new Error('slug is invalid');

	const article = await getArticle(slug);
	const ref = db.collection(ARTICLES_COLLECTION).doc(slug);
	await ref.update({
		published,
		updatedAt: FieldValue.serverTimestamp()
	});

	await refreshPublicIndex();
	return { ...article, published };
}

export async function deleteArticle(slug: string, confirmSlug: string): Promise<{ deleted: string }> {
	if (!SLUG_PATTERN.test(slug)) throw new Error('slug is invalid');
	if (confirmSlug !== slug) throw new Error('confirmSlug must match slug');

	await db.collection(ARTICLES_COLLECTION).doc(slug).delete();
	await refreshPublicIndex();
	return { deleted: slug };
}

export function buildPostizArticleInput(input: Record<string, unknown>): ArticleInput {
	const postText = requiredString(input.postText, 'postText', 4000);
	const title = optionalString(input.title, 'title', 160) ?? titleFromPost(postText);
	const articleContent =
		optionalString(input.articleContent, 'articleContent', 120_000) ?? buildLongFormScaffold(postText, title);
	const platform = optionalString(input.platform, 'platform', 80);
	const postUrl = normalizeUrl(input.postUrl, 'postUrl');
	const postId = optionalString(input.postId, 'postId', 160);

	return {
		slug: optionalString(input.slug, 'slug', 120) ?? slugify(title),
		title,
		excerpt: optionalString(input.excerpt, 'excerpt', 320) ?? excerptFromPost(postText),
		content: articleContent,
		date: input.date,
		tags: input.tags,
		published: input.published === true,
		imageUrl: input.imageUrl,
		videoUrl: input.videoUrl,
		source: {
			type: 'postiz',
			platform,
			postUrl,
			postId
		}
	};
}

function titleFromPost(postText: string): string {
	const firstLine = postText
		.split(/\r?\n/)
		.map((line) => line.trim())
		.find(Boolean);

	if (!firstLine) return 'Untitled article';
	return firstLine.length <= 70 ? firstLine : `${firstLine.slice(0, 67).trim()}...`;
}

function excerptFromPost(postText: string): string {
	const compact = postText.replace(/\s+/g, ' ').trim();
	return compact.length <= 220 ? compact : `${compact.slice(0, 217).trim()}...`;
}

function buildLongFormScaffold(postText: string, title: string): string {
	return [
		`# ${title}`,
		'',
		'This draft was created from a Postiz social post. Expand the sections before publishing.',
		'',
		'## Original post',
		'',
		postText,
		'',
		'## Context',
		'',
		'Add the background, constraints, and why this mattered.',
		'',
		'## What I built or learned',
		'',
		'Turn the short social update into the full story with examples, screenshots, links, and tradeoffs.',
		'',
		'## What comes next',
		'',
		'Close with the practical next step, open question, or follow-up work.'
	].join('\n');
}
