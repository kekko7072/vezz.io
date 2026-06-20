import { browser } from '$app/environment';
import type { Article, ArticleSummary } from '$lib/types/article';
import { getArticleBySlug, loadArticles } from './index';

const ARTICLES_CACHE_KEY = 'vezz:articles:index:v1';
const ARTICLE_CACHE_PREFIX = 'vezz:articles:detail:v1:';
const CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry<T> = {
	value: T;
	expiresAt: number;
};

function toSummary(article: Article): ArticleSummary {
	const { content: _content, ...summary } = article;
	return summary;
}

function readCache<T>(key: string): T | null {
	if (!browser) return null;

	try {
		const raw = sessionStorage.getItem(key);
		if (!raw) return null;

		const cached = JSON.parse(raw) as CacheEntry<T>;
		if (!cached.expiresAt || cached.expiresAt < Date.now()) {
			sessionStorage.removeItem(key);
			return null;
		}

		return cached.value;
	} catch {
		sessionStorage.removeItem(key);
		return null;
	}
}

function writeCache<T>(key: string, value: T) {
	if (!browser) return;

	try {
		const entry: CacheEntry<T> = {
			value,
			expiresAt: Date.now() + CACHE_TTL_MS
		};
		sessionStorage.setItem(key, JSON.stringify(entry));
	} catch {
		// Storage can be unavailable in private contexts; the API/CDN cache still handles reuse.
	}
}

function isArticleSummary(value: unknown): value is ArticleSummary {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
	const article = value as ArticleSummary;
	return (
		typeof article.id === 'string' &&
		typeof article.slug === 'string' &&
		typeof article.title === 'string' &&
		typeof article.excerpt === 'string' &&
		typeof article.date === 'string' &&
		Array.isArray(article.tags) &&
		article.published === true
	);
}

function isArticle(value: unknown): value is Article {
	return isArticleSummary(value) && typeof (value as Article).content === 'string';
}

function bundledSummaries(): ArticleSummary[] {
	return loadArticles().map(toSummary);
}

export async function loadArticleSummaries(fetcher: typeof fetch = fetch): Promise<ArticleSummary[]> {
	const cached = readCache<ArticleSummary[]>(ARTICLES_CACHE_KEY);
	if (cached) return cached;

	try {
		const response = await fetcher('/api/articles', {
			headers: { Accept: 'application/json' }
		});

		if (response.ok) {
			const data = (await response.json()) as { articles?: unknown };
			const articles = Array.isArray(data.articles) ? data.articles.filter(isArticleSummary) : [];
			writeCache(ARTICLES_CACHE_KEY, articles);
			return articles;
		}
	} catch {
		// Local static builds and first-time Firebase setups can use bundled JSON until Firestore is seeded.
	}

	const fallback = bundledSummaries();
	writeCache(ARTICLES_CACHE_KEY, fallback);
	return fallback;
}

export async function loadArticleBySlug(
	slug: string,
	fetcher: typeof fetch = fetch
): Promise<Article | undefined> {
	const cacheKey = `${ARTICLE_CACHE_PREFIX}${slug}`;
	const cached = readCache<Article>(cacheKey);
	if (cached) return cached;

	try {
		const response = await fetcher(`/api/articles/${encodeURIComponent(slug)}`, {
			headers: { Accept: 'application/json' }
		});

		if (response.ok) {
			const data = (await response.json()) as { article?: unknown };
			if (isArticle(data.article)) {
				writeCache(cacheKey, data.article);
				return data.article;
			}
		}
	} catch {
		// Fall back to bundled JSON below.
	}

	const fallback = getArticleBySlug(slug);
	if (fallback) writeCache(cacheKey, fallback);
	return fallback;
}
