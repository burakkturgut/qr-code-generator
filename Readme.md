#  QR Code Generator

Modern, kullanıcı dostu ve tamamen ücretsiz QR kod oluşturma platformu. Özelleştirilebilir tasarım, çoklu dil desteği ve bulut tabanlı depolama ile profesyonel QR kodlar oluşturun.

Canlı : https://qr-code-generator-pied-eight.vercel.app

##  Özellikler

###  **Özelleştirilebilir QR Kodlar**
- Özel renk seçenekleri (QR kodu ve arka plan)
- Boyut ayarlama (küçük, orta, büyük)
- Hazır renk temaları (Klasik, Mavi, Kırmızı, Yeşil, Bordo, Gold)
- Anında önizleme

###  **Responsive Tasarım**
- Mobil, tablet ve desktop uyumlu
- Modern ve kullanıcı dostu arayüz
- Glassmorphism tasarım efektleri
- Smooth animasyonlar

###  **Çoklu Dil Desteği**
- Türkçe 🇹🇷
- İngilizce 🇬🇧
- Anında dil değiştirme

###  **Bulut Depolama**
- Tüm QR kodlarınız güvenle saklanır
- Sınırsız QR kod oluşturma
- Geçmiş kayıtlar ve filtreleme
- Tek tıkla indirme

###  **Gelişmiş Filtreleme**
- Metin araması
- Tarih filtresi (Bugün, Bu hafta, Bu ay)
- Sıralama (En yeni/En eski)

###  **PDF Export**
- Birden fazla QR kodu seçme
- Toplu PDF olarak indirme
- Profesyonel PDF formatı

###  **Güvenlik**
- JWT tabanlı kimlik doğrulama
- Şifreli veri saklama
- Kullanıcı bazlı erişim kontrolü

###  **Hesap Yönetimi**
- E-posta değiştirme
- Şifre değiştirme
- Hesap silme
- Profil istatistikleri

---

##  Kullanılan Teknolojiler

### Frontend
- **React 19.2.5** - Modern UI kütüphanesi
- **Vite** - Hızlı build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Sayfa yönlendirme
- **Axios** - HTTP client
- **i18next** - Çoklu dil desteği
- **jsPDF** - PDF oluşturma

### Backend
- **Flask** - Python web framework
- **PostgreSQL** - Veritabanı
- **SQLAlchemy** - ORM
- **Flask-JWT-Extended** - Kimlik doğrulama
- **Flask-CORS** - Cross-origin resource sharing
- **Pillow** - Görüntü işleme
- **qrcode** - QR kod oluşturma

### Deployment
- **Vercel** - Frontend hosting
- **Koyeb** - Backend hosting
- **Neon.tech** - PostgreSQL database

---

##  Proje Yapısı

```
qr-code-generator/
├── backend/
│   ├── app.py                 # Ana uygulama
│   ├── auth.py                # Kimlik doğrulama
│   ├── config.py              # Konfigürasyon
│   ├── models.py              # Database modelleri
│   ├── requirements.txt       # Python bağımlılıkları
│   ├── Dockerfile            # Docker config
│   └── qr/
│       ├── __init__.py
│       └── qr_bp.py          # QR kod blueprint
├── frontend/
│   ├── src/
│   │   ├── components/       # React componentleri
│   │   ├── pages/           # Sayfalar
│   │   ├── services/        # API servisleri
│   │   ├── locales/         # Dil dosyaları
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── docker-compose.yml
└── README.md
```

---

##  Telif Hakkı

Bu proje ve içerisindeki tüm kaynak kodlar, tasarımlar ve içerikler
Burak Turgut’a aittir.

Bu projeyi kullanmak, kopyalamak, dağıtmak veya herhangi bir amaçla yeniden kullanmak için önceden yazılı izin alınması gerekmektedir.

Ticari kullanım veya yeniden dağıtım için lütfen iletişime geçiniz.

---

##  Geliştirici

**BURAK TURGUT**
- GitHub: [@burakkturgut](https://github.com/burakkturgut)
- LinkedIn: [linkedin.com/in/burakkturgut](https://www.linkedin.com/in/burakkturgut)
- Email: burak.turgut.dev@gmail.com

---

<div align="center">
  <strong>⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın! ⭐</strong>
</div>

<div align="center">
  Made with by Burak Turgut
</div>