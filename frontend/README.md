# TaskFlow AI

Aplikasi manajemen tugas cerdas yang menggunakan Google Gemini AI untuk membantu memecah tugas besar menjadi sub-tugas yang dapat ditindaklanjuti dan memberikan saran prioritas secara otomatis.

## Fitur

- **Manajemen Tugas**: Buat, edit, hapus, dan tandai tugas selesai.
- **AI Assistant**: 
  - Analisis prioritas tugas otomatis.
  - Generasi sub-tugas (steps) otomatis berdasarkan deskripsi.
- **Sistem Login**: Autentikasi pengguna sederhana (Mock).
- **Filtering & Sorting**: Cari dan filter tugas berdasarkan status.

## Cara Menjalankan

### 1. Install Dependencies

Karena konfigurasi telah diperbarui ke Vite, jalankan install ulang:

```bash
npm install
```

### 2. Konfigurasi Environment

Pastikan file `.env` memiliki API Key:

```bash
API_KEY=your_actual_api_key_here
```

### 3. Jalankan Server Development

Gunakan perintah ini (bukan `npm start`):

```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:5173](http://localhost:5173).

## Struktur Project

- `/components`: Komponen UI (Form, List, Login).
- `/services`: Logika bisnis (Auth, Task Storage, Gemini AI).
- `/types`: Definisi tipe TypeScript.

## Catatan Login

- **Email**: Bebas (contoh: `user@demo.com`)
- **Password**: Minimal 6 karakter.
