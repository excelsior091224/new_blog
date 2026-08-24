// 記事一覧から画像エンクロージャー付きのRSSフィードを生成するエンドポイント。
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION } from "../config";
import http from "http";
import https from "https";

async function getImageFileSize(imageUrl) {
  // RSSのenclosureに必要な画像サイズをHEADリクエストで取得する。
  return new Promise((resolve) => {
    const parsedUrl = new URL(imageUrl);
    const isHttps = parsedUrl.protocol === "https:";
    const client = isHttps ? https : http;

    const options = {
      method: "HEAD",
      hostname: parsedUrl.hostname,
      path: `${parsedUrl.pathname}${parsedUrl.search}`,
    };

    const req = client.request(options, (res) => {
      const fileSize = res.headers["content-length"];
      resolve(fileSize ? parseInt(fileSize, 10) : 0);
    });

    req.on("error", (error) => {
      console.error(`エラーが発生しました: ${error}`);
    });

    req.end();
  });
}

export const GET = async () => {
  // RSSと一覧の並び順を揃えるため、記事を公開日の降順にする。
  const posts = (await getCollection("blogs"))
    .map((entry) => ({
      ...entry.data,
      id: entry.id,
    }))
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

  const items = [];

  for (const post of posts) {
    const enclosureUrl = post.eyecatch ? post.eyecatch.url : "";
    const enclosureLength = enclosureUrl
      ? await getImageFileSize(
          `${enclosureUrl}?fm=webp&fit=crop&crop=top&w=720&h=360`,
        )
      : 0;

    const item = {
      link: `/posts/${post.id}`,
      pubDate: post.publishedAt,
      title: post.title,
      description:
        post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "").length > 100
          ? post.content
              .replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "")
              .slice(0, 101) + "..."
          : post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, ""),
    };

    if (enclosureUrl) {
      item.enclosure = {
        url: `${enclosureUrl}?fm=webp&fit=crop&crop=top&w=720&h=360`,
        length: enclosureLength,
        type: "image/webp",
      };
    }

    items.push(item);
  }

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: import.meta.env.SITE,
    customData: `<language>ja</language>`,
    items,
  });
};
