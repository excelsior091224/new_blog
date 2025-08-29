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
  public async getAccounts(queries?: MicroCMSQueries) {
    const data = await client.get<AccountResponse>({ endpoint: "accounts", queries });

    if (data.offset + data.limit < data.totalCount) {
      queries ? (queries.offset = data.offset + data.limit) : "";
      const result: AccountResponse = await this.getAccounts(queries);
      return {
        offset: result.offset,
        limit: result.limit,
        contents: [...data.contents, ...result.contents],
        totalCount: result.totalCount,
      };
    }
    return data;
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
