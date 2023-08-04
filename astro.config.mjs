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
        resolveUrl: (url, location) => {
          // these were the proxied hosts I wanted to proxy
          const proxiedHosts = [
            "googletagmanager.com",
            "connect.facebook.net",
            "googleads.g.doubleclick.net",
          ];

          if (proxiedHosts.includes(url.hostname)) {
            const proxyUrl = new URL("proxy path", "proxy origin");
            proxyUrl.searchParams.append("url", url.href);
            return proxyUrl;
          }

          return url;
        },
        forward: ["dataLayer.push", "fbq"],
        // forward: ["dataLayer.push"],
      },
    }),
    preact({
      compat: true,
    }),
    robotsTxt(),
  ],
  site: "https://www.vermilion3.xyz",
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
