<script lang="ts">
	import { onMount } from 'svelte';

	let mouseX = 0;
	let mouseY = 0;
	let cursorX = 0;
	let cursorY = 0;
	let isHovering = false;
	let trail: Array<{ x: number; y: number; opacity: number }> = [];
	let isMobile = false;

	onMount(() => {
		// Check if device is mobile/touch
		isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
		
		if (isMobile) {
			return; // Don't initialize cursor on mobile
		}
		const handleMouseMove = (e: MouseEvent) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
		};

		const handleMouseEnter = () => {
			isHovering = true;
		};

		const handleMouseLeave = () => {
			isHovering = false;
		};

		// Animate cursor with smooth following
		const animate = () => {
			cursorX += (mouseX - cursorX) * 0.1;
			cursorY += (mouseY - cursorY) * 0.1;

			// Add trail point
			trail.push({ x: cursorX, y: cursorY, opacity: 1 });
			if (trail.length > 10) {
				trail.shift();
			}

			// Fade trail
			trail = trail.map((point, i) => ({
				...point,
				opacity: (i + 1) / trail.length * 0.5
			}));

			requestAnimationFrame(animate);
		};

		// Check for interactive elements
		const checkHover = () => {
			const element = document.elementFromPoint(mouseX, mouseY);
			const interactive = element?.matches('a, button, [role="button"]');
			isHovering = !!interactive;
		};

		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mousemove', checkHover);
		animate();

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mousemove', checkHover);
		};
	});
</script>

{#if !isMobile}
	<!-- Cursor trail -->
	{#each trail as point, i}
		<div
			class="cursor-trail"
			style="left: {point.x}px; top: {point.y}px; opacity: {point.opacity};"
		></div>
	{/each}

	<!-- Main cursor -->
	<div
		class="cursor {isHovering ? 'hover' : ''}"
		style="left: {cursorX}px; top: {cursorY}px;"
	></div>
{/if}

<style>
	.cursor {
		position: fixed;
		width: 20px;
		height: 20px;
		border: 2px solid #6366f1;
		border-radius: 50%;
		pointer-events: none;
		transform: translate(-50%, -50%);
		z-index: 9999;
		transition: width 0.3s, height 0.3s, border-color 0.3s;
	}

	.cursor.hover {
		width: 40px;
		height: 40px;
		border-color: #ec4899;
		background: rgba(236, 72, 153, 0.1);
	}

	.cursor-trail {
		position: fixed;
		width: 8px;
		height: 8px;
		background: #6366f1;
		border-radius: 50%;
		pointer-events: none;
		transform: translate(-50%, -50%);
		z-index: 9998;
	}
</style>
