import useSWR from "swr";
import { createTableOfContents } from "microcms-richedit-processer";

import { load } from "cheerio";
import hljs, { HighlightResult } from "highlight.js";
import 'highlight.js/styles/hybrid.css';
import type { Category } from "../library/microcms";

const BlogPreview = () => {
  const params = new URLSearchParams(window.location.search);
  const contentId = params.get("contentId");
  const draftKey = params.get("draftKey");

  const fetcher = (url: URL | RequestInfo) => fetch(url).then((res) => res.json());
  const endpoint = contentId === null || draftKey === null ? null : `/api/preview?contentId=${contentId}&draftKey=${draftKey}`;

  const { data, error, isLoading, isValidating } = useSWR(
    endpoint, fetcher
  );

  if (error) return <div>エラーが発生しました</div>;

  if (isLoading) return <div>読み込み中...</div>;

  let modifiedContent = data?.content || "";

  if (data && data.content) {
    // APIから取得したリッチエディタのHTMLからcheerioオブジェクトを生成
    const $ = load(data.content);

    // コードブロックのファイル名が入力されている場合の処理
    $("div[data-filename]").each((_, elm) => {
      // data-filename属性の値を持つspanを
      // <div data-filename="{入力したファイル名}">の最初の子要素として追加
      $(elm).prepend(
        `<span class="filename">${$(elm).attr("data-filename")}</span>`
      );
    });

    // コードブロックのシンタックスハイライトを行う
    $("pre code").each((_, elm) => {
      const language = $(elm).attr("class") || "";
      let result: HighlightResult;

      if (language == "") {
        // 言語が入力なしの場合、自動判定
        result = hljs.highlightAuto($(elm).text());
      } else {
        // 言語が入力ありの場合、入力された言語で判定
        result = hljs.highlight($(elm).text(), {
          language: language.replace("language-", ""),
        });
      }
      $(elm).html(result.value);
      $(elm).addClass("hljs");
    });

    $("img").each((index, elm) => {
      const src = $(elm).attr("src");
      if (src && src.includes("https://images.microcms-assets.io/assets/")) {
        // クエリパラメータを削除
        const srcWithoutQuery = src.split("?")[0];
        // fm=webp パラメータ
        const webpQueryParam = "?fm=webp";
        // classにlazyloadを追加
        $(elm).addClass("lazyload");
        // srcを削除
        $(elm).removeAttr("src");
        // data-srcを設定
        $(elm).attr("data-src", srcWithoutQuery + webpQueryParam);
        // data-srcsetを設定
        $(elm).attr("data-srcset", `${srcWithoutQuery + webpQueryParam}&w=640 640w, ${srcWithoutQuery + webpQueryParam}&w=750 750w, ${srcWithoutQuery + webpQueryParam}&w=828 828w, ${srcWithoutQuery + webpQueryParam}&w=1080 1080w, ${srcWithoutQuery + webpQueryParam}&w=1200 1200w, ${srcWithoutQuery + webpQueryParam}&w=1920 1920w, ${srcWithoutQuery + webpQueryParam}&w=2048 2048w, ${srcWithoutQuery + webpQueryParam}&w=3840 3840w`);
        $(elm).attr("data-sizes", "100vw");
        if (index === 0) {
          $(elm).attr("loading", "eager");
        } else {
          $(elm).attr("loading", "lazy");
        }
      }
    });

    $("iframe").each((index, elm) => {
      $(elm).addClass("lazyload");
    });

    // 編集したHTMLを再設定
    data.content = $.html();
  }

  const table_of_content = modifiedContent && createTableOfContents(modifiedContent, { tags: "h1,h2,h3,h4,h5" });

  if (error) return <div>エラーが発生しました</div>;

  if (isLoading) return <div>読み込み中...</div>;

  return (
    <article class="contents">
      {data?.eyecatch && <img class="heroImage" width="720" height="360" src={`${data?.eyecatch?.url}?fit=crop&crop=top&w=720&h=360&fm=webp`} alt="" />}
      <h1 class="title">{data?.title}</h1>
      <time class="publishedAt">{data?.publishedAt ?? data?.createdAt}</time>
      <div>
        Last updated on <time class="updatedAt">{data?.updatedAt ?? data?.createdAt}</time>
      </div>
      <div class="category">
        {
          data?.categories && data?.categories.map((category: Category) => (
            <span>
              <a href={`/category/${category.id}`}>{category.name}</a>
            </span>
          ))
        }
      </div>
      <hr />
      {table_of_content && table_of_content.length > 0 && (
        <div class="table_of_content_wrapper">
          <h4 class="table_of_content_title">目次</h4>
          <ul class="table_of_content_lists">
            {table_of_content.map((item: any) => (
              <li class={`table_of_content_list ${item.name}`}>
                <a href={`#${item.id}`}>{item.text}</a>
              </li>
            ))}
          </ul>
        </div>
      )
      }
      <main class="post" dangerouslySetInnerHTML={{ __html: data?.content ?? "" }} />
      {isValidating && <div>更新中...</div>}
    </article>
  );
};

export default BlogPreview;