import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {resolveUrl} from './helpers';
import {scrapeUrl} from './scrape';

admin.initializeApp();


export const requestParse = functions.runWith({memory: '512MB'}).https
    .onRequest(async (request, response) => {
      const rawUrl = request.query.url as string;
      const resolvedUrl = resolveUrl(rawUrl);
      if (!resolvedUrl) {
        response.status(400).send('Invalid URL given.');
        return;
      }
      const result = await scrapeUrl(resolvedUrl.url);
      response.send(JSON.stringify(result));
    });

// http://localhost:5001/letscook-423ea/us-central1/requestParse?url=https%3A%2F%2Fwww.recipetineats.com%2Fasian-beef-bowls%2F

