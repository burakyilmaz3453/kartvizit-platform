import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const read=(path)=>readFile(new URL(`../../${path}`,import.meta.url),'utf8');
const pages=['index.html','card.html','dashboard.html','login.html','register.html','reset.html','nfc.html','iletisim.html','gizlilik.html','kullanim-sartlari.html','404.html'];
test('every page loads the shared redesign layer',async()=>{for(const page of pages)assert.match(await read(page),/\/assets\/css\/redesign\.css/,`${page} lacks redesign.css`)});
test('redesign defines premium responsive surfaces and page-specific layouts',async()=>{const css=await read('assets/css/redesign.css').catch(()=> '');for(const token of ['backdrop-filter','linear-gradient','@media','min-height:44px','.hero','.dashboard-container','.card-header','.auth-shell'])assert.match(css,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')))});
test('redesign preserves reduced motion and visible focus',async()=>{const css=await read('assets/css/redesign.css').catch(()=> '');assert.match(css,/prefers-reduced-motion/);assert.match(css,/:focus-visible/)});
