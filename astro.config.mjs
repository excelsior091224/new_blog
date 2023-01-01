import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
import netlify from "@astrojs/netlify/functions";

// https://astro.build/config
import vue from "@astrojs/vue";

import partytown from "@astrojs/partytown";

import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), sitemap(), vue(), partytown({
      // Adds dataLayer.push as a forwarding-event.
      config: {
        forward: ["dataLayer.push"],
      },
    }),
    preact({ compat: true })
  ],
  site: 'https://www.vermilion3.xyz',
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