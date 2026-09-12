alter table public.legal_documents
  add column if not exists review_status text not null default 'review_required'
    check (review_status in ('review_required','approved')),
  add column if not exists version integer not null default 1 check (version > 0),
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid;

insert into public.legal_documents(slug,title,summary,body,review_status) values
('teslimat-politikasi','Teslimat Politikası','Türkiye siparişlerinin hazırlanması ve teslimat sürecine ilişkin taslak çalışma metni.',
$doc$## Hukuki inceleme durumu

Bu metin operasyonel altyapıyı hazırlamak amacıyla oluşturulmuş taslaktır. Kargo firması, teslimat bölgeleri, süreler ve ücretler kesinleştikten sonra hukuk danışmanı tarafından onaylanarak yürürlüğe alınacaktır.

## Sipariş hazırlama

Onaylanan siparişler stok ve ödeme kontrolünden sonra hazırlanır. Tahmini teslimat süresi ve teslimat bedeli, sipariş onayından önce müşteriye gösterilir.

## Teslimat kontrolü

Teslimat sırasında paketin görünür hasar bakımından kontrol edilmesi ve hasar bulunması hâlinde taşıyıcıya tutanak düzenletilmesi önerilir.

## İletişim

Teslimat soruları için sipariş numaranızla info@kulalac.com adresine ulaşabilirsiniz.$doc$,'review_required'),
('iade-ve-iptal-politikasi','İade ve İptal Politikası','İade, iptal ve cayma süreçlerine ilişkin hukuk onayı bekleyen çalışma metni.',
$doc$## Hukuki inceleme durumu

Bu çalışma metni hukuk danışmanının onayından sonra yürürlüğe alınacaktır. Bebek maması ve benzeri gıda ürünlerinde ambalaj, mühür, hijyen ve yeniden satılabilirlik koşulları önem taşır.

## Talep oluşturma

İptal veya iade talebinizi sipariş numaranız ve iletişim bilgilerinizle info@kulalac.com adresine iletebilirsiniz. Talebiniz ürünün durumu ve yürürlükteki tüketici mevzuatı kapsamında değerlendirilir.

## İade yöntemi

Onaylanan iadeler için gönderim adresi ve taşıma yöntemi müşteriye ayrıca bildirilir. Ödeme iadeleri, kullanılan ödeme yöntemi ve sağlayıcı süreçlerine göre gerçekleştirilir.$doc$,'review_required'),
('on-bilgilendirme-formu','Ön Bilgilendirme Formu','Siparişe özel fiyat, teslimat ve satıcı bilgilerinin ödeme öncesinde oluşturulacağı form altyapısı.',
$doc$## Siparişe özel belge

Ön bilgilendirme formunun nihai sürümü; satıcının resmî unvan ve kayıt bilgileri, seçilen ürünler, vergiler dâhil toplam bedel, teslimat masrafları, ödeme yöntemi ve cayma koşulları kullanılarak ödeme adımında siparişe özel oluşturulacaktır.

## Hukuki inceleme durumu

Bu şablon, şirket kayıtları ve lojistik koşulları kesinleştikten sonra hukuk danışmanı tarafından onaylanmalıdır.$doc$,'review_required'),
('uyelik-sozlesmesi','Üyelik Sözleşmesi','Dreamlac müşteri hesabının kullanım koşullarına ilişkin hukuk onayı bekleyen çalışma metni.',
$doc$## Hesap kullanımı

Üye, hesap bilgilerinin doğru ve güncel olmasından ve giriş bilgilerinin korunmasından sorumludur. Hesap üzerinden sipariş geçmişi ve kayıtlı adresler yönetilebilir.

## Güvenlik

Şüpheli kullanım tespit edilmesi hâlinde hesap güvenlik amacıyla geçici olarak sınırlandırılabilir. Kişisel verilerin işlenmesine ilişkin ayrıntılar KVKK Aydınlatma Metni ve Gizlilik Politikası'nda açıklanır.

## Hukuki inceleme durumu

Bu metin şirketin resmî bilgileri tamamlandıktan sonra hukuk danışmanı tarafından onaylanmalıdır.$doc$,'review_required'),
('ticari-elektronik-ileti-onayi','Ticari Elektronik İleti Onayı','E-posta ve SMS pazarlama izinlerinin kapsamına ilişkin çalışma metni.',
$doc$## Onayın kapsamı

Açık onay verilmesi hâlinde Dreamlac ürünleri, kampanyaları ve duyuruları hakkında e-posta veya SMS ile ticari elektronik ileti gönderilebilir.

## Tercihin geri alınması

Onay, sunulacak abonelikten çıkma kanalı üzerinden her zaman geri alınabilir. Geri alma talebi pazarlama iletilerini durdurur; sipariş ve güvenlik bildirimleri hizmet iletişimi olarak devam edebilir.

## Hukuki inceleme durumu

İYS kayıt yöntemi ve ileti sağlayıcısı kesinleştirildikten sonra bu metin hukuk danışmanı tarafından onaylanmalıdır.$doc$,'review_required')
on conflict(slug) do nothing;

