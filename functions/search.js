// functions/search.js
import { createClient } from "microcms-js-sdk";

export function onRequest(context) {
  //const { client } = require('../src/library/microcms');
  
  const client = createClient({
    serviceDomain: "process.env.MICROCMS_SERVICE_DOMAIN",
    apiKey: "process.env.MICROCMS_API_KEY",
  });

  const url = context.request.url;
  const q = new URL(url).searchParams.get('q');
  if (!q) {
    return new Response(JSON.stringify({
        error: 'Missing "q" query parameter',
      }), {status:400});
  }
  return client
    .get({
      endpoint: 'blogs',
      queries: { q: 'test' }
    })
    .then((res) => console.log(res))
    // .get({
    //   endpoint: 'blogs',
    //   queries: { q: q },
    // })
    // .then((data) => {
    //   return new Response(JSON.stringify(data), {status:200})
    // })
    .catch((error) => (
      // new Response(String(error), {status:400})
      new Response(JSON.stringify({error:String(error),query:q}), {status:400})
    ));
};