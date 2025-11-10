import { error } from "@sveltejs/kit";
import { getArticleBySlug } from "$lib/articles";
import type { PageLoad } from "./$types";
import { marked } from "marked";

marked.setOptions({
  breaks: true,
  gfm: true,
});

export const load = (async ({ params }) => {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    throw error(404, "Article not found");
  }

  return {
    article,
    contentHtml: await marked.parse(article.content),
  };
}) satisfies PageLoad;
