import { createConfig } from '@redwestdev/tree-lint';

// Модель: файлы — сущности, директории между слоями — группы.
export default createConfig({
  roots: ['src/content', 'src/styles'],
  ignore: ['node_modules', 'dist', 'build', '.astro'],

  entities: {
    // src/content/docs/<locale> — двухбуквенная локаль. Мост к страницам ниже.

    // Страница документации (.md / .mdx).
    doc: {
      matches: {
        type: 'file',
        name: '*.{md,mdx}',
      },
      rules: {
        name: { type: 'error', pattern: '*.{md,mdx}' },
      },
    },

    // src/content/i18n/<locale>.json — файл переводов.
    locale: {
      matches: {
        type: 'file',
        name: '[a-z][a-z].json',
      },
      rules: {
        name: { type: 'error', pattern: '[a-z][a-z].json' },
      },
    },

    // src/styles/*.css — глобальные стили.
    styleSheet: {
      matches: {
        type: 'file',
        name: '*.css',
      },
    },
  },

  layers: {
    docs: {
      entities: ['doc'],
      rules: {
        isEmpty: { type: 'warning' },
      },
    },
    i18n: {
      entities: ['locale'],
      rules: {
        isEmpty: { type: 'warning' },
      },
    },
    styles: {
      entities: ['styleSheet'],
      rules: {
        isEmpty: { type: 'warning' },
      },
    },
  },

  // Разделы (getting-started, rules) — группы: имя в kebab-case, не пустые.
  groups: {
    name: '[a-z]*(-[a-z]*)*',
    rules: {
      isEmpty: { type: 'error' },
    },
  },
});
