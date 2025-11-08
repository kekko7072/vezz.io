# Francesco Vezzani - Portfolio Website

A modern, playful portfolio website built with SvelteKit, TypeScript, and Tailwind CSS.

## Features

- 🎯 **Playful Cursor**: Interactive cursor with trail effects
- 📄 **Interactive CV**: Timeline view of experience, education, and skills
- 💼 **Portfolio Section**: Showcase your recent works and projects
- 📝 **Article Management**: Create, edit, and manage articles with a built-in editor
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
- **LocalStorage**: Article persistence

## Deployment

Deploy to Vercel, Netlify, or any platform that supports SvelteKit:

```bash
npm run build
npm run preview
```

## License

MIT
