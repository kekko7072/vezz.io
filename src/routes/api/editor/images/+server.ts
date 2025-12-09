import { error, json } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

const STATIC_DIR = path.resolve('static');

function assertEditorEnabled() {
	if (import.meta.env.VITE_ENABLE_EDITOR !== 'true') {
		throw error(404, 'Not found');
	}
}

async function getImagesRecursive(dir: string, basePath: string = ''): Promise<string[]> {
	const images: string[] = [];
	const entries = await fs.readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

		if (entry.isDirectory()) {
			const subImages = await getImagesRecursive(fullPath, relativePath);
			images.push(...subImages);
		} else if (entry.isFile()) {
			const ext = path.extname(entry.name).toLowerCase();
			if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
				images.push(`/${relativePath}`);
			}
		}
	}

	return images;
}

export const GET = async () => {
	assertEditorEnabled();
	try {
		const images = await getImagesRecursive(STATIC_DIR);
		return json({ images: images.sort() });
	} catch (err) {
		throw error(500, 'Failed to read images directory');
	}
};
