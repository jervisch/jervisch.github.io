# Personal Portfolio

A minimal, extensible portfolio site built with [Astro](https://astro.build). Earth-tone palette, seaside-inspired ambient design, dark/light theming, and a content model where adding new work is as simple as writing a text file.

**Live:** [jervvs.github.io](https://jervvs.github.io)

**Want your own copy?** Click **Use this template** above — this gives you a clean copy with a single commit and none of my history. (Forking works too, but will carry over my full commit history.)

New to this? Start with SETUP.md for a step-by-step first run.

---

## Quick Start

```bash
git clone https://github.com/jervvs/jervvs.github.io.git
cd jervvs.github.io
npm install
npm run dev
# Open http://localhost:4321
```

---

## Content Model

All content lives in `src/content/`. Here, I have defined three content collection types:
1. Posts
2. Projects
3. Photos

The content model is supposed to easily extensible / replaceable. Simply define a collection in `content.config.ts` and you can go from there. Then adding new content is as easy as creating a new Markdown file with the right frontmatter.

### Writing (`src/content/posts/`)

Long-form essays and articles. Sorted by date, newest first.

```markdown
---
title: "Your Post Title"
date: 2026-06-20
description: "Summary for the listing card (optional)."
tags: ["topic", "another"]
draft: false
---

Your content here. Full Markdown supported.
```

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | Appears everywhere — cards, page, RSS |
| `date` | Yes | Controls sort order |
| `description` | No | Card summary. If omitted, card shows no description |
| `tags` | No | Powers the inline tag filter on the listing page |
| `draft` | No | `true` = hidden from production, visible in `npm run dev` |

**Listing page:** `/notes/` — an editorial index with inline tag filtering.
Paginated at 12 posts per page.

**Detail page:** `/notes/[slug]/` — prose with reading progress bar and share button.

### Photography (`src/content/photos/`)

Individual photos grouped into collections (e.g., "Singapore", "Tokyo", "AI Art").

```markdown
---
title: "Morning Tide"
date: 2026-05-15
image: "/images/photos/changi-beach.jpg"
caption: "First light on the shore"
location: "Changi Beach, Singapore"
size: "tall"
collection: "Singapore"
tags: ["sea", "morning"]
---
```

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | Shown in gallery overlay and lightbox |
| `date` | Yes | Sort within collection |
| `image` | Yes | Path to image file |
| `caption` | No | Shown in lightbox |
| `location` | No | Shown in overlay and lightbox |
| `size` | No | `square` (default), `tall` (2 rows), `wide` (2 columns) |
| `collection` | Yes | Groups photos into sections on the gallery page |
| `tags` | No | For future filtering |

**Gallery page:** `/photos/` — grid grouped by collection, with a lightbox on
click (keyboard navigable: arrows + Escape).

**Adding a new collection:** Just use a new `collection` name in any photo's frontmatter. It appears as a new section automatically.

### Projects (`src/content/projects/`)

Discrete things you've built. Each has a detail page with body content.

```markdown
---
title: "Project Name"
description: "One-line pitch."
url: "https://github.com/you/project"
order: 1
tags: ["tag"]
---

Write about the project here. What it does, why you built it.
Link to related writing or other work.
```

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | Project name |
| `description` | Yes | Card summary |
| `url` | No | External link — shows "View project ↗" on detail page |
| `order` | No | Sort key, ascending (defaults to `1`). The homepage shows the first three |
| `year` | No | Shown alongside the entry on the homepage and detail page |
| `status` | No | One of `growing`, `exploring`, `finished`, `paused` |
| `cover` | No | Path to a cover image for the homepage entry |
| `relatedWork` | No | Array of `"collection/id"` refs — renders as a date-sorted timeline on the detail page |
| `tags` | No | Filterable on listing page |

**Listing page:** `/building/` — an editorial index with inline tag filtering.

**Detail page:** `/building/[slug]/` — body content + auto-generated timeline of
related work, sorted by date + optional external link.

**The `relatedWork` ref format:** `"collection/id"` where collection is `posts` or `projects`, and id is the filename without `.md`. The template automatically looks up the title and date from the referenced content. No data duplication.

---

## Homepage

The homepage is a single editorial column in this order:

1. **Hero** — your name, tagline, and location.
2. **About** — a short statement, plus the "Now" line as one italic sentence,
   with a link to the full About page. The Now line reads from `SITE.now` in
   `src/config.ts` — edit that string directly.
3. **Building** — the first three projects by `order`, as numbered entries with
   status and year.
4. **Notes** — the five most recent posts, as a dated list.
5. **Photos** — an asymmetric spread of three photographs, drawn from distinct
   collections where possible.

Each section has a heading with a link to its full listing page.

---

## Tag Filtering

Notes and Building listing pages have tag filtering. Tags in frontmatter automatically appear as inline filter buttons. Clicking a tag filters the list instantly (client-side). The URL updates to `?tag=fitness` for sharing.

Tags on entries are display-only — the filter bar at the top of the listing page is the interactive element.

---

## Pagination

Notes paginates automatically at 12 posts per page. Pages are generated at build time as static HTML: `/notes/`, `/notes/2/`, `/notes/3/`, etc.

---

## Media in Posts

### Inline Image
```markdown
![Alt text](/images/your-image.jpg)
*Caption text*
```

### Side-by-Side Images
```html
<div class="media-pair">
  <figure>
    <img src="/images/left.jpg" alt="Left">
    <figcaption>Left</figcaption>
  </figure>
  <figure>
    <img src="/images/right.jpg" alt="Right">
    <figcaption>Right</figcaption>
  </figure>
</div>
```

### Video Embed
```html
<iframe width="100%" height="400" src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allowfullscreen></iframe>
```

---

## Adding a New Content Type

To add a completely new category (e.g., "Reviews"):

1. **Define the schema** in `src/content.config.ts`:
   ```typescript
   const reviews = defineCollection({
     loader: glob({ pattern: '**/*.md', base: './src/content/reviews' }),
     schema: z.object({
       title: z.string(),
       date: z.coerce.date(),
       // ... your fields
     }),
   });
   export const collections = { posts, photos, projects, reviews };
   ```

2. **Create the folder:** `src/content/reviews/`

3. **Create a listing page** at `src/pages/reviews/index.astro` — copy `src/pages/building/index.astro` as a template.

4. **Create a detail page** at `src/pages/reviews/[...slug].astro` — copy `src/pages/building/[...slug].astro`.

5. **Add a nav link** in `src/components/Nav.astro`:
   ```typescript
   { href: '/reviews/', label: 'Reviews' },
   ```

6. **Add a section to `src/pages/index.astro`** using `SectionHeading` plus the relevant entry component — query the collection, then render it inside a `<section class="section">`.

7. **Add content** — create `.md` files in `src/content/reviews/`.

8. **Reference from Building** — add `"reviews/my-review"` to any project's `relatedWork` array to show it in that project's timeline.

---

## Customization

### Colors
Edit CSS custom properties in `src/styles/global.css`:
```css
:root {
  --bg: #FAF7F2;        /* Page background */
  --text: #2B2520;       /* Primary text */
  --accent: #5B6B4A;     /* Links, active states */
  /* ... see file for all tokens */
}
```
Both light and dark themes are defined there.

### Typography
Uses [Outfit](https://fonts.google.com/specimen/Outfit) via `@fontsource/outfit`. To change: install a different `@fontsource/` package, update imports in `global.css`, update `font-family`.

### Site Info
Edit `src/config.ts` for name, tagline, bio, social links, and support/sponsorship links (e.g., Buy Me a Coffee).

### "Now" Line
Edit `SITE.now` in `src/config.ts` directly. It renders as one italic line in the About section of the homepage.

### About Page
Edit `src/pages/about.astro` directly. Replace the gradient placeholder with your own photo.

---

## Deployment

### GitHub Pages (default)
Auto-deploys via GitHub Actions on push to `main`. Workflow: `.github/workflows/deploy.yml`.

**First-time setup:**
1. Go to repo → Settings → Pages
2. Set Source to "GitHub Actions"
3. Push to `main`

### Custom Domain
1. Add a `CNAME` file to `public/` with your domain
2. Configure DNS per [GitHub's guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

### Other Hosts
Static HTML. `npm run build` → output in `dist/`. Works on Cloudflare Pages, Vercel, Netlify, S3.

---

## Project Structure

```
src/
├── config.ts                 # Site config (name, tagline, now, social, support)
├── content.config.ts         # Content collection schemas
├── styles/global.css         # Design tokens, spacing, animations, theme
├── layouts/
│   ├── BaseLayout.astro      # HTML shell, nav, footer, theme
│   └── PostLayout.astro      # Notes post layout
├── components/
│   ├── Nav.astro             # Desktop + mobile navigation
│   ├── ThemeToggle.astro     # Dark/light toggle
│   ├── SectionHeading.astro  # Section label + "all" link
│   ├── BuildingEntry.astro   # Numbered homepage entry
│   ├── NoteList.astro        # Dated editorial index
│   ├── PhotoFeature.astro    # Asymmetric homepage photo spread
│   ├── GalleryGrid.astro     # Photo archive grid
│   ├── Lightbox.astro        # Progressive-enhancement viewer
│   ├── Timeline.astro        # Related-work timeline on detail pages
│   ├── Footer.astro          # Site-wide footer with support link
│   ├── ReadingProgress.astro # Scroll progress bar
│   └── ShareButton.astro     # Web Share / copy link
├── content/
│   ├── posts/                # Notes (Markdown)
│   ├── photos/               # Photo entries
│   └── projects/             # Building entries
└── pages/                    # Routes: /, /notes/, /building/, /photos/, /about/
```

## License

MIT
