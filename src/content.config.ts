import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    series: z.string().optional(),
    order: z.number().default(0),
  }),
});

const photos = defineCollection({
  // Underscore-prefixed files are templates and stay unpublished
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/photos' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    image: z.string(),
    caption: z.string().optional(),
    location: z.string().optional(),
    size: z.enum(['square', 'tall', 'wide']).default('square'),
    collection: z.string(),
    // At most one photo per collection should set cover: true — it becomes the
    // main image on the homepage carousel and the /photos grid. Falls back to
    // the newest photo by date when no cover is set.
    cover: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    url: z.string().optional(),
    order: z.number().default(1),   // lower sorts first; the homepage takes the first 3
    year: z.number().optional(),
    status: z.enum(['growing', 'exploring', 'finished', 'paused']).optional(),
    cover: z.string().optional(),
    relatedWork: z.array(z.string()).default([]),  // refs like "notes/my-note" — rendered as a timeline
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { notes, projects, photos };
