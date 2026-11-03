#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';
import matter from 'gray-matter';

const collections = {
  notes: {
    dir: 'src/content/notes',
    required: ['title', 'date'],
    optional: ['description', 'tags', 'draft', 'series', 'order'],
    validate: (fm, file) => {
      if (fm.date && isNaN(Date.parse(fm.date))) {
        throw new Error(`Invalid date format in ${file}: ${fm.date}`);
      }
      if (fm.tags && !Array.isArray(fm.tags)) {
        throw new Error(`tags must be an array in ${file}`);
      }
      if (fm.draft !== undefined && typeof fm.draft !== 'boolean') {
        throw new Error(`draft must be boolean in ${file}`);
      }
      if (fm.order !== undefined && typeof fm.order !== 'number') {
        throw new Error(`order must be a number in ${file}`);
      }
    }
  },
  projects: {
    dir: 'src/content/projects',
    required: ['title', 'description'],
    optional: ['url', 'order', 'year', 'cover'],
    validate: (fm, file) => {
      if (fm.url && !fm.url.startsWith('http')) {
        throw new Error(`url must be a valid URL in ${file}: ${fm.url}`);
      }
      if (fm.order !== undefined && typeof fm.order !== 'number') {
        throw new Error(`order must be a number in ${file}`);
      }
      if (fm.year !== undefined && typeof fm.year !== 'number') {
        throw new Error(`year must be a number in ${file}`);
      }
      if (fm.cover && !fm.cover.startsWith('/images/projects/')) {
        throw new Error(`cover must start with /images/projects/ in ${file}: ${fm.cover}`);
      }
    }
  },
  photos: {
    dir: 'src/content/photos',
    required: ['title', 'date', 'image', 'collection'],
    optional: ['caption', 'location', 'size', 'tags'],
    validate: (fm, file) => {
      if (fm.date && isNaN(Date.parse(fm.date))) {
        throw new Error(`Invalid date format in ${file}: ${fm.date}`);
      }
      if (!fm.image?.startsWith('/images/photos/')) {
        throw new Error(`image must start with /images/photos/ in ${file}: ${fm.image}`);
      }
      const imagePath = path.join(process.cwd(), 'public', fm.image);
      if (!fs.existsSync(imagePath)) {
        console.warn(`⚠️  ${file}: image not found yet, will render as a gradient placeholder: ${fm.image}`);
      }
      if (fm.size && !['square', 'tall', 'wide'].includes(fm.size)) {
        throw new Error(`size must be square, tall, or wide in ${file}: ${fm.size}`);
      }
      if (fm.tags && !Array.isArray(fm.tags)) {
        throw new Error(`tags must be an array in ${file}`);
      }
    }
  }
};

async function validateCollection(name, config) {
  // A missing directory would glob to zero files and silently report "all
  // valid" — which is exactly what a rename looks like. Fail loudly instead.
  if (!fs.existsSync(config.dir)) {
    console.error(`❌ Collection "${name}" points at ${config.dir}, which does not exist`);
    return 1;
  }

  const files = await glob(`${config.dir}/**/*.md`);
  let errors = 0;

  for (const file of files) {
    if (path.basename(file).startsWith('_')) continue; // skip _example.md

    const content = fs.readFileSync(file, 'utf-8');
    const { data: fm } = matter(content);

    // Check required fields
    for (const field of config.required) {
      if (!fm[field]) {
        console.error(`❌ ${file}: missing required field "${field}"`);
        errors++;
      }
    }

    // Run custom validation
    try {
      config.validate(fm, file);
    } catch (e) {
      console.error(`❌ ${file}: ${e.message}`);
      errors++;
    }
  }

  return errors;
}

async function main() {
  console.log('🔍 Validating frontmatter...\n');

  let totalErrors = 0;

  for (const [name, config] of Object.entries(collections)) {
    console.log(`📁 ${name}:`);
    const errors = await validateCollection(name, config);
    totalErrors += errors;
    if (errors === 0) {
      console.log('   ✓ All files valid');
    }
    console.log('');
  }

  if (totalErrors > 0) {
    console.error(`\n❌ ${totalErrors} error(s) found`);
    process.exit(1);
  } else {
    console.log('✅ All frontmatter valid');
  }
}

main().catch(console.error);