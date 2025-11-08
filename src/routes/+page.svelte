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
</footer>

<style>
	.footer {
		padding: 4rem 2rem;
		text-align: center;
		color: #000000;
		font-size: 0.875rem;
		background: #ffffff;
	}
</style>
