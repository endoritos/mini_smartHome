#include <Arduino.h>
#include <WiFi.h>
#include <FirebaseESP32.h>
#include <TimeLib.h>#include <iostream>
#include "info.h"


// Replace with your network credentials
const char* ssid = wifiname;  // WiFi network name (SSID)
const char* password = wifipass;       // WiFi password

// Replace with your Firebase project credentials
#define FIREBASE_HOST Fhost // Firebase host URL
#define FIREBASE_AUTH  FAuth  // Firebase authentication token

// Define Firebase objects
FirebaseData firebaseData;  // Firebase data object
FirebaseAuth auth;          // Firebase authentication object
FirebaseConfig config;      // Firebase configuration object

// Define pins for sensors, relay, and LED
#define DOOR_SENSOR_PIN   19  // ESP32 pin GPIO19 connected to door sensor
#define RELAY_PIN         27  // ESP32 pin GPIO27 connected to relay
#define MOTION_SENSOR_PIN 32  // ESP32 pin GPIO32 connected to motion sensor
#define LED_PIN           17  // ESP32 pin GPIO17 connected to LED
#define ANALOG_IN_PIN     34  // ADC pin connected to SCT sensor output
#define SCALE_FACTOR      66.0 // Scale factor for converting voltage to current (adjust if needed)
#define VOLTAGE           230.0 // Voltage used for power calculation

int doorState;  // Variable to store the state of the door sensor
int motionStateCurrent = LOW; // Current state of the motion sensor
int motionStatePrevious = LOW; // Previous state of the motion sensor
unsigned long startTime = 0; // Start time of the timer
unsigned long lastUpdateTime = 0; // Last update time of the usage time
unsigned long usageTime = 0; // Accumulated usage time
unsigned long dailyUsageTime = 0; // Daily usage time for resetting
bool lightState = false; // State of the light

float dailykWh = 0.0;
float monthlykWh = 0.0;
float yearlykWh = 0.0;

void setup() {
  Serial.begin(115200); // Initialize serial communication with 115200 baudrate

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {  // Wait until WiFi is connected
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("Connected to WiFi");

  // Configure Firebase
  config.host = FIREBASE_HOST;  // Set Firebase host
  config.signer.tokens.legacy_token = FIREBASE_AUTH;  // Set Firebase authentication token

  // Initialize Firebase
  Firebase.begin(&config, &auth);  // Start Firebase with configuration and authentication
  Firebase.reconnectWiFi(true);  // Reconnect to WiFi if connection is lost

  // Check Firebase connection
  if (Firebase.ready()) {
    Serial.println("Firebase is ready");  // Firebase is ready for use
  } else {
    Serial.println("Firebase is not ready");  // Firebase is not ready for use
  }

  // Initialize pins
  pinMode(DOOR_SENSOR_PIN, INPUT_PULLUP); // Set ESP32 pin to input pull-up mode
  pinMode(RELAY_PIN, OUTPUT); // Set ESP32 pin to output mode
  pinMode(MOTION_SENSOR_PIN, INPUT); // Set ESP32 pin to input mode
  pinMode(LED_PIN, OUTPUT); // Set ESP32 pin to output mode

  // Initialize the time (set to compile time for now, use NTP for real application)
  setTime(8, 0, 0, 25, 5, 2024);  // Set the time to 8:00:00 on 25th May 2024
}

void sendToFirebase() {
  // Check if the lights are on before updating the current and usage time
  if (Firebase.getBool(firebaseData, "/light")) {  // Read the light status from Firebase
    bool currentLightState = firebaseData.boolData();  // Current light status

    // Check the current light status and control the relay
    if (currentLightState) {
      if (!lightState) {
        // Lights just turned on
        digitalWrite(RELAY_PIN, HIGH);  // Turn on the relay
        startTime = millis();  // Start the timer
        lastUpdateTime = startTime;  // Set the last update time
        lightState = true;  // Update the light status

        // Retrieve existing usage time from Firebase
        if (Firebase.getInt(firebaseData, "/usageTime")) {
          usageTime = firebaseData.intData(); // Set usageTime to the value from Firebase
        } else {
          Serial.println("Failed to retrieve usage time");
          Serial.println(firebaseData.errorReason());
        }

        // Retrieve existing daily kWh from Firebase
        if (Firebase.getFloat(firebaseData, "/dailykWh")) {
          dailykWh = firebaseData.floatData(); // Set daily kWh to the value from Firebase
        } else {
          Serial.println("Failed to retrieve daily kWh");
          Serial.println(firebaseData.errorReason());
        }
      }

      // Update the usage time every half second
      unsigned long currentTime = millis();  // Current time
      if (currentTime - lastUpdateTime >= 500) {  // Check if half a second has passed
        usageTime += (currentTime - lastUpdateTime) / 1000; // Increase the usage time in seconds
        dailyUsageTime += (currentTime - lastUpdateTime) / 1000; // Increase the daily usage time in seconds
        lastUpdateTime = currentTime;  // Update the last update time

        // Calculate and update kWh usage
        int sensorValue = analogRead(ANALOG_IN_PIN); // Read analog voltage
        float current = (sensorValue / 4095.0) * 3.3 * SCALE_FACTOR; /* Convert analog value to 
        voltage and then to current */
        /*if (current == 0) {
          current = 1500; // Set fake current if the measured current is 0
        }
        float power = current * VOLTAGE; // Power in watts
        dailykWh += (power / 1000.0) * (0.5 / 3600.0); // Convert to kWh and add to daily kWh */

        // Update kWh values in Firebase
        monthlykWh += (power / 1000.0) * (0.5 / 3600.0);
        yearlykWh += (power / 1000.0) * (0.5 / 3600.0);

        // Update the usage time and kWh in Firebase
        if (!Firebase.setInt(firebaseData, "/usageTime", usageTime)) {
          Serial.println("Failed to update usage time");
          Serial.println(firebaseData.errorReason());
        }

        if (!Firebase.setFloat(firebaseData, "/dailykWh", dailykWh)) {
          Serial.println("Failed to update daily kWh");
          Serial.println(firebaseData.errorReason());
        }

        if (!Firebase.setFloat(firebaseData, "/monthlykWh", monthlykWh)) {
          Serial.println("Failed to update monthly kWh");
          Serial.println(firebaseData.errorReason());
        }

        if (!Firebase.setFloat(firebaseData, "/yearlykWh", yearlykWh)) {
          Serial.println("Failed to update yearly kWh");
          Serial.println(firebaseData.errorReason());
        }

        // Print current value to serial monitor
        Serial.print("Current: ");
        Serial.print(current);
        Serial.println(" mA");

        // Update the current in Firebase
        if (!Firebase.setFloat(firebaseData, "/current", current)) {
          Serial.println("Failed to update current");
          Serial.println(firebaseData.errorReason());
        }
      }
    } else {
      if (lightState) {
        // Lights just turned off
        digitalWrite(RELAY_PIN, LOW);  // Turn off the relay
        unsigned long endTime = millis();  // End time of the timer
        usageTime += (endTime - lastUpdateTime) / 1000; // Increase the usage time in seconds
        dailyUsageTime += (endTime - lastUpdateTime) / 1000; // Increase the daily usage time in seconds
        lastUpdateTime = endTime;  // Update the last update time
        lightState = false;  // Update the light status

        // Update the usage time in Firebase
        if (!Firebase.setInt(firebaseData, "/usageTime", usageTime)) {
          Serial.println("Failed to update usage time");
          Serial.println(firebaseData.errorReason());
        }
      }
    }
  } else {
    Serial.println("Failed to read light state");
    Serial.println(firebaseData.errorReason());
  }
}

void resetDailyUsage() {
  dailykWh = 0.0;
  dailyUsageTime = 0;

  if (!Firebase.setFloat(firebaseData, "/dailykWh", dailykWh)) {
    Serial.println("Failed to reset daily kWh");
    Serial.println(firebaseData.errorReason());
  }

  if (!Firebase.setInt(firebaseData, "/usageTime", dailyUsageTime)) {
    Serial.println("Failed to reset daily usage time");
    Serial.println(firebaseData.errorReason());
  }
}

void loop() {
  // Read door sensor status
  doorState = digitalRead(DOOR_SENSOR_PIN);

  // Read motion sensor status and control relay
  motionStatePrevious = motionStateCurrent;
  motionStateCurrent = digitalRead(MOTION_SENSOR_PIN);
  if (motionStatePrevious == LOW && motionStateCurrent == HIGH) {
    digitalWrite(RELAY_PIN, HIGH);
  } else if (motionStatePrevious == HIGH && motionStateCurrent == LOW) {
    digitalWrite(RELAY_PIN, LOW);
  }

  // Check if it's midnight to reset daily usage
  if (hour() == 0 && minute() == 0 && second() == 0) {
    resetDailyUsage();
  }

  // Send data to Firebase
  sendToFirebase();

  delay(500); // Small delay to stabilize sensor readings and check every half second
}
