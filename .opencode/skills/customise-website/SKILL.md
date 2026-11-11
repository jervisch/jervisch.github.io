---
name: customise-website
description: Use when the user wants to personalize or make the site template their own — replacing placeholder identity, colors, fonts, About page content, or the Now section with their real info.
---

# Skill: customise-website

Interactive personalization of site config, colors, fonts, About page, and "Now" section.

## When to Use

User wants to make the template their own — replace placeholder content with their real info.

## Workflow

### 1. Site Identity (`src/config.ts`)

Prompt for each field, show current value:

```
Current: name = "Jervis Chan"
Enter your name (or press Enter to keep):
```

Also prompt for:
- `tagline` — one line shown under the hero and used for meta descriptions
- `hero.greeting` — the hero's opening line (e.g. "Hi, I am YourName.")
- `hero.statements` — one statement per line; they cycle through the hero

Update `src/config.ts` with responses.

### 2. Color Palette (`src/styles/global.css`)

Offer presets instead of raw hex:

| Preset | `--bg` | `--text` | `--accent` | `--muted` | `--border` | `--card` | `--wave` |
|--------|--------|----------|------------|-----------|------------|----------|----------|
| Earth (default) | `#FAF7F2` | `#2B2520` | `#5B6B4A` | `#8B7D6B` | `#E8E0D4` | `#FFFFFF` | `#5B6B4A` |
| Ocean | `#F0F5F8` | `#1B2A3A` | `#3A7CA5` | `#7A9BAE` | `#D0DCE6` | `#FFFFFF` | `#3A7CA5` |
| Forest | `#F0F5F0` | `#1A2E1A` | `#4A7C4A` | `#7A9B7A` | `#D0E6D0` | `#FFFFFF` | `#4A7C4A` |
| Sunset | `#FFF8F0` | `#3D2B1F` | `#D46B3A` | `#B88B6B` | `#F5E0D0` | `#FFFFFF` | `#D46B3A` |
| Monochrome | `#FAFAFA` | `#1A1A1A` | `#333333` | `#888888` | `#E0E0E0` | `#FFFFFF` | `#333333` |
| Custom | User enters hex values |

Apply chosen preset to both `:root` and `[data-theme="dark"]` blocks (dark variants provided in SETUP.md).

### 3. Typography

Current: `@fontsource/outfit` (Outfit)
Option: Install different `@fontsource/*` package, update imports in `global.css`, update `font-family`.

```bash
npm install @fontsource/inter  # example
```

### 4. About Page Photo

```bash
# User provides image path
cp /path/to/photo.jpg public/images/about.jpg
```

Update `src/pages/about.astro` — replace placeholder with:
```astro
<img src="/images/about.jpg" alt="Your Name" class="about-photo" />
```

### 5. "Now" Line (`SITE.now` in `src/config.ts`)

Prompt for a one-line status update, then set it in `src/config.ts`:

```typescript
now: "Currently building X, learning Y.",
```

It renders as one italic line on the About page.

### 6. Custom Domain (Optional)

Create `public/CNAME` with domain, remind about DNS config.

### 7. Placeholder Content Cleanup

List all placeholder files, ask which to delete/replace:

```
Placeholder files to review:
- src/content/notes/hello-world.md
- src/content/notes/how-i-take-notes.md
- src/content/notes/what-im-reading.md
- src/content/notes/on-taking-more-photos.md
- src/content/notes/things-im-learning.md
- src/content/notes/_example.md, _ideas.md, _on-systems-thinking.md, _the-art-of-running-systems-at-scale.md (templates, never published)
- src/content/projects/_90-day-recomp.md, _runbook-generator.md, _example.md (templates)
- src/content/projects/portfolio.md
- src/content/photos/*/*.md (20 files)

Action for each: [delete] [replace] [mark draft] [keep]
```

### 8. Preview & Verify

```bash
npm run dev
# or Codespaces: Code → Codespaces → Create codespace on main
```

Check: homepage hero, nav, all listing pages, detail pages, dark/light toggle, About page, Now section.

### 9. Commit & Push

```bash
git add -A
git commit -m "Personalize site: config, colors, content"
git push origin main
```

Remind user to check Actions tab for deploy.

## Notes

- Never commit real personal data without explicit confirmation
- Always preview before pushing
- Point user to SETUP.md for reference after skill completes