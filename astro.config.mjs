// @ts-check
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Tree Lint",
      defaultLocale: "en",
      locales: {
        en: {
          label: "English",
        },
        uk: {
          label: "Українська",
          lang: "uk",
        },
        ru: {
          label: "Русский",
          lang: "ru",
        },
      },
      customCss: ["./src/styles/global.css"],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/redwestdev/tree-lint",
        },
      ],
      sidebar: [
        {
          label: "Guides",
          translations: { ru: "Руководства", uk: "Посібники" },
          items: [
            {
              label: "Example Guide",
              translations: {
                ru: "Пример руководства",
                uk: "Приклад посібника",
              },
              slug: "guides/example",
            },
          ],
        },
        {
          label: "Reference",
          translations: { ru: "Справочник", uk: "Довідник" },
          items: [{ autogenerate: { directory: "reference" } }],
        },
      ],
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
