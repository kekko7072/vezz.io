import type { Article } from '../types/article';

// Load all article JSON files from the articles folder
const articleModules = import.meta.glob<{ default: Article }>('./*.json', { eager: true });

// Convert the modules object to an array of articles
export function loadArticles(): Article[] {
	const articles: Article[] = Object.values(articleModules).map((module) => module.default);
	
	// Sort by date (newest first) and filter published articles
	return articles
		.filter((article) => article.published)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Load a single article by slug
export function getArticleBySlug(slug: string): Article | undefined {
	const articles = loadArticles();
	return articles.find((article) => article.slug === slug);
}

// Get all article slugs
export function getAllArticleSlugs(): string[] {
	const articles = loadArticles();
	return articles.map((article) => article.slug);
}
