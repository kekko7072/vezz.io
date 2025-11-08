import { error } from '@sveltejs/kit';
import { getArticleBySlug } from '$lib/articles';
import type { PageLoad } from './$types';

export const load = (({ params }) => {
	const article = getArticleBySlug(params.slug);

	if (!article) {
		throw error(404, 'Article not found');
	}

	return {
		article
	};
}) satisfies PageLoad;
