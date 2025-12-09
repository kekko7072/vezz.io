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

async function findArticleBySlug(slug: string): Promise<{ article: Article; fileName: string }> {
	const files = await fs.readdir(ARTICLES_DIR);
	for (const fileName of files) {
		if (!fileName.endsWith('.json')) continue;

		const filePath = path.join(ARTICLES_DIR, fileName);
		const raw = await fs.readFile(filePath, 'utf-8');
		const article = JSON.parse(raw) as Article;

		if (article.slug === slug) {
			return { article, fileName };
		}
	}

	throw error(404, 'Article not found');
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

export const GET = async ({ params }) => {
	assertEditorEnabled();
	const { article, fileName } = await findArticleBySlug(params.slug);
	return json({ article, fileName });
};

export const PUT = async ({ params, request }) => {
	assertEditorEnabled();

	const payload = (await request.json()) as Article;
	validateArticlePayload(payload);

	const { fileName: existingFile } = await findArticleBySlug(params.slug);
	const newSlug = payload.slug.trim();
	const targetFileName = `${newSlug}.json`;
	const targetPath = path.join(ARTICLES_DIR, targetFileName);
	const sourcePath = path.join(ARTICLES_DIR, existingFile);

	if (newSlug !== params.slug) {
		try {
			await fs.access(targetPath);
			throw error(409, 'Another article already uses this slug');
		} catch (err) {
			if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
				throw err;
			}
		}
	}

	const normalized: Article = {
		...payload,
		id: payload.id || newSlug,
		slug: newSlug,
		tags: Array.isArray(payload.tags) ? payload.tags : []
	};

	const serialized = `${JSON.stringify(normalized, null, '\t')}\n`;
	await fs.writeFile(targetPath, serialized, 'utf-8');

	if (targetPath !== sourcePath) {
		await fs.rm(sourcePath);
	}

	return json({ article: normalized, fileName: targetFileName });
};
