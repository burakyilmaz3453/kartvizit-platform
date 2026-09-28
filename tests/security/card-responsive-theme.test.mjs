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

test('mobile card keeps the profile summary fixed while lower sections scroll',async()=>{
  const css=await read('assets/css/redesign.css');
  assert.match(css,/@media\(max-width:780px\)\{[^}]*body\.card-page\{[^}]*height:100dvh[^}]*min-height:100dvh[^}]*overflow:hidden/s);
  assert.match(css,/\.card-page #card-content:not\(\.hidden\)\{[^}]*height:100dvh[^}]*display:flex[^}]*flex-direction:column[^}]*overflow:hidden/);
  assert.match(css,/\.card-page #card-content:not\(\.hidden\)>:is\(\.card-header,\.identity,\.action-row\)\{[^}]*flex-shrink:0/);
  assert.match(css,/\.card-page #card-content:not\(\.hidden\)>\.content\{[^}]*flex:1[^}]*min-height:0[^}]*overflow-y:auto[^}]*overscroll-behavior-y:contain[^}]*-webkit-overflow-scrolling:touch/);
  assert.match(css,/padding-bottom:max\([^}]*env\(safe-area-inset-bottom\)/);
  assert.match(css,/@media\(max-width:780px\) and \(max-height:650px\)\{[^}]*\.card-page \.banner-wrap\{[^}]*height:92px!important/s);
  assert.match(css,/\.card-page \.identity-bio\{[^}]*-webkit-line-clamp:2[^}]*overflow:hidden/);
});
