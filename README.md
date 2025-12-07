# PROJECT LARAVEL-INERTIA-REACT  
Website Top Up dengan Integrasi API VIP RESELLER DAN ESIM ACCES dan Integrasi Payment Method Midtrans

Proyek ini adalah aplikasi **Website Top Up Game** yang dibangun menggunakan **Laravel**, **Inertia.js**, dan **React.js**.  
Pengguna dapat memilih layanan, memilih item, melakukan pembayaran melalui Midtrans, dan melihat halaman invoice.

---

## 🚀 Tech Stack
- Laravel 10+
- Inertia.js
- React.js
- TailwindCSS
- Midtrans API (Snap/Core API)

---

## 🎯 Fitur Utama

### 1. Pilih Layanan
Pengguna memilih kategori layanan/top up game seperti:
- Mobile Legends  
- Free Fire  
- PUBG  
- Dan lainnya

### 2. Pilih Item
Setiap layanan memiliki list item seperti:
- Diamonds  
- UC  
- Gems  
- Paket top up  

### 3. Checkout & Pembayaran (Midtrans)
- Integrasi Midtrans Snap/Core API  
- Generate payment token  
- Mendukung berbagai metode seperti:
  - QRIS  
  - Bank Transfer  
  - E-Wallet  

### 4. Webhook Midtrans
Sistem menerima notifikasi otomatis dari Midtrans:
- Pending  
- Success  
- Failed  

Invoice diperbarui otomatis sesuai status pembayaran.

### 5. Halaman Invoice
Menampilkan:
- Detail order  
- Status pembayaran  
- Metode pembayaran  
- Item & jumlah  

---

## 🛠️ Instalasi & Setup

### 1. Clone Repository
```bash
git clone https://github.com/username/project-laravel-inertia-react.git
cd project-laravel-inertia-react
