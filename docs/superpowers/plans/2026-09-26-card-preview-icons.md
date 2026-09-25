# Card Preview and Icon Customization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gerçek kartla birebir canlı önizleme, ülke kodlu telefon alanları, hizalı görsel kontrolleri ve güvenli ikon özelleştirmesi eklemek.

**Architecture:** `card.html` tek render kaynağı olur ve dashboard onu same-origin preview iframe olarak kullanır. İkonlar whitelist katalogdan seçilir ve `profiles.icon_config` JSONB alanında saklanır.

**Tech Stack:** HTML/CSS, vanilla JavaScript, Supabase JS v2/Postgres, Node test runner, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-26-card-preview-icons-design.md`

## Global Constraints

- Preview modu hiçbir Supabase okuma/yazma veya analitik çağrısı yapmayacak.
- Kullanıcı kaynaklı SVG/HTML kabul edilmeyecek.
- Mevcut profil kolonları ve owner filtreleri korunacak.
- Yeni migration idempotent ve mevcut profillerle geriye uyumlu olacak.

## Review Focus

- Başka origin'den preview mesajı reddedilmeli.
- Bilinmeyen ikon kimliği varsayılana düşmeli.
- Boş/uluslararası telefon numarası doğru birleşmeli.
- Preview modu analitik sayaç artırmamalı.
- Migration uygulanmadan frontend kontrollü hata göstermeli.

---

### Task 1: Ortak ikon kataloğu ve veritabanı sözleşmesi

**Files:** Create `assets/js/icon-catalog.js`, migration ve testler; modify public RPC.

- [ ] İzinli yuvalar, ikon kimlikleri ve fallback davranışı için başarısız testleri yaz ve çalıştır.
- [ ] `icon_config jsonb not null default '{}'` migration'ını ve RPC dönüş alanını ekle.
- [ ] DOM tabanlı `NoshutdownIcons` API'sini uygula ve testleri geçir.
- [ ] Commit.

### Task 2: Gerçek kartın preview modu

**Files:** Modify `card.html`, `assets/js/card-utils.js`; create preview contract tests.

- [ ] Tek `applyCardData` render yolu, origin/source kontrolü ve preview'da RPC/analytics olmaması için başarısız testleri yaz.
- [ ] `?preview=1` mesaj dinleyicisini ve ortak render fonksiyonunu uygula.
- [ ] İkon kataloğunu gerçek kart DOM'una uygula ve testleri geçir.
- [ ] Commit.

### Task 3: Dashboard telefon ve ikon editörleri

**Files:** Modify `dashboard.html`, `assets/css/dashboard.css`, `assets/js/dashboard-app.js`; tests.

- [ ] Ülke kodu birleştirme/ayırma ve ikon draft serialize testlerini RED çalıştır.
- [ ] Telefon seçicilerini, ikon seçim panelini ve `icon_config` veri akışını uygula.
- [ ] Görsel kontrol panellerini eş yükseklik ve hizalı aksiyon satırlarıyla düzelt.
- [ ] Testleri geçir ve commit.

### Task 4: Birebir iframe önizleme entegrasyonu

**Files:** Modify `dashboard.html`, `assets/js/dashboard-preview.js`, `assets/js/dashboard-app.js`, CSS ve testler.

- [ ] Preview iframe ve same-origin mesaj veri akışı için başarısız testleri yaz.
- [ ] Eski yaklaşık preview DOM/CSS'ini kaldır; draft değişimlerini iframe'e gönder.
- [ ] Masaüstü/mobil boyutları ve yüklenme kuyruğunu uygula.
- [ ] Tam test, `git diff --check`, canlı tarayıcı kontrolü, commit ve deploy.
