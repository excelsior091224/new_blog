// functions/search.js
import { createClient, MicroCMSQueries } from "microcms-js-sdk";

export function onRequest(context) {
  //const { client } = require('../src/library/microcms');
  
  const client = createClient({
    serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: import.meta.env.MICROCMS_API_KEY,
  });

  const { q } = context.queryStringParameters;
  if (!q) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Missing "q" query parameter',
      }),
    };
  }
  return client
    .get({
      endpoint: 'blogs',
      queries: { q },
    })
    .then((data) => {
      return {
        statusCode: 200,
        body: JSON.stringify(data),
      };
    })
    .catch((error) => ({
      statusCode: 400,
      body: String(error),
    }));
};