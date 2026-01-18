<script lang="ts">
	import { talks } from '$lib/data/talks';
</script>

<section id="talks" class="section">
	<div class="container">
		<h2 class="section-title">Talks</h2>
		<p class="section-subtitle">Short list of places where I've shared ideas and stories.</p>

		{#if talks.length === 0}
			<p class="empty-state">New talks coming soon.</p>
		{:else}
			<div class="talks-list">
				{#each talks as talk}
					<div class="talk-item">
						<div class="talk-date">{talk.date}</div>
						<div class="talk-details">
							<h3 class="talk-topic">
								{#if talk.url}
									<a class="talk-link" href={talk.url} target="_blank" rel="noopener noreferrer">
										{talk.topic}
									</a>
								{:else}
									{talk.topic}
								{/if}
							</h3>
							<div class="talk-meta">
								<span class="talk-organization">{talk.organization}</span>
								<span class="talk-divider">•</span>
								<span class="talk-location">{talk.location}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>

<style>
	.section {
		min-height: 100vh;
		padding: 6rem 2rem;
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

	.talks-list {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.talk-item {
		display: grid;
		grid-template-columns: minmax(120px, 160px) 1fr;
		gap: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid #f5f5f7;
	}

	.talk-date {
		color: #86868b;
		font-size: 0.95rem;
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}

	.talk-topic {
		font-size: 1.5rem;
		font-weight: 600;
		color: #000000;
		letter-spacing: -0.01em;
		margin-bottom: 0.5rem;
	}

	.talk-link {
		color: #0066cc;
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition: border-color 0.2s, color 0.2s;
	}

	.talk-link:hover,
	.talk-link:focus {
		color: #004c99;
		border-color: #004c99;
	}

	.talk-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		color: #86868b;
		font-size: 1rem;
	}

	.talk-divider {
		color: #d2d2d7;
	}

	.empty-state {
		color: #86868b;
		font-size: 1.125rem;
	}

	@media (max-width: 768px) {
		.section {
			padding: 4rem 1rem;
		}

		.section-title {
			font-size: 3rem;
		}

		.section-subtitle {
			font-size: 1.125rem;
		}

		.talk-item {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}
	}
</style>
