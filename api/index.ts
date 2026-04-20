/**
 * Root-level Vercel serverless function entry point.
 * Re-exports the NestJS handler so Vercel picks it up at /api/index.
 * All /api/* requests are rewritten here via vercel.json rewrites.
 */
export { default } from '../apps/backend/api/index.js';
