#include <Wire.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include "time.h"
#include "DHT.h"
#include <U8g2lib.h>   

#define BUZZER_PIN 5  
#define DHTPIN 4
#define DHTTYPE DHT22

U8G2_SH1106_128X64_NONAME_F_HW_I2C display(U8G2_R0, U8X8_PIN_NONE);

const char* ssid = "cuihh";
const char* password = "04050607";

const char* mqtt_server = "6c42610c24ec49d388827867a6bb4b71.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "sigema";
const char* mqtt_pass = "Sigema2025";

const float RH_LOW = 55.0;  
const float RH_HIGH = 75.0;  

const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 7 * 3600; 
const int daylightOffset_sec = 0;

WiFiClientSecure espClient;
PubSubClient client(espClient);
DHT dht(DHTPIN, DHTTYPE);

unsigned long lastMsg = 0;
const long interval = 10000; 
bool sensorOK = false;

void updateOLED(float suhu, float lembap, String statusSG);

void setup_wifi() {
  Serial.println("[DEBUG] Menghubungkan ke WiFi...");
  WiFi.begin(ssid, password);

  int retry = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    retry++;
    if (retry > 20) {
      Serial.println("\n[ERROR] Gagal terhubung ke WiFi.");
      return;
    }
  }
  Serial.println("\n[OK] WiFi terhubung, IP: " + WiFi.localIP().toString());

  
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

  struct tm timeinfo;
  retry = 0; 
  while(!getLocalTime(&timeinfo) && retry < 20) {
    delay(1000);
    retry++;
    Serial.print(".");
  }
  if(retry < 20){
    Serial.println("\n[OK] Waktu NTP tersinkronisasi.");
  } else {
    Serial.println("\n[ERROR] Tidak bisa sinkronisasi waktu!");
  }
} 

void reconnect() {
  while (!client.connected()) {
    Serial.print("[DEBUG] Menghubungkan ke MQTT...");
    String clientId = "sigemaClient-" + String(random(0xffff), HEX);

    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass, "sigema/status", 1, true, "offline")) {
      Serial.println(" [OK] Terhubung ke broker MQTT.");
      client.publish("sigema/status", "online", true);
    } else {
      Serial.print(" [ERROR] rc=");
      Serial.print(client.state());
      Serial.println(" coba lagi 5 detik...");
      delay(5000);
    }
  }
}

String getTimeString() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) return "Time Error";
  char buffer[30];
  strftime(buffer, sizeof(buffer), "%d-%m-%Y %H:%M:%S", &timeinfo);
  return String(buffer);
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("[DEBUG] Memulai...");

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, HIGH);

  Serial.println("[DEBUG] Inisialisasi DHT22...");
  dht.begin();
  delay(2000); 
  sensorOK = true;

  Serial.println("[DEBUG] Inisialisasi I2C & OLED...");
  Wire.begin();        
  display.begin();      
  display.clearBuffer();
  display.setFont(u8g2_font_ncenB08_tr); 
  display.drawStr(0, 10, "SIGEMA OFF!");
  display.sendBuffer();

  Serial.println("[DEBUG] Set SSL mode...");
  espClient.setInsecure();

  setup_wifi();
  delay(500);   
  client.setServer(mqtt_server, mqtt_port);
}


void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  unsigned long now = millis();
  if (now - lastMsg > interval) {
    lastMsg = now;

    if (sensorOK) {
      float suhu = dht.readTemperature();
      float lembap = dht.readHumidity();

      if (!isnan(suhu) && !isnan(lembap)) {
        if (lembap < RH_LOW || lembap > RH_HIGH) digitalWrite(BUZZER_PIN, LOW);
        else digitalWrite(BUZZER_PIN, HIGH);

        String statusSG;
        if (lembap >= 50 && lembap <= 69) {
          statusSG = "Stabil (aman)";
        } else if (lembap >= 70 && lembap <= 75) {
          statusSG = "SEGERA ganti!";
        } else if (lembap >= 76 && lembap <= 85) {
          statusSG = "GANTI SEKARANG!";
        } else if (lembap > 85) {
          statusSG = "BAHAYA! SG JENUH";
        } else {
          statusSG = "Terlalu kering";
        }

        updateOLED(suhu, lembap, statusSG);

        String payload = "{";
        payload += "\"suhu\":" + String(suhu,1) + ",";
        payload += "\"kelembapan\":" + String(lembap,1) + ",";
        payload += "\"last_update\":\"" + getTimeString() + "\",";
        payload += "\"status\":\"" + statusSG + "\"";
        payload += "}";
        Serial.println("[DEBUG] Kirim MQTT:");
        Serial.println(payload);
        client.publish("sigema/data", payload.c_str());
        client.publish("sigema/status", "online", true);
        delay(10);
      } else {
        Serial.println("[ERROR] Gagal membaca sensor DHT22");
      }
    }
  }
}

void updateOLED(float suhu, float lembap, String statusSG) {
  display.clearBuffer();                
  display.setFont(u8g2_font_ncenB08_tr); 

  char buf[32];
  sprintf(buf, "Suhu: %.1f C", suhu);
  display.drawStr(0, 12, buf);

  sprintf(buf, "Lembap: %.1f %%", lembap);
  display.drawStr(0, 28, buf);

  display.drawStr(0, 44, statusSG.c_str());
  display.sendBuffer();  
}
