// microCMSの下書きをブラウザー上で取得し、記事プレビューとして表示するコンポーネント。
// 公開記事の静的生成とは分離し、contentIdとdraftKeyをURLから受け取ってクライアントで表示する。
import useSWR from "swr";
import { createTableOfContents } from "microcms-richedit-processer";
import { createClient } from "microcms-js-sdk";

import { load } from "cheerio";
import hljs from "highlight.js";
import type { HighlightResult } from "highlight.js";
import 'highlight.js/styles/hybrid.css';

// プレビューはブラウザーからmicroCMSへ直接問い合わせるため、公開設定された環境変数を使う。
const previewClient = createClient({
  serviceDomain:
    import.meta.env.MICROCMS_SERVICE_DOMAIN ??
    import.meta.env.PUBLIC_MICROCMS_SERVICE_DOMAIN,
  apiKey:
    import.meta.env.MICROCMS_API_KEY ?? import.meta.env.PUBLIC_MICROCMS_API_KEY,
});

async function getBlogDetail(contentId: string, queries?: Record<string, string>) {
  // microCMSの詳細取得APIを小さな関数に包み、SWRのfetcherとして利用する。
  return await previewClient.getListDetail({
    endpoint: "blogs",
    contentId,
    queries,
  });
}

type Category = {
  id: string;
  name: string;
};

const BlogPreview = () => {
  // microCMSのプレビュー画面から渡される識別子。どちらかが欠ける場合は取得を実行しない。
  const params = new URLSearchParams(window.location.search);
  const contentId = params.get("contentId");
  const draftKey = params.get("draftKey");

  const fetcher = (url: URL | RequestInfo) => fetch(url).then((res) => res.json());
  // const endpoint = contentId === null || draftKey === null ? null : `/api/preview?contentId=${contentId}&draftKey=${draftKey}`;

  // キーを配列にして記事IDと下書きキーをキャッシュ単位に含める。
  // 第1要素をnullにすると、必要なパラメーターが揃うまでSWRの取得が停止する。
  const { data, error, isValidating } = useSWR(
    contentId === null || draftKey === null
      ? null
      : ["/preview", contentId, draftKey],
    ([, contentId, draftKey]) => getBlogDetail(contentId, { draftKey })
  );
  const isLoading = !data && !error;

  if (error) return <div>エラーが発生しました</div>;

  if (isLoading) return <div>読み込み中...</div>;

  // HTML加工前の本文を保持し、目次抽出と表示用本文の元データにする。
  let modifiedContent = data?.content || "";

  if (data && data.content) {
    // リッチエディターHTMLを表示用に変換し、コードと画像をブラウザー向けに整える。
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

    // microCMS画像だけをWebP・srcset・lazyload対応に変換し、外部画像には触れない。
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

    // 埋め込みコンテンツもlazyload対象にして、プレビュー初期表示を軽くする。
    $("iframe").each((index, elm) => {
      $(elm).addClass("lazyload");
    });

    // 編集したHTMLを再設定
    data.content = $.html();
  }

  // 見出しタグだけを対象に目次を作り、本文の前にナビゲーションとして表示する。
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