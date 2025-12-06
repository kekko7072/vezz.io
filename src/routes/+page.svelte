<script lang="ts">
	import Navigation from '$lib/components/Navigation.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import ArticlesSection from '$lib/components/ArticlesSection.svelte';
	import CVSection from '$lib/components/CVSection.svelte';
</script>

<Navigation />

<Hero />
<ArticlesSection />
<CVSection />

<footer class="footer">
	<p>© {new Date().getFullYear()} Francesco Vezzani. Built with SvelteKit and way too much coffee ☕</p>
	<p class="logo-credit">Logo Artist Matteo Arzenton + Nano Banana</p>
</footer>

<style>
	.footer {
		padding: 4rem 2rem;
		text-align: center;
		color: #000000;
		font-size: 0.875rem;
		background: #ffffff;
	}

	.footer p {
		margin: 0.5rem 0;
	}

	.logo-credit {
		font-size: 0.75rem;
		color: #666666;
		margin-top: 1rem;
	}
</style>
