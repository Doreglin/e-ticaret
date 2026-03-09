# S@TRAT |

S@TRAT, standart e-ticaret sitelerinin sıkıcı beyaz arayüzlerini ve sıradan sepet mantıklarını yıkan; "Siberpunk ve RPG" elementleriyle donatılmış Full-Stack bir web uygulamasıdır. Kullanıcılar (Siber-Savaşçılar) sisteme kayıt olabilir, efsanevi kılıçlar, zırhlar veya kaçak siber-donanımlar satın alabilir ve tam teşekküllü bir veritabanı motoru üzerinde işlem yapabilirler.

##  Sistem Özellikleri (Features)

*  Dinamik Stok ve Envanter Motoru: Gerçek zamanlı stok kontrolü. Stok sıfırlandığında ürün kilitlenir ve "TÜKENDİ" ibaresi belirir.
*  SPA (Single Page Application) Profiller: Sayfa yenilenmeden açılan, kullanıcıya özel sipariş geçmişi ve siber-kimlik kartı.
*  Kalıcı Yorum ve Rating Sistemi: Satın alınan ürünlere yapılan yorumlar ve 1-5 yıldızlı değerlendirmelerin genel ürün puanını (SQL üzerinden) dinamik olarak etkilemesi.
*  Sırlar Odası (Gizli Admin Paneli): Özel şifreyle sızılan bir komuta merkezi. Arayüz üzerinden anında yeni ürün ekleme ve stok güncelleme imkanı. admin 123
*  Kişisel İstek Listesi: Her kullanıcının kendi hesabına özel olarak veritabanında saklanan favoriler kasası.
*  Paskalya Yumurtaları (Easter Eggs): Arama motoruna gizlenmiş siberpunk temaları, retro oyunlar (Dungeon Escape) ve özel müzik çalar.

## 🛠️ Kullanılan Teknolojiler (Tech Stack)

**Frontend (İstemci):**
* HTML5 (Semantik ve SPA İskeleti)
* CSS3 (CSS Variables, Flexbox/Grid, Dark/Light Tema Motoru)
* Vanilla JavaScript (ES6+, DOM Manipülasyonu, Fetch API)
* Swiper.js (3D Coverflow Slider)

**Backend (Sunucu):**
* Node.js
* Express.js
* CORS (Cross-Origin Resource Sharing)

**Database (Veritabanı):**
* Microsoft SQL Server (MSSQL)
* `mssql/msnodesqlv8` (ODBC Driver Entegrasyonu)

---

## 🖥️ Ekran Görüntüleri ve Teknik Analiz

Bu siber-bölümde; platformun kullanıcı arayüzüne, yöneticiler için tasarlanmış gizli komuta merkezine, kişiselleştirilmiş kullanıcı profillerine ve canlı ekran görüntüleriyle desteklenen o sarsılmaz hata yakalama (savunma) mekanizmamıza siber-mimar gözüyle bir bakış bulacaksın.

---

### 🌟 Ana Arayüz ve Slider (Frontend UI/UX)

#### Şekil 1: Taktiksel Sensör Vitrini

<img width="1919" height="967" alt="Ekran görüntüsü 2026-03-09 110058" src="https://github.com/user-attachments/assets/4914050b-ab97-4eff-b003-135ea7bff8ee" />

*Bu görsel, **Swiper.js** kütüphanesi tarafından desteklenen imzamız niteliğindeki 3D Coverflow Slider'ı barındıran ana arayüzü sergilemektedir.*

**Teknik Analiz (CSS Grid & Swiper.js):** Bu arayüz sadece görsel bir şölen değil, aynı zamanda teknik bir başyapıttır. Ana ürün vitrini, dinamik kart yerleşimleri için **CSS Grid** ve 3D dönen kaydırıcı efekti için **Swiper.js** kombinasyonu kullanılarak inşa edilmiştir. Eşaralı fontlar (`Consolas`, `Courier New`) ve butonlar ile başlıklar üzerindeki keskin neon parlamalar (`box-shadow` ve `text-shadow`), modern bir e-ticaret platformunun netliğini korurken kullanıcıyı siberpunk atmosferinin içine çekmek için özenle kodlanmıştır.

#### Şekil 2: Dinamik Izgara ve Stok Yönetimi

<img width="1901" height="968" alt="Ekran görüntüsü 2026-03-09 110118" src="https://github.com/user-attachments/assets/805ee5a4-1bd0-4300-9c9b-ea0354720639" />

*Bu görsel, farklı ekipman kategorilerini ve canlı stok izleme sistemini çalışırken gösteren dinamik **CSS Grid** yerleşimimizi sergilemektedir.*

**Teknik Analiz (Stok ve Tükendi Motoru):** Ürün ızgarası, modüler CSS yaklaşımımızın bir kanıtıdır. Esnek (responsive) bir `repeat(auto-fit, minmax(280px, 1fr))` formülüyle **CSS Grid** kullanır ve kart yerleşimini her ekran boyutuna otomatik olarak adapte eder. En önemlisi, bu ekran arka uç (backend) entegrasyonumuzu doğrular: "Katana Red-Switch Klavye" gibi ürünler, gerçek zamanlı **MSSQL** stok durumlarına göre dinamik olarak "TÜKENDİ" olarak işaretlenir; bu da dinamik DOM manipülasyonumuz ile veritabanı senkronizasyonumuzun kanıtıdır.

---

### 🕵️‍♂️ Sırlar Odası: Admin Komuta Merkezi (CRUD İşlemleri)

<img width="1919" height="974" alt="Ekran görüntüsü 2026-03-09 110209" src="https://github.com/user-attachments/assets/bb32cc6e-d41a-4383-91f3-a5b02d346d29" />

*Yeni ganimetleri MSSQL veritabanına enjekte etmek için gizli bir şifre tetikleyicisi aracılığıyla gizli komuta merkezine erişim.*

**Teknik Analiz (CRUD & DOM Injection):** Bu gizli panel, tek bir satır SQL kodu yazmaya gerek kalmadan veritabanını yönetmek için inşa edilmiş projenin taktiksel sinir merkezidir. JavaScript Mimari Raporumuzda detaylandırıldığı gibi, bu panel yalnızca arama çubuğuna gizli bir şifre dizisi girildikten sonra JS motorumuz tarafından dinamik olarak ekrana çizilir (DOM Injection) ve maksimum güvenlik sağlanır. Panel tam **CRUD (Create, Read, Update, Delete)** yeteneği sunarak, yöneticilerin parlak neon yeşili "SİSTEME ENJEKTE ET" butonuna tek bir tıklamasıyla yeni ürünleri, açıklamaları, fiyatları, emojileri ve stok seviyelerini doğrudan MSSQL veritabanına aktarmalarını sağlar.

---

### 🛡️ SPA Profili ve Sipariş Geçmişi (Kişiselleştirilmiş Veri)

<img width="1919" height="970" alt="Ekran görüntüsü 2026-03-09 110130" src="https://github.com/user-attachments/assets/55e5cbe5-cf59-4091-9179-1aea2372135b" />

*Kullanıcının benzersiz kimliğini ve sipariş geçmişini doğrudan MSSQL veritabanından çeken tam ekran, Tek Sayfa Uygulaması (SPA) kişiselleştirilmiş profil sayfasına bir bakış.*

**Teknik Analiz (SPA & Kişiselleştirilmiş SQL Verisi):** Bu ekran, projemizin **Full-Stack kişiselleştirilmiş veri entegrasyonunun** kritik bir kanıtıdır. Kullanıcı profil butonuna tıkladığında, `script.js` motoru ana mağazayı gizler ve sayfanın tamamını yenilemeden (SPA mimarisi) bu kişiselleştirilmiş profili dinamik olarak ekrana çizer. Sistem Node.js'e **asenkron (`async/await`) bir API çağrısı** yapar ve o da sırasıyla MSSQL'den yalnızca o belirli kullanıcının detaylı verilerini (isim, soyisim, telefon vb.) ve tüm sipariş geçmişini çeker. Özel `ui-avatars` profil resminden, benzersiz sipariş kodlarına sahip detaylı faturalara kadar ortaya çıkan bu arayüz, giriş yapmış kullanıcı (Doreglin) için anında oluşturulur ve güvenli, kusursuz çalışan backend-to-frontend veri hattımızı (pipeline) doğrular.

---

### 💥 Savunma Zırhı: Sağlam Hata Yönetimi ve Çökme Motoru

![]()
*MSSQL veritabanı bağlantısı koptuğunda devreye giren imzamız niteliğindeki **özel Hata Yönetimi Arayüzümüzü (Turuncu Kuru Kafa)** yakalayan bir ekran görüntüsü.*

**Teknik Analiz (Async Try/Catch ve Hata Arayüzü):** Bu ekran bir yazılım hatası (bug) değildir; JS Mimari Raporumuzda detaylandırıldığı gibi, gelişmiş JavaScript hata yakalama mekanizmamızı kanıtlamak için inşa edilmiş **güçlü bir savunma zırhıdır**. Standart web uygulamalarında, bir sunucu arızası kullanıcı için bozuk, bembeyaz veya kafa karıştırıcı bir arayüzle sonuçlanır. Bizim sistemimiz ise, sağlam `try/catch` blokları içinde **asenkron (`async/await`) API çağrıları** kullanır. `script.js` motoru bir bağlantı hatası veya sunucu zaman aşımı (`http://localhost:3000` ulaşılamaz durumda) tespit ettiği an hatayı yakalar. Uygulamanın çökmesine izin vermek yerine, normal arayüzü anında silen ve DOM'a bu özel tasarımlı, turuncu kuru kafa "SİSTEM BAĞLANTISI KOPTU!" uyarısını enjekte eden bir kurtarma fonksiyonunu çağırır. Ayrıca kullanıcıya sorunun nasıl çözüleceği konusunda (örneğin terminalden "node server.js" komutu) teknik detaylar sunar. Bu, sistem arızalandığında bile platformun teknik olarak tutarlı ve kullanıcı odaklı kalmasını sağlar ki bu, kıdemli (senior) bir geliştirici için en kritik özelliklerden biridir.

---

### 💻 Header Kod Analizi (Semantik HTML)

![]()
*Platformun HTML başlığına (head), modern semantik etiketler ve temiz, kusursuzca bağlanmış dış kütüphanelerle oluşturulmuş perde arkası bir bakış.*

**Teknik Analiz (Temiz ve Semantik Kod):** VS Code'dan alınan bu ekran görüntüsü, HTML Mimari Raporumuzda açıklandığı gibi semantik HTML5 standartlarına bağlılığımızı doğrulayarak makine dairesine (engine room) bir bakış sağlar. Tema motoru için `[data-theme="dark"]` niteliği ve titizlikle konumlandırılmış bölümler, maksimum kod okunabilirliği ve sürdürülebilirlik (sustainability) sağlar. İkonlar için FontAwesome ve 3D kaydırıcı için Swiper.js gibi standart/güvenilir dış kütüphaneleri kullanımımızı doğrular; bu kütüphaneler bu hassas HTML yolları (href) aracılığıyla arka ucumuz ve ana JS motorumuzla sorunsuz bir şekilde bütünleşir.

----

## ⚙️ Kurulum ve Kurma (Installation)

Siber-ağı kendi yerel makinenizde (Localhost) çalıştırmak için aşağıdaki adımları izleyin:

### 1. Gereksinimler
* [Node.js](https://nodejs.org/) (Güncel sürüm)
* [Microsoft SQL Server (SSMS)](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms)

### 2. Projeyi Klonlayın

**bash**
git clone [https://github.com/KULLANICI_ADIN/satrat-cephanelik.git](https://github.com/KULLANICI_ADIN/satrat-cephanelik.git)
cd satrat-cephanelik

----

### 3. Gerekli Kütüphaneleri Yükleyin
npm init -y
npm install express mssql cors mssql/msnodesqlv8

----

### 4. Veritabanını (MSSQL) Hazırlayın
SQL Server Management Studio'yu (SSMS) açın.
satrat_db adında yeni bir veritabanı oluşturun.
Proje dosyaları içinde bulunan SQL sorgularını çalıştırarak products, users, orders, comments ve favorites tablolarını oluşturun.
server.js dosyasındaki veritabanı bağlantı (ConnectionString) ayarlarını kendi bilgisayarınızın SQL Server adına göre güncellediğinizden emin olun.

----

terminale node server.js yazın


