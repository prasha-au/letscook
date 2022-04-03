import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {resolveUrl} from './helpers';
import {scrapeUrl} from './scrape';
import {ParseRequest, TableName} from '../../interfaces';
import {setRecipe, syncMetadataForRecipe, updateParseRequest} from './database';

admin.initializeApp();


export const testParse = functions.runWith({memory: '512MB'})
    .https.onRequest(async (request, response) => {
      const rawUrl = request.query.url as string;
      const resolvedUrl = resolveUrl(rawUrl);
      if (!resolvedUrl) {
        response.status(400).send('Invalid URL given.');
        return;
      }
      const result = await scrapeUrl(resolvedUrl.url);
      response.send(JSON.stringify(result));
    });

// http://localhost:5001/letscook-423ea/us-central1/testParse?url=https%3A%2F%2Fwww.recipetineats.com%2Fasian-beef-bowls%2F
// http://localhost:5001/letscook-423ea/us-central1/testParse?url=https%3A%2F%2Fwww.taste.com.au%2Frecipes%2Fnew-york-baked-cheesecake%2F9c2546a2-576c-4879-9036-d99e159bf8a9
// https://us-central1-letscook-423ea.cloudfunctions.net/testParse?url=https%3A%2F%2Fwww.taste.com.au%2Frecipes%2Fnew-york-baked-cheesecake%2F9c2546a2-576c-4879-9036-d99e159bf8a9
// https://www.taste.com.au/recipes/new-york-baked-cheesecake/9c2546a2-576c-4879-9036-d99e159bf8a9

export const updateMetadata = functions.runWith({memory: '128MB'})
    .https.onRequest(async (request, response) => {
      const id = request.query.id as string;
      if (!id) {
        response.status(400).send('Invalid ID given.');
        return;
      }
      await syncMetadataForRecipe(id);
      response.send(JSON.stringify({success: true}));
    });


export const handleParseRequest = functions.runWith({memory: '512MB'})
    .database.ref(`/${TableName.PARSE_REQUEST}/{id}`)
    .onCreate(async (snapshot, context) => {
      const id = context.params.id as string;
      const request = snapshot.val() as ParseRequest;

      if (request.status != 'pending') {
        await updateParseRequest(id, {status: 'pending'});
      }

      const resolvedUrl = resolveUrl(request.url);
      if (resolvedUrl === null) {
        functions.logger.error(`Invalid URL: ${request.url}`);
        await updateParseRequest(id, {status: 'done', success: false, error: 'Failed to parse link.'});
        return;
      }
      if (resolvedUrl.id != id) {
        functions.logger.error(`URL mismatched ID: ${resolvedUrl.id} vs ${id}`);
        await updateParseRequest(id, {status: 'done', success: false, error: 'Invalid request.'});
        return;
      }

      await updateParseRequest(id, {status: 'active'});

      try {
        const recipe = await scrapeUrl(resolvedUrl.url);
        await setRecipe(id, recipe);
        await syncMetadataForRecipe(id);
        await updateParseRequest(id, {status: 'done', success: true});
      } catch (e) {
        functions.logger.error(`Failed to parse "${resolvedUrl.id}": ${e}`);
        await updateParseRequest(id, {status: 'done', success: false, error: 'Failed to parse website.'});
      }
    });


