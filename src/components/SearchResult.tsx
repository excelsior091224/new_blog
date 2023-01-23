import useSWR from 'swr'

import { useState } from "preact/hooks";
import type { MicroCMSQueries } from "microcms-js-sdk";
import { client, BlogResponse } from "../library/microcms";

const LIMIT = 10;

const BlogSearch = () => {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");

  // const [page, setPage] = useState(1);

  const [page, setPage] = useState(params.get("page") ? Number(params.get("page")) : 1);

  const getBlogs = async (queries?: MicroCMSQueries) => {
    return await client.get<BlogResponse>({ endpoint: "blogs", queries });
  };

  const { data, error, isLoading } = useSWR(
    q === null ? null : ["/search", q, page],
    ([, q, page]) =>
      getBlogs({
        q,
        limit: LIMIT,
        offset: (page - 1) * LIMIT,
        // orders: '-publishedAt',
      })
  );

  if (error) return <div>エラーが発生しました</div>;

  if (isLoading) return <div>読み込み中...</div>;

  return (
    <>
      <h1 className="search-result-title">「{ q }」の検索結果:{ data?.totalCount }件</h1>
      {data?.contents.length !== 0 ? (
        <>
          {data?.contents.map((post:any) => (
          <div class="post">
            {post.eyecatch && <a href={`/posts/${post.id}`} aria-label="記事へ進む"><img width={720} height={360} src={`${post.eyecatch.url}?fm=webp&fit=crop&crop=top&w=720&h=360`} alt="" /></a>}
            <div class="spans">
                <span class="published_time_span">
                    <time dateTime={post.publishedAt}>
                        {new Date(post.publishedAt).toLocaleString('ja-JP',{ timeZone: 'Asia/Tokyo' })}
                    </time>
                </span>
                {post.category && <span class="category"><a href={`/category/${post.category.id}`}>{post.category.name}</a></span>}
            </div>
            <a href={`/posts/${post.id}`}>
              <h2>{post.title}</h2>
              <div class="description">{post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'').length > 100 ? post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'').slice(0,101) + '...' : post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'')}</div>
            </a>
          </div>
          ))}
          {data?.totalCount !== undefined && (
            <nav>
              <ul style={{ display: "flex", gap: "8px" }}>
                {page >= 2
                ?
                <li style={{ listStyle: "none" }}>
                  <a href={page - 1 === 1 ? `/search?q=${q}` : `/search?q=${q}&page=${page - 1}`}>
                    Prev
                  </a>
                </li>
                :
                null
                }
                {Array.from({
                  length: Math.ceil(data.totalCount / LIMIT),
                }).map((_, i) => (
                  <li key={i} style={{ listStyle: "none" }}>
                    {/* <button
                      onClick={() => setPage(i + 1)}
                      disabled={page === i + 1 }
                    > */}
                      {/* {i + 1} */}
                    {/* </button> */}
                    {page === i + 1 ?
                      <span>
                        {i + 1}
                      </span>
                      :
                      <a 
                      href={i + 1 === 1 ? `/search?q=${q}` : `/search?q=${q}&page=${i + 1}`}
                      >
                        {i + 1}
                      </a>
                    }
                  </li>
                ))}
                {page != Math.ceil(data.totalCount / LIMIT) ?
                  <li style={{ listStyle: "none" }}>
                  <a href={`/search?q=${q}&page=${page + 1}`}>
                    Next
                  </a>
                  </li>
                  :
                  null
                }
              </ul>
            </nav>
          )}
        </>
      ) : (
        <div>検索結果はありません</div>
      )}
    </>
  );
};

export default BlogSearch;

// const Content = () => {
//   const params = new URL(window.location.href).searchParams
//   const q = params.get('q')
//   const endpoint = typeof q !== 'string' ? null : `/api/search?q=${q}`

//   const fetcher = (url: URL | RequestInfo) => fetch(url).then((res) => res.json());

//   const { data, error } = useSWR(endpoint, fetcher)

//   if (!data) {
//     return <p className="loading">Loading...</p>
//   }

//   if (error) {
//     console.error(error)
//     return <p className="error">Error occurred.</p>
//   }

//   return (
//     <>
//       <h1 className="search-result-title">「{ q }」の検索結果:{ data.totalCount }件</h1>
        
//       {data &&
//         data.contents &&
//         (data.contents.length >= 1 ? (
//           // <ArticleList articleList={data.posts.contents} />
//           data.contents.map((post:any) => (
//           // posts.map((post) => (
//               <div class="post">
//                   {post.eyecatch && <a href={`/posts/${post.id}`} aria-label="記事へ進む"><img width={720} height={360} src={`${post.eyecatch.url}?fit=crop&crop=top&w=720&h=360&fm=webp`} alt="" /></a>}
//                   <span class="published_time_span">
//                       <time dateTime={post.publishedAt}>
//                           {new Date(post.publishedAt).toLocaleString('ja-JP',{ timeZone: 'Asia/Tokyo' })}
//                       </time>
//                   </span>
//                   {post.category && <span class="category"><a href={`/category/${post.category.id}`}>{post.category.name}</a></span>}							
//                   <a href={`/posts/${post.id}`}>
//                       <h2>{post.title}</h2>
//                       <div class="description">{post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'').length > 100 ? post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'').slice(0,101) + '...' : post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'')}</div>
//                   </a>
//               </div>
//           ))
//         ) : (
//           <p>検索結果はありませんでした。</p>
//         ))}
//     </>
//   )
// }

// const Search = () => {
//   return (
//     <>
//       <Content />
//     </>
//   )
// }

// export default Search