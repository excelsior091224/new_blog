import rss from "@astrojs/rss";
import { SITE_TITLE, SITE_DESCRIPTION } from "../config";
import { cmsBlog } from "../library/microcms";
const { contents: posts } = await cmsBlog.getBlogs({
  fields: ["id", "title", "publishedAt", "content", "eyecatch", "category"],
  orders: "-publishedAt",
});

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
        enclosure: {
         url: post.eyecatch ? post.eyecatch.url : "",
         length: 124568,
         type: "/"
        }
        // customData: [`<enclosure url="${post.eyecatch ? post.eyecatch.url : ""}">eyecatch</enclosure>`].join(''),
      };
    }),
  });
