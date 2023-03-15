import {ElementHandle, Page} from 'puppeteer';
import type {IngredientGroup, InstructionGroup, Recipe} from '../../../interfaces';
import {parseIngredient, tryCleanupImageUrl} from '../helpers';

async function getTextFromNodeSelector(element: ElementHandle<Element> | Page, selector: string): Promise<string | undefined> {
  const node = await element.$(selector);
  return await node?.evaluate((e) => e.textContent) ?? undefined;
}

export async function scrape(page: Page, url: string): Promise<Recipe> {
  await page.goto(url, {waitUntil: 'domcontentloaded'});

  const wprmNode = await page.$('.wprm-recipe');
  if (!wprmNode) {
    throw new Error('Not a Wordpress Recipe Maker website.');
  }

  const recipeName = await getTextFromNodeSelector(page, '.wprm-recipe-name');
  if (!recipeName) {
    throw new Error('Cannot find recipe name.');
  }

  const ingredientGroupNodes = await page.$x('//div[contains(@class, "wprm-recipe-ingredient-group")]');
  const ingredients = await Promise.all(ingredientGroupNodes.map(async (ingredientGroupNode) => {
    const ingredientNodes = await ingredientGroupNode.$$('.wprm-recipe-ingredient');
    return {
      name: await getTextFromNodeSelector(ingredientGroupNode, '.wprm-recipe-group-name'),
      ingredients: await Promise.all(ingredientNodes.map(async (v) => {
        const name = await getTextFromNodeSelector(v, '.wprm-recipe-ingredient-name');
        const amount = await getTextFromNodeSelector(v, '.wprm-recipe-ingredient-amount');
        const unit = await getTextFromNodeSelector(v, '.wprm-recipe-ingredient-unit');
        const notes = await getTextFromNodeSelector(v, '.wprm-recipe-ingredient-notes');
        const ingredientText = `${amount?.split('/').shift() ?? 1} ${unit ?? 'each'} ${name}`;
        const parsedValue = parseIngredient(ingredientText);
        if (!parsedValue) {
          throw Error('Unable to parse ingredient.');
        }
        return {
          name,
          amount: parsedValue.amount,
          unit: parsedValue.unit,
          notes,
        };
      })),
    };
  })) as IngredientGroup[];

  const instructionGroupNodes = await page.$x('//div[contains(@class, "wprm-recipe-instruction-group")]');

  const instructions = (await Promise.all(instructionGroupNodes.map(async (instructionGroupNode) => {
    const instructionName = await getTextFromNodeSelector(instructionGroupNode, '.wprm-recipe-group-name');
    const stepNodes = await instructionGroupNode.$$('.wprm-recipe-instruction-text');
    return {
      name: instructionName,
      steps: (await Promise.all(stepNodes.map(async (v) => {
        return await v.evaluate((e) => e.textContent);
      }))).filter((v) => v !== undefined),
    };
  }))).filter((v) => {
    return !!v.name || v.steps.length > 0;
  }) as InstructionGroup[];

  const noteNodes = await page.$x('//div[contains(@class,"wprm-recipe-notes")]/span');
  const notes = (await Promise.all(noteNodes.map(async (noteNode) => {
    return (await noteNode.evaluate((e) => e.textContent)) ?? undefined;
  }))).filter((v) => v !== undefined);


  const imageNode = await page.$x('//div[contains(@class, "wprm-recipe-image")]//img');
  const imageSrc = await imageNode?.[0]?.evaluate((e) => e.getAttribute('data-lazy-src') ?? e.getAttribute('src'));
  const cleanedImageSrc = imageSrc ? tryCleanupImageUrl(imageSrc) : undefined;

  return {
    url,
    name: recipeName,
    image: cleanedImageSrc,
    ingredients,
    instructions,
    notes: notes.filter((v): v is string => v !== undefined),
  };
}
