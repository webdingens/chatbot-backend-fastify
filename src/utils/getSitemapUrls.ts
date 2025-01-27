import crawl from "./crawl-sitemap.js";

export async function getSitemapUrls(sitemapUrl: string) {
  const result = [];
  for await (const url of crawl(sitemapUrl)) result.push(url);
  return result;
}
