# Birebir Kart Önizlemesi ve Özelleştirilebilir İkonlar

## Amaç

Yönetim panelindeki kart önizlemesi, canlı kartın yaklaşık bir kopyası değil doğrudan aynı sayfa ve stillerle çalışan önizleme modu olacaktır. Kullanıcı metin, renk, görsel, telefon ve ikon değişikliklerini kaydetmeden önce gerçek sonuçla aynı biçimde görür.

## Tasarım

- Dashboard önizlemesi `card.html?preview=1` iframe'i kullanır. Kart sayfası preview modunda Supabase okuması ve analitik yazması yapmaz; yalnızca aynı origin'den gelen doğrulanmış `postMessage` taslağını render eder.
- `card.html` içindeki mevcut veri uygulama kodu `applyCardData(data, options)` fonksiyonuna ayrılır. Hem gerçek profil yükleme hem preview mesajı bu tek fonksiyonu çağırır.
- Telefon editörü ülke kodu seçimi ve yerel numara alanından oluşur. Kayıtta mevcut `mobile` ve `work_phone` kolonlarına birleşik E.164-benzeri gösterim yazılır; şema değişmez.
- Tüm kart ikon yuvaları sabit anahtarlarla tanımlanır: eylemler, iletişim satırları, şirket satırları, yol tarifi, paylaşım ve sosyal ağlar. Her yuva yalnızca ortak katalogdaki ikon kimliklerinden birini kabul eder.
- İkon tercihleri `profiles.icon_config jsonb` kolonunda saklanır ve public RPC tarafından döndürülür. Bilinmeyen kimlikler varsayılan ikona düşer; SVG/HTML kullanıcıdan alınmaz.
- Görsel yükleme kontrolleri aynı yüksekliğe, buton satırına ve durum alanına sahip iki eş panel olarak hizalanır.

## Güvenlik ve erişilebilirlik

- Preview mesajı sadece `event.origin === location.origin`, `event.source === parent` ve beklenen mesaj türünde kabul edilir.
- Preview modunda analytics, Storage veya profile RPC çağrısı yapılmaz.
- İkonlar izinli katalogdan DOM API'leriyle üretilir; `innerHTML` ile kullanıcı içeriği basılmaz.
- Telefon kodu seçenekleri sabit listedir; numara yalnızca izinli karakterlerle normalize edilir.
- İkon seçimleri görünür label ve klavye ile kullanılabilen `select` elemanlarıdır.

## Başarı ölçütleri

- Gerçek kart ve preview aynı `applyCardData` fonksiyonunu ve aynı `card.html` CSS/DOM'unu kullanır.
- Dashboard'da yazı, tema, vurgu rengi, görsel, sosyal sıra, telefon ve ikon değişiklikleri kaydetmeden preview'a yansır.
- Görsel alanlarında fotoğraf/kapak kontrolleri hizalıdır.
- Mevcut profiller migration sonrasında varsayılan ikonlarla bozulmadan çalışır.
