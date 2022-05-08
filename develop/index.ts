import puppeteer from 'puppeteer';
import parseIngredient from 'parse-ingredient';
import { IngredientGroup, InstructionGroup, Recipe } from '../interfaces';


type SchemaObject<Type, Properties> = {
  '@context': 'http://schema.org',
  '@type': Type,
} & Properties;



function getSchemaItemProperties<P extends Record<string, string>>(value: string | P | string[] | P[], property: keyof P): string[] {
  const arrayValue = Array.isArray(value) ? value : [value];
  return arrayValue.map(v => {
    return typeof v === 'string' ? v : v?.[property];
  }).filter((v: unknown): v is string => typeof v === 'string' && v.length > 0);
}


async function bootstrap() {

  const url = 'https://snacksandsips.com/homemade-air-fryer-doughnut-holes/';
  // const url = 'https://www.recipetineats.com/butter-chicken/';

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

  const ldScripts = await page.$x('//script[@type="application/ld+json"]');
  const ldScriptContent = await ldScripts[0].evaluate((e) => e.textContent);

  const ldContent = JSON.parse(ldScriptContent ?? '');


  const recipeContent = Array.isArray(ldContent['@graph']) ? ldContent['@graph'].find(v => v['@type'] === 'Recipe') : ldContent;


  if (recipeContent['@type'] !== 'Recipe') {
    throw Error('Unable to find recipe schema');

  }


  console.log('found schema', recipeContent);

  const ingredients: IngredientGroup['ingredients'] = recipeContent.recipeIngredient.map((v: string) => {
    const [ingredient, notes] = v.split(', ');
    const parsedValue = parseIngredient(ingredient)[0];
    if (!parsedValue) {
      throw Error('Unable to parse ingredient.');
    }
    return {
      name: parsedValue.description.replace(/^x /g, ''),
      amount: parsedValue.quantity?.toString() ?? '1',
      unit: parsedValue.unitOfMeasure ?? 'each',
      notes,
    };
  });


  let steps: string[] = [];

  if (typeof recipeContent.recipeInstructions === 'string') {
    steps = recipeContent.recipeInstructions.split('\n').filter((v: string) => v.length);
  } else if (Array.isArray(recipeContent.recipeInstructions)) {

    interface HowToStep {
      text: string;
      '@type': 'HowToStep';
    }

    steps = recipeContent.recipeInstructions.filter((v: { '@type': string }): v is HowToStep => v['@type'] === 'HowToStep').map((v: HowToStep) => v.text)
  }



  // const noteNodes = await page.$x('//div[contains(@class,"recipe-notes")]//p');
  // const notes = (await Promise.all(noteNodes.map(async (noteNode) => {
  //   return (await noteNode.evaluate((e) => e.textContent)) ?? undefined;
  // }))).filter((v): v is string => v !== undefined);


  // const nameNode = await page.$x('//div[contains(@class, "recipe-title-container")]/h1');

  // const imageNode = await page.$x('//*[contains(@class, "lead-image-block")]//img');
  // const imageSrc = await imageNode?.[0]?.evaluate((e) => e.getAttribute('src'));
  // // const cleanedImageSrc = imageSrc ? tryCleanupImageUrl(imageSrc) : undefined;


  console.log(JSON.stringify({
    url,
    name: recipeContent.name,
    //image: recipeContent.images[0] ? tryCleanupImageUrl(recipeContent.images[0]) : undefined,
    ingredients: [{ ingredients }],
    instructions: [{ steps }],
  }, null, 2));


}



bootstrap();
