// @ts-check
import { satteri } from '@astrojs/markdown-satteri';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import fileTreeIcons from './src/plugins/file-tree-icons.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://tree-lint.dev',
  base: '/',
  // Единственный редирект, который нужен всегда: у английских страниц
  // появился префикс `/en`, а корень сайта остаётся входной точкой.
  redirects: {
    '/': '/en/',
    // Старые адреса русской документации после переезда на новую структуру.
    '/ru/rules/': '/ru/validation/entities/',
    '/ru/rules/configuration-examples/': '/ru/validation/entities/',
    '/ru/rules/custom-usage/': '/ru/validation/entities/',
    '/ru/rules/node-fields/': '/ru/validation/entities/',
    '/ru/getting-started/architecture-examples/': '/ru/recipes/fsd/',
    // Переезд на новую структуру разделов: «Концепция», «Определение», «Валидация».
    '/ru/getting-started/': '/ru/concepts/intro/',
    '/ru/getting-started/installation/': '/ru/getting-started/quick-start/',
    '/ru/getting-started/concepts/': '/ru/concepts/intro/',
    '/ru/configuration/entities-matches/': '/ru/matching/entities/',
    '/ru/configuration/layers/': '/ru/concepts/layers/',
    '/ru/configuration/custom-rules/': '/ru/validation/entities/',
    '/ru/cli/ai-contract/': '/ru/concepts/intro/',
    '/ru/recipes/monorepo/': '/ru/configuration/roots-ignore/',
    '/ru/recipes/legacy-migration/': '/ru/configuration/roots-ignore/',
    '/ru/recipes/docs-i18n/': '/ru/validation/layers/',
    '/ru/reference/built-in-rules/': '/ru/validation/entities/',
  },
  // Примеры файловой структуры рисуются иконками Material Icon Theme.
  markdown: {
    processor: satteri({ hastPlugins: [fileTreeIcons()] }),
  },
  integrations: [
    starlight({
      title: 'Tree Lint',
      // Сайт закрыт от индексации поисковыми ботами.
      head: [
        {
          tag: 'meta',
          attrs: { name: 'robots', content: 'noindex, nofollow' },
        },
      ],
      defaultLocale: 'en',
      locales: {
        en: {
          label: 'English',
          lang: 'en',
        },
        uk: {
          label: 'Українська',
          lang: 'uk',
        },
        ru: {
          label: 'Русский',
          lang: 'ru',
        },
      },
      components: {
        Sidebar: './src/components/Sidebar.astro',
        Pagination: './src/components/Pagination.astro',
      },
      customCss: ['./src/styles/global.css', './src/styles/file-tree.css'],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/redwestdev/tree-lint',
        },
      ],
      sidebar: [
        {
          label: 'Get started',
          translations: { ru: 'Начало работы', uk: 'Початок роботи' },
          items: [
            {
              label: 'Overview',
              translations: { ru: 'Обзор', uk: 'Огляд' },
              link: 'getting-started',
            },
            {
              label: 'Installation',
              translations: { ru: 'Установка', uk: 'Встановлення' },
              link: 'getting-started/installation',
            },
            {
              label: 'Quick start',
              translations: { ru: 'Быстрый старт', uk: 'Швидкий старт' },
              link: 'getting-started/quick-start',
            },
            {
              label: 'Concepts',
              translations: { ru: 'Концепции', uk: 'Концепції' },
              link: 'getting-started/concepts',
            },
            {
              label: 'Architecture examples',
              translations: {
                ru: 'Примеры архитектур',
                uk: 'Приклади архітектур',
              },
              link: 'getting-started/architecture-examples',
            },
          ],
        },
        {
          label: 'Rules',
          translations: { ru: 'Правила', uk: 'Правила' },
          items: [
            {
              label: 'Overview',
              translations: { ru: 'Обзор', uk: 'Огляд' },
              link: 'rules',
            },
            {
              label: 'Configuration examples',
              translations: {
                ru: 'Примеры конфигурации',
                uk: 'Приклади конфігурації',
              },
              link: 'rules/configuration-examples',
            },
            {
              label: 'Node fields',
              translations: { ru: 'Поля node', uk: 'Поля node' },
              link: 'rules/node-fields',
            },
            {
              label: 'Custom checks',
              translations: {
                ru: 'Проверка custom()',
                uk: 'Перевірка custom()',
              },
              link: 'rules/custom-usage',
            },
          ],
        },
      ],
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
