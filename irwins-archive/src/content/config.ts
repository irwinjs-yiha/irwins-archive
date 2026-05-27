import { defineCollection, z } from 'astro:content';

const writing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    cover: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
  }),
});

const films = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    year: z.number(),
    poster: z.string().optional(),
    tagline: z.string(),
    date: z.coerce.date(),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    type: z.string(),
    status: z.string(),
    cover: z.string().optional(),
    excerpt: z.string(),
    tags: z.array(z.string()).optional().default([]),
    link: z.string().optional(),
  }),
});

export const collections = { writing, films, projects };
