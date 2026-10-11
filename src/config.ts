export const SITE = {
  name: 'Jervis Chan',
  tagline: 'I make things, think about systems, and notice too much.',
  bio: 'An engineer in Singapore. I like understanding how things work, then making them work better.',
  now: 'Currently trying to learn about AI, or making content on tech.',
  location: 'Singapore',
  url: 'https://jervisch.github.io',
  social: {
    github: { url: 'https://github.com/jervisch', label: 'GitHub' },
    linkedin: { url: 'https://www.linkedin.com/in/jervis-chan/', label: 'LinkedIn' },
    tiktok: { url: 'https://www.tiktok.com/@jervisch', label: 'TikTok' },
    email: { url: 'mailto:chanjy09@live.com', label: 'Email' },
  },
  support: {
    buymeacoffee: { url: 'https://buymeacoffee.com/jervischan', label: 'Buy Me a Coffee' },
  },
};

// Single source of truth for site navigation. Shared by Nav.astro and 404.astro
// so the two can't drift. Each href matches its collection key and page folder —
// see src/content.config.ts.
export const NAV_LINKS = [
  { href: '/projects/', label: 'Projects' },
  { href: '/notes/', label: 'Notes' },
  { href: '/photos/', label: 'Photos' },
  { href: '/about/', label: 'About' },
] as const;
