# Pengaduan Mobile 📢📱

Aplikasi Mobile **Sistem Aspirasi & Pengaduan Masyarakat (SAS)** yang dibangun menggunakan **[Expo](https://expo.dev)** dan **React Native** dengan **Expo Router**.

---

## 📌 Deskripsi

Aplikasi **Pengaduan Mobile** ini dirancang untuk memudahkan masyarakat/pengguna dalam menyampaikan aspirasi, pengaduan, dan keluhan secara cepat, efisien, dan transparan. Aplikasi ini dilengkapi dengan dukungan mode penyimpanan lokal (Offline Mock) serta pengintegrasian ke Server Backend REST API.

---

## ✨ Fitur Utama

- 🔐 **Autentikasi Pengguna**: Login & Registrasi Akun Masyarakat.
- 📝 **Buat Laporan / Aspirasi**: Form pengiriman laporan disertai judul, kategori, deskripsi, lokasi, dan opsi foto/lampiran.
- 📋 **Daftar Laporan**: Melihat daftar riwayat pengaduan beserta status tindak lanjut (Pending, Diproses, Selesai, Ditolak).
- 🔍 **Detail Laporan & Tanggapan**: Melihat rincian pengaduan lengkap beserta balasan/tanggapan dari petugas.
- 👤 **Profil Pengguna**: Manajemen profil pengguna dan riwayat akun.
- 🌐 **Offline / Online API Switch**: Mendukung penyimpanan lokal `AsyncStorage` serta sinkronisasi ke REST API backend.

---

## 🛠️ Persyaratan Sistem

Sebelum menjalankan proyek ini, pastikan Anda telah menginstal:

- **Node.js** (versi LTS disarankan)
- **npm** atau **yarn**
- **Expo Go** (Aplikasi di Play Store / App Store untuk pengujian di smartphone)
- *(Opsional)* **Android Studio** / **Xcode** untuk emulator/simulator.

---

## 🚀 Cara Menjalankan

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Rizqinus/Perpustakaan-Mobile.git
cd Perpustakaan-Mobile
npm install
```

### 2. Jalankan Server Expo
```bash
npx expo start
# atau
npm start
```

### 3. Buka Aplikasi
- **HP Fisik**: Buka aplikasi **Expo Go**, scan **QR Code** yang tampil di terminal.
- **Android Emulator**: Tekan `a` pada terminal.
- **iOS Simulator**: Tekan `i` pada terminal.
- **Web Browser**: Tekan `w` pada terminal.

---

## ⚙️ Konfigurasi Backend API

Secara bawaan, aplikasi akan menggunakan mode offline (Mock Storage). Jika ingin menghubungkan ke backend server:

Buka file [`src/services/api.ts`](file:///e:/Data/Documents/11_RPL_2/Semester_2\PM\Project\SAS\mobile\src\services\api.ts) dan atur URL backend Anda:

```typescript
// Ganti dengan IP lokal komputer Anda jika menguji dengan HP fisik
const BASE_URL = 'http://192.168.x.x:8000/api';
```

---

## 📁 Struktur Direktori

```text
mobile/
├── src/
│   ├── app/                # Route & Halaman Aplikasi (Expo Router)
│   │   ├── index.tsx       # Halaman Utama / Home
│   │   ├── login.tsx       # Halaman Login
│   │   ├── register.tsx    # Halaman Register
│   │   ├── lapor.tsx       # Form Pengaduan Baru
│   │   ├── laporan-list.tsx# List Pengaduan
│   │   ├── detail.tsx      # Detail Pengaduan & Tanggapan
│   │   └── profil.tsx      # Halaman Profil
│   ├── context/            # Global State (Auth Context)
│   ├── services/           # Service API & Local Storage
│   └── types.ts            # TypeScript Interfaces & Types
├── assets/                 # Gambar & Icon Aplikasi
├── app.json                # Konfigurasi Expo Project
└── README.md
```

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan penguji / pengembangan Sistem Aspirasi & Pengaduan Masyarakat.

**Made with ❤️ using Expo Router**

