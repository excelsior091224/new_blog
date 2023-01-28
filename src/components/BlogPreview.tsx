import useSWR from "swr";
// import { getBlogDetail } from "../library/microcms";
import { createTableOfContents } from "microcms-richedit-processer";

const BlogPreview = () => {
  const params = new URLSearchParams(window.location.search);
  const contentId = params.get("contentId");
  const draftKey = params.get("draftKey");

  const fetcher = (url: URL | RequestInfo) => fetch(url).then((res) => res.json());
  const endpoint = contentId === null || draftKey === null ? null : `/api/preview?contentId=${contentId}&draftKey=${draftKey}`;

  const { data, error, isLoading, isValidating } = useSWR(
    // contentId === null || draftKey === null
    //   ? null
    //   : ["/preview", contentId, draftKey],
    // ([, contentId, draftKey]) => getBlogDetail(contentId, { draftKey })
    endpoint,fetcher
  );

  const table_of_content = data?.content && createTableOfContents(data?.content,{ tags: "h1,h2,h3,h4,h5" })

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
      {data?.category && <span class="category"><a href={`/category/${data?.category?.id}`}>{data?.category?.name}</a></span>}
      <hr />
      {table_of_content && table_of_content.length > 0 && (
        <div class="table_of_content_wrapper">
          <h4 class="table_of_content_title">目次</h4>
          <ul class="table_of_content_lists">
            {table_of_content.map((item:any) => (
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