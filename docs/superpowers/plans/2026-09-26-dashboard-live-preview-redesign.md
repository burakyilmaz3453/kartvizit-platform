# Yönetim Paneli ve Şifre Sıfırlama Yenileme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Yönetim panelini canlı kart önizlemeli, birleşik sosyal bağlantı editörlü profesyonel bir çalışma alanına dönüştürmek ve şifre sıfırlama ekranını ortak, sade doğrulama deneyimiyle yenilemek.

**Architecture:** Dashboard formu tek bir taslak durum nesnesi üretir; güvenli önizleme modülü bu nesneyi DOM API’leriyle render eder ve Supabase’e erişmez. Sosyal bağlantı editörü aynı taslak durum üzerinde çalışan bağımsız bir modüldür; kalıcı kayıt mevcut `profiles` kolonlarına dönüştürülür. Auth sayfaları ortak CSS kullanır ve şifre sıfırlama doğrulamasını tarayıcı balonları yerine uygulama içinde yapar.

**Tech Stack:** Statik HTML5, CSS, vanilla JavaScript ES modules/IIFE, Supabase JS v2, Node.js built-in test runner, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-25-dashboard-live-preview-redesign.md`

## Global Constraints

- Kullanıcı arayüzünde “Premium”, “stüdyo”, “altın standart” veya benzeri kendini öven ifadeler kullanılmayacak.
- Arayüz başlıkları kısa, Türkçe ve işlev odaklı olacak.
- Service role anahtarı veya başka bir secret istemciye eklenmeyecek.
- Profil yazmaları mevcut kullanıcı kimliği filtresini koruyacak.
- Önizleme kullanıcı metnini `innerHTML` ile render etmeyecek.
- URL alanları güvenli protokol kontrolünden geçecek.
- Mevcut görsel MIME türü ve 5 MiB boyut doğrulaması korunacak.
- Yeni bir veritabanı tablosu veya migration oluşturulmayacak.
- Inline `onclick`, `onchange` ve `oninput` nitelikleri kaldırılacak.
- 320 px ve üzerindeki ekranlarda yatay taşma oluşmayacak.

## Review Focus

- Bozuk veya `javascript:` sosyal URL’si önizlemede bağlantı üretmemeli; Task 3 güvenli URL testi bunu kapsar.
- Çok uzun ad, unvan ve bağlantılar önizlemeyi yatay taşırmamalı; Task 3 uzun içerik testi bunu kapsar.
- Hızlı yazma ve sıralama sırasında kaydedilen durum ile görünen önizleme ayrışmamalı; Task 5 taslak senkronizasyon testi bunu kapsar.
- Görsel yükleme başarısız olduğunda yerel önizleme URL’si sızmamalı ve önceki görsel korunmalı; Task 5 yükleme hata testi bunu kapsar.
- Recovery oturumu olmayan veya süresi dolmuş bağlantı şifre formunu etkin bırakmamalı; Task 1 recovery oturumu testi bunu kapsar.

---

### Task 1: Ortak Auth Görsel Sistemi ve Şifre Sıfırlama

**Files:**
- Create: `assets/css/auth.css`
- Modify: `login.html`
- Modify: `register.html`
- Modify: `reset.html`
- Modify: `assets/js/auth.js`
- Modify: `tests/security/auth-contract.test.mjs`
- Modify: `tests/security/visual-contract.test.mjs`

**Interfaces:**
- Consumes: `window.sb`, `window.NoshutdownCaptcha` mevcut tarayıcı API’leri.
- Produces: `validatePassword(password, confirmation) -> { valid: boolean, errors: string[] }`, `renderPasswordRequirements(result) -> void`, ortak `.auth-*` CSS bileşenleri.

- [ ] **Step 1: Şifre sıfırlama ve sade metinler için başarısız sözleşme testlerini yaz**

`auth-contract.test.mjs` içinde reset formunda `novalidate`, görünür etiketler, şifre göster/gizle düğmeleri, `password-requirements`, recovery oturumu kontrolü ve Turnstile bulunmaması şartlarını ekle. `visual-contract.test.mjs` içinde üç auth sayfasının `/assets/css/auth.css` yüklediğini ve tüm üretim HTML sayfalarının kullanıcıya görünen metinlerinde yasaklı pazarlama ifadeleri olmadığını doğrula.

- [ ] **Step 2: Testlerin doğru nedenle başarısız olduğunu doğrula**

Run: `node --test tests/security/auth-contract.test.mjs tests/security/visual-contract.test.mjs`

Expected: FAIL; `auth.css`, `novalidate`, recovery kontrolü ve yeni DOM kimlikleri eksik.

- [ ] **Step 3: Ortak auth CSS’ini ve reset sayfa yapısını uygula**

`auth.css` içinde `.auth-page`, `.auth-card`, `.auth-alert`, `.field-error`, `.password-requirements`, `.password-toggle` ve responsive kuralları oluştur. Login/register/reset içindeki tekrarlı stilleri ortak dosyaya taşı; görünen marka alt metnindeki “Altın Standardı” ifadesini kaldır. Reset ekranında Turnstile HTML ve betiğini kaldır; formu `novalidate` yap.

- [ ] **Step 4: Şifre doğrulamasını ve recovery oturumu durumunu uygula**

`assets/js/auth.js` içinde `validatePassword` ve `renderPasswordRequirements` fonksiyonlarını ekle. En az 8 karakter ve iki alanın eşleşmesi zorunlu olsun; koşullar yazarken güncellensin. `PASSWORD_RECOVERY` olayı veya geçerli recovery oturumu olmadan formu devre dışı bırak ve “Bağlantı geçersiz veya süresi dolmuş” mesajı göster.

- [ ] **Step 5: Review Focus recovery vakasını ekle ve tüm ilgili testleri çalıştır**

Recovery oturumu yokken `updateUser` çağrılmadığını doğrulayan test ekle.

Run: `node --test tests/security/auth-contract.test.mjs tests/security/visual-contract.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add assets/css/auth.css assets/js/auth.js login.html register.html reset.html tests/security/auth-contract.test.mjs tests/security/visual-contract.test.mjs
git commit -m "feat: redesign password recovery experience"
```

### Task 2: Dashboard Sayfa İskeleti ve Responsive Yerleşim

**Files:**
- Create: `assets/css/dashboard.css`
- Modify: `dashboard.html`
- Modify: `assets/css/redesign.css`
- Modify: `tests/security/dashboard-contract.test.mjs`
- Modify: `tests/security/visual-contract.test.mjs`

**Interfaces:**
- Consumes: Task 1 ortak bildirim sınıfları.
- Produces: `#dashboard-form`, `#card-preview`, `#save-profile`, `.dashboard-workspace`, `.editor-column`, `.preview-column`, sosyal editör ve önizleme modüllerinin kullanacağı sabit DOM kimlikleri.

- [ ] **Step 1: Yeni dashboard iskeleti için başarısız testleri yaz**

Dashboard testinde tek `#dashboard-form`, `#card-preview`, `#save-profile`, analitik özet ve kullanıcı kimliğiyle filtrelenen mevcut yazmaları doğrula. Görsel testte masaüstü iki sütun, yapışkan önizleme, 780 px altında tek sütun ve 320 px yatay taşma koruması ara.

- [ ] **Step 2: Testlerin eski kart ızgarası nedeniyle başarısız olduğunu doğrula**

Run: `node --test tests/security/dashboard-contract.test.mjs tests/security/visual-contract.test.mjs`

Expected: FAIL; yeni çalışma alanı ve önizleme kimlikleri eksik.

- [ ] **Step 3: Dashboard HTML yapısını semantik olarak yeniden kur**

Üst çubukta “Yönetim Paneli”, kart bağlantısı, “Kartı Görüntüle”, kaydetme durumu ve `#save-profile` kullan. Düzenleme bölümlerini spec sırasına taşı. Alt yapışkan kaydet düğmesini ve ayrı sosyal sıralama alanını kaldır. Inline olay niteliklerini kaldır; kontrollere kalıcı kimlikler ver.

- [ ] **Step 4: Dashboard CSS’ini oluştur**

Masaüstünde `minmax(0, 1fr) minmax(320px, 430px)` sütunları, `position: sticky` önizleme ve maksimum içerik genişliği tanımla. Mobilde önizlemeyi daraltılabilir üst panele çevir. Metin kesme ve `overflow-wrap:anywhere` ile uzun içerik taşmasını engelle.

- [ ] **Step 5: Testleri çalıştır**

Run: `node --test tests/security/dashboard-contract.test.mjs tests/security/visual-contract.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add dashboard.html assets/css/dashboard.css assets/css/redesign.css tests/security/dashboard-contract.test.mjs tests/security/visual-contract.test.mjs
git commit -m "feat: create dashboard editing workspace"
```

### Task 3: Güvenli Canlı Kart Önizlemesi

**Files:**
- Create: `assets/js/dashboard-preview.js`
- Create: `tests/security/dashboard-preview.test.mjs`
- Modify: `dashboard.html`
- Modify: `assets/css/dashboard.css`
- Modify: `assets/js/card-utils.js`

**Interfaces:**
- Consumes: Task 2 `#card-preview` ve form alanı kimlikleri; `NoshutdownCard.safeUrl` benzeri mevcut URL güvenliği.
- Produces: `window.NoshutdownPreview = { createDraft(profile), updateDraft(patch), render(container, draft), setImage(kind, url), destroy() }`.

- [ ] **Step 1: Taslak durum ve render için başarısız davranış testlerini yaz**

Testler `createDraft` alan eşlemesini, `updateDraft` ile değişmez birleşimi, metinlerin `textContent` üzerinden render edilmesini, güvenli URL dönüşümünü, tema/rengin CSS değişkenlerine yansımasını ve sosyal sırasını doğrulasın.

- [ ] **Step 2: Review Focus bozuk URL ve uzun içerik testlerini ekle**

`javascript:` URL’sinin link üretmediğini; 200 karakterlik ad/unvan ve uzun sosyal URL için güvenli metin çıktısı ve taşma sınıfı üretildiğini doğrula.

- [ ] **Step 3: Testlerin modül eksikliği nedeniyle başarısız olduğunu doğrula**

Run: `node --test tests/security/dashboard-preview.test.mjs`

Expected: FAIL; `dashboard-preview.js` bulunamıyor.

- [ ] **Step 4: Önizleme modülünü uygula**

Saf veri yardımcılarını DOM renderından ayır. Kullanıcı verisi için `innerHTML` kullanma; ikon ve sabit iskelet başlangıç HTML’inde yer alsın. `setImage` yalnızca `https:`, `blob:` veya güvenli proje kaynağını kabul etsin.

- [ ] **Step 5: Dashboard alan olaylarını taslak duruma bağla**

`input` ve `change` olaylarını tek delegasyon dinleyicisinde ele al. Her değişiklik `updateDraft` ve `render` çağrısı yapsın; Supabase yazması yapmasın. Mobil önizleme aç/kapat kontrolünü bağla.

- [ ] **Step 6: Testleri çalıştır**

Run: `node --test tests/security/dashboard-preview.test.mjs tests/security/card-data-contract.test.mjs`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add assets/js/dashboard-preview.js assets/js/card-utils.js assets/css/dashboard.css dashboard.html tests/security/dashboard-preview.test.mjs
git commit -m "feat: add safe live card preview"
```

### Task 4: Birleşik Sosyal Bağlantı Editörü

**Files:**
- Create: `assets/js/social-editor.js`
- Create: `tests/security/social-editor.test.mjs`
- Modify: `dashboard.html`
- Modify: `assets/css/dashboard.css`

**Interfaces:**
- Consumes: Task 3 `NoshutdownPreview.updateDraft(patch)`.
- Produces: `window.NoshutdownSocialEditor = { fromProfile(profile), mount(container, items, onChange), serialize(items) }`; item şekli `{ platform: 'linkedin'|'instagram'|'twitter'|'facebook', url: string, visible: boolean }`.

- [ ] **Step 1: Sosyal veri dönüşümü için başarısız testleri yaz**

`fromProfile` mevcut kolonları ve `social_order` değerini item dizisine dönüştürmeli. `serialize` görünür/boş durumları kaybetmeden mevcut kolonlara ve virgüllü sıraya geri çevirmeli.

- [ ] **Step 2: Etkileşim ve erişilebilirlik testlerini yaz**

Ekleme, silme, görünürlük değiştirme, sürükleme sonrası sıra ve klavye yukarı/aşağı taşıma eylemlerini doğrula. Yinelenen platform eklenmemeli.

- [ ] **Step 3: Testlerin modül eksikliği nedeniyle başarısız olduğunu doğrula**

Run: `node --test tests/security/social-editor.test.mjs`

Expected: FAIL; `social-editor.js` bulunamıyor.

- [ ] **Step 4: Sosyal editör veri API’sini uygula**

Platform listesini sabit ve izinli değerlerle sınırla. URL alanı, görünürlük, kaldırma, sürükleme tutamacı ve erişilebilir yukarı/aşağı eylemlerini aynı satırda üret.

- [ ] **Step 5: Önizleme ve dashboard ile bağla**

Her değişiklikte `onChange(items)` çağır; dashboard bu sonucu Task 3 taslağına uygulasın. Ayrı `social-order-list` ve `social-inputs` DOM yapılarını tamamen kaldır.

- [ ] **Step 6: Testleri çalıştır**

Run: `node --test tests/security/social-editor.test.mjs tests/security/dashboard-contract.test.mjs`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add assets/js/social-editor.js assets/css/dashboard.css dashboard.html tests/security/social-editor.test.mjs tests/security/dashboard-contract.test.mjs
git commit -m "feat: unify social link editing"
```

### Task 5: Dashboard Veri Akışı, Yüklemeler ve Son Entegrasyon

**Files:**
- Create: `assets/js/dashboard-app.js`
- Modify: `dashboard.html`
- Modify: `assets/js/dashboard.js`
- Modify: `tests/security/dashboard-contract.test.mjs`
- Modify: `tests/security/dashboard-preview.test.mjs`
- Modify: `tests/security/visual-contract.test.mjs`

**Interfaces:**
- Consumes: Task 3 `NoshutdownPreview`, Task 4 `NoshutdownSocialEditor`, mevcut `NoshutdownDashboard.validateImage/showImage`.
- Produces: `window.NoshutdownDashboardApp = { init(), loadProfile(), collectUpdates(), saveProfile(), uploadImage(kind, file), removeImage(kind) }`.

- [ ] **Step 1: Başarısız entegrasyon testlerini yaz**

Tek profil yüklemesinin formu, taslağı ve sosyal editörü başlattığını; `collectUpdates` çıktısının yalnızca izinli profil kolonlarını içerdiğini; kaydetmenin `.eq('user_id', currentUser.id)` filtresini koruduğunu doğrula.

- [ ] **Step 2: Review Focus hızlı değişiklik senkronizasyon testini ekle**

Ardışık `input`, sosyal sıra ve tema değişikliklerinden sonra önizleme taslağı ile `collectUpdates` çıktısının aynı son değerleri taşıdığını doğrula.

- [ ] **Step 3: Review Focus görsel yükleme hata testini ekle**

Başarısız upload işleminde önceki kalıcı URL’nin korunduğunu, geçici `blob:` URL’nin revoke edildiğini ve kaydetme durumunun hata olarak kaldığını doğrula.

- [ ] **Step 4: Testlerin entegrasyon modülü eksikliği nedeniyle başarısız olduğunu doğrula**

Run: `node --test tests/security/dashboard-contract.test.mjs tests/security/dashboard-preview.test.mjs`

Expected: FAIL; `dashboard-app.js` ve yeni veri akışı eksik.

- [ ] **Step 5: Dashboard uygulama denetleyicisini uygula**

Oturum doğrulama, tek profil yükleme, form doldurma, taslak başlatma, sosyal editör bağlama, izinli alan toplama, kullanıcı filtreli upsert ve durum mesajlarını `dashboard-app.js` içine taşı. `dashboard.html` içindeki inline uygulama betiğini kaldır.

- [ ] **Step 6: Görsel yükleme yaşam döngüsünü bağla**

Dosya seçildiğinde doğrula, geçici önizleme göster, upload başarılıysa kalıcı URL’ye geç, her tamamlanma yolunda geçici URL’yi revoke et. Silme eyleminde kullanıcı filtresini ve mevcut Storage yol kısıtlarını koru.

- [ ] **Step 7: Metin, inline handler ve güvenlik taramasını doğrula**

Run: `rg -ni -g "*.html" "premium|stüdyo|altın standart|onclick=|onchange=|oninput=" .`

Expected: eşleşme yok.

- [ ] **Step 8: Tam test paketini çalıştır**

Run: `npm test && git diff --check`

Expected: tüm testler PASS; whitespace hatası yok.

- [ ] **Step 9: Commit**

```bash
git add dashboard.html assets/js/dashboard.js assets/js/dashboard-app.js tests/security/dashboard-contract.test.mjs tests/security/dashboard-preview.test.mjs tests/security/visual-contract.test.mjs
git commit -m "feat: complete dashboard live editing flow"
```

### Task 6: Canlı Tarayıcı Doğrulaması ve Dokümantasyon

**Files:**
- Modify: `README.md`
- Test: `tests/security/*.test.mjs`

**Interfaces:**
- Consumes: Tasks 1–5 tamamlanmış kullanıcı akışları.
- Produces: doğrulanmış masaüstü/mobil davranış ve güncel yerel çalışma notları.

- [ ] **Step 1: README için başarısız dokümantasyon sözleşmesini yaz**

Deployment testine dashboard canlı önizleme modüllerinin statik olarak sunulduğunu ve README’nin panel/reset manuel doğrulama adımlarını içerdiğini kontrol eden assertions ekle.

- [ ] **Step 2: Testin eksik dokümantasyon nedeniyle başarısız olduğunu doğrula**

Run: `node --test tests/security/deployment-contract.test.mjs`

Expected: FAIL; yeni manuel doğrulama bölümü eksik.

- [ ] **Step 3: README’yi güncelle**

Yerel çalıştırma, test komutu, dashboard masaüstü/mobil kontrolü, kaydedilmemiş önizleme kontrolü, sosyal sıralama ve recovery bağlantısı test adımlarını ekle.

- [ ] **Step 4: Yerel tarayıcı doğrulamasını yap**

1440 px, 768 px ve 390 px viewportlarda dashboard ile reset sayfasını aç. Yatay taşma, odak görünürlüğü, canlı önizleme, sosyal sıra ve satır içi şifre hatasını görsel olarak doğrula. CAPTCHA çözme veya gerçek şifre değiştirme işlemi yapma.

- [ ] **Step 5: Tam doğrulamayı çalıştır**

Run: `npm test && git diff --check && git status --short`

Expected: tüm testler PASS; yalnızca planlanan dosyalar değişmiş.

- [ ] **Step 6: Commit**

```bash
git add README.md tests/security/deployment-contract.test.mjs
git commit -m "docs: add dashboard verification workflow"
```
