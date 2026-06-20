import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';

if (!getApps().length) {
	initializeApp();
}

const db = getFirestore();
const ARTICLES_COLLECTION = 'articles';
const METADATA_COLLECTION = 'metadata';
const PUBLIC_INDEX_DOC = 'articlesPublicIndex';
const SITE_URL = (process.env.SITE_URL || 'https://vezz.io').replace(/\/+$/, '');
const LIST_CACHE = 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400';
const DETAIL_CACHE = 'public, max-age=60, s-maxage=1800, stale-while-revalidate=86400';
const RSS_CACHE = 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400';
const NO_STORE = 'no-store';

interface Article {
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
}

type ArticleSummary = Omit<Article, 'content'>;

type JsonRequest = {
	method: string;
	url: string;
};

type JsonResponse = {
	set(field: string, value: string): JsonResponse;
	status(code: number): JsonResponse;
	json(body: unknown): void;
	send(body: string): void;
	end(): void;
};

type RequestRoute =
	| { kind: 'list' }
	| { kind: 'rss' }
	| { kind: 'detail'; slug: string }
	| { kind: 'notFound' };

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function boundedString(value: unknown, maxLength: number): string | undefined {
	if (typeof value !== 'string') return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : undefined;
}

function optionalUrl(value: unknown): string | undefined {
	if (value === undefined || value === null || value === '') return undefined;
	const candidate = boundedString(value, 2048);
	if (!candidate) return undefined;

	if (candidate.startsWith('/')) return candidate;

	try {
		const parsed = new URL(candidate);
		if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return candidate;
	} catch {
		return undefined;
	}

	return undefined;
}

function tagsFrom(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value
		.filter((tag): tag is string => typeof tag === 'string')
		.map((tag) => tag.trim())
		.filter((tag) => tag.length > 0 && tag.length <= 40)
		.slice(0, 12);
}

function hasUnsafeMarkdown(value: string): boolean {
	return /<script\b/i.test(value) || /\son[a-z]+\s*=/i.test(value) || /javascript:/i.test(value);
}

function normalizeSummary(value: unknown): ArticleSummary | null {
	if (!isRecord(value)) return null;

	const slug = boundedString(value.slug, 120);
	const title = boundedString(value.title, 160);
	const excerpt = boundedString(value.excerpt, 320);
	const date = boundedString(value.date, 40);
	const published = value.published === true;

	if (!slug || !title || !excerpt || !date || !published) return null;
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
	if (Number.isNaN(new Date(date).getTime())) return null;

	return {
		id: boundedString(value.id, 120) ?? slug,
		slug,
		title,
		excerpt,
		date,
		tags: tagsFrom(value.tags),
		published,
		imageUrl: optionalUrl(value.imageUrl),
		videoUrl: optionalUrl(value.videoUrl)
	};
}

function normalizeArticle(value: unknown): Article | null {
	if (!isRecord(value)) return null;

	const summary = normalizeSummary(value);
	const content = boundedString(value.content, 120_000);

	if (!summary || !content || hasUnsafeMarkdown(content)) return null;

	return {
		...summary,
		content
	};
}

function sortByDateDesc<T extends { date: string }>(articles: T[]): T[] {
	return [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function setJsonHeaders(res: JsonResponse, cacheControl: string) {
	res.set('Cache-Control', cacheControl);
	res.set('Content-Type', 'application/json; charset=utf-8');
	res.set('X-Content-Type-Options', 'nosniff');
}

function sendJson(
	req: JsonRequest,
	res: JsonResponse,
	status: number,
	body: unknown,
	cacheControl = NO_STORE
) {
	setJsonHeaders(res, cacheControl);
	if (req.method === 'HEAD') {
		res.status(status).end();
		return;
	}
	res.status(status).json(body);
}

function setXmlHeaders(res: JsonResponse, cacheControl: string) {
	res.set('Cache-Control', cacheControl);
	res.set('Content-Type', 'application/rss+xml; charset=utf-8');
	res.set('X-Content-Type-Options', 'nosniff');
}

function sendXml(req: JsonRequest, res: JsonResponse, status: number, body: string, cacheControl = RSS_CACHE) {
	setXmlHeaders(res, cacheControl);
	if (req.method === 'HEAD') {
		res.status(status).end();
		return;
	}
	res.status(status).send(body);
}

function getRequestRoute(rawUrl: string): RequestRoute {
	const url = new URL(rawUrl, SITE_URL);
	const pathname = url.pathname.replace(/\/+$/, '');
	const apiPrefix = '/api/articles';

	if (url.searchParams.get('format') === 'rss') {
		return { kind: 'rss' };
	}

	if (
		pathname === '/rss.xml' ||
		pathname === '/feed.xml' ||
		pathname === '/api/rss.xml' ||
		pathname === '/api/articles/rss.xml'
	) {
		return { kind: 'rss' };
	}

	if (pathname === '' || pathname === '/' || pathname === apiPrefix) return { kind: 'list' };

	if (pathname.startsWith(`${apiPrefix}/`)) {
		const rest = pathname.slice(apiPrefix.length + 1);
		if (!rest || rest.includes('/')) return { kind: 'notFound' };
		return { kind: 'detail', slug: decodeURIComponent(rest) };
	}

	const fallback = pathname.replace(/^\/+/, '');
	if (!fallback || fallback.includes('/')) return { kind: 'notFound' };
	return { kind: 'detail', slug: decodeURIComponent(fallback) };
}

async function listPublishedArticles(): Promise<ArticleSummary[]> {
	const indexSnapshot = await db.collection(METADATA_COLLECTION).doc(PUBLIC_INDEX_DOC).get();
	const indexData = indexSnapshot.data();
	const indexedArticles = Array.isArray(indexData?.articles)
		? indexData.articles.map(normalizeSummary).filter((article): article is ArticleSummary => article !== null)
		: [];

	if (indexedArticles.length > 0) {
		return sortByDateDesc(indexedArticles);
	}

	const snapshot = await db
		.collection(ARTICLES_COLLECTION)
		.where('published', '==', true)
		.get();

	const articles = snapshot.docs
		.map((doc) => normalizeSummary(doc.data()))
		.filter((article): article is ArticleSummary => article !== null);

	return sortByDateDesc(articles);
}

async function getPublishedArticle(slug: string): Promise<Article | null> {
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;

	const snapshot = await db.collection(ARTICLES_COLLECTION).doc(slug).get();
	if (!snapshot.exists) return null;

	return normalizeArticle(snapshot.data());
}

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function absoluteUrl(value: string): string {
	if (value.startsWith('/')) return `${SITE_URL}${value}`;
	return value;
}

function rssDate(value: string): string {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
}

function buildRssFeed(articles: ArticleSummary[]): string {
	const latestDate = articles[0]?.date ?? new Date().toISOString();
	const items = articles
		.map((article) => {
			const articleUrl = `${SITE_URL}/articles/${encodeURIComponent(article.slug)}`;
			const imageTag = article.imageUrl
				? `\n      <enclosure url="${escapeXml(absoluteUrl(article.imageUrl))}" type="image/*" />`
				: '';
			const categories = article.tags
				.map((tag) => `\n      <category>${escapeXml(tag)}</category>`)
				.join('');

			return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(articleUrl)}</link>
      <guid isPermaLink="true">${escapeXml(articleUrl)}</guid>
      <description>${escapeXml(article.excerpt)}</description>
      <pubDate>${rssDate(article.date)}</pubDate>${categories}${imageTag}
    </item>`;
		})
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>vezz.io articles</title>
    <link>${escapeXml(SITE_URL)}</link>
    <atom:link href="${escapeXml(`${SITE_URL}/rss.xml`)}" rel="self" type="application/rss+xml" />
    <description>Articles, project updates, and notes by Francesco Vezzani.</description>
    <language>en</language>
    <lastBuildDate>${rssDate(latestDate)}</lastBuildDate>
${items}
  </channel>
</rss>`;
}

export const articlesApi = onRequest(
	{
		region: 'europe-west1',
		timeoutSeconds: 15,
		memory: '256MiB',
		maxInstances: 4
	},
	async (req, res) => {
		if (req.method === 'OPTIONS') {
			res.set('Allow', 'GET, HEAD, OPTIONS');
			res.status(204).end();
			return;
		}

		if (req.method !== 'GET' && req.method !== 'HEAD') {
			res.set('Allow', 'GET, HEAD, OPTIONS');
			sendJson(req, res, 405, { error: 'Method not allowed' });
			return;
		}

		try {
			const route = getRequestRoute(req.url);

			if (route.kind === 'notFound') {
				sendJson(req, res, 404, { error: 'Not found' });
				return;
			}

			if (route.kind === 'list') {
				const articles = await listPublishedArticles();
				sendJson(req, res, 200, { articles }, LIST_CACHE);
				return;
			}

			if (route.kind === 'rss') {
				const articles = await listPublishedArticles();
				sendXml(req, res, 200, buildRssFeed(articles), RSS_CACHE);
				return;
			}

			const article = await getPublishedArticle(route.slug);
			if (!article) {
				sendJson(req, res, 404, { error: 'Article not found' });
				return;
			}

			sendJson(req, res, 200, { article }, DETAIL_CACHE);
		} catch (err) {
			console.error('articlesApi failed', err);
			sendJson(req, res, 500, { error: 'Internal server error' });
		}
	}
);
