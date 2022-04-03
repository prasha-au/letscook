import * as puppeteer from 'puppeteer';

import { IngredientGroup, InstructionGroup, Recipe } from '../interfaces';


async function bootstrap() {

  const url = 'https://www.taste.com.au/recipes/classic-baked-vanilla-cheesecake/2c52456a-9a15-4a56-a285-b6e3ef2c6e4d';

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36',
    'upgrade-insecure-requests': '1',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9,en;q=0.8'
})

  await page.goto(url, {waitUntil: 'domcontentloaded'});

  const ingredientNodes = await page.$x('//div[@id="tabIngredients"]//div[@class="ingredient-description"]');
  const ingredients: IngredientGroup['ingredients'] = await Promise.all(ingredientNodes.map(async node => {
    const nodeText = await node.evaluate((e) => (e as HTMLElement).dataset?.['rawIngredient']);
    if (!nodeText) {
      throw Error(`Unable to parse ingredient.`);
    }
    const [ingredient, notes] = nodeText.split(', ');
    const [amount, ...nameParts] = ingredient.split(' ');
    return {
      name: nameParts.join(' ').replace(/^x\s/g, ''),
      amount,
      unit: 'each',
      notes,
    };
  }));

  const stepNodes = await page.$x('//div[@id="tabMethodSteps"]//div[contains(@class,"recipe-method-step-content")]')
  const steps: InstructionGroup['steps'] = (await Promise.all(stepNodes.map(async node => {
    return (await node.evaluate((e) => e.textContent))?.trim();
  }))).filter((v): v is string => typeof v === 'string');


  const noteNodes = await page.$x('//div[contains(@class,"recipe-notes")]//p');
  const notes = (await Promise.all(noteNodes.map(async (noteNode) => {
    return (await noteNode.evaluate((e) => e.textContent)) ?? undefined;
  }))).filter((v): v is string => v !== undefined);


  const nameNode = await page.$x('//div[contains(@class, "recipe-title-container")]/h1');

  const imageNode = await page.$x('//*[contains(@class, "lead-image-block")]//img');
  const imageSrc = await imageNode?.[0]?.evaluate((e) => e.getAttribute('src'));
  // const cleanedImageSrc = imageSrc ? tryCleanupImageUrl(imageSrc) : undefined;


  console.log(JSON.stringify({
    url,
    name: await nameNode?.[0]?.evaluate((e) => e.textContent) ?? 'Unknown Name',
    image: imageSrc,
    ingredients: [{ ingredients }],
    instructions: [{ steps }],
    notes,
  }, null, 2));


}



bootstrap();
