// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = import.meta.env.SITE_TITLE
  ? import.meta.env.SITE_TITLE
  : "My personal website.";
export const SITE_DESCRIPTION = import.meta.env.SITE_DESCRIPTION
  ? import.meta.env.SITE_DESCRIPTION
  : "Welcome to my website!";
