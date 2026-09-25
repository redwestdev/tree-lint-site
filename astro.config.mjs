// @ts-check
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://tree-lint.dev',
  base: '/',
  // Единственный редирект, который нужен всегда: у английских страниц
  // появился префикс `/en`, а корень сайта остаётся входной точкой.
  redirects: {
    '/': '/en/',
  },
  integrations: [
    starlight({
      title: 'Tree Lint',
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
      customCss: ['./src/styles/global.css'],
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
