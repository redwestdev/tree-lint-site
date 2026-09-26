## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## File trees in documentation

File structures in the docs are rendered as icon rows by `src/plugins/file-tree-icons.mjs` (Sätteri hast plugin) and styled by `src/styles/file-tree.css`:

- A `tree` fence (also `filetree`, `file-tree`, `filestructure`) is always rendered.
- Unlabelled and `text` fences are rendered when the content looks like a tree: at least two entries, and at least half of them with a branch marker (`├──`, `└──`).
- Fences in any other language are left alone, so CLI output and lint messages stay code blocks.
- Icons and name colors come from [material-icon-theme](https://github.com/material-extensions/vscode-material-icon-theme) (MIT), resolved from the file/folder name.
- Trees are plain `div`s, so they have no copy button and no Expressive Code frame.
- Indentation comes from one cell per nesting level; its width is `--tl-ft-indent-step` in `src/styles/file-tree.css` (`2ch` by default, `4ch` restores the full `├── ` markers). Each cell holds the four source characters of that level, and whatever does not fit is clipped, so the documents themselves never need re-indenting.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
