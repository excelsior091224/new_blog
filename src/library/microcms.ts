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

type Endpoint = "blogs" | "categories" | "links"; // 使用するエンドポイントを定義

type ResponseType<T> = T extends "blogs"
  ? BlogResponse
  : T extends "categories"
  ? CategoryResponse
  : T extends "links"
  ? LinkResponse
  : never;

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
  public async getBlogs(queries?: MicroCMSQueries) {
    return this.getData("blogs", queries);
  }

  public async getBlogDetail(contentId: string, queries?: MicroCMSQueries) {
    return this.getDetailData("blogs",contentId,queries);
  }

  public async getCategories(queries?: MicroCMSQueries) {
    return this.getData("categories", queries);
  }

  public async getCategoryDetail(contentId: string, queries?: MicroCMSQueries) {
    return this.getDetailData("categories",contentId,queries);
  }

  public async getLinks(queries?: MicroCMSQueries) {
    return this.getData("links", queries);
  }

  public async getLinkDetail(contentId: string, queries?: MicroCMSQueries) {
    return this.getDetailData("links",contentId,queries);
  } 

  private async getData<T extends Endpoint>(
    endpoint: T,
    queries?: MicroCMSQueries
  ): Promise<ResponseType<T>> {
    const cacheKey = `${endpoint}-${JSON.stringify(queries)}`;

    // キャッシュにデータがあればそれを返す
    const cachedData = await userCache.getItem<ResponseType<T>>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const data = await client.get<ResponseType<T>>({ endpoint, queries });

    if (data.offset + data.limit < data.totalCount) {
      queries ? (queries.offset = data.offset + data.limit) : "";
      const result = await this.getData(endpoint, queries);

      // offset や limit の変更を考慮して結果をマージしてからキャッシュに保存
      const mergedData: ResponseType<T> = {
        offset: result.offset,
        limit: result.limit,
        contents: [...data.contents, ...result.contents],
        totalCount: result.totalCount,
      };
      await userCache.setItem(cacheKey, mergedData, { ttl: 300 });
      return mergedData;
    }

    // データをキャッシュに保存してから返す
    await userCache.setItem(cacheKey, data, { ttl: 300 });
    return data;
  }

  private async getDetailData<T extends Endpoint>
  (
    endpoint: T,
    contentId: string, 
    queries?: MicroCMSQueries
    ): Promise<ResponseType<T>> {
    const cacheKey = `${endpoint}-${contentId}-${JSON.stringify(queries)}`;
    const cachedData = await userCache.getItem<ResponseType<T>>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const data = await client.getListDetail<ResponseType<T>>({
      endpoint,
      contentId,
      queries,
    });
    // データをキャッシュに保存してから返す
    await userCache.setItem(cacheKey, data, { ttl: 300 });
    return data;
  }
}
export const cmsBlog = new CMSBlog();

// class CMSBlog {
//   //@Cache(userCache, { ttl: 300 })
//   // export const getBlogs = async (queries?: MicroCMSQueries) => {
//   public async getBlogs(queries?: MicroCMSQueries) {
//     const data = await client.get<BlogResponse>({ endpoint: "blogs", queries });

//     if (data.offset + data.limit < data.totalCount) {
//       queries ? (queries.offset = data.offset + data.limit) : "";
//       const result: BlogResponse = await this.getBlogs(queries);
//       return {
//         offset: result.offset,
//         limit: result.limit,
//         contents: [...data.contents, ...result.contents],
//         totalCount: result.totalCount,
//       };
//     }
//     return data;
//   }
//   public async getBlogDetail(contentId: string, queries?: MicroCMSQueries) {
//     return await client.getListDetail<Blog>({
//       endpoint: "blogs",
//       contentId,
//       queries,
//     });
//   }
//   public async getCategories(queries?: MicroCMSQueries) {
//     const data = await client.get<CategoryResponse>({
//       endpoint: "categories",
//       queries,
//     });

//     if (data.offset + data.limit < data.totalCount) {
//       queries ? (queries.offset = data.offset + data.limit) : "";
//       const result: CategoryResponse = await this.getCategories(queries);
//       return {
//         offset: result.offset,
//         limit: result.limit,
//         contents: [...data.contents, ...result.contents],
//         totalCount: result.totalCount,
//       };
//     }
//     return data;
//   }
//   public async getCategoryDetail(contentId: string, queries?: MicroCMSQueries) {
//     return await client.getListDetail<Category>({
//       endpoint: "categories",
//       contentId,
//       queries,
//     });
//   }
//   public async getLinks(queries?: MicroCMSQueries) {
//     const data = await client.get<LinkResponse>({ endpoint: "links", queries });

//     if (data.offset + data.limit < data.totalCount) {
//       queries ? (queries.offset = data.offset + data.limit) : "";
//       const result: LinkResponse = await this.getLinks(queries);
//       return {
//         offset: result.offset,
//         limit: result.limit,
//         contents: [...data.contents, ...result.contents],
//         totalCount: result.totalCount,
//       };
//     }
//     return data;
//   }
//   public async getLinkDetail(contentId: string, queries?: MicroCMSQueries) {
//     return await client.getListDetail<Link>({
//       endpoint: "links",
//       contentId,
//       queries,
//     });
//   }
// }
// export const cmsBlog = new CMSBlog();

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
