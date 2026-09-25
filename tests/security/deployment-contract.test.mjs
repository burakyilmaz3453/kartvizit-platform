import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
const read=(path)=>readFile(new URL(`../../${path}`,import.meta.url),'utf8');
test('Vercel is the sole deployment target',async()=>{const vercel=await read('vercel.json');assert.match(vercel,/\/u\/:username/);for(const file of ['netlify.toml','_headers','_redirects'])await assert.rejects(access(new URL(`../../${file}`,import.meta.url)))});
test('Vercel sets baseline browser protections',async()=>{const vercel=await read('vercel.json');for(const header of ['Content-Security-Policy','X-Content-Type-Options','Referrer-Policy','Permissions-Policy'])assert.match(vercel,new RegExp(header,'i'))});
test('Vercel CSP permits Cloudflare Turnstile',async()=>{assert.match(await read('vercel.json'),/https:\/\/challenges\.cloudflare\.com/)});
test('production files contain no Netlify references',async()=>{const files=['index.html','login.html','register.html','nfc.html','iletisim.html','gizlilik.html','kullanim-sartlari.html','sitemap.xml','robots.txt','README.md'];for(const file of files)assert.doesNotMatch(await read(file),/netlify/i,`${file} still references Netlify`)});
