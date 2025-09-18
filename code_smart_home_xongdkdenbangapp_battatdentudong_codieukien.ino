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
// Non-blocking kiểm tra 1 phút sau khi hết 5 phút không có chuyển động
bool checkingWindowActive = false;
unsigned long checkingWindowStartMs = 0;

// Theo dõi giờ lần cuối lấy được từ NTP để fallback nếu getLocalTime() thất bại
int lastKnownHour = -1;

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

      if (state != 0 && state != 1) {
        request->send(400, "text/plain", "state must be 0 or 1");
        return;
      }

      if (id >= 0 && id < 4) { // Nhóm A
        relayAState[id] = (state == 1);
        digitalWrite(relayPinsA[id], relayAState[id] ? HIGH : LOW);
        request->send(200, "text/plain", "Relay A updated");
        return;
      }

      if (id == 5) { // Nhóm B
        // Kiểm tra giờ hiện tại để quyết định có cho phép điều khiển tay không
        struct tm nowInfo;
        bool timeOk = getLocalTime(&nowInfo);
        int currentHour = timeOk ? nowInfo.tm_hour : lastKnownHour;
        bool autoMode = (currentHour >= 23);
        if (autoMode) {
          request->send(423, "text/plain", "Relay B locked: auto mode after 23h");
          return;
        }
        relayBState = (state == 1);
        digitalWrite(relayB, relayBState ? HIGH : LOW);
        request->send(200, "text/plain", "Relay B updated");
        return;
      }
    }
    request->send(400, "text/plain", "Invalid params");
  });

  server.begin();
}

void loop() {
  struct tm timeinfo;   //lấy giờ thực tế từ internet, nếu ko cần thì khỏi
  bool gotTime = getLocalTime(&timeinfo);
  int hour;
  if (gotTime) {
    hour = timeinfo.tm_hour;
    lastKnownHour = hour;
  } else {
    // Fallback: dùng giờ lần cuối lấy được; nếu chưa có, giả định <23h để tránh khóa điều khiển tay
    if (lastKnownHour == -1) {
      hour = 12; // fallback an toàn
    } else {
      hour = lastKnownHour;
    }
  }

  // Sau 23h: bật chế độ cảm biến
  if (hour >= 23) {
    int pirValue = digitalRead(pirPin);

    // Phát hiện chuyển động: bật ngay và ghi nhận thời điểm
    if (pirValue == HIGH) {
      lastMotionTime = millis();
      digitalWrite(relayB, HIGH);
      relayBState = true;
      // Nếu đang trong cửa sổ kiểm tra, thoát ra vì đã có chuyển động
      if (checkingWindowActive) {
        checkingWindowActive = false;
      }
    }

    // Nếu đang bật và đã quá 5 phút không phát hiện thêm chuyển động
    if (relayBState) {
      unsigned long elapsedSinceLastMotion = millis() - lastMotionTime;
      if (!checkingWindowActive && elapsedSinceLastMotion > 5UL * 60UL * 1000UL) {
        // Bắt đầu cửa sổ kiểm tra 1 phút (non-blocking)
        checkingWindowActive = true;
        checkingWindowStartMs = millis();
      }

      if (checkingWindowActive) {
        // Trong cửa sổ kiểm tra, nếu có chuyển động -> tiếp tục bật và reset 5 phút
        if (digitalRead(pirPin) == HIGH) {
          lastMotionTime = millis();
          checkingWindowActive = false;
        } else {
          // Hết 1 phút mà không có chuyển động -> tắt
          if (millis() - checkingWindowStartMs >= 60UL * 1000UL) {
            digitalWrite(relayB, LOW);
            relayBState = false;
            checkingWindowActive = false;
          }
        }
      }
    }
  }
  // Trước 23h: nhóm B chỉ điều khiển bằng app
}
