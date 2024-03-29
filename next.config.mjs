/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");
import { withAxiom } from "next-axiom";

/** @type {import("next").NextConfig} */
const config = withAxiom({
  reactStrictMode: true,

  /**
   * If you have `experimental: { appDir: true }` set, then you must comment the below `i18n` config
   * out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  // i18n: {
  //   locales: ["en"],
  //   defaultLocale: "en",
  // },
  images: {
    domains: [
      "i.scdn.co",
      "iwhksjsfesopygewmtaw.supabase.co",
      "loremflickr.com",
      "loremflickr.com",
    ],
  },
  // experimental: {
  //   serverActions: true,
  // },
});

export default config;
