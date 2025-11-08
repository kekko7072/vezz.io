<script lang="ts">
	import type { TabType } from '$lib/types/cv';
	import { experiences, education, skills } from '$lib/data/cv';

	let selectedTab: TabType = 'experience';
</script>

<section id="cv" class="section">
	<div class="container">
		<h2 class="section-title">Curriculum Vitae</h2>
		<p class="section-subtitle">The journey so far (and it's just getting started!)</p>

		<div class="tabs">
			<button
				class="tab {selectedTab === 'experience' ? 'active' : ''}"
				on:click={() => selectedTab = 'experience'}
			>
				Experience
			</button>
			<button
				class="tab {selectedTab === 'education' ? 'active' : ''}"
				on:click={() => selectedTab = 'education'}
			>
				Education
			</button>
			<button
				class="tab {selectedTab === 'skills' ? 'active' : ''}"
				on:click={() => selectedTab = 'skills'}
			>
				Skills
			</button>
		</div>

		<div class="content">
			{#if selectedTab === 'experience'}
				<div class="items">
					{#each experiences as exp}
						<div class="item">
							<div class="item-header">
								<div>
									<h3>{exp.role}</h3>
									<p class="company">{exp.company}</p>
								</div>
								<span class="period">{exp.period}</span>
							</div>
							<p class="description">{exp.description}</p>
							{#if exp.achievements}
								<ul class="achievements">
									{#each exp.achievements as achievement}
										<li>{achievement}</li>
									{/each}
								</ul>
							{/if}
							<div class="technologies">
								{#each exp.technologies as tech}
									<span class="tech-tag">{tech}</span>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{:else if selectedTab === 'education'}
				<div class="items">
					{#each education as edu}
						<div class="item">
							<div class="item-header">
								<div>
									<h3>{edu.degree}</h3>
									<p class="company">{edu.institution}</p>
								</div>
								<span class="period">{edu.period}</span>
							</div>
							{#if edu.description}
								<p class="description">{edu.description}</p>
							{/if}
						</div>
					{/each}
				</div>
			{:else if selectedTab === 'skills'}
				<div class="skills-grid">
					{#each skills as skillGroup}
						<div class="skill-group">
							<h3 class="skill-category">{skillGroup.category}</h3>
							<div class="skill-items">
								{#each skillGroup.items as skill}
									<span class="tech-tag">{skill}</span>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<div class="download-section">
			<a href="/Francesco%20Vezzani.pdf.webp" download="Francesco-Vezzani-CV.pdf.webp" class="download-btn" target="_blank" rel="noopener noreferrer">
				Download CV
			</a>
		</div>
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
		text-align: left;
		margin-bottom: 1rem;
		color: #0066cc;
		line-height: 0.9;
	}

	.section-subtitle {
		text-align: left;
		color: #86868b;
		margin-bottom: 5rem;
		font-size: 1.25rem;
		font-weight: 400;
		max-width: 600px;
	}

	.tabs {
		display: flex;
		justify-content: flex-start;
		gap: 1.5rem;
		margin-bottom: 4rem;
		flex-wrap: wrap;
		border-bottom: 1px solid #d2d2d7;
		padding-bottom: 1rem;
	}

	.tab {
		padding: 0.5rem 1rem;
		background: transparent;
		border: none;
		color: #86868b;
		cursor: pointer;
		transition: color 0.2s;
		text-transform: capitalize;
		font-size: 0.875rem;
		font-weight: 400;
		position: relative;
	}

	.tab:hover {
		color: #0066cc;
	}

	.tab.active {
		color: #0066cc;
	}

	.tab.active::after {
		content: '';
		position: absolute;
		bottom: -1rem;
		left: 0;
		width: 100%;
		height: 1px;
		background: #0066cc;
	}

	.content {
		margin-bottom: 3rem;
	}

	.items {
		display: flex;
		flex-direction: column;
		gap: 3rem;
	}

	.item {
		padding: 0;
		transition: opacity 0.2s;
	}

	.item:hover {
		opacity: 0.8;
	}

	.item-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.item h3 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: #000000;
		letter-spacing: -0.01em;
	}

	.company {
		color: #86868b;
		font-size: 1.125rem;
		font-weight: 400;
	}

	.period {
		color: #86868b;
		font-size: 0.875rem;
	}

	.description {
		color: #000000;
		margin-bottom: 1rem;
		line-height: 1.5;
		font-size: 1.125rem;
	}

	.achievements {
		list-style: none;
		color: #000000;
		margin-bottom: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding-left: 0;
	}

	.achievements li::before {
		content: '•';
		margin-right: 0.5rem;
		color: #86868b;
	}

	.technologies {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.tech-tag {
		padding: 0.375rem 0.75rem;
		background: #f5f5f7;
		border-radius: 4px;
		font-size: 0.875rem;
		color: #000000;
		font-weight: 400;
	}

	.skills-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.skill-group {
		padding: 0;
		transition: opacity 0.2s;
	}

	.skill-group:hover {
		opacity: 0.8;
	}

	.skill-category {
		font-size: 1.25rem;
		font-weight: 600;
		color: #000000;
		margin-bottom: 1rem;
		letter-spacing: -0.01em;
	}

	.skill-items {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.download-section {
		text-align: center;
		margin-top: 4rem;
	}

	.download-btn {
		display: inline-block;
		padding: 0.75rem 2rem;
		background: #0066cc;
		border-radius: 4px;
		color: #ffffff;
		font-weight: 400;
		text-decoration: none;
		transition: opacity 0.2s;
		font-size: 0.875rem;
	}

	.download-btn:hover {
		opacity: 0.8;
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

		.tabs {
			justify-content: center;
		}
	}
</style>
