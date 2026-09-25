import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const foundationPath = new URL('../../supabase/migrations/202609250001_security_foundation.sql', import.meta.url);

async function foundationSql() {
  return readFile(foundationPath, 'utf8');
}

test('profile access is owner-bound and public reads use a restricted RPC', async () => {
  const sql = await foundationSql();
  assert.match(sql, /user_id\s*=\s*\(select auth\.uid\(\)\)/i);
  assert.match(sql, /create or replace function public\.get_public_profile/i);
  assert.doesNotMatch(sql, /returns[\s\S]{0,300}\b(user_id|created_at|\bid\b)/i);
});

test('analytics writes use validated atomic functions', async () => {
  const sql = await foundationSql();
  assert.match(sql, /create or replace function public\.record_profile_view/i);
  assert.match(sql, /on conflict\s*\(username\)[\s\S]*do update[\s\S]*count\s*=\s*public\.profile_views\.count\s*\+\s*1/i);
  assert.match(sql, /create or replace function public\.record_link_click/i);
  assert.match(sql, /normalized_link_type\s*=\s*any/i);
});

test('storage writes are limited by folder, size, and image MIME type', async () => {
  const sql = await foundationSql();
  assert.match(sql, /insert into storage\.buckets[\s\S]*file_size_limit[\s\S]*5242880/i);
  assert.match(sql, /allowed_mime_types/i);
  assert.match(sql, /\(storage\.foldername\(name\)\)\[1\][\s\S]{0,80}auth\.uid\(\)::text/i);
});

test('foundation migration is non-destructive', async () => {
  const sql = await foundationSql();
  assert.doesNotMatch(sql, /\bdrop\s+table\b/i);
  assert.doesNotMatch(sql, /\bdelete\s+from\b/i);
  assert.doesNotMatch(sql, /\btruncate\b/i);
});
