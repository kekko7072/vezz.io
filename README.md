# Francesco Vezzani - Portfolio Website

A modern, playful portfolio website built with SvelteKit, TypeScript, and Tailwind CSS.

## Features

- 🎯 **Playful Cursor**: Interactive cursor with trail effects
- 📄 **Interactive CV**: Timeline view of experience, education, and skills
- 💼 **Portfolio Section**: Showcase your recent works and projects
- 📝 **Article Management**: Create, edit, and manage articles with a built-in editor
- 🔥 **Firestore Articles API**: Published articles are served from Firebase Functions with CDN caching
- 🤖 **Article MCP**: Local MCP server for agents to create, edit, publish, and import articles
- 🏢 **Company Information**: Display your current company and role
- 🎨 **Modern Design**: Glass morphism, smooth animations, and clean UI
- 📱 **Responsive**: Works perfectly on all devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

### Edit articles locally (WYSIWYG)

- Start the editor-only dev server:
```bash
npm run edit
```
- Open `/editor` for a WYSIWYG UI that saves back to `src/lib/articles/*.json`
- The editor API is gated behind `VITE_ENABLE_EDITOR` and is not available in production builds

### Firestore-backed articles

Production articles are loaded through `/api/articles`, backed by Firebase Functions and Firestore. The static JSON files remain as a local/offline fallback.

See [docs/articles-backend.md](docs/articles-backend.md) for setup, import, deploy, MCP configuration, and the Postiz-to-article workflow.

## Customization

### Update Your Information

All components are in `src/lib/components/`:

- **Hero Section** (`Hero.svelte`): Update social links and bio
- **CV Section** (`CVSection.svelte`): Update experiences, education, and skills
- **Works Section** (`WorksSection.svelte`): Add your projects
- **Company Section** (`CompanySection.svelte`): Update company information
- **Articles**: Use the built-in editor to create and manage articles

## Tech Stack

- **SvelteKit**: Modern Svelte framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Firebase Firestore + Functions**: Production article storage and read API
- **MCP**: Agent-facing article management

## Deployment

Deploy to Vercel, Netlify, or any platform that supports SvelteKit:

```bash
npm run build
npm run preview
```

## License

MIT
