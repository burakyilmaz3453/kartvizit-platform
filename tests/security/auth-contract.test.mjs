import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('registration delegates profile creation and does not enumerate profiles', async () => {
  const js = await read('assets/js/auth.js').catch(() => '');
  assert.match(js, /auth\.signUp/);
  assert.match(js, /data:\s*\{\s*username\s*\}/);
  assert.doesNotMatch(js, /from\(['"]profiles['"]\)/);
  assert.match(js, /Kayıt işlemi tamamlanamadı/);
});

test('auth pages use forms, autocomplete, accessible status and eight-character passwords', async () => {
  const [register, login, reset] = await Promise.all([
    read('register.html'), read('login.html'), read('reset.html')
  ]);
  assert.match(register, /<form[^>]+id="register-form"/);
  assert.match(login, /<form[^>]+id="login-form"/);
  assert.match(reset, /<form[^>]+id="reset-form"/);
  assert.match(register, /autocomplete="username"/);
  assert.match(register, /autocomplete="new-password"[^>]+minlength="8"/);
  assert.match(login, /autocomplete="current-password"/);
  assert.match(reset, /minlength="8"/);
  for (const html of [register, login, reset]) {
    assert.match(html, /role="status"[^>]+aria-live="polite"/);
    assert.match(html, /assets\/js\/auth\.js/);
    assert.doesNotMatch(html, /onclick=/);
  }
});

test('password recovery uses a generic response and an explicit redirect', async () => {
  const js = await read('assets/js/auth.js').catch(() => '');
  assert.match(js, /resetPasswordForEmail/);
  assert.match(js, /redirectTo:/);
  assert.match(js, /Eğer bu adresle eşleşen bir hesap varsa/);
  assert.match(js, /password\.length\s*<\s*8/);
});

test('registration is prepared for Cloudflare Turnstile without hardcoded secrets', async () => {
  const [register, js, captcha] = await Promise.all([
    read('register.html'), read('assets/js/auth.js'), read('assets/js/captcha.js').catch(() => '')
  ]);
  assert.doesNotMatch(register, /google\.com\/recaptcha|grecaptcha/i);
  assert.match(register, /challenges\.cloudflare\.com\/turnstile/);
  assert.match(register, /turnstile-site-key/);
  assert.match(captcha, /turnstile\.render/);
  assert.doesNotMatch(captcha, /secret/i);
  assert.match(js, /requireCaptchaToken\(\)/);
});

test('browser auth client is exposed to the shared auth module', async () => {
  const client = await read('supabase.js');
  assert.match(client, /window\.sb\s*=\s*createClient/);
});

test('captcha lifecycle blocks tokenless requests and recovers after use', async () => {
  const [js, captcha] = await Promise.all([
    read('assets/js/auth.js'), read('assets/js/captcha.js')
  ]);
  assert.match(js, /requireToken\(\)/);
  assert.match(js, /Güvenlik doğrulamasını tamamla/);
  assert.match(js, /NoshutdownCaptcha\?\.reset\(\)/);
  assert.match(captcha, /'error-callback'/);
  assert.match(captcha, /'timeout-callback'/);
  assert.match(captcha, /language:\s*'tr'/);
  assert.match(captcha, /size:\s*'flexible'/);
});
