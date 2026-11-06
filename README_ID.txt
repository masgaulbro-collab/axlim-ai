AXLIM AI - VERSI GEMINI UNTUK NETLIFY

PENTING:
- Paket ini mengaktifkan backend AI menggunakan Gemini API.
- Website saat ini masih demo sampai paket ini dipasang, fungsi Netlify ter-deploy, dan API key ditambahkan.
- API key jangan pernah ditulis di index.html atau dikirim ke chat publik.

LANGKAH RINGKAS:
1. Buat API key di Google AI Studio: https://aistudio.google.com/app/apikey
2. Simpan API key tersebut secara pribadi.
3. Upload folder proyek ini ke repository GitHub (struktur folder harus tetap sama).
4. Hubungkan repository GitHub itu ke Netlify sebagai project dari Git.
5. Di Netlify buka Site configuration / Environment variables.
6. Tambahkan variable:
   Key: GEMINI_API_KEY
   Value: (API key dari Google AI Studio)
7. Simpan lalu lakukan deploy ulang.
8. Buka website AXLIM. Status akan berubah menjadi AI READY jika fungsi dan key sudah aktif.

MODEL:
Default model: gemini-3.8-flash
Bisa diganti dengan environment variable GEMINI_MODEL jika model yang tersedia pada akun/API key berbeda.

CATATAN:
- Kuota gratis Gemini bergantung model, wilayah, dan batas penggunaan Google; bukan tanpa batas dan dapat berubah.
- Jangan masukkan informasi rahasia ke layanan AI.
- Pada paket gratis, Google dapat menggunakan data yang dikirim untuk meningkatkan produk sesuai ketentuan Google.
- Netlify Drop biasa hanya mengunggah file statis; agar backend Netlify Functions berjalan, deploy melalui GitHub/Git atau Netlify CLI diperlukan.

Dokumentasi resmi:
https://ai.google.dev/gemini-api/docs
https://ai.google.dev/gemini-api/docs/models
