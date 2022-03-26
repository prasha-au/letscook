import * as admin from 'firebase-admin';
import {ParseRequest, RecipeMetadata, Recipe, ResolvedUrl, TableName} from '../../interfaces';
import {cleanUndefinedValues} from './helpers';

export async function createParseRequest(resolvedUrl: ResolvedUrl): Promise<void> {
  await admin.database().ref(`${TableName.PARSE_REQUEST}/${resolvedUrl.id}`).set({
    url: resolvedUrl.url,
    status: 'pending',
  } as ParseRequest);
}

export async function updateParseRequest(id: string, update: Partial<ParseRequest>): Promise<void> {
  await admin.database().ref(`${TableName.PARSE_REQUEST}/${id}`).update(update);
}

export async function setRecipe(id: string, recipe: Recipe): Promise<void> {
  await admin.database().ref(`${TableName.RECIPE}/${id}`).set(cleanUndefinedValues(recipe));
}

async function getRecipe(id: string): Promise<Recipe> {
  const snap = await admin.database().ref(`${TableName.RECIPE}/${id}`).get();
  return snap.val();
}

export async function syncMetadataForRecipe(id: string) {
  const recipe = await getRecipe(id);
  const url = new URL(recipe.url);
  await admin.database().ref(`${TableName.RECIPE_METADATA}/${id}`).set({
    url: recipe.url,
    image: recipe.image,
    name: recipe.name,
    site: url.host.replace(/^www\./, ''),
    timestamp: Date.now(),
  } as RecipeMetadata);
}
