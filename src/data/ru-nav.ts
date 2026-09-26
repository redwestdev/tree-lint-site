/**
 * Навигация русской документации.
 *
 * Starlight не поддерживает отдельный sidebar для локали, поэтому структура
 * русской документации хранится здесь и используется компонентами
 * `Sidebar.astro` и `Pagination.astro` для локали `ru`.
 */

export interface RuNavLink {
  type: 'link';
  label: string;
  href: string;
  isCurrent: boolean;
  badge?: undefined;
  attrs: Record<string, string | number | boolean | undefined>;
}

export interface RuNavGroup {
  type: 'group';
  label: string;
  entries: (RuNavLink | RuNavGroup)[];
  collapsed: boolean;
  badge?: undefined;
}

export type RuNavEntry = RuNavLink | RuNavGroup;

const link = (label: string, href: string): RuNavLink => ({
  type: 'link',
  label,
  href,
  isCurrent: false,
  attrs: {},
});

export const RU_NAV: RuNavEntry[] = [
  {
    type: 'group',
    label: '📂 Быстрый старт',
    collapsed: false,
    entries: [
      link('Обзор', '/ru/getting-started/'),
      link('Установка', '/ru/getting-started/installation/'),
      link('Быстрый старт', '/ru/getting-started/quick-start/'),
      link('Основные понятия', '/ru/getting-started/concepts/'),
    ],
  },
  {
    type: 'group',
    label: '⚙️ Конфигурация',
    collapsed: false,
    entries: [
      link('Форматы конфигурации', '/ru/configuration/config-formats/'),
      link('Корни и исключения', '/ru/configuration/roots-ignore/'),
      link('Сущности и совпадения', '/ru/configuration/entities-matches/'),
      link('Слои', '/ru/configuration/layers/'),
      link('Свои правила', '/ru/configuration/custom-rules/'),
    ],
  },
  {
    type: 'group',
    label: '🛠️ CLI и интеграции',
    collapsed: false,
    entries: [
      link('Команды и флаги', '/ru/cli/commands/'),
      link('Интеграция с CI/CD', '/ru/cli/ci-cd/'),
      link('Контракт для ИИ-ассистентов', '/ru/cli/ai-contract/'),
    ],
  },
  {
    type: 'group',
    label: '🏛️ Рецепты архитектур',
    collapsed: false,
    entries: [
      link('Feature-Sliced Design (FSD)', '/ru/recipes/fsd/'),
      link('Deep Tree', '/ru/recipes/deep-tree/'),
      link('Монорепо', '/ru/recipes/monorepo/'),
      link('Внедрение в легаси-проект', '/ru/recipes/legacy-migration/'),
      link('Документация и переводы', '/ru/recipes/docs-i18n/'),
    ],
  },
  {
    type: 'group',
    label: '📖 Справочник',
    collapsed: false,
    entries: [
      link('Справочник встроенных правил', '/ru/reference/built-in-rules/'),
      link(
        'Устранение проблем и безопасность',
        '/ru/reference/troubleshooting/'
      ),
    ],
  },
];

/** Сравнение путей без учёта завершающего слеша. */
const normalize = (path: string) => path.replace(/\/+$/, '') || '/';

/** Возвращает копию дерева навигации с проставленным `isCurrent`. */
export function getRuSidebar(pathname: string): RuNavEntry[] {
  const current = normalize(pathname);

  const visit = (entries: RuNavEntry[]): RuNavEntry[] =>
    entries.map((entry) => {
      if (entry.type === 'link') {
        return { ...entry, isCurrent: normalize(entry.href) === current };
      }
      return { ...entry, entries: visit(entry.entries) };
    });

  return visit(RU_NAV);
}

/** Возвращает ссылки «назад/вперёд» для страницы по её пути. */
export function getRuPrevNext(pathname: string): {
  prev: RuNavLink | undefined;
  next: RuNavLink | undefined;
} {
  const links: RuNavLink[] = [];
  const collect = (entries: RuNavEntry[]) => {
    for (const entry of entries) {
      if (entry.type === 'link') links.push(entry);
      else collect(entry.entries);
    }
  };
  collect(RU_NAV);

  const current = normalize(pathname);
  const index = links.findIndex((item) => normalize(item.href) === current);
  if (index === -1) return { prev: undefined, next: undefined };

  const copy = (item: RuNavLink | undefined) =>
    item ? { ...item, isCurrent: false } : undefined;

  return { prev: copy(links[index - 1]), next: copy(links[index + 1]) };
}
