import {Page} from 'puppeteer';
import type {IngredientGroup, InstructionGroup, Recipe} from '../../../interfaces';
import {tryCleanupImageUrl, parseIngredient} from '../helpers';

export async function scrape(page: Page, url: string): Promise<Recipe> {
  if (!url.includes('www.taste.com.au')) {
    throw Error('Not www.taste.com.au');
  }

  await page.goto(url, {waitUntil: 'domcontentloaded'});

  const ingredientNodes = await page.$x('//div[@id="tabIngredients"]//div[@class="ingredient-description"]');
  const ingredients: IngredientGroup['ingredients'] = await Promise.all(ingredientNodes.map(async (node) => {
    const nodeText = await node.evaluate((e) => (e as HTMLElement).dataset?.['rawIngredient']);
    if (!nodeText) {
      throw Error('Unable to parse ingredient.');
    }
    const [ingredient, notes] = nodeText.split(', ');
    const parsedValue = parseIngredient(ingredient);
    if (!parsedValue) {
      throw Error('Unable to parse ingredient.');
    }
    return {...parsedValue, notes};
  }));


  const stepTooltips = await page.$$('.annotated-ingredient .tooltip');
  await Promise.all(stepTooltips.map((node) => node.evaluate((e) => (e as HTMLElement).remove())));

  const stepNodes = await page.$x('//div[@id="tabMethodSteps"]//div[contains(@class,"recipe-method-step-content")]');
  const steps: InstructionGroup['steps'] = (await Promise.all(stepNodes.map(async (node) => {
    return (await node.evaluate((e) => e.textContent))?.trim();
  }))).filter((v): v is string => typeof v === 'string');


  const noteNodes = await page.$x('//section[contains(@class,"recipe-notes")]//p');
  const notes = (await Promise.all(noteNodes.map(async (noteNode) => {
    return (await noteNode.evaluate((e) => e.textContent)) ?? undefined;
  }))).filter((v): v is string => v !== undefined);


  const nameNode = await page.$x('//div[contains(@class, "recipe-title-container")]/h1');

  const imageMetaNode = await page.$x('//meta[@itemprop="image"]');
  const imageSrc = await imageMetaNode?.[0]?.evaluate((e) => (e as HTMLMetaElement).content);
  const cleanedImageSrc = imageSrc ? tryCleanupImageUrl(imageSrc) : undefined;

  return {
    url,
    name: await nameNode?.[0]?.evaluate((e) => e.textContent) ?? 'Unknown Name',
    image: cleanedImageSrc ?? '',
    ingredients: [{ingredients}],
    instructions: [{steps}],
    notes,
  };
}
