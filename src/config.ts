// サイト全体で使うタイトル、説明文、アイコンを環境変数から組み立てる設定。

export const SITE_TITLE = import.meta.env.SITE_TITLE
  ? import.meta.env.SITE_TITLE
  : "My personal website.";
export const SITE_DESCRIPTION = import.meta.env.SITE_DESCRIPTION
  ? import.meta.env.SITE_DESCRIPTION
  : "Welcome to my website!";
export const FAVICON = import.meta.env.FAVICON
  ? import.meta.env.FAVICON
  : "/favicon.svg";
export const ICON_HEADER = import.meta.env.ICON_HEADER
  ? import.meta.env.ICON_HEADER
  : "";
