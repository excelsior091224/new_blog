import useSWR from 'swr'
import { useState } from "react";
import type { Category } from '../library/microcms';
import { cmsBlog } from "../library/microcms";

const LIMIT = 10;

const SearchItems = (props: any) => {
  const { data, q, offset, LIMIT } = props;

  return (
    <>
      <h1 className="search-result-title">「{q}」の検索結果:{data?.totalCount}件</h1>
      {data?.contents.length !== 0 ? (
        <>
          {data?.contents.slice(offset, offset + LIMIT).map((post: any) => (
            <div class="post">
              {post.eyecatch && <a href={`/posts/${post.id}/`} aria-label="記事へ進む"><img width={720} height={360} src={`${post.eyecatch.url}?fm=webp&fit=crop&crop=top&w=720&h=360`} alt="" /></a>}
              <div class="spans">
                <span class="published_time_span">
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
                  </time>
                </span>
                {
                  post.categories.map((category: Category) => (
                    <span class="category">
                      <a href={`/category/${category.id}/`}>{category.name}</a>
                    </span>
                  ))
                }
              </div>
              <a href={`/posts/${post.id}/`}>
                <h2>{post.title}</h2>
                <div class="description">{post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '').length > 100 ? post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '').slice(0, 101) + '...' : post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '')}</div>
              </a>
            </div>
          ))}
        </>
      ) : (
        <div>検索結果はありません</div>
      )}
    </>
  );
}

const Paginate = (props: any) => {
  const { totalCount, setOffset, setCurrentPage, LIMIT, url, params, currentPage } = props;
  const totalPageCount = Math.ceil(totalCount / LIMIT);
  const currentPageLabel = `ページ ${currentPage + 1} / ${totalPageCount}`;

  const handlePaginate = (data: any) => {
    const selectedPage = data.selected;
    setOffset(selectedPage * LIMIT);
    setCurrentPage(selectedPage);
    if (selectedPage === 0) {
      if (params.get('page')) {
        params.delete('page');
        history.pushState({}, '', url);
      }
    } else {
      params.set('page', selectedPage + 1);
      history.pushState({}, '', url);
    }
    // params.set('page',selectedPage + 1);
    // history.pushState({}, '', url);
  }

  return (
    <nav class="pagination">
      <p class="pagination-current">{currentPageLabel}</p>
      <ul>
        {/* 前へ */}
        <li class={`page-item${currentPage === 0 ? ' disabled-button d-none' : ''}`}>
          <a class="previous-link" onClick={() => handlePaginate({ selected: currentPage - 1 })} style="cursor:pointer">◁</a>
        </li>

        {/* 先頭ページ + 省略 */}
        {currentPage > 2 && (
          <>
            <li class="page-item"><a class="page-link rounded-full" onClick={() => handlePaginate({ selected: 0 })} style="cursor:pointer">1</a></li>
            {currentPage > 3 && <li class="page-item break-item"><span class="page-link">...</span></li>}
          </>
        )}

        {/* ページ番号 */}
        {Array.from({ length: totalPageCount }, (_, i) => i)
          .filter(i => i >= currentPage - 2 && i <= currentPage + 2)
          .map(i => (
            <li key={i} class={`page-item${i === currentPage ? ' active' : ''}`}>
              {i === currentPage ? (
                <span class="page-link rounded-full active" aria-current="page">{i + 1}</span>
              ) : (
                <a
                  class="page-link rounded-full"
                  onClick={() => handlePaginate({ selected: i })}
                  style="cursor:pointer"
                >
                  {i + 1}
                </a>
              )}
            </li>
          ))
        }

        {/* 末尾ページ + 省略 */}
        {currentPage < totalPageCount - 3 && (
          <>
            {currentPage < totalPageCount - 4 && <li class="page-item break-item"><span class="page-link">...</span></li>}
            <li class="page-item"><a class="page-link rounded-full" onClick={() => handlePaginate({ selected: totalPageCount - 1 })} style="cursor:pointer">{totalPageCount}</a></li>
          </>
        )}

        {/* 次へ */}
        <li class={`page-item${currentPage === totalPageCount - 1 ? ' disabled-button d-none' : ''}`}>
          <a class="next-link" onClick={() => handlePaginate({ selected: currentPage + 1 })} style="cursor:pointer">▷</a>
        </li>
      </ul>
    </nav>
  )
}

const BlogSearch = () => {
  const url = new URL(window.location.href)
  const params = url.searchParams;
  const q = params.get('q');
  const pageNum = params.get('page');
  const endpoint = typeof q !== 'string' ? null : `/api/search?q=${q}`

  const fetcher = (url: URL | RequestInfo) => fetch(url).then((res) => res.json());

  // const { data, error, isLoading } = useSWR(endpoint, fetcher);
  const { data, error, isLoading } = useSWR(
    q === null ? null : ["/search", q],
    ([, q]) =>
      cmsBlog.getBlogs({
        q,
        orders: "-publishedAt"
      })
  );

  const initialPage = pageNum ? Math.max(0, Number(pageNum) - 1) : 0;
  const [offset, setOffset] = useState(initialPage * LIMIT);
  const [currentPage, setCurrentPage] = useState(initialPage);

  if (error) return <div>エラーが発生しました</div>;

  if (isLoading) return <div>読み込み中...</div>;

  if (!data) return <div>データを取得できませんでした</div>;

  return (
    <>
      <SearchItems data={data} q={q} offset={offset} LIMIT={LIMIT} />
      {data.totalCount > LIMIT && (
        <Paginate totalCount={data.totalCount} setOffset={setOffset} setCurrentPage={setCurrentPage} LIMIT={LIMIT} url={url} params={params} currentPage={currentPage} />
      )}
    </>
  )
}

export default BlogSearch;

// const BlogSearch = () => {
//   const params = new URLSearchParams(window.location.search);
//   const q = params.get("q");

//   // const [page, setPage] = useState(1);

//   const [page, setPage] = useState(params.get("page") ? Number(params.get("page")) : 1);

//   const getBlogs = async (queries?: MicroCMSQueries) => {
//     return await client.get<BlogResponse>({ endpoint: "blogs", queries });
//   };

//   const { data, error, isLoading } = useSWR(
//     q === null ? null : ["/search", q, page],
//     ([, q, page]) =>
//       getBlogs({
//         q,
//         limit: LIMIT,
//         offset: (page - 1) * LIMIT,
//         // orders: '-publishedAt',
//       })
//   );

//   const adjacentPageNumber = 1;

//   // リンク先のパスを生成する関数
//   const getPath = (q:any, page?: number) => {
//     const path = page ? `/search?q=${q}&page=${page}` : `/search?q=${q}`;
//     return path;
//     //if (page) {
//     //    return `./${page}`;
//     //} else {
//     //    return `./`;
//     //}
//   };

//   if (error) return <div>エラーが発生しました</div>;

//   if (isLoading) return <div>読み込み中...</div>;

//   return (
//     <>
//       <h1 className="search-result-title">「{ q }」の検索結果:{ data?.totalCount }件</h1>
//       {data?.contents.length !== 0 ? (
//         <>
//           {data?.contents.map((post:any) => (
//           <div class="post">
//             {post.eyecatch && <a href={`/posts/${post.id}/`} aria-label="記事へ進む"><img width={720} height={360} src={`${post.eyecatch.url}?fm=webp&fit=crop&crop=top&w=720&h=360`} alt="" /></a>}
//             <div class="spans">
//                 <span class="published_time_span">
//                     <time dateTime={post.publishedAt}>
//                         {new Date(post.publishedAt).toLocaleString('ja-JP',{ timeZone: 'Asia/Tokyo' })}
//                     </time>
//                 </span>
//                 {post.category && <span class="category"><a href={`/category/${post.category.id}`}>{post.category.name}</a></span>}
//             </div>
//             <a href={`/posts/${post.id}/`}>
//               <h2>{post.title}</h2>
//               <div class="description">{post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'').length > 100 ? post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'').slice(0,101) + '...' : post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'')}</div>
//             </a>
//           </div>
//           ))}
//           {data?.totalCount !== undefined && (
//             <nav class="pagination">
//               <ul>
//                 {page >= 2
//                 ?
//                 <li>
//                   <a href={page - 1 === 1 ? getPath(q) : getPath(q,page - 1)}>
//                     &#9665;
//                   </a>
//                 </li>
//                 :
//                 null
//                 }
//                 {
//                   adjacentPageNumber + 1 < page && (
//                     <>
//                       <li>
//                         <a href={getPath(q)}>1</a>
//                       </li>
//                       <li>
//                         &#8230;
//                       </li>
//                     </>
//                   )
//                 }
//                 {Array.from({
//                   length: Math.ceil(data.totalCount / LIMIT),
//                 }).map((_, i) => (
//                   page - adjacentPageNumber - 1 < i + 1 &&
//                   i + 1 < page + adjacentPageNumber + 1 &&
//                   (page === i + 1 ? (
//                     <li key={i + 1}>
//                       <span>{i + 1}</span>
//                     </li>
//                   ) : (
//                     <li key={i + 1}>
//                       <a href={getPath(q, i + 1)}>{i + 1}</a>
//                     </li>
//                   ))
//                 ))}
//                 {
//                   page < Math.ceil(data.totalCount / LIMIT) - adjacentPageNumber && (
//                     <>
//                       <li>
//                         &#8230;
//                       </li>
//                       <li>
//                         <a href={getPath(q,Math.ceil(data.totalCount / LIMIT))}>{Math.ceil(data.totalCount / LIMIT)}</a>
//                       </li>
//                     </>
//                   )
//                 }
//                 {page != Math.ceil(data.totalCount / LIMIT) ?
//                   <li>
//                     <a href={`/search?q=${q}&page=${page + 1}`}>
//                       &#9655;
//                     </a>
//                   </li>
//                   :
//                   null
//                 }
//               </ul>
//             </nav>
//           )}
//         </>
//       ) : (
//         <div>検索結果はありません</div>
//       )}
//     </>
//   );
// };
