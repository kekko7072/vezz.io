import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { refreshPublicIndex, upsertArticle, type ArticleInput } from './article-store.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const articlesDir = path.resolve(dirname, '../../src/lib/articles');

async function main() {
	const files = (await fs.readdir(articlesDir)).filter((file) => file.endsWith('.json')).sort();
	const imported: string[] = [];

	for (const file of files) {
		const filePath = path.join(articlesDir, file);
		const raw = await fs.readFile(filePath, 'utf-8');
		const article = JSON.parse(raw) as ArticleInput;

		const saved = await upsertArticle({
			...article,
			source: {
				type: 'import'
			}
		});
		imported.push(saved.slug);
	}

	await refreshPublicIndex();
	console.log(JSON.stringify({ imported, count: imported.length }, null, 2));
}

main().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
