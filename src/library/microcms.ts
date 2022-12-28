import { createClient, MicroCMSQueries } from "microcms-js-sdk";
const client = createClient({
//  serviceDomain: "import.meta.env.MICROCMS_SERVICE_DOMAIN",
//  apiKey: "import.meta.env.MICROCMS_API_KEY",
  serviceDomain: "process.env.MICROCMS_SERVICE_DOMAIN",
  apiKey: "process.env.MICROCMS_API_KEY",
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

export const getBlogs = async (queries?: MicroCMSQueries) => {
//  const client = createClient({
//    serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
//    apiKey: import.meta.env.MICROCMS_API_KEY,
//  });
  return await client.get<BlogResponse>({ endpoint: "blogs", queries });
};
export const getBlogDetail = async (
  contentId: string,
  queries?: MicroCMSQueries
) => {
//  const client = createClient({
//    serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
//    apiKey: import.meta.env.MICROCMS_API_KEY,
//  });
  return await client.getListDetail<Blog>({
    endpoint: "blogs",
    contentId,
    queries,
  });
};
export const getCategories = async (queries?: MicroCMSQueries) => {
  // const client = createClient({
  //   serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
  //   apiKey: import.meta.env.MICROCMS_API_KEY,
  // });
  return await client.get<CategoryResponse>({ endpoint: "categories", queries });
};
export const getCategoryDetail = async (
  contentId: string,
  queries?: MicroCMSQueries
) => {
  // const client = createClient({
  //   serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
  //   apiKey: import.meta.env.MICROCMS_API_KEY,
  // });
  return await client.getListDetail<Category>({
    endpoint: "categories",
    contentId,
    queries,
  });
};