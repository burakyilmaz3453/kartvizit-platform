# Yönetim Paneli ve Şifre Sıfırlama Yenileme Tasarımı

## Amaç

Yönetim panelini profesyonel, anlaşılır ve doğrudan kartvizit düzenlemeye odaklanan bir çalışma alanına dönüştürmek. Kullanıcı yaptığı değişiklikleri kaydetmeden önce gerçek kart görünümüne yakın bir önizlemede anında görmeli. Şifre sıfırlama ekranı da aynı görsel sistem içinde, tarayıcının varsayılan uyarılarına ihtiyaç duymadan çalışmalı.

## Dil ve İçerik İlkeleri

Kullanıcı arayüzünde kaliteyi anlatan pazarlama sıfatları kullanılmayacak. “Premium”, “stüdyo”, “altın standart” veya benzeri kendini öven ifadeler yerine işlevi açıkça belirten başlıklar kullanılacak:

- Yönetim Paneli
- Kart Önizlemesi
- Sosyal Bağlantılar
- Şifre Sıfırlama
- Değişiklikleri Kaydet
- Kartı Görüntüle

Metinler kısa, Türkçe ve eylem odaklı olacak. Teknik hata metinleri doğrudan kullanıcıya gösterilmeyecek.

## Yönetim Paneli Yerleşimi

Masaüstünde iki sütunlu bir düzen kullanılacak:

- Sol sütun düzenleme alanıdır ve sayfa içinde kayar.
- Sağ sütun gerçek kart oranına yakın, sabit konumlu bir telefon önizlemesidir.
- Üst çubukta marka, kart bağlantısı, “Kartı Görüntüle”, hesap menüsü ve kaydetme durumu bulunur.
- Ana kaydetme eylemi üst çubukta görünür kalır. Sayfanın altında ikinci, büyük ve yapışkan bir kaydetme düğmesi kullanılmaz.

Mobilde tek sütun kullanılır. Kart önizlemesi sayfanın üstünde daraltılabilir bir panel olarak görünür. Kullanıcı “Önizlemeyi Göster/Gizle” kontrolüyle form alanını kaplamadan kartı kontrol edebilir.

## Bölümler ve Bilgi Mimarisi

Düzenleme alanı aşağıdaki sırayı izler:

1. Profil fotoğrafı ve kapak görseli
2. Ad, soyad, şirket, unvan ve kısa açıklama
3. Telefon, e-posta, web sitesi ve adres
4. Sosyal bağlantılar
5. Tema ve vurgu rengi
6. Şirket bilgileri
7. Hesap ve güvenlik

Analitik bilgiler düzenleme akışını bölmeyecek. Görüntülenme ve tıklama özeti üst kısımda küçük bir özet olarak gösterilecek; ayrıntılı dağılım açılır bir bölümde kalacak.

## Canlı Kart Önizlemesi

Önizleme ayrı bir `iframe` içinde gerçek `card.html` sayfasını çalıştırmayacak. Bu yaklaşım kaydedilmemiş veriyi aktarmak, Supabase sorgularını engellemek ve iki sayfa arasında güvenli iletişim kurmak için gereksiz karmaşıklık yaratır.

Bunun yerine kartın görsel yapısını kullanan bağımsız bir önizleme bileşeni oluşturulacak. Form alanlarındaki `input` ve `change` olayları tek bir taslak durum nesnesini güncelleyecek; önizleme yalnızca bu nesneden render edilecek. Böylece:

- Kaydedilmemiş değişiklikler anında görünür.
- Önizleme Supabase’e yazma veya okuma yapmaz.
- Kullanıcı girişleri HTML olarak enjekte edilmez; yalnızca `textContent`, doğrulanmış URL ve güvenli görsel kaynakları kullanılır.
- Tema, renk, avatar, banner, iletişim bilgileri ve sosyal bağlantı sırası aynı anda güncellenir.

Önizleme ile herkese açık kart aynı veri alanlarını ve formatlama yardımcılarını kullanır. Görsel sapmayı azaltmak için ortak kart değişkenleri ve yardımcı fonksiyonlar ayrı bir CSS/JS katmanında paylaşılır.

## Sosyal Bağlantılar

Mevcut ayrı sıralama listesi ve ayrı URL girişleri kaldırılacak. Her sosyal ağ tek bir satırda yönetilecek:

- Sürükleme tutamacı
- Platform simgesi ve adı
- URL alanı
- Görünürlük anahtarı
- Silme eylemi

Yeni bağlantı “Sosyal bağlantı ekle” düğmesiyle platform seçilerek eklenir. Sürükle-bırak klavye erişilebilirliğini ortadan kaldırmayacak; her satır için yukarı/aşağı taşıma erişilebilir eylemleri de bulunacak. Boş veya kapalı bağlantılar kartta gösterilmeyecek.

Mevcut veritabanı şeması korunacak. `linkedin`, `instagram`, `twitter`, `facebook` alanları ve virgülle ayrılmış `social_order` değeri yeni bileşene uyarlanacak. Bu aşamada yeni tablo veya migration gerekmiyor.

## Kaydetme Modeli

Form değiştiğinde panel “Kaydedilmemiş değişiklikler” durumuna geçer. Kaydetme sırasında düğme devre dışı bırakılır ve durum metni gösterilir. Başarılı işlemden sonra “Kaydedildi” durumu görünür; hata halinde girilen değerler korunur ve ilgili bölümde sade bir hata mesajı gösterilir.

Fotoğraf yükleme ve silme işlemleri mevcut güvenlik kontrollerini korur. Önizleme için seçilen yerel görsel `URL.createObjectURL` ile geçici gösterilir; başarılı yüklemeden sonra kalıcı Supabase Storage URL’si kullanılır ve geçici URL serbest bırakılır.

## Şifre Sıfırlama

Sayfanın kullanıcıya görünen başlığı “Şifre Sıfırlama” olacak. Alt metin işlemi kısa biçimde açıklayacak. Aşağıdaki yapı kullanılacak:

- Yeni şifre alanı
- Şifre doğrulama alanı
- Yazarken güncellenen şifre koşulları
- Şifreyi göster/gizle kontrolü
- “Şifreyi Güncelle” düğmesi
- Bağlantı geçersiz veya süresi dolmuşsa giriş sayfasına dönme eylemi

Tarayıcının beyaz yerel doğrulama balonu kullanılmayacak. `minlength` tek başına kullanıcı deneyimi olarak kabul edilmeyecek; form `novalidate` ile uygulama tarafından doğrulanacak ve hatalar Noshutdown görsel sistemi içinde, ilgili alanla ilişkilendirilmiş olarak gösterilecek. HTML kısıtları savunma katmanı olarak korunabilir ancak gönderim uygulama kodu tarafından yönetilir.

Turnstile şifre sıfırlama bağlantısını isteme aşamasında giriş sayfasında kullanılır. Oturum içindeki yeni şifre belirleme ekranında tekrar Turnstile gösterilmez; Supabase recovery oturumu doğrulanır.

## Uyarı ve Durum Bileşenleri

Giriş, kayıt, şifre sıfırlama ve yönetim panelinde ortak bir bildirim görünümü kullanılacak:

- Hata: koyu kırmızı yüzey, kısa başlık ve çözüm odaklı metin
- Başarı: düşük doygunluklu yeşil yüzey
- Bilgi: nötr koyu yüzey
- Alan hatası: alan altında kısa metin ve `aria-describedby`

Tarayıcı veya Supabase kaynaklı İngilizce teknik hata metinleri doğrudan gösterilmeyecek. Bilinen durumlar Türkçe kullanıcı mesajlarına eşlenecek; bilinmeyen durumlarda genel ve güvenli mesaj kullanılacak.

## Erişilebilirlik ve Responsive Davranış

- Tüm alanların görünür etiketi olacak.
- Klavye odağı belirgin olacak.
- Sürükleme işlemlerinin klavye alternatifi bulunacak.
- Durum mesajları uygun `aria-live` bölgelerinde duyurulacak.
- Renk tek başına durum göstergesi olmayacak.
- Hareket azaltma tercihi korunacak.
- 320 px genişlikten büyük masaüstü ekranlara kadar yatay taşma oluşmayacak.

## Güvenlik

- Service role anahtarı veya başka bir secret istemciye eklenmeyecek.
- Tüm profil güncellemeleri mevcut kullanıcı kimliği filtresiyle yapılacak.
- Önizleme kullanıcı metnini `innerHTML` ile render etmeyecek.
- URL alanları kaydetme ve önizleme öncesinde güvenli protokol kontrolünden geçecek.
- Görsel MIME türü ve boyut doğrulaması korunacak.
- Şifre sıfırlama hataları hesap varlığını açığa çıkarmayacak.

## Dosya Yapısı

Mevcut büyük `dashboard.html` içindeki sorumluluklar ayrıştırılacak:

- `dashboard.html`: semantik sayfa yapısı ve form alanları
- `assets/css/dashboard.css`: panel yerleşimi ve bileşen stilleri
- `assets/js/dashboard.js`: oturum, yükleme, kaydetme ve Supabase işlemleri
- `assets/js/dashboard-preview.js`: taslak durum ve güvenli canlı önizleme
- `assets/js/social-editor.js`: sosyal bağlantı ekleme, silme ve sıralama
- `reset.html`: şifre sıfırlama sayfa yapısı
- `assets/js/auth.js`: şifre doğrulama ve mevcut kimlik doğrulama akışları
- `assets/css/auth.css`: giriş, kayıt ve şifre sıfırlama ortak stilleri

Eski inline olay nitelikleri (`onclick`, `onchange`, `oninput`) kaldırılacak ve olaylar JavaScript üzerinden bağlanacak.

## Test Stratejisi

- Dashboard sözleşme testleri kullanıcı kimliği filtrelerini ve güvenli yazma davranışını korur.
- Canlı önizleme testleri form değişikliklerinin taslak duruma ve güvenli DOM çıktısına yansımasını doğrular.
- Sosyal editör testleri ekleme, silme, görünürlük ve sıra değişikliklerini doğrular.
- Şifre sıfırlama testleri tarayıcı balonuna bağlı kalmadan 8 karakter, eşleşme ve recovery oturumu durumlarını doğrular.
- Görsel sözleşme testleri masaüstü iki sütun, yapışkan önizleme ve mobil tek sütun davranışını kontrol eder.
- Tam test paketi ve `git diff --check` her görev sonunda çalıştırılır.

## Başarı Ölçütleri

- Kullanıcı form değişikliklerini kaydetmeden kart önizlemesinde görür.
- Sosyal bağlantıların sırası ve URL’leri tek bileşenden yönetilir.
- Şifre sıfırlama ekranında tarayıcının varsayılan beyaz uyarısı görünmez.
- Kullanıcı arayüzünde kendini öven pazarlama sıfatları bulunmaz.
- Masaüstü ve mobil düzenlerde panel kullanılabilir kalır.
- Mevcut RLS, Storage ve kimlik doğrulama güvenliği zayıflatılmaz.
