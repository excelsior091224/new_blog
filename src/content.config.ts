// microCMSの各エンドポイントをAstro Content Collectionsとして読み込む設定。
// スキーマをここに集約し、ページ側では取得データの形を意識せずに利用できるようにする。
import { defineCollection, z } from "astro:content";
import { createClient } from "microcms-js-sdk";

// 秘密情報をサーバー専用変数から優先して読み込み、静的ビルド環境ではPUBLIC変数も許可する。
const serviceDomain =
    import.meta.env.MICROCMS_SERVICE_DOMAIN ??
    import.meta.env.PUBLIC_MICROCMS_SERVICE_DOMAIN;
const apiKey =
    import.meta.env.MICROCMS_API_KEY ?? import.meta.env.PUBLIC_MICROCMS_API_KEY;

const microCMSClient = createClient({
    serviceDomain,
    apiKey,
});

// Content Collectionsのloaderから共通利用するmicroCMS全件取得処理。
const microCMSLoader = (endpoint: string) => {
    // ビルド時にAPIから全件取得し、取得失敗時は空のコレクションとして扱う。
    return async () => {
        try {
            return await microCMSClient.getAllContents({ endpoint });
        } catch (error) {
            // 1エンドポイントの障害でサイト全体のビルドを止めず、該当コレクションを空にする。
            console.error(`microCMSから${endpoint}のデータ取得に失敗しました:`, error);
            return [];
        }
    };
};

// microCMSが各コンテンツに付与する日時フィールドを全スキーマで共有する。
const microCMSDateFields = {
    createdAt: z.string(),
    updatedAt: z.string(),
    publishedAt: z.string(),
    revisedAt: z.string(),
};

// カテゴリ、画像、記事の順に部品を定義し、記事スキーマで再利用する。
const categorySchema = z.object({
    id: z.string(),
    name: z.string(),
    ...microCMSDateFields,
});

const imageSchema = z.object({
    url: z.string(),
    height: z.number(),
    width: z.number(),
});

const blogSchema = z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    eyecatch: imageSchema.optional(),
    // APIでカテゴリが省略されても、表示側では常に配列として扱えるようにする。
    categories: z.array(categorySchema).default([]),
    ...microCMSDateFields,
});

// コレクション名は各ページのgetCollection("...")呼び出しと対応する。
const categoryCollection = defineCollection({
    loader: microCMSLoader("categories"),
    schema: categorySchema,
});

const blogCollection = defineCollection({
    loader: microCMSLoader("blogs"),
    schema: blogSchema,
});

const linkSchema = z.object({
    id: z.string(),
    title: z.string(),
    url: z.string(),
    ...microCMSDateFields,
});

const linkCollection = defineCollection({
    loader: microCMSLoader("links"),
    schema: linkSchema,
});

const accountSchema = z.object({
    id: z.string(),
    title: z.string(),
    url: z.string(),
    ...microCMSDateFields,
});

const accountCollection = defineCollection({
    loader: microCMSLoader("accounts"),
    schema: accountSchema,
});

export const collections = {
    blogs: blogCollection,
    categories: categoryCollection,
    links: linkCollection,
    accounts: accountCollection,
};
