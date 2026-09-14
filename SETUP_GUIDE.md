# 📱 Panduan Setup Aplikasi Mobile SAS (Sistem Aspirasi & Pengaduan)

Panduan ini akan membantu Anda mengonfigurasi, menginstal, dan menjalankan aplikasi mobile SAS yang dibangun menggunakan **Expo (React Native)** dengan **Expo Router**.

---

## 📋 Prasyarat (Prerequisites)

Sebelum memulai, pastikan Anda telah menginstal tools berikut di komputer Anda:

1. **Node.js** (Rekomendasi versi LTS terbaru)
2. **npm** (Bawaan setelah menginstal Node.js)
3. **Expo Go** (Instal dari Google Play Store atau Apple App Store di HP fisik Anda untuk pengujian langsung)
4. *(Opsional)* **Android Studio** (untuk Emulator Android) atau **Xcode** (hanya untuk macOS, jika ingin menggunakan Simulator iOS)

---

## 🛠️ Langkah Instalasi

Ikuti langkah-langkah di bawah ini untuk memulai pengembangan:

### 1. Masuk ke Direktori Project Mobile
Buka terminal/command prompt dan masuk ke folder `mobile`:
```bash
cd mobile
```

### 2. Instal Dependensi
Jalankan perintah berikut untuk menginstal seluruh pustaka yang dibutuhkan:
```bash
npm install
```

---

## ⚙️ Konfigurasi API / Backend

Aplikasi mobile SAS mendukung dua mode penyimpanan data:
1. **Mode Mock / Offline (Default)**: Menggunakan `AsyncStorage` di dalam perangkat untuk menyimpan data secara lokal. Cocok untuk pengujian cepat tanpa menyalakan server backend.
2. **Mode Online (Backend Server)**: Menghubungkan aplikasi langsung ke backend API.

Untuk menghubungkan ke backend, buka file [api.ts](file:///e:/Data/Documents/11_RPL_2/Semester_2/PM/Project/SAS/mobile/src/services/api.ts):
```typescript
// Ganti null dengan URL API backend Anda
const BASE_URL = 'http://<IP_KOMPUTER_ANDA>:8000/api'; 
```

> [!IMPORTANT]
> - Jangan gunakan `localhost` atau `127.0.0.1` jika Anda menguji menggunakan HP fisik dengan **Expo Go**. Gunakan IP lokal komputer Anda (contoh: `http://192.168.1.100:8000/api`).
> - Pastikan HP dan Komputer Anda berada dalam **satu jaringan Wi-Fi yang sama**.

---

## 🚀 Menjalankan Aplikasi

Jalankan perintah-perintah berikut sesuai dengan target perangkat pengujian Anda:

### Menggunakan Expo CLI (Metode Utama)
Jalankan server Expo dengan perintah:
```bash
npm start
# atau
npx expo start
```
Setelah server berjalan, terminal akan menampilkan **QR Code**.

### Cara Menghubungkan ke Perangkat:
* **HP Android (Expo Go)**: Buka aplikasi **Expo Go**, lalu pilih **Scan QR Code** dan arahkan kamera ke QR Code di terminal.
* **HP iOS (Expo Go)**: Buka aplikasi kamera bawaan iOS, arahkan ke QR Code di terminal, lalu buka tautan yang muncul menggunakan aplikasi **Expo Go**.
* **Android Emulator**: Tekan tombol `a` pada keyboard saat server Expo aktif di terminal.
* **iOS Simulator**: Tekan tombol `i` pada keyboard saat server Expo aktif di terminal.
* **Web Browser**: Tekan tombol `w` pada keyboard (membutuhkan konfigurasi webpack tambahan jika belum diatur).

---

## 🔄 Mereset Project ke Template Bersih
Jika Anda ingin memulai dari awal dan memindahkan kode saat ini ke folder backup:
```bash
npm run reset-project
```

---

## ⚠️ Troubleshooting Umum

1. **Error: Network Request Failed (Saat menghubungkan ke Backend)**
   * Pastikan URL API backend menggunakan IP komputer lokal Anda (bukan `localhost`).
   * Pastikan port backend (misalnya `8000`) sudah terbuka dan tidak diblokir firewall.
   * Pastikan HP dan komputer terhubung ke jaringan Wi-Fi yang sama.
   
2. **Gagal Memuat Font / Assets**
   * Hapus cache expo dan mulai ulang dengan perintah:
     ```bash
     npx expo start -c
     ```

3. **Versi SDK Tidak Cocok**
   * Project ini dikonfigurasi menggunakan **Expo SDK 56**. Pastikan aplikasi **Expo Go** di HP Anda merupakan versi terbaru yang mendukung SDK ini.
