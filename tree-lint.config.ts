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
    translation: {
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
      entities: ['translation'],
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
});

createConfig({
  roots: ['src'],
  entities: {
    component: {
      // как мы определяем сущность, в данном случае через имя
      // в будущем будет возможность добавлять флаги в файлы и через них указывать сущность, без обязательного этого поля
      matches: {
        type: 'directory', // это должна быть папка
        name: '[A-Z]Cmp.tsx', // название произвольное + окончание Cmp
        children: [{ type: 'file', name: 'index' }], // по наличию файла index, можно добавить еще несколько файлов для нахождения
      },
      // Правила валидации сущности
      rules: {
        // обязательно должны содержать файлы или папки
        includes: [
          { type: 'file', name: '*.tsx' }, // файл разметки,
          { type: 'file', name: 'index' }, // индексный файл можем и не указывать если по нему мы определяли сущность
        ],
        // // обязательно не должно содержать файлы или папки
        excludes: [{ type: 'directory', name: '*' }], // исключаем любые папки внутри (чисто для примера)

        // описание правил для дочерних нодов
        children: [
          {
            // index.ts | tsx
            _matches: { type: 'file', name: 'index' }, // находим нужные файлы тот же индекс
            // размер, не пустой но и не превышающий 10 кб(не помню точно в чем измеряется)
            size: {
              type: 'warning',
              min: 1,
              max: 2,
            },
            // валидируем имя, в частности интересует формат
            name: {
              type: 'error', // тип ошибки
              pattern: 'index.ts|tsx', // проверящий патерн
              message: 'Не верный формат файла',
            },
          },
          {
            // валидируем имя файла стилей, в частности интересует формат и преставка по которой мы определяем что это стиль
            _matches: { type: 'file', name: '*.css|scss' },
            size: {
              // предупреждаем если размер будет маленький или очень большой
              type: 'warning',
              min: 1,
              max: 10000,
            },
            name: {
              type: 'error',
              pattern: '[A-Z].module.scss', // указываем что файл должен заканчиваться на module и иметь формат scss или css
              message: 'Не верный нейминг файла',
            },
          },
          {
            // главный файл разметки
            // ищем по формату файла
            _matches: { type: 'file', name: '*.ts|tsx' },
            name: {
              type: 'error',
              // в будущем планируется добавить ко многим местам возможность добавлять шаблоны {{parentName}} где будет указано имя файла родителя и тп
              pattern: 'camelCase', // должен быть camelCase
              message: 'Не верный нейминг файла',
            },
            size: {
              type: 'warning',
              min: 1,
              max: 10000,
              message: 'Некоректный вес файла',
            },
          },
        ],
      },
    },
    hook: {
      matches: {
        type: 'file',
        name: 'use[A-Z].ts|tsx', // начинается на use
      },
      rules: {
        // предупреждаем если название короткое или слишком длинное
        nameLength: {
          type: 'warning',
          min: 4,
          max: 30,
        },
        // начинается на use должен быть кемелкейсом
        name: { type: 'error', pattern: 'camelCase' },
      },
    },
  },
  layers: {
    components: {
      entities: ['component'], // внутри слоя будут искаться только компоненты
    },
    hooks: {
      entities: ['hook'], // внутри слоя будут валидироваться только хуки
    },
  },
});
