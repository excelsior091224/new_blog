// microCMSのqパラメータ検索をブラウザーから直接叩き、ページング付きで表示するPreactコンポーネント。
// 検索ページ自体はAstroで静的生成されるため、入力値の反映とAPI呼び出しをブラウザー側で行う。
import { useState } from "preact/hooks";
import useSWR from "swr";
import { createClient } from "microcms-js-sdk";

// 検索はブラウザーからmicroCMSへ直接問い合わせるため、公開設定された環境変数を使う。
const searchClient = createClient({
  serviceDomain:
    import.meta.env.MICROCMS_SERVICE_DOMAIN ??
    import.meta.env.PUBLIC_MICROCMS_SERVICE_DOMAIN,
  apiKey:
    import.meta.env.MICROCMS_API_KEY ?? import.meta.env.PUBLIC_MICROCMS_API_KEY,
});

// microCMSのカテゴリ情報のうち、検索結果とリンク表示で使う項目だけを表す。
type Category = {
  id: string;
  name: string;
};

// 1ページに表示する検索結果の件数。トップページのページサイズとも合わせている。
const LIMIT = 10;

async function searchBlogs(q: string, offset: number) {
  // microCMS本来のq検索を使い、ページングもoffset/limitでmicroCMS側に任せる。
  return await searchClient.get({
    endpoint: "blogs",
    queries: { q, orders: "-publishedAt", limit: LIMIT, offset },
  });
}

// 検索結果一覧で必要な記事データ。アイキャッチとカテゴリは未設定の場合がある。
type Post = {
  id: string;
  title: string;
  createdAt: string;
  publishedAt: string;
  content: string;
  eyecatch?: {
    url: string;
  };
  categories?: Category[];
};

const SearchItems = ({ contents, q, totalCount }: any) => {
  // microCMS側でoffset/limitに絞り込まれた1ページ分だけが渡される。
  return (
    <>
      <h1 className="search-result-title">「{q}」の検索結果:{totalCount}件</h1>
      {contents.length !== 0 ? (
        <>
          {contents.map((post: Post) => (
            <div class="post" key={post.id}>
              {post.eyecatch && (
                <a href={`/posts/${post.id}/`} aria-label="記事へ進む">
                  <img
                    width={720}
                    height={360}
                    src={`${post.eyecatch.url}?fm=webp&fit=crop&crop=top&w=720&h=360`}
                    alt=""
                  />
                </a>
              )}
              <div class="spans">
                <span class="published_time_span">
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleString("ja-JP", {
                      timeZone: "Asia/Tokyo",
                    })}
                  </time>
                </span>
                {(post.categories ?? []).map((category: Category) => (
                  <span class="category" key={category.id}>
                    <a href={`/category/${category.id}/`}>{category.name}</a>
                  </span>
                ))}
              </div>
              <a href={`/posts/${post.id}/`}>
                <h2>{post.title}</h2>
                <div class="description">
                  {/* microCMSの本文HTMLからタグを除き、検索結果用の短い概要にする。 */}
                  {post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "").length > 100
                    ? post.content
                      .replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "")
                      .slice(0, 101) + "..."
                    : post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "")}
                </div>
              </a>
            </div>
          ))}
        </>
      ) : (
        <div>検索結果はありません</div>
      )}
    </>
  );
};

const Paginate = (props: any) => {
  const { totalCount, setOffset, limit, url, params, currentPage } = props;
  // ページ番号は0始まりで管理し、画面表示とURLでは1始まりに変換する。
  const totalPageCount = Math.ceil(totalCount / limit);
  const currentPageLabel = `ページ ${currentPage + 1} / ${totalPageCount}`;

  const handlePaginate = (data: any) => {
    // 表示位置とURLを同時に更新し、再読み込みなしでページを切り替える。
    const selectedPage = data.selected;
    setOffset(selectedPage * limit);

    if (selectedPage === 0) {
      if (params.get("page")) {
        params.delete("page");
        history.pushState({}, "", url);
      }
    } else {
      params.set("page", String(selectedPage + 1));
      history.pushState({}, "", url);
    }
  };

  return (
    <nav class="pagination">
      <p class="pagination-current">{currentPageLabel}</p>
      <ul>
        <li class={`page-item${currentPage === 0 ? " disabled-button d-none" : ""}`}>
          <a class="previous-link" onClick={() => handlePaginate({ selected: currentPage - 1 })} style="cursor:pointer">
            ◁
          </a>
        </li>

        {/* 現在ページから離れたページは省略し、先頭ページへの導線だけ残す。 */}
        {currentPage > 2 && (
          <>
            <li class="page-item">
              <a class="page-link rounded-full" onClick={() => handlePaginate({ selected: 0 })} style="cursor:pointer">
                1
              </a>
            </li>
            {currentPage > 3 && <li class="page-item break-item"><span class="page-link">...</span></li>}
          </>
        )}

        {/* 現在ページの前後2ページを表示し、ページ数が多い場合もナビゲーションを圧縮する。 */}
        {Array.from({ length: totalPageCount }, (_, i) => i)
          .filter((i) => i >= currentPage - 2 && i <= currentPage + 2)
          .map((i) => (
            <li key={i} class={`page-item${i === currentPage ? " active" : ""}`}>
              {i === currentPage ? (
                <span class="page-link rounded-full active" aria-current="page">{i + 1}</span>
              ) : (
                <a class="page-link rounded-full" onClick={() => handlePaginate({ selected: i })} style="cursor:pointer">
                  {i + 1}
                </a>
              )}
            </li>
          ))}

        {/* 後半にも省略記号と最終ページへの導線を表示する。 */}
        {currentPage < totalPageCount - 3 && (
          <>
            {currentPage < totalPageCount - 4 && <li class="page-item break-item"><span class="page-link">...</span></li>}
            <li class="page-item">
              <a class="page-link rounded-full" onClick={() => handlePaginate({ selected: totalPageCount - 1 })} style="cursor:pointer">
                {totalPageCount}
              </a>
            </li>
          </>
        )}

        <li class={`page-item${currentPage === totalPageCount - 1 ? " disabled-button d-none" : ""}`}>
          <a class="next-link" onClick={() => handlePaginate({ selected: currentPage + 1 })} style="cursor:pointer">
            ▷
          </a>
        </li>
      </ul>
    </nav>
  );
};

const BlogSearch = () => {
  // URLを初期状態の情報源にすることで、検索結果URLを直接開いた場合も同じページを復元できる。
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const q = params.get("q") ?? "";
  const pageNum = Number(params.get("page") ?? "1") - 1;
  const [offset, setOffset] = useState(Math.max(0, pageNum) * LIMIT);

  // qとoffsetの組でmicroCMSを検索する。qが空の間はキーをnullにしてフェッチさせない。
  const { data, error } = useSWR(
    q.trim() ? ["/search", q.trim(), offset] : null,
    ([, q, offset]) => searchBlogs(q, offset),
  );
  // dataもerrorもまだ届いていない = リクエスト中とみなす。
  const isLoading = !data && !error;

  if (!q.trim()) {
    return <div>検索キーワードを入力してください</div>;
  }

  if (error) {
    return <div>検索中にエラーが発生しました</div>;
  }

  if (isLoading) {
    return <div>検索中...</div>;
  }

  const totalCount = data.totalCount;
  const currentPage = offset / LIMIT;

  if (totalCount === 0) {
    return <div>検索結果はありません</div>;
  }

  return (
    <>
      <SearchItems contents={data.contents} q={q} totalCount={totalCount} />
      {totalCount > LIMIT && (
        <Paginate
          totalCount={totalCount}
          setOffset={setOffset}
          limit={LIMIT}
          url={url}
          params={params}
          currentPage={currentPage}
        />
      )}
    </>
  );
};

export default BlogSearch;
