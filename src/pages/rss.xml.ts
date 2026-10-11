import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../config';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const notes = (await getCollection('notes'))
    .filter(n => !n.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: SITE.name,
    description: SITE.tagline,
    site: context.site!,
    items: notes.map(note => ({
      title: note.data.title,
      pubDate: note.data.date,
      description: note.data.description || '',
      link: `/notes/${note.id}/`,
    })),
  });
}
