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

    // Suhu
    if (data.suhu !== undefined)
      document.getElementById("suhu").textContent = parseFloat(
        data.suhu
      ).toFixed(1);

    // Kelembapan
    if (data.kelembapan !== undefined)
      document.getElementById("kelembapan").textContent = parseFloat(
        data.kelembapan
      ).toFixed(1);

    // Last Update
    if (data.last_update !== undefined)
      document.getElementById("last-update-time").textContent =
        "Last Update: " + data.last_update;

    // Estimasi
    let estimasiText = "--";
    if (data.kelembapan !== undefined) {
      const kelembapan = parseFloat(data.kelembapan);
      const estJam = data.estimasi_jam;

      if (kelembapan < 59) {
        estimasiText = "Kondisi Sangat Baik";
      } else if (kelembapan >= 59 && kelembapan <= 69) {
        estimasiText = "Normal/Stabil";
      } else if (kelembapan >= 70) {
        if (typeof estJam === "number") {
          estimasiText =
            estJam > 24 ? "Silica Gel Stabil" : estJam.toFixed(1) + " jam";
        } else {
          estimasiText = estJam || "--";
        }
      }
    }
    document.getElementById("estimasi").textContent =
      "Estimasi: " + estimasiText;
  } catch (err) {
    console.error("⚠️ Error parsing message:", err.message);
  }
});

window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar");
  if (window.scrollY > 20) {
    navbar.classList.add("navbar-scrolled");
  } else {
    navbar.classList.remove("navbar-scrolled");
  }
});

const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

menuBtn.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});
