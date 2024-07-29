import { createClient } from "microcms-js-sdk";

export async function onRequest({ request, env }) {
    const client = createClient({
      serviceDomain: env.MICROCMS_SERVICE_DOMAIN,
      apiKey: env.MICROCMS_API_KEY,
    });
  
    const getBlogDetail = async (contentId,queries) => {
        return await client.getListDetail({
            endpoint: "blogs",
            contentId,
            queries,
        });
    };
  
    const url = request.url;
    const params = new URL(url).searchParams;
    const contentId = params.get("contentId");
    const draftKey = params.get("draftKey");

    return await getBlogDetail(contentId, { draftKey })
      .then((data) => {
        return new Response(JSON.stringify(data), { status: 200 });
      })
      .catch(
        (error) =>
          new Response(String(error), { status: 400 })
      );
  }