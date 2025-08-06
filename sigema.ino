#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <DHT.h>

#define DHTPIN 4     //ganti sesuai gpio/pin digital  
#define DHTTYPE DHT22   

const char* ssid = "WIFI SMKN 1";
const char* password = "gurusmkn1";
const char* mqtt_server = "6c42610c24ec49d388827867a6bb4b71.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "sigema";
const char* mqtt_pass = "Sigema2025";

DHT dht(DHTPIN, DHTTYPE);
WiFiClientSecure espClient;
PubSubClient client(espClient);

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Menghubungkan ke ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi terhubung");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Mencoba konek MQTT...");
    if (client.connect("ESP32Client", mqtt_user, mqtt_pass)) {
      Serial.println("terhubung");
    } else {
      Serial.print("gagal, rc=");
      Serial.print(client.state());
      Serial.println(" coba lagi dalam 5 detik");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  setup_wifi();

  espClient.setInsecure();  

  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  float suhu = dht.readTemperature();
  float kelembapan = dht.readHumidity();

  if (isnan(suhu) || isnan(kelembapan)) {
    Serial.println("Gagal membaca dari sensor DHT!");
    return;
  }

  String payload = "{\"suhu\":" + String(suhu) + ", \"kelembapan\":" + String(kelembapan) + "}";
  Serial.println("Mengirim data: " + payload);

  client.publish("sigema/data", payload.c_str());

  delay(5000);
}
