import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('public card uses restricted RPCs only', async () => {
  const source = `${await read('card.html')}\n${await read('assets/js/card.js').catch(() => '')}`;
  assert.match(source, /rpc\(['"]get_public_profile['"]/);
  assert.match(source, /rpc\(['"]record_profile_view['"]/);
  assert.match(source, /rpc\(['"]record_link_click['"]/);
  assert.doesNotMatch(source, /from\(['"](profiles|profile_views|link_clicks)['"]\)/);
});

test('public card validates URLs and escapes vCard values', async () => {
  const js = await read('assets/js/card.js').catch(() => '');
  assert.match(js, /new URL/);
  assert.match(js, /https?:/);
  assert.match(js, /escapeVCard/);
  assert.doesNotMatch(js, /innerHTML\s*=/);
});

test('card page loads the hardened helper layer', async () => {
  const html = await read('card.html');
  assert.match(html, /src=["']\/assets\/js\/card\.js["']/);
});
