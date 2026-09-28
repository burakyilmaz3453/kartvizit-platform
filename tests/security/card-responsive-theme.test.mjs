import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL(`../../${path}`,import.meta.url),'utf8');

test('public card keeps all five primary actions on one mobile row',async()=>{
  const html=await read('card.html');
  const css=await read('assets/css/redesign.css');
  assert.match(html,/<body class="card-page">/);
  assert.match(css,/@media\(max-width:780px\)\{\.card-page \.action-row\{[^}]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\)!important/);
  assert.match(css,/\.card-page \.act-btn span\{[^}]*font-size:/);
});

test('light card theme defines readable surfaces, text, icons and controls',async()=>{
  const css=await read('assets/css/redesign.css');
  assert.match(css,/\[data-theme=light\] body\.card-page\{[^}]*--text:#18150f[^}]*--text-secondary:#514b42[^}]*--text-muted:#6f675c/);
  for(const selector of ['.act-btn','.info-card','.map-card','.copy-btn','.social-btn'])assert.match(css,new RegExp(`\\[data-theme=light\\] \\.card-page \\${selector.replace('.','.')}`));
  assert.match(css,/\[data-theme=light\] \.card-page :is\(\.act-btn svg,\.row-icon svg,\.social-btn\)\{[^}]*var\(--gold-dim\)/);
  assert.match(css,/\[data-theme=light\] \.card-page \.info-row:hover\{[^}]*rgba\(160,120,40/);
});

test('mobile card keeps the full-size summary sticky while lower sections scroll over it',async()=>{
  const html=await read('card.html');
  const css=await read('assets/css/redesign.css');
  assert.match(html,/<div class="card-fixed-zone">[\s\S]*?<div class="card-header">[\s\S]*?<div class="identity">[\s\S]*?<div class="action-row">[\s\S]*?<\/div>\s*<\/div>\s*<!-- CONTENT -->/);
  assert.match(css,/\.card-fixed-zone\{display:contents\}/);
  assert.match(css,/\.card-page \.card-fixed-zone\{[^}]*display:block[^}]*position:sticky[^}]*top:0[^}]*z-index:1/);
  assert.match(css,/\.card-page #page-wrap\{overflow-x:clip\}/);
  assert.match(css,/\.card-page #card-content:not\(\.hidden\)>\.content\{[^}]*position:relative[^}]*z-index:2[^}]*background:var\(--bg\)[^}]*padding-bottom:max\([^}]*env\(safe-area-inset-bottom\)/);
  assert.doesNotMatch(css,/body\.card-page\{[^}]*overflow:hidden/);
  assert.doesNotMatch(css,/@media\(max-width:780px\) and \(max-height:650px\)/);
});
