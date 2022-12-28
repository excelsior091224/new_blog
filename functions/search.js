// functions/search.js
import { createClient } from "microcms-js-sdk";

export async function onRequest({ request }) {
  const client = createClient({
    serviceDomain: "import.meta.env.MICROCMS_SERVICE_DOMAIN",
    apiKey: "import.meta.env.MICROCMS_API_KEY",
  });

  const url = request.url;
  // const { q } = request.query;
  const q  = new URL(url).searchParams.get('q');
  if (!q) {
    return new Response(JSON.stringify({
        error: 'Missing "q" query parameter',
        request:request
      }), {status:400});
  }
  return await client
    .get({
      endpoint: 'blogs',
      queries: { q: q },
    })
    .then((data) => {
      return new Response(JSON.stringify(data), {status:200})
    })
    .catch((error) => (
      // new Response(String(error), {status:400})
      new Response(JSON.stringify({error:String(error),query:q}), {status:400})
    ));
};