import { createClient, } from "microcms-js-sdk";
import type { MicroCMSQueries } from "microcms-js-sdk";

export const client = createClient({
  serviceDomain: import.meta.env.PUBLIC_MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.PUBLIC_MICROCMS_API_KEY,
});
import { Cache, CacheContainer } from "node-ts-cache";
import { MemoryStorage } from "node-ts-cache-storage-memory";

const userCache = new CacheContainer(new MemoryStorage());

type Endpoint = "blogs" | "categories" | "links"; // 使用するエンドポイントを定義

type ResponseType<T> = T extends "blogs"
  ? BlogResponse
  : T extends "categories"
  ? CategoryResponse
  : T extends "links"
  ? LinkResponse
  : never;

export type Category = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  name: string;
};
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
  categories: Category[];
};
export type BlogResponse = {
  totalCount: number;
  offset: number;
  limit: number;
  contents: Blog[];
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
export type Account = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  url: string;
}
export type AccountResponse = {
  totalCount: number;
  offset: number;
  limit: number;
  contents: Account[];
}

class CMSBlog {
  @Cache(userCache, { ttl: 300 })
  public async getBlogs(queries?: MicroCMSQueries): Promise<BlogResponse> {
    const contents = await client.getAllContents<Blog>({ endpoint: "blogs", queries });
    return { totalCount: contents.length, offset: 0, limit: contents.length, contents };
  }
  public async getBlogDetail(contentId: string, queries?: MicroCMSQueries) {
    return await client.getListDetail<Blog>({
      endpoint: "blogs",
      contentId,
      queries,
    });
  }
  public async getCategories(queries?: MicroCMSQueries): Promise<CategoryResponse> {
    const contents = await client.getAllContents<Category>({ endpoint: "categories", queries });
    return { totalCount: contents.length, offset: 0, limit: contents.length, contents };
  }
  public async getCategoryDetail(contentId: string, queries?: MicroCMSQueries) {
    return await client.getListDetail<Category>({
      endpoint: "categories",
      contentId,
      queries,
    });
  }
  public async getLinks(queries?: MicroCMSQueries): Promise<LinkResponse> {
    const contents = await client.getAllContents<Link>({ endpoint: "links", queries });
    return { totalCount: contents.length, offset: 0, limit: contents.length, contents };
  }
  public async getLinkDetail(contentId: string, queries?: MicroCMSQueries) {
    return await client.getListDetail<Link>({
      endpoint: "links",
      contentId,
      queries,
    });
  }
  public async getAccounts(queries?: MicroCMSQueries): Promise<AccountResponse> {
    const contents = await client.getAllContents<Account>({ endpoint: "accounts", queries });
    return { totalCount: contents.length, offset: 0, limit: contents.length, contents };
  }
  public async getAccountDetail(contentId: string, queries?: MicroCMSQueries) {
    return await client.getListDetail<Account>({
      endpoint: "accounts",
      contentId,
      queries,
    });
  }
}
export const cmsBlog = new CMSBlog();

// export const getCategories = async (queries?: MicroCMSQueries) => {
//   const data = await client.get<CategoryResponse>({
//     endpoint: "categories",
//     queries,
//   });

//   if (data.offset + data.limit < data.totalCount) {
//     queries ? (queries.offset = data.offset + data.limit) : "";
//     const result: CategoryResponse = await getCategories(queries);
//     return {
//       offset: result.offset,
//       limit: result.limit,
//       contents: [...data.contents, ...result.contents],
//       totalCount: result.totalCount,
//     };
//   }
//   return data;
// };
// export const getCategoryDetail = async (
//   contentId: string,
//   queries?: MicroCMSQueries
// ) => {
//   return await client.getListDetail<Category>({
//     endpoint: "categories",
//     contentId,
//     queries,
//   });
// };
// export const getLinks = async (queries?: MicroCMSQueries) => {
//   const data = await client.get<LinkResponse>({ endpoint: "links", queries });

//   if (data.offset + data.limit < data.totalCount) {
//     queries ? (queries.offset = data.offset + data.limit) : "";
//     const result: LinkResponse = await getLinks(queries);
//     return {
//       offset: result.offset,
//       limit: result.limit,
//       contents: [...data.contents, ...result.contents],
//       totalCount: result.totalCount,
//     };
//   }
//   return data;
// };
// export const getLinkDetail = async (
//   contentId: string,
//   queries?: MicroCMSQueries
// ) => {
//   return await client.getListDetail<Link>({
//     endpoint: "links",
//     contentId,
//     queries,
//   });
// };
