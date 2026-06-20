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
	source?: {
		type: 'manual' | 'postiz' | 'import';
		platform?: string;
		postUrl?: string;
		postId?: string;
	};
	createdAt?: string;
	updatedAt?: string;
}

export type ArticleSummary = Omit<Article, 'content'>;
