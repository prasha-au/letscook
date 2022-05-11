import parseIngredient from 'parse-ingredient';
import {Page} from 'puppeteer';
import {IngredientGroup, Recipe} from '../../../interfaces';
import {tryCleanupImageUrl} from '../helpers';


type SchemaObject<Type, Properties> = {
  '@context': 'http://schema.org',
  '@type': Type,
} & Properties;


type RecipeSchema = SchemaObject<'Recipe', {
  name: string;
  image: string[];
  recipeIngredient: string[];
  recipeInstructions: string | SchemaObject<'HowToStep', { text: string }>;
}>


export async function scrape(page: Page, url: string): Promise<Recipe> {
  await page.goto(url, {waitUntil: 'domcontentloaded'});

  const ldScripts = await page.$x('//script[@type="application/ld+json"]');
  const ldScriptContent = await ldScripts[0]?.evaluate((e) => e.textContent);
  if (!ldScriptContent) {
    throw Error('Could not find ld script content.');
  }

  const ldContent = JSON.parse(ldScriptContent ?? '');
  const recipeContent: RecipeSchema = Array.isArray(ldContent['@graph']) ? ldContent['@graph'].find((v) => v['@type'] === 'Recipe') : ldContent;
  if (recipeContent['@type'] !== 'Recipe') {
    throw Error('Unable to find recipe schema');
  }


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
    steps = recipeContent.recipeInstructions.map((v) => {
      if (typeof v === 'string') {
        return v;
      } else if (v?.['@type'] === 'HowToStep') {
        return v.text;
      }
    }).filter((v) => v?.length);
  }

  return {
    url,
    name: recipeContent.name,
    image: typeof recipeContent.image[0] === 'string' ? tryCleanupImageUrl(recipeContent.image[0]) : undefined,
    ingredients: [{ingredients}],
    instructions: [{steps}],
    notes: [],
  };
}
