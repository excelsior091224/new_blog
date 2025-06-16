import useSWR from 'swr'

import { useState } from "preact/hooks";
import ReactPaginate from 'react-paginate';
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
  const { totalCount, setOffset, LIMIT, url, params, currentPage } = props;
  const totalPageCount = Math.ceil(totalCount / LIMIT);

  const handlePaginate = (data: any) => {
    const selectedPage = data.selected;
    setOffset(selectedPage * LIMIT);
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
      <ReactPaginate
        forcePage={currentPage} // 現在のページをreactのstateで管理したい場合等
        pageCount={totalPageCount}
        onPageChange={handlePaginate}
        marginPagesDisplayed={1} // 先頭と末尾に表示するページ数
        pageRangeDisplayed={2} // 現在のページの前後をいくつ表示させるか
        // containerClassName="pagination justify-center" // ul(pagination本体)
        pageClassName="page-item" // li
        pageLinkClassName="page-link rounded-full" // a
        activeClassName="active" // active.li
        activeLinkClassName="active" // active.li < a

        // 戻る・進む関連
        previousClassName="page-item" // li
        nextClassName="page-item" // li
        previousLabel={'◁'} // a
        previousLinkClassName="previous-link"
        nextLabel={'▷'} // a
        nextLinkClassName="next-link"

        // 先頭 or 末尾に行ったときにそれ以上戻れ(進め)なくする
        disabledClassName="disabled-button d-none"

        // 中間ページの省略表記関連
        breakLabel="..."
        breakClassName="page-item"
        breakLinkClassName="page-link"
      />
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

  const [offset, setOffset] = useState(0);

  const [currentPage, setCurrentPage] = useState(0);

  if (pageNum) {
    setCurrentPage(Number(pageNum) - 1);
    console.log(`${typeof (pageNum)}:${pageNum}`);
    console.log(`${typeof (Number(pageNum))}:${Number(pageNum)}`);
    setOffset((Number(pageNum) - 1) * LIMIT);
    console.log(offset);
  }

  if (error) return <div>エラーが発生しました</div>;

  if (isLoading) return <div>読み込み中...</div>;

  return (
    <>
      <SearchItems data={data} q={q} offset={offset} LIMIT={LIMIT} />
      <Paginate totalCount={data.totalCount} setOffset={setOffset} LIMIT={LIMIT} url={url} params={params} currentPage={currentPage} />
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
