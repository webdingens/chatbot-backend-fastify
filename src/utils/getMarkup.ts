import puppeteer, { Page } from "puppeteer";

export async function getMarkup(url: string) {
  const response = await fetch(url);
  const content = await response.text();

  return content;
}

export async function getMarkupPuppeteer(url: string, page: Page) {
  await page.goto(url, {
    waitUntil: "networkidle2",
  });
  const markup = await page.$eval("html", (element) => element.outerHTML);

  return `<!DOCTYPE html>${markup}`;
}

export async function getPuppeteerPage() {
  const browser = await puppeteer.launch({
    args: ["--ignore-certificate-errors"],
  });
  const page = await browser.newPage();

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });
  await page.setRequestInterception(true);

  // abort image requests
  page.on("request", (request) => {
    if (request.resourceType() === "image") {
      request.abort();
    } else {
      request.continue();
    }
  });

  return [page, async () => await page.browser().close()] as const;
}
