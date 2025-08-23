const client = mqtt.connect(
  "wss://6c42610c24ec49d388827867a6bb4b71.s1.eu.hivemq.cloud:8884/mqtt",
  {
    clientId: "sigemaWeb_" + Math.random().toString(16).substr(2, 8),
    username: "sigema",
    password: "Sigema2025",
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 2000,
    keepalive: 15,
  }
);

let lastUpdateTime = 0;

// Subscribe MQTT
client.on("connect", () => {
  document.getElementById("status").innerHTML =
    "Status MQTT: <b style='color:green;'>Connected</b>";
  client.subscribe("sigema/data");
  client.subscribe("sigema/status");
});

client.on("message", (topic, message) => {
  const payload = message.toString();

  if (topic === "sigema/data") lastUpdateTime = Date.now();

  if (topic === "sigema/status") {
    if (payload === "online") lastUpdateTime = Date.now();
    document.getElementById("status-alat").innerHTML =
      payload === "online"
        ? "Status Alat: <b style='color:green;'>Online</b>"
        : "Status Alat: <b style='color:red;'>Offline</b>";
    return;
  }

  try {
    const data = JSON.parse(payload);

    // Update suhu
    if (data.suhu !== undefined)
      document.getElementById("suhu").textContent = parseFloat(
        data.suhu
      ).toFixed(1);

    // Update kelembapan
    if (data.kelembapan !== undefined) {
      const kelembapan = parseFloat(data.kelembapan);
      document.getElementById("kelembapan").textContent = kelembapan.toFixed(1);

      // Hitung estimasi ganti silica gel
      let estimasiText = "--";
      let gantiText = "--";
      const now = new Date();

      if (kelembapan >= 80) {
        estimasiText = "Segera ganti silica gel!";
        gantiText = "Sekarang juga!";
      } else if (kelembapan >= 70 && kelembapan < 80) {
        estimasiText = "Silica gel mulai jenuh, estimasi ganti 3 hari lagi";
        // Hitung jam ganti +3 hari
        now.setDate(now.getDate() + 3);
        const jam = now.getHours().toString().padStart(2, "0");
        const menit = now.getMinutes().toString().padStart(2, "0");
        gantiText = `${jam}:${menit} (3 hari dari sekarang)`;
      } else {
        estimasiText = "Kondisi aman, kelembapan stabil";
        gantiText = "Belum perlu diganti";
      }

      document.getElementById("estimasi").textContent =
        "Estimasi: " + estimasiText;
      document.getElementById("ganti-silica").textContent =
        "Ganti silica gel pada: " + gantiText;
    }

    if (data.last_update !== undefined)
      document.getElementById("last-update-time").textContent =
        "Last Update: " + data.last_update;
  } catch (err) {
    console.error("⚠️ Error parsing message:", err.message);
  }
});

// Navbar scroll effect
window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar");
  if (window.scrollY > 20) {
    navbar.classList.add("navbar-scrolled");
  } else {
    navbar.classList.remove("navbar-scrolled");
  }
});

// Mobile menu toggle
const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
menuBtn.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});
