# Articles

This folder contains all blog articles in JSON format.

## Adding a New Article

1. Create a new JSON file in this folder (e.g., `my-article.json`)
2. Use the following structure:

```json
{
	"id": "unique-article-id",
	"slug": "unique-article-id",
	"title": "Article Title",
	"content": "Full article content here. You can use \\n for line breaks.",
	"excerpt": "Short excerpt that appears in the article card",
	"date": "2024-12-01T00:00:00.000Z",
	"tags": ["tag1", "tag2"],
	"published": true,
	"imageUrl": "https://example.com/image.jpg",
	"videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

## Fields

- **id**: Unique identifier (use kebab-case, e.g., "my-article")
- **slug**: URL-friendly identifier (used in the article URL, e.g., "my-article" creates `/articles/my-article`)
- **title**: Article title
- **content**: Full article content (use `\n` for line breaks)
- **excerpt**: Short description shown in article cards
- **date**: ISO 8601 date string (YYYY-MM-DDTHH:mm:ss.sssZ)
- **tags**: Array of tag strings
- **published**: `true` to show the article, `false` to hide it
- **imageUrl**: (optional) URL to an image for the article
- **videoUrl**: (optional) YouTube video URL

## Article URLs

Each article gets its own URL based on the slug:
- Slug: `"my-article"` → URL: `/articles/my-article`
- You can copy and share these URLs directly

## Date Format

Use ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`

Example: `2024-12-01T10:30:00.000Z`

## Ordering

Articles are automatically sorted by date (newest first). Just set the date field correctly and the articles will be ordered automatically.
