# Agent Guidelines for jervisch.github.io

> Also readable as `CLAUDE.md` (symlinked to this file).

## Skills

Prefer these skills over manual file edits when available:
- **`creating-new-content-type`** — scaffolds a new content collection (schema, folder, pages, nav link, homepage section)
- **`customise-website`** — walks through personalizing site config, colors, fonts, About page, and "Now" section

Never commit real personal data on this user's behalf without confirming it's actually theirs to publish — this is a public GitHub Pages site.

## Quick Start
- Install: `npm install`
- Dev server: `npm run dev` (http://localhost:4321)
- Build: `npm run build` (outputs to `dist/`)
- Preview: `npm run preview`

## Content Model
All content lives in `src/content/` as Markdown with YAML frontmatter. Folder
name, collection key, route, and headings all use the same word:
- **Notes** (`src/content/notes/`) — published at `/notes/`: title, date, description?, tags?, draft?, series?, order?
- **Projects** (`src/content/projects/`) — published at `/projects/`: title, description, url?, order? (ascending; the homepage shows the first three), year?, status? (growing/exploring/finished/paused), cover?, relatedWork[], tags?
- **Photos** (`src/content/photos/`) — published at `/photos/`: title, date, image, caption?, location?, size? (square/tall/wide), collection, cover?, tags?
- **Experience** (`src/content/experience/`) — no route; rendered on About: role, organization, start (YYYY or YYYY-MM), end? (omit for Present), type (work/education/volunteer/course), location?, description?, order?

### Collection cover images
A collection's main image — the one shown on the homepage mosaic and the
`/photos` grid — is the photo with `cover: true`. Mark exactly one photo per
collection; if none is marked, the site falls back to the newest by date. The
flag is honoured in both `PhotoMosaic.astro` and `pages/photos/index.astro`,
so setting it changes both surfaces at once.
- **Now**: a single short line at `SITE.now` in `src/config.ts`, rendered inside About.
  It is state of mind, not a list of projects.

Files prefixed with `_` are templates and are never published.

### Adding Content
1. Create a `.md` file in the appropriate collection folder with required frontmatter.
2. For new collections:
   - Define schema in `src/content.config.ts`
   - Create folder `src/content/<collectionname>/`
   - Create list page `src/pages/<collectionname>/index.astro` (copy from projects)
   - Create detail page `src/pages/<collectionname>/[...slug].astro` (copy from projects)
   - Add an entry to `NAV_LINKS` in `src/config.ts`
   - Add homepage section in `src/pages/index.astro`
   - Add `relatedWork: ["collectionname/slug"]` to a project to feature that entry in its timeline

## Styling & Theming
- Design tokens: Edit CSS custom properties in `src/styles/global.css`
- Type system: semantic classes `.type-display`, `.type-title`, `.type-subtitle`, `.type-body`, `.type-meta`, `.type-label`, `.type-nav`
- Long-form reading styles: single shared `.prose` block in `global.css` — do not re-declare prose rules per page
- Layout: `.page-content` (max 1280px) plus `.editorial-grid`, which collapses 12 → 8 → 4 columns
- Section rhythm: `--section-pad` and `--heading-gap` in `global.css` drive every
  vertical boundary. Do not add ad-hoc `padding-block` values to individual sections.
  Two exceptions are intentional: `.hero`'s bottom offset, which positions the
  statement inside a viewport-height panel, and `ProjectEntry`'s item spacing, which
  separates entries rather than sections.
- Light/dark theme: Toggles `data-theme` attribute on `<html>`; persists via `localStorage`
- Theme toggle component: `src/components/ThemeToggle.astro`
- Fonts: `@fontsource/newsreader` (serif, display/prose headings) and `@fontsource/outfit` (sans, UI/body)

### Contrast requirement
Every text token must clear WCAG AA (4.5:1) against its background in **both**
themes. `--text-muted` and `--accent` carry small meta text, so they are held
near 4.8:1. If you change a token, re-check contrast rather than assuming.

## Routes
Folder, collection key, route, and headings all use the same word:
- `/projects/` ← `src/content/projects/`
- `/notes/` ← `src/content/notes/`
- `/photos/` ← `src/content/photos/`

There are no redirects. The site went live 2026-08-31 and has no inbound links worth
preserving, so a renamed route is simply gone. When you rename one, update
`NAV_LINKS` in `src/config.ts`, internal links, `src/components/Timeline.astro`'s
`REF_COLLECTIONS` list, and `src/pages/rss.xml.ts`.

## Configuration
- Site metadata (name, tagline, location, social links) and `NAV_LINKS`: `src/config.ts`
- Astro config: `astro.config.mjs` (site URL, integrations, markdown syntax highlighting)
- TypeScript config: `tsconfig.json` (extends `astro/tsconfigs/strict` with path alias `@/*` → `src/*`)

## Deployment
- Static site: `npm run build` → output in `dist/`
- Deploy `dist/` to any static host (GitHub Pages, Netlify, Vercel, etc.)
- For GitHub Pages: Push to `main` branch (if GitHub Actions workflow is configured)

## Development Notes
- No linting, formatting, or test setup configured (eslint, prettier, vitest absent)
- Uses Astro's built-in Markdown and MDX support
- Client-side interactivity via `astro/components/ClientRouter.astro` for SPA navigation
- Scripts that bind to DOM must re-init on `astro:after-swap`, and must guard against double-binding (e.g. a `dataset.bound` flag)
- No UI framework. Progressive enhancement only: every page must remain readable and navigable with JavaScript disabled
- `prefers-reduced-motion` is a hard requirement for all animation
- Photography placeholders: `src/lib/photoGradient.ts` resolves whether an image exists at build time via `photoExists()`, and `getPhotoGradient()` supplies the fallback. Only emit an `<img>` when `photoExists()` is true — never render an `<img>` that 404s
- RSS feed: `@astrojs/rss` integration
- Sitemap: `@astrojs/sitemap` integration

## Component Inventory
Editorial sections (homepage): `HeroAnimation`, `ProjectEntry`, `NoteList`,
`PhotoMosaic` (composed from `PhotoTile`)
About-only: `ExperienceTimeline`
Retained: `Nav`, `Footer`, `GalleryGrid`, `Lightbox`, `Timeline`, `ThemeToggle`,
`ReadingProgress`, `ShareButton`

Section headings on the homepage are inlined in `src/pages/index.astro` and use
the global `.section-header` / `.section-view-all` pair from `global.css`. Do not
reintroduce a heading-owning component — `PhotoMosaic` in particular renders
photos only and must not own its own heading.

## File Extensions
- `.astro`: Astro components (pages, layouts, UI components)
- `.md`: Content files (frontmatter + Markdown)
- `.ts`: TypeScript configs and utilities
- `.css`: Global styles and tokens
- `.mjs`: ESM config files