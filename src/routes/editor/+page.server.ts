import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load = (() => {
	if (import.meta.env.VITE_ENABLE_EDITOR !== 'true') {
		throw error(404, 'Not found');
	}

	return {};
}) satisfies PageServerLoad;
