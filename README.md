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

Supabase Dashboard > Authentication > Attack Protection bölümünde leaked-password protection özelliğini ayrıca etkinleştirin; bu ayar SQL migration kapsamı dışındadır.
