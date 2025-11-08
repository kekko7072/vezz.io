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
}
