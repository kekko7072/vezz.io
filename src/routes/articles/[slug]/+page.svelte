<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { marked } from 'marked';
	import type { PageData } from './$types';

	export let data: PageData;
	const article = data.article;

	let articleUrl = '';

	const getYouTubeId = (url: string): string | null => {
		if (!url) return null;
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		return (match && match[2].length === 11) ? match[2] : null;
	};

	// Configure marked options
	marked.setOptions({
		breaks: true,
		gfm: true
	});

	// Parse markdown content
	const parsedContent = marked.parse(article.content);

	onMount(() => {
		if (browser) {
			articleUrl = `${window.location.origin}/articles/${article.slug}`;
		}
	});
</script>

<svelte:head>
	<title>{article.title} | vezz.io</title>
	<meta name="description" content={article.excerpt} />
</svelte:head>

<section class="article-page">
	<div class="container">
		<a href="/#articles" class="back-link">← Back to Articles</a>
		{#if articleUrl}
			<div class="article-url">
				<span class="url-label">Article URL:</span>
				<code class="url-code">{articleUrl}</code>
			</div>
		{/if}
		
		<article class="article-view">
			<header class="article-header">
				<h1>{article.title}</h1>
				<div class="article-meta">
					<div class="article-tags">
						{#each article.tags as tag}
							<span class="tech-tag">{tag}</span>
						{/each}
					</div>
					<time class="article-date" datetime={article.date}>
						{new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
					</time>
				</div>
			</header>

			{#if article.imageUrl}
				<div class="article-media-full">
					<img src={article.imageUrl} alt={article.title} class="article-image-full" />
				</div>
			{:else if article.videoUrl}
				{@const videoId = getYouTubeId(article.videoUrl)}
				{#if videoId}
					<div class="article-media-full">
						<iframe
							class="article-video-full"
							src="https://www.youtube.com/embed/{videoId}"
							title={article.title}
							frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowfullscreen
						></iframe>
					</div>
				{/if}
			{/if}

			<div class="article-content markdown">
				{@html parsedContent}
			</div>
		</article>
	</div>
</section>

<style>
	.article-page {
		min-height: 100vh;
		padding: 8rem 2rem 4rem;
		background: #ffffff;
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
	}

	.back-link {
		display: inline-block;
		color: #0066cc;
		text-decoration: none;
		margin-bottom: 2rem;
		font-size: 0.875rem;
		transition: opacity 0.2s;
	}

	.back-link:hover {
		opacity: 0.7;
	}

	.article-url {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 2rem;
		padding: 1rem;
		background: #f5f5f7;
		border-radius: 4px;
		font-size: 0.875rem;
	}

	.url-label {
		color: #86868b;
		font-weight: 400;
	}

	.url-code {
		color: #0066cc;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
		font-size: 0.875rem;
		background: #ffffff;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		border: 1px solid #d2d2d7;
	}

	.article-view {
		padding: 0;
	}

	.article-header {
		margin-bottom: 2rem;
	}

	.article-header h1 {
		font-size: 3rem;
		font-weight: 600;
		color: #000000;
		letter-spacing: -0.02em;
		line-height: 1.1;
		margin-bottom: 1.5rem;
	}

	.article-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid #f5f5f7;
	}

	.article-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tech-tag {
		padding: 0.375rem 0.75rem;
		background: #f5f5f7;
		border-radius: 4px;
		font-size: 0.875rem;
		color: #000000;
		font-weight: 400;
	}

	.article-date {
		color: #86868b;
		font-size: 0.875rem;
	}

	.article-media-full {
		width: 100%;
		margin-bottom: 2rem;
		border-radius: 8px;
		overflow: hidden;
		background: #f5f5f7;
	}

	.article-image-full {
		width: 100%;
		height: auto;
		display: block;
	}

	.article-video-full {
		width: 100%;
		aspect-ratio: 16 / 9;
		border: none;
	}

	.article-content {
		color: #000000;
		line-height: 1.75;
		font-size: 1.125rem;
		margin-top: 2rem;
	}

	/* Markdown styles */
	.markdown p {
		margin-bottom: 1.5rem;
	}

	.markdown p:last-child {
		margin-bottom: 0;
	}

	.markdown h1,
	.markdown h2,
	.markdown h3,
	.markdown h4,
	.markdown h5,
	.markdown h6 {
		font-weight: 600;
		color: #000000;
		margin-top: 2rem;
		margin-bottom: 1rem;
		line-height: 1.3;
	}

	.markdown h1 {
		font-size: 2.5rem;
		margin-top: 0;
	}

	.markdown h2 {
		font-size: 2rem;
	}

	.markdown h3 {
		font-size: 1.5rem;
	}

	.markdown h4 {
		font-size: 1.25rem;
	}

	.markdown h5 {
		font-size: 1.125rem;
	}

	.markdown h6 {
		font-size: 1rem;
	}

	.markdown a {
		color: #0066cc;
		text-decoration: none;
		transition: opacity 0.2s;
	}

	.markdown a:hover {
		opacity: 0.7;
		text-decoration: underline;
	}

	.markdown strong {
		font-weight: 600;
	}

	.markdown em {
		font-style: italic;
	}

	.markdown code {
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
		font-size: 0.9em;
		background: #f5f5f7;
		padding: 0.2em 0.4em;
		border-radius: 4px;
		color: #000000;
	}

	.markdown pre {
		background: #f5f5f7;
		border-radius: 8px;
		padding: 1.5rem;
		overflow-x: auto;
		margin: 1.5rem 0;
		line-height: 1.5;
	}

	.markdown pre code {
		background: transparent;
		padding: 0;
		font-size: 0.875rem;
		color: #000000;
	}

	.markdown ul,
	.markdown ol {
		margin: 1.5rem 0;
		padding-left: 2rem;
	}

	.markdown li {
		margin-bottom: 0.5rem;
	}

	.markdown ul li {
		list-style-type: disc;
	}

	.markdown ol li {
		list-style-type: decimal;
	}

	.markdown blockquote {
		border-left: 4px solid #0066cc;
		padding-left: 1.5rem;
		margin: 1.5rem 0;
		color: #86868b;
		font-style: italic;
	}

	.markdown hr {
		border: none;
		border-top: 1px solid #f5f5f7;
		margin: 2rem 0;
	}

	.markdown img {
		max-width: 100%;
		height: auto;
		border-radius: 8px;
		margin: 1.5rem 0;
	}

	.markdown table {
		width: 100%;
		border-collapse: collapse;
		margin: 1.5rem 0;
	}

	.markdown th,
	.markdown td {
		padding: 0.75rem;
		border: 1px solid #f5f5f7;
		text-align: left;
	}

	.markdown th {
		background: #f5f5f7;
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.article-page {
			padding: 6rem 1rem 4rem;
		}

		.article-header h1 {
			font-size: 2rem;
		}
	}
</style>
