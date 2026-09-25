import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const read=(path)=>readFile(new URL(`../../${path}`,import.meta.url),'utf8');
const pages=['index.html','card.html','dashboard.html','login.html','register.html','reset.html','nfc.html','iletisim.html','gizlilik.html','kullanim-sartlari.html','404.html'];
test('every page loads the shared redesign layer',async()=>{for(const page of pages)assert.match(await read(page),/\/assets\/css\/redesign\.css/,`${page} lacks redesign.css`)});
test('redesign defines premium responsive surfaces and page-specific layouts',async()=>{const css=await read('assets/css/redesign.css').catch(()=> '');for(const token of ['backdrop-filter','linear-gradient','@media','min-height:44px','.hero','.dashboard-container','.card-header','.auth-shell'])assert.match(css,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')))});
test('redesign preserves reduced motion and visible focus',async()=>{const css=await read('assets/css/redesign.css').catch(()=> '');assert.match(css,/prefers-reduced-motion/);assert.match(css,/:focus-visible/)});

test('card header keeps the overlapping profile photo visible',async()=>{
  const css=await read('assets/css/redesign.css');
  assert.doesNotMatch(css,/\.card-header\s*\{[^}]*overflow\s*:\s*hidden/i);
  assert.match(css,/\.card-header\s*\{[^}]*overflow\s*:\s*visible/i);
});

test('forgot-password control is styled as an accessible text link',async()=>{
  const login=await read('login.html');
  assert.match(login,/\.forgot button\s*\{/);
  assert.match(login,/\.forgot button:focus-visible\s*\{/);
  assert.match(login,/<button[^>]+id="forgot-password"[^>]+class="forgot-link"/);
});

test('auth pages share the restrained auth design without marketing superlatives',async()=>{
  for(const page of ['login.html','register.html','reset.html']) assert.match(await read(page),/assets\/css\/auth\.css/);
  for(const page of pages) assert.doesNotMatch(await read(page),/premium|stüdyo|altın standardı/i,`${page} contains marketing copy`);
});

test('dashboard uses a sticky responsive two-column workspace',async()=>{const css=await read('assets/css/dashboard.css');assert.match(css,/grid-template-columns:minmax\(0,1fr\) minmax\(320px,430px\)/);assert.match(css,/\.preview-column\{position:sticky/);assert.match(css,/@media\(max-width:900px\)/);assert.match(css,/min-width:320px/)});
