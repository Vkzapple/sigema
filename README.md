# SIGEMA – Silica Gel Effectiveness Monitoring & Assistant

Versi: 2.0 (IoT + Web)

Sistem ini bertujuan untuk memantau efektivitas silica gel sebagai penyerap kelembaban dalam penyimpanan barang laboratorium, gudang, atau ruang server. Proyek ini mengintegrasikan **sensor kelembaban**, **mikrokontroler ESP32**, serta **sistem backend dan frontend** yang saling terhubung.

---

## 🧩 Fitur Utama Modul Ini

- Pemantauan kelembaban real-time menggunakan DHT11/DHT22
- Indikator efektivitas silica gel (Efektif → Jenuh)
- LED status indikator (Hijau: Aman, Merah: Butuh ganti)
- Monitoring visual melalui OLED display
- Integrasi ke platform SIGEMA melalui koneksi Wi-Fi
- Logging data ke server (fitur opsional, tergantung backend)

---

## 🛠 Teknologi & Komponen

### 📦 Hardware:

- ESP32 Dev Board
- DHT22 (Sensor Suhu & Kelembaban)
- OLED I2C Display (0.96 inch)
- Breadboard, jumper, resistor, dan power supply

### 🧪 Software:

- Arduino IDE
- Arduino libraries: `Adafruit_Sensor`, `DHT`, `Wire`, `Adafruit_GFX`, `Adafruit_SSD1306`
- Git + GitHub
- Backend: Node.js, next: PHP (Laravel)
- Frontend: HTML + TailwindCSS, Vanilla.Js
