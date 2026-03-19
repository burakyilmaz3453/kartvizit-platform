// ======================================
// SUPABASE BAĞLANTI AYARLARI
// Bu dosyada sadece kendi bilgilerini gir
// ======================================

const SUPABASE_URL = 'https://hztxxfjdqzktgucrwlvc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6dHh4ZmpkcXprdGd1Y3J3bHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NzUxNTUsImV4cCI6MjA4OTQ1MTE1NX0.MdjosHT_VQOLQ6cc5pQMaLoJj_lhsCE34TiTOgefNU0'; // Supabase > Settings > API > anon public

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
