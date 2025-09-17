#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include "time.h"

// ====== WiFi cấu hình tại đây ======
const char* ssid = "Ten-WiFi-Nha-Ban";      // đổi tên WiFi của bạn
const char* password = "MatKhauWiFi";       // đổi mật khẩu WiFi nhà bạnnn

// ====== NTP (giờ Việt Nam) ======
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 7 * 3600;  // múi giờ VN/hoặc múi giờ chổ bạn
const int daylightOffset_sec = 0;

// ====== Web server ======
AsyncWebServer server(80);

// ====== Nhóm A: 4 relay điều khiển bằng app ======
const int relayPinsA[4] = {16, 17, 18, 19};
bool relayAState[4] = {false, false, false, false};

// ====== Nhóm B: cảm biến + relay ======
const int pirPin = 34;   // cảm biến PIR
const int relayB = 13;   // relay nhóm B
bool relayBState = false;

unsigned long lastMotionTime = 0;

void setup() {
  Serial.begin(115200);

  // Setup relay nhóm A
  for (int i = 0; i < 4; i++) {
    pinMode(relayPinsA[i], OUTPUT);
    digitalWrite(relayPinsA[i], LOW);
  }

  // Setup nhóm B
  pinMode(pirPin, INPUT);
  pinMode(relayB, OUTPUT);
  digitalWrite(relayB, LOW);

  // Kết nối WiFi
  WiFi.begin(ssid, password);
  Serial.print("Đang kết nối WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nĐã kết nối WiFi");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  // Cấu hình NTP
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

  // API điều khiển relay
  server.on("/relay", HTTP_GET, [](AsyncWebServerRequest *request){
    if (request->hasParam("id") && request->hasParam("state")) {
      int id = request->getParam("id")->value().toInt();
      int state = request->getParam("state")->value().toInt();

      if (id >= 0 && id < 4) { // Nhóm A
        relayAState[id] = state;
        digitalWrite(relayPinsA[id], relayAState[id] ? HIGH : LOW);
        request->send(200, "text/plain", "Relay A updated");
        return;
      }

      if (id == 5) { // Nhóm B (trước 23h)
        relayBState = state;
        digitalWrite(relayB, relayBState ? HIGH : LOW);
        request->send(200, "text/plain", "Relay B updated");  //khi app gửi request / relay?id=5&state=1 thì bật, /relay?id=5&state=0 thì off
        return;
      }
    }
    request->send(400, "text/plain", "Invalid params");
  });

  server.begin();
}

void loop() {
  struct tm timeinfo;   //lấy giờ thực tế từ internet, nếu ko cần thì khỏi
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Không lấy được thời gian");
    delay(1000);
    return;
  }
  int hour = timeinfo.tm_hour;

  // Sau 23h: bật chế độ cảm biến
  if (hour >= 23) {
    int pirValue = digitalRead(pirPin);

    if (pirValue == HIGH) {
      lastMotionTime = millis();
      digitalWrite(relayB, HIGH);
      relayBState = true;
    }

    if (relayBState) {
      if (millis() - lastMotionTime > 5UL * 60UL * 1000UL) { // hết 5 phút
        unsigned long checkStart = millis();
        bool stillMotion = false;

        while (millis() - checkStart < 60UL * 1000UL) { // kiểm tra thêm 1 phút
          if (digitalRead(pirPin) == HIGH) {
            stillMotion = true;
            break;
          }
          delay(100);
        }

        if (stillMotion) {
          lastMotionTime = millis(); // reset lại 5 phút
        } else {
          digitalWrite(relayB, LOW);
          relayBState = false;
        }
      }
    }
  }
  // Trước 23h: nhóm B chỉ điều khiển bằng app
}
