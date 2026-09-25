import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const read=(path)=>readFile(new URL(`../../${path}`,import.meta.url),'utf8');
test('Vercel and Netlify expose the same profile rewrite',async()=>{const [vercel,netlify,redirects]=await Promise.all([read('vercel.json'),read('netlify.toml'),read('_redirects')]);assert.match(vercel,/\/u\/:username/);assert.match(netlify,/\/u\/:username/);assert.match(redirects,/\/u\/:username/)});
test('deployment targets set baseline browser protections',async()=>{const [vercel,netlify,headers]=await Promise.all([read('vercel.json'),read('netlify.toml'),read('_headers')]);for(const source of [vercel,netlify,headers]){assert.match(source,/Content-Security-Policy/i);assert.match(source,/X-Content-Type-Options/i);assert.match(source,/Referrer-Policy/i);assert.match(source,/Permissions-Policy/i)}});
