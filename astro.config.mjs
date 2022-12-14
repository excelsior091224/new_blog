import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
import netlify from "@astrojs/netlify/functions";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), sitemap()],
  // output: "server",
  // adapter: cloudflare(),
  // vite: {
  //   define: {
  //     "import.meta.env.MICROCMS_SERVICE_DOMAIN": JSON.stringify(
  //       import.meta.env.MICROCMS_SERVICE_DOMAIN
  //     ),
  //     "import.meta.env.MICROCMS_API_KEY": JSON.stringify(
  //       import.meta.env.MICROCMS_API_KEY
  //     ),
  //   },
  // },
  // adapter: netlify()
});
