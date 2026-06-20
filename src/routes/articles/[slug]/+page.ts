import { error } from "@sveltejs/kit";
import { loadArticleBySlug } from "$lib/articles/api";
import type { PageLoad } from "./$types";
import { marked } from "marked";

marked.setOptions({
  breaks: true,
  gfm: true,
});

export const load = (async ({ params, fetch }) => {
  const article = await loadArticleBySlug(params.slug, fetch);

  if (!article) {
    throw error(404, "Article not found");
  }

  return {
    article,
    contentHtml: await marked.parse(article.content),
  };
}) satisfies PageLoad;
