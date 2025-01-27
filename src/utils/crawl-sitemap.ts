// originally package "crawl-sitemap", which couldn't ignore certificate errors
import { Readable } from "stream";
// @ts-ignore
import saxophonist from "saxophonist";

async function getResponse(url: string) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  const response = await fetch(url, {
    redirect: "follow",
  });
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";

  if (!response.status.toString().startsWith("2")) {
    throw new Error(`Not found: ${url}`);
  }
  return response;
}

async function* crawl(url: string): AsyncGenerator<string> {
  const response = await getResponse(url);
  if (!response.body) throw new Error(`Body missing for: ${url}`);

  const readable = Readable.fromWeb(response.body as any);
  const locs = readable.pipe(saxophonist("loc"));

  for await (const loc of locs) {
    const { text, path } = loc as { path: string[]; text: string };
    const pathParent = path[path.length - 2];
    if (pathParent === "sitemap") {
      yield* crawl(text);
    } else {
      yield text;
    }
  }
}

export default crawl;
