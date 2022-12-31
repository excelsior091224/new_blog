import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
import netlify from "@astrojs/netlify/functions";

// https://astro.build/config
import vue from "@astrojs/vue";

// https://astro.build/config
import react from "@astrojs/react";

import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), sitemap(), vue(), react(),partytown({
      // Adds dataLayer.push as a forwarding-event.
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
  site: 'https://new-blog-81t.pages.dev',
  // output: "server",
  // adapter: cloudflare(),
  // vite: {
  //   define: {
  //       "process.env.MICROCMS_SERVICE_DOMAIN": process.env.MICROCMS_SERVICE_DOMAIN,
  //       "process.env.MICROCMS_API_KEY":process.env.MICROCMS_API_KEY,
  //   },
  // },
  // adapter: netlify()
});