import { error, json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import type { Article } from '$lib/types/article';

const ARTICLES_DIR = path.resolve('src/lib/articles');

function assertEditorEnabled() {
	if (import.meta.env.VITE_ENABLE_EDITOR !== 'true') {
		throw error(404, 'Not found');
	}
}

async function readArticleFiles(): Promise<{ article: Article; fileName: string }[]> {
	const files = await fs.readdir(ARTICLES_DIR);
	const articles: { article: Article; fileName: string }[] = [];

	for (const fileName of files) {
		if (!fileName.endsWith('.json')) continue;

		const filePath = path.join(ARTICLES_DIR, fileName);
		const raw = await fs.readFile(filePath, 'utf-8');
		const article = JSON.parse(raw) as Article;
		articles.push({ article, fileName });
	}

	return articles;
}

function validateArticlePayload(payload: Article) {
	if (!payload.title?.trim() || !payload.slug?.trim()) {
		throw error(400, 'Title and slug are required');
	}

	if (!payload.excerpt?.trim()) {
		throw error(400, 'Excerpt is required');
	}

	if (!payload.content?.trim()) {
		throw error(400, 'Content is required');
	}

	if (!payload.date?.trim()) {
		throw error(400, 'Date is required');
	}
}

export const GET = async () => {
	assertEditorEnabled();
	const articles = await readArticleFiles();

	return json({
		articles: articles
			.map(({ article, fileName }) => ({ ...article, fileName }))
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
	});
};

export const POST = async ({ request }) => {
	assertEditorEnabled();

	const payload = (await request.json()) as Article;
	validateArticlePayload(payload);

	const articles = await readArticleFiles();
	if (articles.some(({ article }) => article.slug === payload.slug)) {
		throw error(409, 'An article with this slug already exists');
	}

	const normalized: Article = {
		...payload,
		id: payload.id || payload.slug,
		slug: payload.slug.trim(),
		tags: Array.isArray(payload.tags) ? payload.tags : []
	};

	const targetPath = path.join(ARTICLES_DIR, `${normalized.slug}.json`);
	const serialized = `${JSON.stringify(normalized, null, '\t')}\n`;
	await fs.writeFile(targetPath, serialized, 'utf-8');

	return json({ article: normalized });
};
