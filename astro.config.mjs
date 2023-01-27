import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
import vue from "@astrojs/vue";
import partytown from "@astrojs/partytown";
import preact from "@astrojs/preact";
import robotsTxt from "astro-robots-txt";

// https://astro.build/config
export default defineConfig({
  integrations: [
    mdx(),
    sitemap(),
    vue(),
    partytown({
      // Adds dataLayer.push as a forwarding-event.
      config: {
        forward: ["dataLayer.push"],
      },
    }),
    preact({
      compat: true,
    }),
    robotsTxt(),
  ],
  site: "https://www.vermilion3.xyz"
});
