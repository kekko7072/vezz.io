<script lang="ts">
	import { onMount } from 'svelte';
	import { loadArticles } from '$lib/articles';
	import { getYouTubeId } from '$lib/utils/youtube';
	import type { Article } from '$lib/types/article';

	let articles: Article[] = [];

	onMount(() => {
		articles = loadArticles();
	});
</script>

<section id="articles" class="section">
	<div class="container">
		<div class="section-header">
			<h2 class="section-title">Articles</h2>
			<p class="section-subtitle">Random thoughts, project updates, and things I've learned</p>
		</div>

		<div class="articles-grid">
			{#each articles as article}
				<a 
					href="/articles/{article.slug}"
					class="article-card"
				>
						{#if article.imageUrl}
							<div class="article-media">
								<img src={article.imageUrl} alt={article.title} class="article-image" />
							</div>
						{:else if article.videoUrl}
							{@const videoId = getYouTubeId(article.videoUrl)}
							{#if videoId}
								<div class="article-media">
									<iframe
										class="article-video"
										src="https://www.youtube.com/embed/{videoId}"
										title={article.title}
										frameborder="0"
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
										allowfullscreen
									></iframe>
								</div>
							{/if}
						{/if}
						<div class="article-content-wrapper">
							<div class="article-header">
								<h3>{article.title}</h3>
							</div>
							<p class="article-excerpt">{article.excerpt}</p>
							<div class="article-footer">
								<div class="article-tags">
									{#each article.tags as tag}
										<span class="tech-tag">{tag}</span>
									{/each}
								</div>
								<span class="article-date">
									{new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
								</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
	</div>
</section>

<style>
	.section {
		min-height: 100vh;
		padding: 8rem 2rem 6rem;
		background: #ffffff;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	.section-title {
		font-size: 5rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		margin-bottom: 1rem;
		color: #0066cc;
		line-height: 0.9;
	}

	.section-subtitle {
		color: #86868b;
		margin-bottom: 4rem;
		font-size: 1.25rem;
		font-weight: 400;
		max-width: 600px;
	}

	.section-header {
		margin-bottom: 5rem;
	}

	.btn-secondary {
		padding: 0.75rem 1.5rem;
		background: transparent;
		border: 1px solid #d2d2d7;
		border-radius: 4px;
		color: #000000;
		font-weight: 400;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.875rem;
	}

	.btn-secondary:hover {
		border-color: #0066cc;
		color: #0066cc;
	}

	.articles-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
		gap: 4rem 3rem;
	}

	.article-card {
		padding: 0;
		cursor: pointer;
		transition: transform 0.2s;
		outline: none;
		border-radius: 8px;
		overflow: hidden;
		background: #ffffff;
		border: 1px solid #f5f5f7;
		transition: all 0.2s;
		text-decoration: none;
		color: inherit;
		display: block;
	}

	.article-card:hover,
	.article-card:focus {
		transform: translateY(-4px);
		border-color: #0066cc;
		box-shadow: 0 4px 12px rgba(0, 102, 204, 0.1);
	}

	.article-card:focus {
		outline: 2px solid #0066cc;
		outline-offset: 4px;
	}

	.article-media {
		width: 100%;
		height: 200px;
		overflow: hidden;
		background: #f5f5f7;
		margin-bottom: 0;
	}

	.article-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s;
	}

	.article-card:hover .article-image {
		transform: scale(1.05);
	}

	.article-video {
		width: 100%;
		height: 100%;
		border: none;
	}

	.article-content-wrapper {
		padding: 2rem;
	}

	.article-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.75rem;
		gap: 1rem;
	}

	.article-header h3 {
		font-size: 1.75rem;
		font-weight: 600;
		color: #000000;
		letter-spacing: -0.02em;
		line-height: 1.3;
		flex: 1;
	}


	.article-excerpt {
		color: #86868b;
		margin-bottom: 1.5rem;
		line-height: 1.7;
		font-size: 1.125rem;
	}

	.article-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #f5f5f7;
	}

	.article-date {
		color: #86868b;
		font-size: 0.875rem;
	}


	.tech-tag {
		padding: 0.375rem 0.75rem;
		background: #f5f5f7;
		border-radius: 4px;
		font-size: 0.875rem;
		color: #000000;
		font-weight: 400;
	}

	@media (max-width: 768px) {
		.section {
			padding: 6rem 1rem 4rem;
		}

		.section-title {
			font-size: 3rem;
		}

		.section-subtitle {
			font-size: 1.125rem;
		}

		.articles-grid {
			grid-template-columns: 1fr;
			gap: 2rem;
		}
	}
</style>
