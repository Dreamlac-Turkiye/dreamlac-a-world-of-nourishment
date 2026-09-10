CREATE TABLE public.legal_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text,
  body text NOT NULL DEFAULT '',
  effective_date date,
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.legal_documents TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.legal_documents TO authenticated;
GRANT ALL ON public.legal_documents TO service_role;

ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Legal documents are publicly readable"
  ON public.legal_documents FOR SELECT USING (true);

CREATE POLICY "Admins can insert legal documents"
  ON public.legal_documents FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update legal documents"
  ON public.legal_documents FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete legal documents"
  ON public.legal_documents FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER legal_documents_set_updated_at
  BEFORE UPDATE ON public.legal_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.legal_documents (slug, title, summary, effective_date, body) VALUES
('kvkk', 'KVKK Aydınlatma Metni', '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel verilerinizin nasıl işlendiğine dair bilgilendirme.', CURRENT_DATE, $doc$## 1. Veri Sorumlusu

6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca kişisel verileriniz, veri sorumlusu Kulalac (Dreamlac markası) tarafından aşağıda açıklanan kapsamda işlenmektedir.

- Adres: Zaferiye Mah. Kayrak Küme Evler No: 47 İç Kapı No: 1 Kula / Manisa, Türkiye
- Telefon: +90 212 495 03 33
- E-posta: info@kulalac.com

## 2. İşlenen Kişisel Veriler

- Kimlik bilgileri: ad, soyad
- İletişim bilgileri: e-posta adresi, telefon numarası, teslimat adresi, il ve ilçe
- Müşteri işlem bilgileri: sipariş kayıtları, sipariş numarası, sipariş içeriği, sipariş notu
- İşlem güvenliği bilgileri: hesap oturum kayıtları, IP adresi, tarayıcı ve cihaz bilgileri
- Pazarlama bilgileri: bülten ve ticari elektronik ileti onayları, çerez tercihleri

## 3. Kişisel Verilerin İşlenme Amaçları

- Üyelik hesabınızın oluşturulması ve yönetilmesi
- Sipariş süreçlerinin yürütülmesi, siparişin hazırlanması ve teslim edilmesi
- Müşteri taleplerinin, sorularının ve şikâyetlerinin yanıtlanması
- Açık rızanız bulunması hâlinde bülten ve tanıtım iletilerinin gönderilmesi
- Web sitesinin güvenliğinin sağlanması ve hatalı işlemlerin tespit edilmesi
- İlgili mevzuattan kaynaklanan saklama, bilgilendirme ve raporlama yükümlülüklerinin yerine getirilmesi

## 4. İşlemenin Hukuki Sebepleri

Kişisel verileriniz KVKK'nın 5. maddesinde yer alan aşağıdaki hukuki sebeplere dayanılarak işlenir:

- Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması
- Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması
- İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması
- Kanunlarda açıkça öngörülmesi
- Açık rızanızın bulunması (pazarlama iletileri ve zorunlu olmayan çerezler bakımından)

## 5. Kişisel Verilerin Aktarılması

Kişisel verileriniz; siparişinizin teslimi için kargo ve lojistik hizmet sağlayıcılarına, elektronik ileti gönderimi için ileti hizmet sağlayıcılarına, barındırma ve altyapı hizmetleri için bilgi teknolojileri hizmet sağlayıcılarına ve talep edilmesi hâlinde yetkili kamu kurum ve kuruluşlarına, yalnızca ilgili amaçla sınırlı olarak ve KVKK'nın 8. ve 9. maddelerine uygun şekilde aktarılabilir.

## 6. Saklama Süresi

Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen zamanaşımı ile saklama süreleri sona erene kadar saklanır. Sürelerin sona ermesi hâlinde verileriniz silinir, yok edilir veya anonim hâle getirilir.

## 7. İlgili Kişinin Hakları

KVKK'nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme, silinmesini veya yok edilmesini isteme, bu işlemlerin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme, otomatik sistemlerle yapılan analiz sonucu aleyhinize çıkan sonuca itiraz etme ve zarara uğramanız hâlinde zararın giderilmesini talep etme haklarına sahipsiniz.

## 8. Başvuru Yöntemi

Taleplerinizi info@kulalac.com adresine e-posta ile veya yukarıda belirtilen posta adresine yazılı olarak iletebilirsiniz. Başvurunuz, talebin niteliğine göre en kısa sürede ve en geç otuz gün içinde ücretsiz olarak sonuçlandırılır. İşlemin ayrıca bir maliyet gerektirmesi hâlinde Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki ücret talep edilebilir.$doc$),

('gizlilik-politikasi', 'Gizlilik Politikası', 'Dreamlac web sitesinde toplanan bilgilerin nasıl kullanıldığı, korunduğu ve paylaşıldığı hakkında bilgilendirme.', CURRENT_DATE, $doc$## 1. Kapsam

Bu Gizlilik Politikası, Kulalac tarafından işletilen Dreamlac web sitesi üzerinden toplanan bilgilerin hangi amaçlarla kullanıldığını, nasıl korunduğunu ve hangi durumlarda üçüncü taraflarla paylaşıldığını açıklar. Siteyi kullanarak bu politikada açıklanan uygulamaları kabul etmiş olursunuz.

## 2. Topladığımız Bilgiler

- **Sizin paylaştığınız bilgiler:** üyelik ve sipariş sırasında girdiğiniz ad, soyad, e-posta, telefon, adres ve sipariş notu; iletişim formu ve bülten kaydı bilgileri.
- **Otomatik toplanan bilgiler:** IP adresi, tarayıcı ve cihaz türü, ziyaret edilen sayfalar, ziyaret tarihi ve süresi gibi teknik kayıtlar.
- **Tercihleriniz:** çerez onayı, ticari elektronik ileti onayı ve sepet içeriği gibi tarayıcınızda saklanan tercihler.

## 3. Bilgilerin Kullanım Amaçları

Bilgileriniz; hesabınızın yönetilmesi, siparişlerinizin oluşturulması ve takibi, sizinle iletişim kurulması, destek taleplerinizin yanıtlanması, sitenin güvenliğinin ve teknik işleyişinin sağlanması, hizmet kalitesinin iyileştirilmesi ve yasal yükümlülüklerin yerine getirilmesi amacıyla kullanılır.

## 4. Bilgilerin Paylaşımı

Bilgileriniz üçüncü taraflara satılmaz veya kiralanmaz. Yalnızca hizmetin sunulması için gerekli olduğu ölçüde kargo ve lojistik firmaları, e-posta gönderim sağlayıcıları, barındırma ve altyapı hizmeti sağlayıcıları ile paylaşılır. Ayrıca yasal bir yükümlülük veya yetkili merci talebi bulunması hâlinde mevzuatın gerektirdiği ölçüde paylaşım yapılabilir.

## 5. Veri Güvenliği

Bilgilerinizin yetkisiz erişime, kayba ve kötüye kullanıma karşı korunması için idari ve teknik önlemler uygulanır. Bunlar arasında şifreli bağlantı kullanımı, yetkilendirilmiş erişim, veritabanı düzeyinde erişim kuralları ve düzenli güncellemeler yer alır. İnternet üzerinden yapılan hiçbir aktarımın yüzde yüz güvenli olduğunun garanti edilemeyeceğini hatırlatırız.

## 6. Ödeme Bilgileri

Site üzerinde kart bilgileri saklanmaz. Ödeme altyapısı devreye alındığında kart bilgileri yalnızca yetkili ödeme kuruluşu tarafından işlenecek ve bu politika buna göre güncellenecektir.

## 7. Çocukların Gizliliği

Site, 18 yaşından küçük kişilere yönelik değildir ve bilinçli olarak çocuklardan kişisel veri toplanmaz. Bir çocuğa ait bilgi paylaşıldığını düşünüyorsanız info@kulalac.com adresine bildirebilirsiniz.

## 8. Haklarınız ve İletişim

Verilerinize erişme, düzeltme, silme ve işlemeye itiraz etme haklarınız KVKK Aydınlatma Metni'nde ayrıntılı olarak açıklanmıştır. Talepleriniz ve sorularınız için info@kulalac.com adresine yazabilirsiniz.

## 9. Değişiklikler

Bu politika, mevzuat değişiklikleri veya hizmetlerimizdeki güncellemeler nedeniyle revize edilebilir. Güncel sürüm her zaman bu sayfada yayımlanır ve yürürlük tarihi sayfa başında belirtilir.$doc$),

('cerez-politikasi', 'Çerez Politikası', 'Dreamlac web sitesinde kullanılan çerezler, amaçları ve tercihlerinizi nasıl yöneteceğiniz.', CURRENT_DATE, $doc$## 1. Çerez Nedir?

Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınıza kaydedilen küçük metin dosyalarıdır. Çerezler sitenin doğru çalışmasına, tercihlerinizin hatırlanmasına ve kullanım deneyiminin iyileştirilmesine yardımcı olur. Dreamlac sitesinde ayrıca tarayıcı depolama alanı (localStorage ve sessionStorage) gibi benzer teknolojiler kullanılır.

## 2. Kullandığımız Çerez Türleri

- **Zorunlu çerezler:** Sitenin temel işlevleri için gereklidir. Oturum yönetimi, güvenlik, sepet içeriğinin ve ödeme adımlarındaki bilgilerin korunması ile çerez tercihinizin hatırlanması bu kapsamdadır. Bu çerezler devre dışı bırakılamaz.
- **İşlevsel çerezler:** Dil, görüntüleme ve form tercihlerinizin hatırlanmasını sağlar.
- **Analitik çerezler:** Sayfaların nasıl kullanıldığını toplu ve kimliğinizi belirlemeyen biçimde anlamamıza yardımcı olur. Yalnızca onay vermeniz hâlinde kullanılır.
- **Pazarlama çerezleri:** Şu anda kullanılmamaktadır. İleride kullanılması hâlinde bu politika güncellenir ve ayrıca onayınız alınır.

## 3. Onay ve Tercih Yönetimi

Siteye ilk girişinizde çerez bildirimi görüntülenir; zorunlu olmayan çerezleri kabul edebilir veya yalnızca zorunlu çerezlerle devam edebilirsiniz. Tercihiniz tarayıcınızda saklanır ve dilediğiniz zaman değiştirilebilir.

## 4. Tarayıcı Ayarları

Tarayıcınızın ayarlar bölümünden çerezleri silebilir veya engelleyebilirsiniz. Zorunlu çerezlerin engellenmesi hâlinde oturum açma, sepet ve ödeme adımları gibi işlevlerin çalışmayabileceğini hatırlatırız.

## 5. Saklama Süreleri

Oturum çerezleri tarayıcınızı kapattığınızda silinir. Kalıcı çerezler ve tarayıcı depolamasındaki kayıtlar, amaçları ortadan kalkana veya tarafınızca silinene kadar saklanır.

## 6. İletişim

Çerez uygulamalarımıza ilişkin sorularınız için info@kulalac.com adresine yazabilirsiniz. Kişisel verilerin işlenmesine dair ayrıntılı bilgi KVKK Aydınlatma Metni'nde yer alır.$doc$),

('mesafeli-satis-sozlesmesi', 'Mesafeli Satış Sözleşmesi', '6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında satış koşulları.', CURRENT_DATE, $doc$## 1. Taraflar

**SATICI**
- Unvan: Kulalac
- Adres: Zaferiye Mah. Kayrak Küme Evler No: 47 İç Kapı No: 1 Kula / Manisa, Türkiye
- Telefon: +90 212 495 03 33
- E-posta: info@kulalac.com

**ALICI**
- Sipariş sırasında bildirilen ad, soyad, teslimat adresi, telefon ve e-posta bilgilerine sahip kişi.

## 2. Konu

Bu sözleşmenin konusu, ALICI'nın SATICI'ya ait web sitesi üzerinden elektronik ortamda siparişini verdiği, nitelikleri ve satış fiyatı sipariş özetinde belirtilen ürünün satışı ve teslimi ile tarafların 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamındaki hak ve yükümlülüklerinin belirlenmesidir.

## 3. Sözleşme Konusu Ürün ve Ödeme Bilgileri

Ürünün türü, adedi, satış fiyatı, teslimat ücreti ve ödeme şekli, sipariş onayı öncesinde ALICI'ya gösterilen sipariş özetinde ve sipariş onay bildiriminde yer alır. Bu bilgiler bu sözleşmenin ayrılmaz parçasıdır.

## 4. Genel Hükümler

- ALICI, sipariş vermeden önce ürünün temel nitelikleri, vergiler dâhil satış fiyatı, ödeme ve teslimat koşulları ile cayma hakkına ilişkin ön bilgilendirmeyi okuyup onayladığını kabul eder.
- SATICI, sipariş konusu ürünün sağlam, eksiksiz ve siparişte belirtilen niteliklere uygun şekilde teslim edilmesinden sorumludur.
- Ürün, ALICI'nın bildirdiği adrese, yasal süre olan otuz günü aşmamak kaydıyla teslim edilir.
- Sipariş konusu ürünün teslimi imkânsız hâle gelirse SATICI durumu ALICI'ya bildirir ve ödenen tutar en geç on dört gün içinde iade edilir.
- Kargo teslimi sırasında ALICI, paketi kontrol etmekle ve hasarlı paketler için tutanak düzenletmekle yükümlüdür.

## 5. Cayma Hakkı

ALICI, sözleşmenin kurulmasından veya ürünün teslim alınmasından itibaren on dört gün içinde hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma hakkına sahiptir. Cayma bildirimi info@kulalac.com adresine veya SATICI'nın posta adresine iletilebilir. Bildirimin ulaşmasından itibaren on dört gün içinde ürün bedeli ALICI'ya iade edilir; ürünün SATICI'ya geri gönderilmesine ilişkin usul, İade ve İptal Politikası'nda açıklanmıştır.

## 6. Cayma Hakkının Kullanılamayacağı Hâller

Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi uyarınca; ambalajı açılmış olan gıda ürünleri, sağlık ve hijyen açısından iadeye uygun olmayan ürünler, çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler ile ALICI'nın isteği doğrultusunda kişiselleştirilen ürünlerde cayma hakkı kullanılamaz. Bebek maması ürünleri, gıda güvenliği nedeniyle ancak ambalajı açılmamış, mührü bozulmamış ve yeniden satılabilir durumda olması hâlinde iade edilebilir.

## 7. Uyuşmazlıkların Çözümü

ALICI, şikâyet ve itirazlarını, mevzuatta belirlenen parasal sınırlar dâhilinde yerleşim yerinin bulunduğu veya işlemin yapıldığı yerdeki Tüketici Hakem Heyetine veya Tüketici Mahkemesine iletebilir. Parasal sınırlara ilişkin güncel bilgi Ticaret Bakanlığı tarafından her yıl ilan edilir.

## 8. Yürürlük

ALICI, siparişi elektronik ortamda onaylamakla bu sözleşmenin tüm koşullarını kabul etmiş sayılır. Sözleşme, siparişin SATICI tarafından onaylanmasıyla yürürlüğe girer ve sipariş kaydı ile birlikte saklanır.$doc$);