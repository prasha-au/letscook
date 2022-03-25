import * as functions from "firebase-functions";


export const processWebsite = functions.https
.onRequest(async (request, response) => {
  const url = request.query.url as string;
  if (!url) {
    response.status(400).send('No URL provided.');
    return;
  }





  const accountId = request.query.accountId as string;
  if (!accountId) {
    response.status(400).send('Invalid account ID');
    return;
  }
  functions.logger.info(`Starting force sync on account ${accountId}`);
  const result = await syncAccount(accountId);
  response.send(JSON.stringify(result));
});




