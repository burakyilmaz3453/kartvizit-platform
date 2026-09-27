import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL(`../../${path}`,import.meta.url),'utf8');

test('landing page embeds the real card renderer instead of maintaining a mock card',async()=>{
  const html=await read('index.html');
  assert.match(html,/id="landing-card-preview"/);
  assert.match(html,/src="card\.html\?preview=1"/);
  assert.match(html,/assets\/js\/landing-preview\.js/);
  assert.doesNotMatch(html,/class="mock-card"|Ahmet Yılmaz/);
});

test('landing demo sends representative data only after the real card reports ready',async()=>{
  const js=await read('assets/js/landing-preview.js');
  assert.match(js,/NOSHUTDOWN_CARD_READY/);
  assert.match(js,/NOSHUTDOWN_CARD_PREVIEW/);
  assert.match(js,/event\.origin\s*!==\s*location\.origin/);
  assert.match(js,/event\.source\s*!==\s*frame\.contentWindow/);
  assert.match(js,/full_name/);
  assert.match(js,/icon_config/);
});
