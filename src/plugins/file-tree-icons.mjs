/**
 * Sätteri hast plugin (Astro markdown pipeline) that renders ASCII file trees as
 * icon rows, so `tree` examples in the docs look like a file explorer.
 *
 * A fence is rendered when it is labelled `tree` (also `filetree`, `file-tree`,
 * `filestructure`) or - for unlabelled/`text` fences - when its content looks
 * like a file tree.
 *
 * Icon names and artwork come from the Material Icon Theme extension
 * (`material-icon-theme`, MIT, (c) Philipp Kief), the same source the
 * "Material Icon Theme"/"Atom Material Icons" IDE plugins use.
 * https://github.com/material-extensions/vscode-material-icon-theme
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { fromHtml } from 'hast-util-from-html';

const require = createRequire(import.meta.url);
const themeDir = path.dirname(
  require.resolve('material-icon-theme/package.json')
);
const theme = JSON.parse(
  readFileSync(path.join(themeDir, 'dist', 'material-icons.json'), 'utf8')
);

/** Languages that always contain a file tree. */
const TREE_LANGS = new Set(['tree', 'filetree', 'file-tree', 'filestructure']);
/** Languages that are scanned for tree content, because unlabelled fences are common. */
const SCANNED_LANGS = new Set([
  '',
  'text',
  'txt',
  'plain',
  'plaintext',
  ...TREE_LANGS,
]);

/** Characters allowed in the indentation prefix: guides, dashes and the spaces between them. */
const INDENT_CHARS = new Set([' ', '\t', '│', '┃', '─', '━']);
/**
 * One nesting level in the source text: a guide, a branch marker or plain spaces
 * followed by three spaces (`│   `, `├── `). The last group of a prefix is the
 * branch marker of the entry itself.
 */
const INDENT_LEVEL_WIDTH = 4;
/** Characters that start a tree entry. */
const BRANCH_CHARS = new Set(['├', '┣', '└', '┗', '╰', '╭']);
/** Trailing annotation, e.g. `Button.tsx  ← 250 lines`. */
const ANNOTATION_RE = /^(.*?\S)\s{2,}((?:←|→|#|\/\/).*)$/;
/** Explicit color in the icon artwork, used to tint the entry name. */
const COLOR_RE = /#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi;

/**
 * hast property name -> attribute name, for every attribute used by the theme's
 * icons. Sätteri writes declarative property keys to the output verbatim, so
 * they have to be the real HTML/SVG attribute names.
 */
const ATTRIBUTE_NAMES = {
  className: 'class',
  clipPath: 'clip-path',
  clipPathUnits: 'clipPathUnits',
  clipRule: 'clip-rule',
  fillOpacity: 'fill-opacity',
  fillRule: 'fill-rule',
  gradientTransform: 'gradientTransform',
  gradientUnits: 'gradientUnits',
  imageRendering: 'image-rendering',
  paintOrder: 'paint-order',
  preserveAspectRatio: 'preserveAspectRatio',
  shapeRendering: 'shape-rendering',
  stopColor: 'stop-color',
  stopOpacity: 'stop-opacity',
  strokeLineJoin: 'stroke-linejoin',
  strokeMiterLimit: 'stroke-miterlimit',
  strokeWidth: 'stroke-width',
  textRendering: 'text-rendering',
  viewBox: 'viewBox',
  xLinkHref: 'xlink:href',
  xmlSpace: 'xml:space',
  xmlnsXLink: 'xmlns:xlink',
};
/** Theme metadata that means nothing outside of VS Code, or duplicates our own markup. */
const DROPPED_ATTRIBUTES = new Set([
  'aria-label',
  'data-mit-no-recolor',
  'data-name',
]);

const iconCache = new Map();

function readIcon(key) {
  let svg = iconCache.get(key);

  if (svg === undefined) {
    const definition =
      theme.iconDefinitions[key] ?? theme.iconDefinitions[theme.file];
    // `iconPath` is relative to the theme file itself.
    svg = readFileSync(
      path.resolve(themeDir, 'dist', definition.iconPath),
      'utf8'
    );
    iconCache.set(key, svg);
  }

  return svg;
}

/** Icon key for a folder/file name, following the Material Icon Theme lookup order. */
export function resolveIconKey(name, isDir) {
  const lowerName = name.toLowerCase();

  if (isDir) {
    return (
      theme.folderNames[lowerName] ?? theme.folderNames[name] ?? theme.folder
    );
  }

  const exact = theme.fileNames[name] ?? theme.fileNames[lowerName];
  if (exact) return exact;

  // Compound extensions (`.module.css`, `.lib.ts`) win over the last one.
  const parts = lowerName.split('.');
  for (let i = 1; i < parts.length; i += 1) {
    const extension = theme.fileExtensions[parts.slice(i).join('.')];
    if (extension) return extension;
  }

  return theme.file;
}

/** Whether a `#rgb`/`#rrggbb` color is far enough from black and white to tint text. */
function isVisible(color) {
  const hex =
    color.length === 4 ? color.replace(/\w/g, '$&$&').slice(1) : color.slice(1);
  const [r, g, b] = [0, 2, 4].map(
    (i) => parseInt(hex.slice(i, i + 2), 16) / 255
  );
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > 0.12 && luminance < 0.9;
}

/** Most frequent explicit color of the icon artwork. */
function iconColor(svg) {
  const counts = new Map();

  for (const color of svg.match(COLOR_RE) ?? []) {
    const key = color.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts]
    .sort((a, b) => b[1] - a[1])
    .find(([color]) => isVisible(color))?.[0];
}

/**
 * Splits a row prefix into one cell per nesting level, counting from the right,
 * so the marker cell never ends up shorter than `INDENT_LEVEL_WIDTH`.
 */
export function splitIndentCells(indices) {
  const cells = [];

  for (let end = indices.length; end > 0; end -= INDENT_LEVEL_WIDTH) {
    cells.unshift(indices.slice(Math.max(0, end - INDENT_LEVEL_WIDTH), end));
  }

  return cells;
}

/** Splits one line into its indentation prefix and its entry. */
function splitEntry(line) {
  let index = 0;

  while (index < line.length) {
    const char = line[index];

    if (INDENT_CHARS.has(char)) {
      index += 1;
      continue;
    }
    if (!BRANCH_CHARS.has(char)) break;

    // A branch marker is followed by dashes and a single space.
    index += 1;
    while (line[index] === '─' || line[index] === '━') index += 1;
    if (line[index] === ' ') index += 1;
    break;
  }

  const label = line.slice(index).replace(/\s+$/, '');
  if (!label) return undefined;

  const annotation = ANNOTATION_RE.exec(label);
  const name = annotation ? annotation[1] : label;
  if (!/^\S+$/.test(name)) return undefined;

  return {
    indices: line.slice(0, index),
    name,
    isDir: name.endsWith('/'),
    annotation: annotation ? annotation[2] : undefined,
  };
}

/**
 * Parses fence content into rows, or returns `undefined` when it is not a file tree.
 * Pass `isForced` for an explicitly labelled tree fence.
 */
export function parseTree(text, isForced) {
  const lines = text.replace(/\r\n?/g, '\n').replace(/\s+$/, '').split('\n');
  const rows = lines.map((line) => ({ line, entry: splitEntry(line) }));
  const entries = rows.filter((row) => row.entry);

  if (!isForced) {
    const branchEntries = entries.filter((row) => row.entry.indices);
    if (entries.length < 2 || branchEntries.length < entries.length / 2) {
      return undefined;
    }
  }

  return rows;
}

/** Renames hast properties to real attribute names and drops theme metadata. */
function normalize(node, attributes) {
  if (node.type === 'element') {
    const properties = { ...attributes };

    for (const [key, value] of Object.entries(node.properties ?? {})) {
      const name =
        ATTRIBUTE_NAMES[key] ?? key.replace(/([A-Z])/g, '-$1').toLowerCase();
      if (DROPPED_ATTRIBUTES.has(name)) continue;

      properties[name] = value;
    }

    node.properties = properties;
    // Lower-cased SVG tag names (`clippath`, `lineargradient`) are what the HTML
    // parser expects; it restores the camelCase SVG element names itself.
    node.tagName = node.tagName.toLowerCase();
  }

  for (const child of node.children ?? []) normalize(child, {});

  return node;
}

/**
 * Inlines an icon as an `svg` node. Icons are inlined per row, so the ids they
 * reference internally have to be namespaced to stay unique on the page.
 */
function inlineIcon(key, prefix) {
  const source = readIcon(key);
  const namespace = `${prefix}${key.replace(/\W/g, '-')}-`;
  const [node] = fromHtml(
    source.replace(
      /(id="|url\(#|href="#)([\w-]+)/g,
      (_match, head, id) => `${head}${namespace}${id}`
    ),
    { fragment: true }
  ).children;

  normalize(node, { class: 'tl-ft-icon', 'aria-hidden': 'true' });

  return { node, color: iconColor(source) };
}

const element = (tagName, properties, children) => ({
  type: 'element',
  tagName,
  properties,
  children,
});
const text = (value) => ({ type: 'text', value });

function renderRow(row, prefix) {
  if (!row.entry)
    return element('div', { class: 'tl-ft-line' }, [text(row.line)]);

  const { indices, name, isDir, annotation } = row.entry;
  const icon = inlineIcon(
    resolveIconKey(name.replace(/\/$/, ''), isDir),
    prefix
  );
  const properties = { class: 'tl-ft-line' };
  if (icon.color) properties.style = `--tl-ft-c:${icon.color}`;

  const children = [];
  for (const cell of splitIndentCells(indices ?? '')) {
    children.push(element('span', { class: 'tl-ft-guides' }, [text(cell)]));
  }
  children.push(
    icon.node,
    element('span', { class: 'tl-ft-name' }, [text(name)])
  );
  if (annotation) {
    children.push(
      element('span', { class: 'tl-ft-annotation' }, [text(annotation)])
    );
  }

  return element('div', properties, children);
}

/**
 * Sätteri hast plugin definition.
 *
 * Registered as the first `hastPlugins` entry so it sees the plain
 * `<pre><code>` before Expressive Code frames it - and so the markup it returns
 * (which has no `pre`) is left alone by Expressive Code.
 */
export default function fileTreeIcons() {
  let blockIndex = 0;

  return {
    name: 'file-tree-icons',
    element: {
      filter: ['pre'],
      visit(node, ctx) {
        const [code] = node.children ?? [];
        if (
          node.children?.length !== 1 ||
          code?.type !== 'element' ||
          code.tagName !== 'code'
        ) {
          return;
        }

        const lang =
          /^language-(.+)$/.exec(code.properties?.className?.[0])?.[1] ?? '';
        if (!SCANNED_LANGS.has(lang)) return;

        const rows = parseTree(ctx.textContent(node), TREE_LANGS.has(lang));
        if (!rows) return;

        const file = ctx.fileURL ? path.basename(ctx.fileURL.pathname) : '';
        const slug =
          file.replace(/\.[^.]+$/, '').replace(/\W/g, '-') || 'inline';
        const prefix = `tlft-${slug}-${blockIndex}-`;
        blockIndex += 1;

        return element('div', { class: 'tl-ft', dir: 'ltr' }, [
          // The row number is part of the icon namespace, so a repeated icon
          // inside one block cannot produce duplicate ids.
          ...rows.map((row, index) => renderRow(row, `${prefix}${index}-`)),
        ]);
      },
    },
  };
}
