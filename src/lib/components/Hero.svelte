<script lang="ts">
	import { PERSONAL_INFO } from '$lib/constants/personal';
	import { scrollToSection } from '$lib/utils/scroll';

	let showEmail = false;

	const revealEmail = () => {
		showEmail = true;
	};
</script>

<section id="home" class="hero">
	<div class="hero-content">
		<div class="hero-main">
			<div class="hero-text">
				<h1 class="title">
					<span class="title-line">{PERSONAL_INFO.name.first}</span>
					<span class="title-line">{PERSONAL_INFO.name.last}</span>
				</h1>
				<p class="subtitle">{PERSONAL_INFO.title}</p>
			</div>
			
			<div class="hero-aside">
				<div class="site-name">
					<span class="site-label">{PERSONAL_INFO.siteName}</span>
					<span class="fun-fact">{PERSONAL_INFO.siteTagline}</span>
				</div>
			</div>
		</div>
		
		<div class="who-am-i">
			{#each PERSONAL_INFO.bio as paragraph}
				<p class="description">{paragraph}</p>
			{/each}
		</div>
		
		<div class="social-links">
			{#each PERSONAL_INFO.socialLinks as link}
				<a
					href={link.url}
					target="_blank"
					rel="noopener noreferrer"
					class="social-link"
				>
					{link.name}
				</a>
			{/each}
			{#if showEmail}
				<a
					href="mailto:{PERSONAL_INFO.email}"
					class="social-link"
				>
					Email
				</a>
			{:else}
				<button
					class="social-link reveal-email-btn"
					on:click={revealEmail}
					type="button"
				>
					Email
				</button>
			{/if}
		</div>
	</div>
</section>

<style>
	.hero {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		padding: 6rem 2rem;
		padding-top: 120px;
		background: #ffffff;
	}

	.hero-content {
		max-width: 1200px;
		width: 100%;
		animation: slideIn 0.6s ease-out;
	}

	.hero-main {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 4rem;
		align-items: start;
		margin-bottom: 4rem;
	}

	.hero-text {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.title {
		display: flex;
		flex-direction: column;
		gap: 0;
		margin: 0;
		line-height: 0.9;
	}

	.title-line {
		display: block;
		font-size: 6rem;
		font-weight: 700;
		letter-spacing: -0.04em;
		color: #000000;
		line-height: 0.9;
	}

	.title-line:first-child {
		color: #0066cc;
	}

	.subtitle {
		font-size: 1.25rem;
		color: #86868b;
		font-weight: 400;
		margin-top: 0.5rem;
		letter-spacing: 0.01em;
	}

	.hero-aside {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		text-align: right;
		padding-top: 0.5rem;
	}

	.site-name {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.site-label {
		font-size: 1.5rem;
		font-weight: 600;
		color: #0066cc;
		letter-spacing: -0.01em;
	}

	.fun-fact {
		font-size: 0.75rem;
		color: #86868b;
		font-weight: 400;
		font-style: italic;
		letter-spacing: 0.01em;
	}

	.who-am-i {
		max-width: 800px;
		margin-bottom: 3rem;
	}

	.description {
		font-size: 1.25rem;
		color: #000000;
		margin-bottom: 1.5rem;
		line-height: 1.8;
		font-weight: 400;
	}

	.description:last-of-type {
		margin-bottom: 0;
	}

	.social-links {
		display: flex;
		flex-wrap: wrap;
		gap: 2rem;
	}

	.social-link {
		color: #0066cc;
		text-decoration: none;
		font-size: 1rem;
		font-weight: 500;
		transition: opacity 0.2s;
		position: relative;
	}

	.social-link:hover {
		opacity: 0.7;
	}

	.social-link::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 0;
		height: 2px;
		background: #0066cc;
		transition: width 0.3s;
	}

	.social-link:hover::after {
		width: 100%;
	}

	.reveal-email-btn {
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		font-family: inherit;
		text-decoration: none;
	}

	@media (max-width: 968px) {
		.hero-main {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.hero-aside {
			align-items: flex-start;
			text-align: left;
		}
	}

	@media (max-width: 768px) {
		.hero {
			padding: 4rem 1rem;
			padding-top: 100px;
		}

		.title-line {
			font-size: 3.5rem;
		}

		.subtitle {
			font-size: 1.125rem;
		}

		.site-label {
			font-size: 1.25rem;
		}

		.fun-fact {
			font-size: 0.7rem;
		}

		.description {
			font-size: 1.125rem;
		}

		.social-links {
			gap: 1.5rem;
		}
	}
</style>
