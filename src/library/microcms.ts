import { createClient, MicroCMSQueries } from "microcms-js-sdk";
export const client = createClient({
  // serviceDomain: import.meta.env.PUBLIC_MICROCMS_SERVICE_DOMAIN,
  // apiKey: import.meta.env.PUBLIC_MICROCMS_API_KEY,
  serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.MICROCMS_API_KEY,
});
import { Cache, CacheContainer } from "node-ts-cache";
import { MemoryStorage } from "node-ts-cache-storage-memory";

const userCache = new CacheContainer(new MemoryStorage());

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

class CMSBlog {
  @Cache(userCache, { ttl: 300 })
  // export const getBlogs = async (queries?: MicroCMSQueries) => {
  public async getBlogs(queries?: MicroCMSQueries) {
    const data = await client.get<BlogResponse>({ endpoint: "blogs", queries });

    if (data.offset + data.limit < data.totalCount) {
      queries ? (queries.offset = data.offset + data.limit) : "";
      const result: BlogResponse = await this.getBlogs(queries);
      return {
        offset: result.offset,
        limit: result.limit,
        contents: [...data.contents, ...result.contents],
        totalCount: result.totalCount,
      };
    }
    return data;
  }
  public async getBlogDetail(contentId: string, queries?: MicroCMSQueries) {
    return await client.getListDetail<Blog>({
      endpoint: "blogs",
      contentId,
      queries,
    });
  }
  public async getCategories(queries?: MicroCMSQueries) {
    const data = await client.get<CategoryResponse>({
      endpoint: "categories",
      queries,
    });

    if (data.offset + data.limit < data.totalCount) {
      queries ? (queries.offset = data.offset + data.limit) : "";
      const result: CategoryResponse = await this.getCategories(queries);
      return {
        offset: result.offset,
        limit: result.limit,
        contents: [...data.contents, ...result.contents],
        totalCount: result.totalCount,
      };
    }
    return data;
  }
  public async getCategoryDetail(contentId: string, queries?: MicroCMSQueries) {
    return await client.getListDetail<Category>({
      endpoint: "categories",
      contentId,
      queries,
    });
  }
  public async getLinks(queries?: MicroCMSQueries) {
    const data = await client.get<LinkResponse>({ endpoint: "links", queries });

    if (data.offset + data.limit < data.totalCount) {
      queries ? (queries.offset = data.offset + data.limit) : "";
      const result: LinkResponse = await this.getLinks(queries);
      return {
        offset: result.offset,
        limit: result.limit,
        contents: [...data.contents, ...result.contents],
        totalCount: result.totalCount,
      };
    }
    return data;
  }
  public async getLinkDetail(contentId: string, queries?: MicroCMSQueries) {
    return await client.getListDetail<Link>({
      endpoint: "links",
      contentId,
      queries,
    });
  }
}
export const cmsBlog = new CMSBlog();

export const getCategories = async (queries?: MicroCMSQueries) => {
  const data = await client.get<CategoryResponse>({
    endpoint: "categories",
    queries,
  });

  if (data.offset + data.limit < data.totalCount) {
    queries ? (queries.offset = data.offset + data.limit) : "";
    const result: CategoryResponse = await getCategories(queries);
    return {
      offset: result.offset,
      limit: result.limit,
      contents: [...data.contents, ...result.contents],
      totalCount: result.totalCount,
    };
  }
  return data;
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
export const getLinks = async (queries?: MicroCMSQueries) => {
  const data = await client.get<LinkResponse>({ endpoint: "links", queries });

  if (data.offset + data.limit < data.totalCount) {
    queries ? (queries.offset = data.offset + data.limit) : "";
    const result: LinkResponse = await getLinks(queries);
    return {
      offset: result.offset,
      limit: result.limit,
      contents: [...data.contents, ...result.contents],
      totalCount: result.totalCount,
    };
  }
  return data;
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
