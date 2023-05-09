import rss from "@astrojs/rss";
import { SITE_TITLE, SITE_DESCRIPTION } from "../config";
import { cmsBlog } from "../library/microcms";
const { contents: posts } = await cmsBlog.getBlogs({
  fields: ["id", "title", "publishedAt", "content", "eyecatch", "category"],
  orders: "-publishedAt",
});

import http from 'http';
import { parse } from 'url';

async function getImageFileSize(imageUrl) {
  return new Promise((resolve) => {
    const { hostname, path } = parse(imageUrl);

    const options = {
      method: 'HEAD',
      hostname,
      path,
    };

    const req = http.request(options, (res) => {
      const fileSize = res.headers['content-length'];
      resolve(parseInt(fileSize));
    });

    req.on('error', (error) => {
      console.error(`エラーが発生しました: ${error}`);
      resolve(1);
    });

    req.end();
  });
}

export const get = () =>
  rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: import.meta.env.SITE,
    customData: `<language>ja</language>`,
    items: posts.map((post) => {
      return {
        link: `/posts/${post.id}`,
        pubDate: post.publishedAt,
        title: post.title,
        description:
          post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "").length > 100
            ? post.content
                .replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "")
                .slice(0, 101) + "..."
            : post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, ""),
        enclosure: {url: post.eyecatch ?await getImageFileSize(post.eyecatch.url)+ '?fit=crop&crop=top&w=720&h=360' : "",length:0,type: "image/png"}
        // customData: [`<enclosure url="${post.eyecatch ? post.eyecatch.url : ""}">eyecatch</enclosure>`].join(''),
      };
    }),
  });
