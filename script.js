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
  if (topic === "sigema/data") {
    lastUpdateTime = Date.now();
  }
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
    if (data.suhu !== undefined)
      document.getElementById("suhu").textContent = data.suhu.toFixed(1);
    if (data.kelembapan !== undefined)
      document.getElementById("kelembapan").textContent =
        data.kelembapan.toFixed(1);
  } catch (err) {
    console.error("⚠️ Error parsing message:", err.message);
  }
});

client.on("error", (err) => console.error("⚠️ MQTT Error:", err.message));
client.on("close", () => {
  document.getElementById("status").innerHTML =
    "Status MQTT: <b style='color:red;'>Disconnected</b>";
});
let lastUpdateTime = Date.now();

function checkAlatTimeout() {
  const now = Date.now();
  const diff = now - lastUpdateTime;
  const timeoutThreshold = 10000;

  if (diff > timeoutThreshold) {
    document.getElementById("status-alat").innerHTML =
      "Status Alat: <b style='color:red;'>Offline (Timeout)</b>";
  }
}

setInterval(checkAlatTimeout, 5000);

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
document.getElementById("last-update").textContent =
  "Terakhir update: " + new Date().toLocaleTimeString();
