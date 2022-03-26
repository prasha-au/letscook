import puppeteer from 'puppeteer';

import { IngredientGroup, InstructionGroup, Recipe } from '../interfaces';


async function bootstrap() {

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Safari/537.36',
    'upgrade-insecure-requests': '1',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9,en;q=0.8'
})

  await page.goto('https://dinnerthendessert.com/mongolian-beef/#wprm-recipe-container-8751', { waitUntil: 'domcontentloaded' });

  const ingredientGroupNodes = await page.$x('//div[contains(@class, "wprm-recipe-ingredient-group")]');

  const ingredients: IngredientGroup[] = await Promise.all(ingredientGroupNodes.map(async ingredientGroupNode => {
    const ingredientNameNode = await ingredientGroupNode.$('.wprm-recipe-group-name');
    const ingredientNodes = await ingredientGroupNode.$$('.wprm-recipe-ingredient');

    return {
      name: ingredientNameNode ? await ingredientNameNode.evaluate(e => e.textContent) : undefined,
      ingredients: await Promise.all(ingredientNodes.map(async v => {
        const nameNode = await v.$('.wprm-recipe-ingredient-name');
        const amountNode = await v.$('.wprm-recipe-ingredient-amount');
        const unitNode = await v.$('.wprm-recipe-ingredient-unit');
        const noteNode = await v.$('.wprm-recipe-ingredient-notes');
        return {
          name: nameNode ? await nameNode.evaluate(e => e.textContent) : undefined,
          amount: amountNode ? await amountNode.evaluate(e => e.textContent) : undefined,
          unit: unitNode ? await unitNode.evaluate(e => e.textContent) : undefined,
          notes: noteNode ? await noteNode.evaluate(e => e.textContent) : undefined,
        };
      }))
    };
  }));

  const instructionGroupNodes = await page.$x('//div[contains(@class, "wprm-recipe-instruction-group")]');

  const instructions: InstructionGroup[] = (await Promise.all(instructionGroupNodes.map(async instructionGroupNode => {
    const instructionNameNode = await instructionGroupNode.$('.wprm-recipe-group-name');
    const stepNodes = await instructionGroupNode.$$('.wprm-recipe-instruction-text');
    return {
      name: instructionNameNode ? await instructionNameNode.evaluate(e => e.textContent) : undefined,
      steps: await Promise.all(stepNodes.map(async v => {
        return  await v.evaluate(e => e.textContent);
      }))
    };
  }))).filter(v => {
    return v.name || v.steps.length > 0;
  });




  const noteNodes = await page.$x('//div[contains(@class,"wprm-recipe-notes")]/span');
  const notes = await Promise.all(noteNodes.map(async noteNode => {
    return noteNode.evaluate(e => e.textContent);
  }));



  const nameNode = await page.$('h2.wprm-recipe-name');

  const reciepe: Recipe = {
    url: 'test',
    name: await nameNode?.evaluate(e => e.textContent),
    ingredients,
    instructions,
    notes,
  };
  console.log(JSON.stringify(reciepe, null, 2));



}



bootstrap();
