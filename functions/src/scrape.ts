import {EXTRA_PAGE_HEADERS} from './helpers';
import puppeteer from 'puppeteer';
import {scrape as wrpmScrape} from './scrapers/wprm';
import {scrape as tasteScrape} from './scrapers/taste';
import {scrape as ldschemaScrape} from './scrapers/ldschema';
import {Recipe} from '../../interfaces';

let browser: puppeteer.Browser;

const scrapers = {
  tasteScrape,
  wrpmScrape,
  ldschemaScrape,
} as const;


async function tryScape(page: puppeteer.Page, url: string): Promise<Recipe | null> {
  for (const [scrapeFnName, scrapeFn] of Object.entries(scrapers)) {
    try {
      return await scrapeFn(page, url);
    } catch (e) {
      console.log(`Failed scraper ${scrapeFnName}: ${e}`);
    }
  }
  console.error('Failed all scrapes.');
  return null;
}


export async function scrapeUrl(url: string): Promise<Recipe> {
  if (!browser) {
    browser = await puppeteer.launch();
  }
  let page: puppeteer.Page | undefined = undefined;
  try {
    page = await browser.newPage();
    await page.setExtraHTTPHeaders(EXTRA_PAGE_HEADERS);

    const recipe = await tryScape(page, url);
    if (recipe === null) {
      throw Error('Failed all scrapers.');
    }
    return recipe;
  } finally {
    page?.close();
  }
}
