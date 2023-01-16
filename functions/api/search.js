// functions/search.js
import { createClient } from "microcms-js-sdk";
// import { client } from "../src/library/microcms";

export async function onRequest({ request, env }) {
  const client = createClient({
    serviceDomain: env.MICROCMS_SERVICE_DOMAIN,
    apiKey: env.MICROCMS_API_KEY,
  });

  const getBlogs = async (queries) => {
    const data = await client.get({ endpoint: "blogs", queries});
    data.q = queries.q;

    if (data.offset + data.limit < data.totalCount) {
      const result = await getBlogs({q:q,limit:data.limit, offset:data.offset + data.limit})
      return {
          q:q,
          offset:result.offset,
          limit:result.limit,
          contents: [...data.contents, ...result.contents],
          totalCount: result.totalCount,
        };
    }
    return data
  };

  const url = request.url;
  const q  = new URL(url).searchParams.get('q');
  if (!q) {
    return new Response(JSON.stringify({
        error: 'Missing "q" query parameter',
      }), {status:400});
  }
  return await getBlogs({ q: q, orders: '-publishedAt' })
  // client
  //   .get({
  //     endpoint: 'blogs',
  //     queries: { q: q, orders: '-createdAt' },
  //   })
    .then((data) => {
      return new Response(JSON.stringify(data), {status:200})
    })
    .catch((error) => (
      new Response(String(error), {status:400})
      // new Response(JSON.stringify({error:String(error),query:q,client:client}), {status:400})
    ));
};