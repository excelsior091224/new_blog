import useSWR from "swr";
import { getBlogDetail } from "../library/microcms";

const BlogPreview = () => {
  const params = new URLSearchParams(window.location.search);
  const contentId = params.get("contentId");
  const draftKey = params.get("draftKey");

  const { data, error, isLoading, isValidating } = useSWR(
    contentId === null || draftKey === null
      ? null
      : ["/preview", contentId, draftKey],
    ([, contentId, draftKey]) => getBlogDetail(contentId, { draftKey })
  );

  if (error) return <div>エラーが発生しました</div>;

  if (isLoading) return <div>読み込み中...</div>;

  return (
    <article class="contents">
        {data?.eyecatch && <img class="heroImage" width="720" height="360" src={`${data?.eyecatch?.url}?fit=crop&w=720&h=360`} alt="" />}
        <h1 class="title">{data?.title}</h1>
        <time class="publishedAt">{data?.publishedAt ?? data?.createdAt}</time>			
        <div>
            Last updated on <time class="updatedAt">{data?.updatedAt ?? data?.createdAt}</time>
        </div>
        { data?.category && <span class="category"><a href={`/category/${data?.category?.id}`}>{data?.category?.name}</a></span> }
        <hr />
        <main class="post" dangerouslySetInnerHTML={{ __html: data?.content ?? "" }}/>
        {isValidating && <div>更新中...</div>}
    </article>
  );
};

export default BlogPreview;