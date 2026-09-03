// @ts-check
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Tree Lint",
      defaultLocale: "root",
      locales: {
        root: { label: "English", lang: "en" },
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
          label: "Get started",
          translations: { ru: "Начало работы", uk: "Початок роботи" },
          items: [
            {
              label: "Readme",
              slug: "getting-started/readme",
            },
          ],
        },
        {
          label: "Rules",
          translations: { ru: "Правила", uk: "Правила" },
          items: [{ autogenerate: { directory: "rules" } }],
        },
      ],
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
