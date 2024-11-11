#include "Arduino.h"
#include <ArduinoJson.h>
#include <TimeLib.h>

// Pin Definitions
#define RXD2 16
#define TXD2 17
#define MOTION_PIN 5  // Motion sensor input pin
#define LED_PIN 4     // LED output pin (PWM supported)
#define ELEC_METRIC_PIN 13

// Khởi tạo Serial và pin
void setup() {
  Serial.begin(9600);
  Serial2.begin(9600, SERIAL_8N1, RXD2, TXD2);
  delay(500);  // Cho thời gian để thiết lập

  pinMode(MOTION_PIN, INPUT);  // Motion sensor pin as input
  pinMode(LED_PIN, OUTPUT);    // LED pin as output
}

// Điều khiển độ sáng đèn LED
void controlLED(int brightness) {
  analogWrite(LED_PIN, brightness);
}

// Xử lý tín hiệu change_status và bật/tắt đèn
void handleStatus(String status) {
  if (status == "on") {
    controlLED(255);  // Bật đèn
    Serial.println("LED turned ON");
  } else if (status == "off") {
    controlLED(0);  // Tắt đèn
    Serial.println("LED turned OFF");
  }
}

// Xử lý tín hiệu change_schedule
void handleSchedule(String schedule) {
  // Tách startTime và endTime từ chuỗi "hh:mm;hh:mm"
  int separatorIndex = schedule.indexOf(';');
  String startTime = schedule.substring(0, separatorIndex);
  String endTime = schedule.substring(separatorIndex + 1);

  // Chuyển đổi startTime và endTime thành giờ và phút
  int startHour = startTime.substring(0, 2).toInt();
  int startMin = startTime.substring(3).toInt();
  int endHour = endTime.substring(0, 2).toInt();
  int endMin = endTime.substring(3).toInt();

  // Lấy giờ và phút hiện tại
  // time_t currentTime = now();
  // int curHour = hour(currentTime);
  // int curMin = minute(currentTime);
  
  int curHour = 6;
  int curMin = 33;

  // Xác định nếu lịch trình đang hoạt động
  bool isScheduleActive;
  if (startHour < endHour || (startHour == endHour && startMin < endMin)) {
    // Lịch trình không qua đêm (VD: 08:00 -> 18:00)
    isScheduleActive = (curHour > startHour || (curHour == startHour && curMin >= startMin)) && (curHour < endHour || (curHour == endHour && curMin < endMin));
  } else {
    // Lịch trình qua đêm (VD: 18:00 -> 06:00)
    isScheduleActive = (curHour > startHour || (curHour == startHour && curMin >= startMin)) || (curHour < endHour || (curHour == endHour && curMin < endMin));
  }

  // Kiểm tra trạng thái và điều chỉnh đèn
  if (isScheduleActive) {
    analogWrite(LED_PIN, 25);  // Đèn sáng 10%
    handleMotionSensor();      // Chuyển sang hàm kiểm tra cảm biến chuyển động
    Serial.println("LED dim to 10%");
  } else {
    analogWrite(LED_PIN, 0);  // Tắt đèn
    Serial.println("LED turned off due to schedule");

    // Kiểm tra dữ liệu môi trường từ bộ phát qua Serial2
    if (Serial2.available()) {
      String receivedData = Serial2.readStringUntil('\n');
      Serial.println("Data received from master: " + receivedData);

      if (receivedData.startsWith("change_environment=")) {
        int environment = receivedData.substring(19).toInt();
        if (environment == 0) {
          controlLED(0);  // Tắt đèn nếu ánh sáng môi trường cao
          sendDataToTransmitter(0, "Led off");
        } else {
          handleMotionSensor();  // Kiểm tra cảm biến chuyển động nếu ánh sáng môi trường thấp
        }
      }
    }
  }
}

// Kiểm tra và xử lý tín hiệu từ bộ phát (transmitter)
void checkTransmitterData() {
  if (Serial2.available()) {
    String receivedData = Serial2.readStringUntil('\n');  // Đọc đến khi gặp ký tự xuống dòng
    // String receivedData = "change_brightness=50";
    Serial.println("Data received from master (raw): " + receivedData);

    receivedData.trim();  // Loại bỏ khoảng trắng hoặc ký tự xuống dòng thừa

    if (receivedData.startsWith("change_environment=")) {
      String envValue = receivedData.substring(19);                // Lấy phần "1" hoặc "0" từ chuỗi
      Serial.println("Environment value as string: " + envValue);  // In chuỗi con để kiểm tra

      // Kiểm tra chuỗi thay vì dùng toInt()
      if (envValue == "1") {
        Serial.println("Environment detected as 1 - Motion Sensor Activated");
        handleMotionSensor();  // Kiểm tra cảm biến chuyển động nếu ánh sáng môi trường thấp
      } else if (envValue == "0") {
        Serial.println("Environment detected as 0 - LED turned off");
        controlLED(0);  // Tắt đèn nếu ánh sáng môi trường cao
        sendDataToTransmitter(0, "Led off");
      } else {
        Serial.println("Unexpected environment value.");
      }
    } else if (receivedData.startsWith("change_status=")) {
      String status = receivedData.substring(14);
      handleStatus(status);
    } else if (receivedData.startsWith("change_schedule=")) {
      String schedule = receivedData.substring(16);
      handleSchedule(schedule);
    } else if (receivedData.startsWith("change_brightness=")) {
      int brightness = receivedData.substring(18).toInt();
      controlLED(brightness);
    }
  }
}

// Xử lý cảm biến chuyển động và gửi dữ liệu lại cho bộ phát
void handleMotionSensor() {
  int motionDetected = digitalRead(MOTION_PIN);
  Serial.println(motionDetected);
  // 0-255
  if (motionDetected == 1) {
    // Motion detected, set brightness to 100%
    controlLED(255);
    sendDataToTransmitter(255, "Motion detected!");
  } else {
    // No motion detected, set brightness to 10%
    controlLED(25);
    sendDataToTransmitter(25, "No motion detected!");
  }
}

void sendDataToTransmitter(int lightIntensity, String motion_status) {
  int brightnessPercentage = map(lightIntensity, 0, 255, 0, 100);

  // Create Json
  DynamicJsonDocument doc(256);
  doc["lightIntesity"] = lightIntensity;
  doc["brightness"] = brightnessPercentage;
  doc["light_status"] = (lightIntensity > 0) ? "on" : "off";
  doc["motion_status"] = motion_status;

  // Tao JSON và gửi qua Serial2
  char jsonBuffer[128];
  serializeJson(doc, jsonBuffer);
  Serial2.write(jsonBuffer);
  Serial.println("Send Data: " + String(jsonBuffer));
}

// Vòng lặp chính
void loop() {
  checkTransmitterData();
  delay(500);
}