import { onRequest as __api_preview_js_onRequest } from "/home/tadashi/dev/astro_test/new_blog/functions/api/preview.js"
import { onRequest as __api_search_js_onRequest } from "/home/tadashi/dev/astro_test/new_blog/functions/api/search.js"

export const routes = [
    {
      routePath: "/api/preview",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_preview_js_onRequest],
    },
  {
      routePath: "/api/search",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_search_js_onRequest],
    },
  ]