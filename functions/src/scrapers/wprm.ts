import {Page} from "puppeteer";
import {IngredientGroup, InstructionGroup, Recipe} from "../../../interfaces";

export async function scrape(page: Page, url: string): Promise<Recipe> {
  await page.goto(url, {waitUntil: "domcontentloaded"});

  const ingredientGroupNodes = await page.$x("//div[contains(@class, \"wprm-recipe-ingredient-group\")]");

  const ingredients = await Promise.all(ingredientGroupNodes.map(async (ingredientGroupNode) => {
    const ingredientNameNode = await ingredientGroupNode.$(".wprm-recipe-group-name");
    const ingredientNodes = await ingredientGroupNode.$$(".wprm-recipe-ingredient");

    return {
      name: ingredientNameNode ? await ingredientNameNode.evaluate((e) => e.textContent) : undefined,
      ingredients: await Promise.all(ingredientNodes.map(async (v) => {
        const nameNode = await v.$(".wprm-recipe-ingredient-name");
        const amountNode = await v.$(".wprm-recipe-ingredient-amount");
        const unitNode = await v.$(".wprm-recipe-ingredient-unit");
        const noteNode = await v.$(".wprm-recipe-ingredient-notes");
        return {
          name: nameNode ? await nameNode.evaluate((e) => e.textContent) : undefined,
          amount: amountNode ? await amountNode.evaluate((e) => e.textContent) : undefined,
          unit: unitNode ? await unitNode.evaluate((e) => e.textContent) : undefined,
          notes: noteNode ? await noteNode.evaluate((e) => e.textContent) : undefined,
        };
      })),
    };
  })) as IngredientGroup[];

  const instructionGroupNodes = await page.$x("//div[contains(@class, \"wprm-recipe-instruction-group\")]");

  const instructions = (await Promise.all(instructionGroupNodes.map(async (instructionGroupNode) => {
    const instructionNameNode = await instructionGroupNode.$(".wprm-recipe-group-name");
    const stepNodes = await instructionGroupNode.$$(".wprm-recipe-instruction-text");
    return {
      name: instructionNameNode ? await instructionNameNode.evaluate((e) => e.textContent) : undefined,
      steps: (await Promise.all(stepNodes.map(async (v) => {
        return await v.evaluate((e) => e.textContent);
      }))).filter((v) => v !== null),
    };
  }))).filter((v) => {
    return !!v.name || v.steps.length > 0;
  }) as InstructionGroup[];

  const noteNodes = await page.$x("//div[contains(@class,\"wprm-recipe-notes\")]/span");
  const notes = await Promise.all(noteNodes.map(async (noteNode) => {
    return noteNode.evaluate((e) => e.textContent);
  }));


  const nameNode = await page.$("h2.wprm-recipe-name");

  return {
    url,
    name: await nameNode?.evaluate((e) => e.textContent) ?? "Unknown Name",
    ingredients,
    instructions,
    notes: notes.filter((v): v is string => v !== null),
  };
}
