import { Document } from "llamaindex";
import { getMarkupPuppeteer, getPuppeteerPage } from "./getMarkup.js";
import { getSitemapUrls } from "./getSitemapUrls.js";
import { getCleanedUpContent } from "./getCleanedUpContent.js";

export async function getDocumentsFromSitemapUrl(
  sitemapUrl: string,
  limit: number = -1
) {
  const sitemapUrls = await getSitemapUrls(sitemapUrl);

  const pageContents = await getPageContents(sitemapUrls.slice(0, limit));

  const documents = pageContents.map(
    (content) =>
      new Document({
        text: content.textContent,
        metadata: {
          url: content.url,
          title: content.title,
        },
        excludedLlmMetadataKeys: ["url"],
        excludedEmbedMetadataKeys: ["url"],
      })
  );

  return documents;
}

async function getPageContents(sitemapUrls: string[]) {
  const [page, destroyPage] = await getPuppeteerPage();

  const pageContents = [];
  for (const url of sitemapUrls) {
    let markup = null;
    try {
      markup = await getMarkupPuppeteer(url, page);
    } catch {
      console.error(`Couldn't crawl url: ${url}`);
      continue;
    }
    const article = await getCleanedUpContent(markup, url);
    if (!article) {
      console.error(`Couldn't parse article of url: ${url}`);
      continue;
    }

    const textContent = article.textContent
      .trim()
      .replace(/(\s|\\n|\\t)+/gm, " "); // replace excessive whitespaces with single white space

    pageContents.push({
      url,
      textContent,
      title: article.title,
    });
  }

  await destroyPage();

  return pageContents;
}
