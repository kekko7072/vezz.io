#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import {
	buildPostizArticleInput,
	deleteArticle,
	getArticle,
	listArticles,
	refreshPublicIndex,
	setArticlePublished,
	upsertArticle
} from './article-store.js';

const server = new Server(
	{
		name: 'vezz-articles',
		version: '0.1.0'
	},
	{
		capabilities: {
			tools: {}
		}
	}
);

const publishToken = process.env.VEZZ_ARTICLES_PUBLISH_TOKEN?.trim();

const tools = [
	{
		name: 'list_articles',
		description: 'List article summaries from Firestore. Defaults to published articles only.',
		inputSchema: {
			type: 'object',
			properties: {
				includeDrafts: { type: 'boolean', description: 'Include unpublished drafts.' },
				limit: { type: 'number', minimum: 1, maximum: 100, description: 'Maximum number of summaries.' },
				query: { type: 'string', description: 'Optional title, slug, or tag search.' }
			},
			additionalProperties: false
		}
	},
	{
		name: 'get_article',
		description: 'Read a full article by slug.',
		inputSchema: {
			type: 'object',
			properties: {
				slug: { type: 'string' }
			},
			required: ['slug'],
			additionalProperties: false
		}
	},
	{
		name: 'upsert_article',
		description:
			'Create or replace an article. Requires VEZZ_ARTICLES_PUBLISH_TOKEN in the MCP environment. New articles should usually start with published=false.',
		inputSchema: {
			type: 'object',
			properties: {
				id: { type: 'string' },
				slug: { type: 'string', description: 'Lowercase words separated by hyphens.' },
				title: { type: 'string' },
				excerpt: { type: 'string' },
				content: { type: 'string', description: 'Markdown content. Script tags, inline handlers, and javascript: URLs are rejected.' },
				date: { type: 'string', description: 'ISO date. Defaults to now if omitted.' },
				tags: {
					oneOf: [
						{ type: 'array', items: { type: 'string' } },
						{ type: 'string' }
					]
				},
				published: { type: 'boolean', description: 'Whether the public API should serve this article.' },
				imageUrl: { type: 'string' },
				videoUrl: { type: 'string' },
				source: {
					type: 'object',
					properties: {
						type: { type: 'string', enum: ['manual', 'postiz', 'import'] },
						platform: { type: 'string' },
						postUrl: { type: 'string' },
						postId: { type: 'string' }
					},
					required: ['type'],
					additionalProperties: false
				}
			},
			required: ['slug', 'title', 'excerpt', 'content'],
			additionalProperties: false
		}
	},
	{
		name: 'set_article_published',
		description:
			'Publish or unpublish an existing article and refresh the public index. Requires VEZZ_ARTICLES_PUBLISH_TOKEN in the MCP environment.',
		inputSchema: {
			type: 'object',
			properties: {
				slug: { type: 'string' },
				published: { type: 'boolean' }
			},
			required: ['slug', 'published'],
			additionalProperties: false
		}
	},
	{
		name: 'delete_article',
		description:
			'Delete an article. Requires VEZZ_ARTICLES_PUBLISH_TOKEN in the MCP environment. confirmSlug must exactly match slug.',
		inputSchema: {
			type: 'object',
			properties: {
				slug: { type: 'string' },
				confirmSlug: { type: 'string' }
			},
			required: ['slug', 'confirmSlug'],
			additionalProperties: false
		}
	},
	{
		name: 'refresh_public_index',
		description:
			'Rebuild the one-document public index used by the website article list. Requires VEZZ_ARTICLES_PUBLISH_TOKEN in the MCP environment.',
		inputSchema: {
			type: 'object',
			properties: {},
			additionalProperties: false
		}
	},
	{
		name: 'draft_article_from_postiz',
		description:
			'Create a draft long-form article from a Postiz/social post. Requires VEZZ_ARTICLES_PUBLISH_TOKEN in the MCP environment. Pass articleContent when the agent has already written the longer article.',
		inputSchema: {
			type: 'object',
			properties: {
				postText: { type: 'string', description: 'The social post text used as the seed.' },
				articleContent: { type: 'string', description: 'Optional full Markdown article. If omitted, a scaffold draft is created.' },
				title: { type: 'string' },
				slug: { type: 'string' },
				excerpt: { type: 'string' },
				date: { type: 'string' },
				tags: {
					oneOf: [
						{ type: 'array', items: { type: 'string' } },
						{ type: 'string' }
					]
				},
				published: { type: 'boolean', description: 'Defaults to false.' },
				imageUrl: { type: 'string' },
				videoUrl: { type: 'string' },
				platform: { type: 'string', description: 'Postiz platform, such as linkedin or x.' },
				postUrl: { type: 'string' },
				postId: { type: 'string' }
			},
			required: ['postText'],
			additionalProperties: false
		}
	}
];

function argsRecord(value: unknown): Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringArg(args: Record<string, unknown>, key: string): string {
	const value = args[key];
	if (typeof value !== 'string' || !value.trim()) {
		throw new Error(`${key} is required`);
	}
	return value.trim();
}

function booleanArg(args: Record<string, unknown>, key: string): boolean {
	if (typeof args[key] !== 'boolean') {
		throw new Error(`${key} must be a boolean`);
	}
	return args[key];
}

function textResponse(value: unknown) {
	return {
		content: [
			{
				type: 'text' as const,
				text: typeof value === 'string' ? value : JSON.stringify(value, null, 2)
			}
		]
	};
}

function assertPublishingEnabled(toolName: string) {
	if (!publishToken) {
		throw new Error(
			`${toolName} requires VEZZ_ARTICLES_PUBLISH_TOKEN to be configured in the MCP server environment`
		);
	}
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const args = argsRecord(request.params.arguments);

	switch (request.params.name) {
		case 'list_articles':
			return textResponse(
				await listArticles({
					includeDrafts: args.includeDrafts === true,
					limit: typeof args.limit === 'number' ? args.limit : undefined,
					query: typeof args.query === 'string' ? args.query : undefined
				})
			);

		case 'get_article':
			return textResponse(await getArticle(stringArg(args, 'slug')));

		case 'upsert_article':
			assertPublishingEnabled(request.params.name);
			return textResponse(await upsertArticle(args));

		case 'set_article_published':
			assertPublishingEnabled(request.params.name);
			return textResponse(await setArticlePublished(stringArg(args, 'slug'), booleanArg(args, 'published')));

		case 'delete_article':
			assertPublishingEnabled(request.params.name);
			return textResponse(await deleteArticle(stringArg(args, 'slug'), stringArg(args, 'confirmSlug')));

		case 'refresh_public_index':
			assertPublishingEnabled(request.params.name);
			return textResponse(await refreshPublicIndex());

		case 'draft_article_from_postiz':
			assertPublishingEnabled(request.params.name);
			return textResponse(await upsertArticle(buildPostizArticleInput(args)));

		default:
			throw new Error(`Unknown tool: ${request.params.name}`);
	}
});

await server.connect(new StdioServerTransport());
