// import { Blog } from 'src/types/blog'
// import { ResponseWrapper } from 'src/types/microcmsResponse'
import useSWR from 'swr'

const Content = () => {
  const params = new URL(window.location.href).searchParams
  const q = params.get('q')
  const endpoint = typeof q !== 'string' ? null : `/api/search?q=${q}`

  const fetcher = (url: URL | RequestInfo) => fetch(url).then((res) => res.json());

  const { data, error } = useSWR(endpoint, fetcher)

  if (!data) {
    return <p className="loading">Loading...</p>
  }

  if (error) {
    console.error(error)
    return <p className="error">Error occurred.</p>
  }

  return (
    <>
      <h1 className="search-result-title">「{ q }」の検索結果:{ data.totalCount }件</h1>
        
      {data &&
        data.contents &&
        (data.contents.length >= 1 ? (
          // <ArticleList articleList={data.posts.contents} />
          data.contents.map((post:any) => (
          // posts.map((post) => (
              <div class="post">
                  {post.eyecatch && <a href={`/posts/${post.id}`} aria-label="記事へ進む"><img width={720} height={360} src={`${post.eyecatch.url}?fit=crop&crop=top&w=720&h=360`} alt="" /></a>}
                  <span class="published_time_span">
                      <time dateTime={post.publishedAt}>
                          {new Date(post.publishedAt).toLocaleString('ja-JP',{ timeZone: 'Asia/Tokyo' })}
                      </time>
                  </span>
                  {post.category && <span class="category"><a href={`/category/${post.category.id}`}>{post.category.name}</a></span>}							
                  <a href={`/posts/${post.id}`}>
                      <h2>{post.title}</h2>
                      <div class="description">{post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'').length > 100 ? post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'').slice(0,101) + '...' : post.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'')}</div>
                  </a>
              </div>
          ))
        ) : (
          <p>検索結果はありませんでした。</p>
        ))}
    </>
  )
}

const Search = () => {
  return (
    <>
      <Content />
    </>
  )
}

export default Search