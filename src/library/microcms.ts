import { createClient, MicroCMSQueries } from "microcms-js-sdk";
export const client = createClient({
  serviceDomain: import.meta.env.PUBLIC_MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.PUBLIC_MICROCMS_API_KEY,
  // serviceDomain: "import.meta.env.MICROCMS_SERVICE_DOMAIN",
  // apiKey: "import.meta.env.MICROCMS_API_KEY",
  // serviceDomain: "process.env.MICROCMS_SERVICE_DOMAIN",
  // apiKey: "process.env.MICROCMS_API_KEY",
});

export type Blog = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  content: string;
  eyecatch: {
    url: string;
    height: number;
    width: number;
  };
  category: {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    revisedAt: string;
    name: string;
  };
};
export type BlogResponse = {
  totalCount: number;
  offset: number;
  limit: number;
  contents: Blog[];
};
export type Category = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  name: string;
};
export type CategoryResponse = {
  totalCount: number;
  offset: number;
  limit: number;
  contents: Category[];
};
export type Link = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  url: string;
};
export type LinkResponse = {
  totalCount: number;
  offset: number;
  limit: number;
  contents: Link[];
};

// export const getBlogs = async (queries?: MicroCMSQueries) => {
//   return await client.get<BlogResponse>({ endpoint: "blogs", queries });
// };
export const getBlogs = async (queries?: MicroCMSQueries) => {
  const data = await client.get<BlogResponse>({ endpoint: "blogs", queries});

  if (data.offset + data.limit < data.totalCount) {
    const result:BlogResponse = await getBlogs({limit:data.limit, offset:data.offset + data.limit})
    return {
        offset:result.offset,
        limit:result.limit,
        contents: [...data.contents, ...result.contents],
        totalCount: result.totalCount,
      };
  }
  return data
};
export const getBlogDetail = async (
  contentId: string,
  queries?: MicroCMSQueries
) => {
  return await client.getListDetail<Blog>({
    endpoint: "blogs",
    contentId,
    queries,
  });
};
// export const getCategories = async (queries?: MicroCMSQueries) => {
//   return await client.get<CategoryResponse>({ endpoint: "categories", queries });
// };
export const getCategories = async (queries?: MicroCMSQueries) => {
  const data = await client.get<CategoryResponse>({ endpoint: "categories", queries });

  if (data.offset + data.limit < data.totalCount) {
    const result:CategoryResponse = await getCategories({limit:data.limit, offset:data.offset + data.limit})
    return {
        offset:result.offset,
        limit:result.limit,
        contents: [...data.contents, ...result.contents],
        totalCount: result.totalCount,
      };
  }
  return data
};
export const getCategoryDetail = async (
  contentId: string,
  queries?: MicroCMSQueries
) => {
  return await client.getListDetail<Category>({
    endpoint: "categories",
    contentId,
    queries,
  });
};
// export const getLinks = async (queries?: MicroCMSQueries) => {
//   return await client.get<LinkResponse>({ endpoint: "links", queries });
// };
export const getLinks = async (queries?: MicroCMSQueries) => {
  const data = await client.get<LinkResponse>({ endpoint: "links", queries });

  if (data.offset + data.limit < data.totalCount) {
    const result:LinkResponse = await getLinks({limit:data.limit, offset:data.offset + data.limit})
    return {
        offset:result.offset,
        limit:result.limit,
        contents: [...data.contents, ...result.contents],
        totalCount: result.totalCount,
      };
  }
  return data
};
export const getLinkDetail = async (
  contentId: string,
  queries?: MicroCMSQueries
) => {
  return await client.getListDetail<Link>({
    endpoint: "links",
    contentId,
    queries,
  });
};


export const test = async (queries?: MicroCMSQueries) => {
  const data = await client.get<BlogResponse>({ endpoint: "blogs", queries});
  console.log(data.contents);

  if (data.offset + data.limit < data.totalCount) {
    queries.offset = data.offset + data.limit;
    const result:BlogResponse = await test(queries);
    console.log(result.contents);
    return {
        offset:result.offset,
        limit:result.limit,
        contents: [...data.contents, ...result.contents],
        totalCount: result.totalCount,
      };
  }
  return data
};