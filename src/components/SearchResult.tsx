// 検索語で記事を絞り込み、クライアント側ページング付きで表示するPreactコンポーネント。
// 検索ページ自体はAstroで静的生成されるため、入力値の反映とページ移動をブラウザー側で行う。
import { useState } from "preact/hooks";

// microCMSのカテゴリ情報のうち、検索結果とリンク表示で使う項目だけを表す。
type Category = {
  id: string;
  name: string;
};

// 1ページに表示する検索結果の件数。トップページのページサイズとも合わせている。
const LIMIT = 10;

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

const SearchItems = ({ data, q, offset, limit }: any) => {
  // offsetからlimit件だけを切り出す。検索結果全体は親で保持し、ページ移動では再取得しない。
  return (
    <>
      <h1 className="search-result-title">「{q}」の検索結果:{data.length}件</h1>
      {data.length !== 0 ? (
        <>
          {data.slice(offset, offset + limit).map((post: Post) => (
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
  const { totalCount, setOffset, setCurrentPage, limit, url, params, currentPage } = props;
  // ページ番号は0始まりで管理し、画面表示とURLでは1始まりに変換する。
  const totalPageCount = Math.ceil(totalCount / limit);
  const currentPageLabel = `ページ ${currentPage + 1} / ${totalPageCount}`;

  const handlePaginate = (data: any) => {
    // 表示位置とURLを同時に更新し、再読み込みなしでページを切り替える。
    const selectedPage = data.selected;
    setOffset(selectedPage * limit);
    setCurrentPage(selectedPage);

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

const BlogSearch = ({ posts = [] }: { posts?: Post[] }) => {
  // URLを初期状態の情報源にすることで、検索結果URLを直接開いた場合も同じページを復元できる。
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const q = params.get("q") ?? "";
  const pageNum = Number(params.get("page") ?? "1") - 1;

  // タイトル、本文、カテゴリ名を一つの小文字文字列にして部分一致検索する。
  // 検索語が空の場合は全件を対象にするが、画面では入力を促すメッセージを表示する。
  const filteredPosts = (q.trim()
    ? posts.filter((post) => {
      const keyword = q.trim().toLowerCase();
      const searchText = [
        post.title,
        post.content,
        ...(post.categories ?? []).map((category) => category.name),
      ]
        .join(" ")
        .toLowerCase();
      return searchText.includes(keyword);
    })
    : [...posts]
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalCount = filteredPosts.length;
  // URLに存在しないページ番号が指定されても、存在する最後のページへ丸める。
  const initialPage = Math.max(0, Math.min(pageNum, totalCount > 0 ? Math.ceil(totalCount / LIMIT) - 1 : 0));
  const [offset, setOffset] = useState(initialPage * LIMIT);
  const [currentPage, setCurrentPage] = useState(initialPage);

  if (!q.trim()) {
    return <div>検索キーワードを入力してください</div>;
  }

  if (totalCount === 0) {
    return <div>検索結果はありません</div>;
  }

  return (
    <>
      <SearchItems data={filteredPosts} q={q} offset={offset} limit={LIMIT} />
      {totalCount > LIMIT && (
        <Paginate
          totalCount={totalCount}
          setOffset={setOffset}
          setCurrentPage={setCurrentPage}
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
