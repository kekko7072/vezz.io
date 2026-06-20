# Firestore Articles Backend

This project now has two article sources:

- Production source: Firestore documents managed by the MCP/import tooling.
- Local fallback: `src/lib/articles/*.json`, still useful for offline development and first-time setup.

## Data Model

Firestore uses:

- `articles/{slug}`: full article documents, including markdown content and draft state.
- `metadata/articlesPublicIndex`: a denormalized list of published article summaries.

The home page reads `/api/articles`, which normally costs one Firestore document read because it uses `metadata/articlesPublicIndex`. The RSS feed uses the same index document, so it avoids scanning article documents. Article detail pages read `/api/articles/:slug`, which costs one document read for that article. Firebase Hosting/CDN cache headers reduce repeat reads across visitors.

Public endpoints:

- `GET /api/articles`: published article summaries as JSON.
- `GET /api/articles/:slug`: one published article as JSON.
- `GET /rss.xml`: RSS 2.0 feed.
- `GET /feed.xml`: RSS 2.0 feed alias.
- `GET /api/rss.xml`: RSS 2.0 feed alias.
- `GET /api/articles/rss.xml`: RSS 2.0 feed alias.
- `GET /api/articles?format=rss`: RSS 2.0 feed alias.

## Security

`firestore.rules` denies all direct client reads and writes. The public website talks to Firebase Functions at `/api/articles`; article writes happen only through Firebase Admin credentials used by the MCP/import tooling.

The write tooling rejects obvious unsafe markdown payloads such as script tags, inline event handlers, and `javascript:` URLs. New articles should be created as drafts first and published only after review.

## Install

```bash
npm install
npm --prefix functions install
npm --prefix mcp install
```

## Local Admin Auth

Use one of these before running the MCP or import script:

```bash
export FIREBASE_PROJECT_ID=vezz-io
export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
```

Do not commit service account files. A local `gcloud auth application-default login` setup also works if the authenticated account can use Firestore Admin APIs.

## Seed Firestore From Existing JSON

```bash
npm run articles:import
```

This imports `src/lib/articles/*.json` into `articles/{slug}` and rebuilds `metadata/articlesPublicIndex`.

## MCP Setup

Build the server:

```bash
npm run mcp:build
```

Example MCP configuration:

```json
{
  "mcpServers": {
    "vezz-articles": {
      "command": "node",
      "args": ["/Users/francescovezzani/Developer/vezz.io/mcp/dist/server.js"],
      "env": {
        "FIREBASE_PROJECT_ID": "vezz-io",
        "GOOGLE_APPLICATION_CREDENTIALS": "/absolute/path/to/service-account.json",
        "VEZZ_ARTICLES_PUBLISH_TOKEN": "local-secret-token"
      }
    }
  }
}
```

Read tools work without the publish token. Mutating tools refuse to run unless `VEZZ_ARTICLES_PUBLISH_TOKEN` is configured in the MCP server environment.

Available tools:

- `list_articles`
- `get_article`
- `upsert_article`
- `set_article_published`
- `delete_article`
- `refresh_public_index`
- `draft_article_from_postiz`

## Postiz Workflow

When an agent schedules a social post with Postiz, it should also call `draft_article_from_postiz` with:

- `postText`: the social post copy.
- `articleContent`: the longer markdown article if the agent has already written it.
- `platform`, `postUrl`, or `postId`: optional Postiz/social metadata.
- `published: false` by default.

If `articleContent` is omitted, the MCP creates a structured draft scaffold from the post text. Review and expand it, then publish with `set_article_published`.

## Deploy

```bash
npm run deploy
```

This builds the Svelte site, builds Firebase Functions, and deploys Hosting, Functions, Firestore rules, and indexes.
