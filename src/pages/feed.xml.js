import rss from "@astrojs/rss";
import { SITE_TITLE, SITE_DESCRIPTION } from "../config";
import { getBlogs } from "../library/microcms";
const { contents: posts } = await getBlogs({
  fields: ["id", "title", "publishedAt", "content", "eyecatch", "category"],
  orders: "-publishedAt",
});

export const get = () =>
  rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: import.meta.env.SITE,
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
        customData: [`<enclosure url="${post.eyecatch ? post.eyecatch.url + "?fm=webp&fit=crop&crop=top&w=720&h=360" : ""}"></enclosure>`].join(''),
      };
    }),
  });
