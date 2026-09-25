# Noshutdown

Statik HTML, CSS ve tarayıcı JavaScript'i ile hazırlanmış; Supabase Auth, Postgres, Storage ve RPC kullanan dijital kartvizit platformu.

## Yerelde çalıştırma

1. Node.js 20+ ve Supabase CLI kurun.
2. `supabase.js` içinde yalnızca proje URL'si ile publishable/anon anahtarı kullanın. Service-role anahtarını hiçbir zaman tarayıcıya veya repoya koymayın.
3. Statik sunucuyu başlatın: `npx serve .`
4. Testleri çalıştırın: `npm test`
5. Yerel Supabase için Docker açıkken `supabase start`, ardından `supabase db reset` çalıştırın.

Kısa profil yolları (`/u/kullanici`) hosting rewrite gerektirir; yalın statik sunucuda `card.html?username=kullanici` adresini kullanın.

## Güvenlik modeli

- Public profil yalnızca `get_public_profile` RPC'sinden okunur.
- Profil yazma işlemleri `auth.uid()` sahipliğiyle RLS tarafından sınırlandırılır.
- Görüntüleme ve tıklamalar doğrulayan `record_profile_view` / `record_link_click` RPC'lerine gider.
- Görseller 5 MiB ve JPG/PNG/WebP/AVIF ile sınırlıdır; Storage yolu kullanıcı UUID'siyle başlar.
- `anon`/publishable anahtar public olabilir; `service_role` secret'tır ve istemci tarafında kullanılamaz.

## Migration yayını

Migration'ları sırayla uygulayın. `202609250001_security_foundation.sql` yeni RPC/policy sözleşmelerini ekler. Yeni frontend canlıya alındıktan sonra `202609250002_security_finalize.sql` eski geniş politikaları ve doğrudan anon tablo erişimini kaldırır. Üretim öncesinde yedek ve staging denemesi önerilir.

## Auth güvenlik ayarları

- Supabase Dashboard > Authentication > Providers > Email altında minimum parola uzunluğunu en az 8 yapın.
- `Prevent use of leaked passwords` yalnızca Supabase Pro plan ve üzerinde kullanılabilir; Free planda açılamaz.
- CAPTCHA için Cloudflare Turnstile'da `noshutdown.vercel.app` alan adına bir widget oluşturun. Public **site key** değerini `login.html`, `register.html` ve `reset.html` içindeki `turnstile-site-key` meta etiketine yazın. Gizli **secret key** yalnızca Supabase Dashboard > Authentication > Attack Protection bölümüne girilmelidir; repoya veya frontend'e konulmamalıdır.
- Site ve secret key birlikte hazır olmadan Supabase CAPTCHA anahtarını açmayın. Boş site key ile uygulama CAPTCHA olmadan, mevcut Supabase rate limitleriyle çalışmaya devam eder.
