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
  link('🚀 Быстрый старт', '/ru/getting-started/quick-start/'),
  {
    type: 'group',
    label: '📚 Основы и концепция',
    collapsed: false,
    entries: [
      {
        type: 'group',
        label: '💡 Концепция',
        collapsed: false,
        entries: [
          link('Вступление', '/ru/concepts/intro/'),
          link('Слои', '/ru/concepts/layers/'),
          link('Сущности', '/ru/concepts/entities/'),
          link('Группы', '/ru/concepts/groups/'),
          link('Флоу работы', '/ru/concepts/workflow/'),
        ],
      },
      {
        type: 'group',
        label: '🔍 Определение (Matching)',
        collapsed: false,
        entries: [
          link('Как покрыть проект', '/ru/matching/coverage/'),
          link('Определение сущности', '/ru/matching/entities/'),
          link('Определение слоя', '/ru/matching/layers/'),
          link('Определение группы', '/ru/matching/groups/'),
        ],
      },
      {
        type: 'group',
        label: '✅ Правила валидации',
        collapsed: false,
        entries: [
          link('Валидация слоя', '/ru/validation/layers/'),
          link('Валидация группы', '/ru/validation/groups/'),
          link('Валидация сущности', '/ru/validation/entities/'),
        ],
      },
      {
        type: 'group',
        label: '⚙️ Конфигурация',
        collapsed: false,
        entries: [
          link('Форматы конфигурации', '/ru/configuration/config-formats/'),
          link(
            'Корни (roots) и исключения (ignore)',
            '/ru/configuration/roots-ignore/'
          ),
        ],
      },
    ],
  },
  {
    type: 'group',
    label: '🏛️ Рецепты архитектур',
    collapsed: false,
    entries: [
      link('DeepTree', '/ru/recipes/deep-tree/'),
      link('Feature-Sliced Design (FSD)', '/ru/recipes/fsd/'),
    ],
  },
  {
    type: 'group',
    label: '🛠️ CLI и Автоматизация',
    collapsed: false,
    entries: [
      link('Команды и флаги CLI (scan / init)', '/ru/cli/commands/'),
      link('Интеграция с CI/CD и Git Hooks', '/ru/cli/ci-cd/'),
    ],
  },
  {
    type: 'group',
    label: '📖 Справочник',
    collapsed: false,
    entries: [
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
