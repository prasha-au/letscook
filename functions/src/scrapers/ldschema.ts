import {Page} from 'puppeteer';
import type {IngredientGroup, Recipe} from '../../../interfaces';
import {tryCleanupImageUrl, parseIngredient, parseInstructionStep} from '../helpers';


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

  const ldContents = await Promise.all(ldScripts.map((script) => script.evaluate((e) => e.textContent)));
  const recipeContent = ldContents
    .map((scriptContent) => {
      try {
        const ldContent = JSON.parse(scriptContent ?? '');
        if (Array.isArray(ldContent)) {
          return ldContent;
        } else if (Array.isArray(ldContent['@graph'])) {
          return ldContent['@graph'];
        } else {
          return ldContent;
        }
      } catch (e) {
        return undefined;
      }
    })
    .flat()
    .find((v): v is RecipeSchema => v?.['@type'] === 'Recipe');

  if (!recipeContent) {
    throw Error('Unable to find a recipe');
  }

  const ingredients: IngredientGroup['ingredients'] = recipeContent.recipeIngredient.map((v: string) => {
    const [ingredient, notes] = v.split(', ');
    const parsedValue = parseIngredient(ingredient);
    if (!parsedValue) {
      throw Error('Unable to parse ingredient.');
    }
    return {...parsedValue, notes};
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
    instructions: [{
      steps: steps.map((stepText) => parseInstructionStep(stepText)),
    }],
    notes: [],
  };
}
