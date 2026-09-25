import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const read=(path)=>readFile(new URL(`../../${path}`,import.meta.url),'utf8');
test('dashboard refreshes identity and validates uploads',async()=>{const source=`${await read('dashboard.html')}\n${await read('assets/js/dashboard.js').catch(()=> '')}`;assert.match(source,/auth\.getUser\(\)/);assert.match(source,/5\s*\*\s*1024\s*\*\s*1024/);assert.match(source,/image\/jpeg/);assert.match(source,/image\/png/);assert.match(source,/image\/webp/);assert.match(source,/storage\.from\(['"]Avatars['"]\)\.remove/)});
test('dashboard writes stay owner-filtered and helpers avoid HTML sinks',async()=>{const html=await read('dashboard.html');const js=await read('assets/js/dashboard.js').catch(()=> '');assert.match(html,/\.eq\(['"]user_id['"],\s*currentUser\.id\)/);assert.match(html,/\$\{currentUser\.id\}\/avatar\./);assert.match(html,/\$\{currentUser\.id\}\/banner\./);assert.doesNotMatch(js,/innerHTML\s*=/);assert.match(html,/assets\/js\/dashboard\.js/)});
