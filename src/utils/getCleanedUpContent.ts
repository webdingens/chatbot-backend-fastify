import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export async function getCleanedUpContent(markup: string, url: string) {
  const doc = new JSDOM(markup, {
    url,
  });
  let reader = new Readability(doc.window.document);
  let article = reader.parse();

  return article;
}
