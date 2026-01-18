<script lang="ts">
	import { onMount } from 'svelte';
	import { scrollToSection as scrollToSectionUtil } from '$lib/utils/scroll';

	let activeSection = 'home';
	let mobileMenuOpen = false;

	const navItems = [
		{ id: 'home', label: 'Home' },
		{ id: 'articles', label: 'Articles' },
		{ id: 'talks', label: 'Talks' },
		{ id: 'cv', label: 'CV' }
	];

	const scrollToSection = (id: string) => {
		activeSection = id;
		mobileMenuOpen = false;
		scrollToSectionUtil(id);
	};

	onMount(() => {
		const handleScroll = () => {
			const scrollPosition = window.scrollY + 150; // Offset for fixed nav
			let currentSection = 'home';

			for (const item of navItems) {
				const section = document.getElementById(item.id);
				if (section) {
					const sectionTop = section.offsetTop;
					const sectionHeight = section.offsetHeight;
					
					if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
						currentSection = item.id;
						break;
					}
				}
			}

			// Fallback: check if we're at the top
			if (window.scrollY < 100) {
				currentSection = 'home';
			}

			activeSection = currentSection;
		};

		// Throttle scroll events for better performance
		let ticking = false;
		const throttledScroll = () => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					handleScroll();
					ticking = false;
				});
				ticking = true;
			}
		};

		window.addEventListener('scroll', throttledScroll, { passive: true });
		handleScroll(); // Initial check

		return () => {
			window.removeEventListener('scroll', throttledScroll);
		};
	});
</script>

<nav class="nav">
	<div class="nav-container">
		<a href="#home" class="logo" on:click|preventDefault={() => scrollToSection('home')}>
			vezz.io
		</a>
		
		<button 
			class="mobile-menu-toggle" 
			aria-expanded={mobileMenuOpen}
			on:click={() => mobileMenuOpen = !mobileMenuOpen}
		>
			<span class="hamburger-line"></span>
			<span class="hamburger-line"></span>
			<span class="hamburger-line"></span>
		</button>
		
		<div class="nav-items {mobileMenuOpen ? 'open' : ''}">
			{#each navItems as item}
				<button
					class="nav-item {activeSection === item.id ? 'active' : ''}"
					on:click={() => scrollToSection(item.id)}
				>
					{item.label}
				</button>
			{/each}
		</div>
	</div>
</nav>

<style>
	.nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: saturate(180%) blur(20px);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}

	.nav-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 1rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		font-size: 1.125rem;
		font-weight: 600;
		color: #0066cc;
		text-decoration: none;
		letter-spacing: -0.01em;
	}

	.nav-items {
		display: flex;
		gap: 2rem;
	}

	.nav-item {
		padding: 0.5rem 0;
		background: transparent;
		border: none;
		color: #86868b;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 400;
		transition: color 0.2s;
		position: relative;
	}

	.nav-item:hover {
		color: #0066cc;
	}

	.nav-item.active {
		color: #0066cc;
	}

	.nav-item.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 1px;
		background: #0066cc;
	}

	.mobile-menu-toggle {
		display: none;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		flex-direction: column;
		gap: 4px;
		width: 24px;
		height: 24px;
		justify-content: center;
	}

	.hamburger-line {
		width: 18px;
		height: 1px;
		background: #000000;
		transition: all 0.3s;
	}

	.mobile-menu-toggle[aria-expanded="true"] .hamburger-line:nth-child(1) {
		transform: rotate(45deg) translate(5px, 5px);
	}

	.mobile-menu-toggle[aria-expanded="true"] .hamburger-line:nth-child(2) {
		opacity: 0;
	}

	.mobile-menu-toggle[aria-expanded="true"] .hamburger-line:nth-child(3) {
		transform: rotate(-45deg) translate(5px, -5px);
	}

	@media (max-width: 768px) {
		.nav-container {
			padding: 0.75rem 1.5rem;
		}

		.mobile-menu-toggle {
			display: flex;
		}

		.nav-items {
			position: fixed;
			top: 60px;
			left: 0;
			right: 0;
			background: rgba(255, 255, 255, 0.95);
			backdrop-filter: saturate(180%) blur(20px);
			flex-direction: column;
			padding: 1.5rem;
			gap: 1rem;
			transform: translateY(-100%);
			opacity: 0;
			pointer-events: none;
			transition: all 0.3s ease;
			border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		}

		.nav-items.open {
			transform: translateY(0);
			opacity: 1;
			pointer-events: all;
		}

		.nav-item {
			width: 100%;
			text-align: left;
			font-size: 1rem;
			padding: 0.75rem 0;
		}
	}
</style>
