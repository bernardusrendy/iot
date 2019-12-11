//LIBRARY AND PIN USED-----------------
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <SPI.h>
//LIGHT SENSOR------------------
#include <BH1750FVI.h>
//LED STRIP---------------------------
#include <Adafruit_NeoPixel.h> 


//CONFIGURE NETWORK--------------------
const char* ssid = "SEGERRR";
const char* password = "JusBawang7890";
const char* mqtt_server = "192.168.43.62";

// LIGHT SENSOR SETTINGS-------------------
uint8_t ADDRESSPIN = 13;
BH1750FVI::eDeviceAddress_t DEVICEADDRESS = BH1750FVI::k_DevAddress_H;
BH1750FVI::eDeviceMode_t DEVICEMODE = BH1750FVI::k_DevModeContHighRes;
// Create the Lightsensor instance
BH1750FVI LightSensor(ADDRESSPIN, DEVICEADDRESS, DEVICEMODE);
//LED STRIP SETTINGS--------------------
#define LEDPIN    0
#define NUMPIXELS 3
Adafruit_NeoPixel pixels(NUMPIXELS, LEDPIN, NEO_GRB + NEO_KHZ800);

//SETTING WIFI----------------------
WiFiClient espClient;
PubSubClient client(espClient);
long lastMsg = 0; long lastRead = 0; //waktu terakhir kirim pesan, waktu terakhir baca untuk alarm
String msg, msgtopic; //pesan dari topic, RGB khusus untuk ledRGB
int R,G,B; //nilai RGB untuk led
int tick =0;
int treshold = 1000;
String mod = "manual";
char msg4[50];
float lux;
char YI[]="0";
char DIR[]="128"; 
char DIG[]="128";
char DIB[]="128";
char CC[] ="1000";

//SETUP WiFi CONNECTION-------------------------------------
void setup_wifi() {
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  // Waiting until connected
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  randomSeed(micros());
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

//CALLBACK SETTINGS------------------------------------
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message received on topic ");
  Serial.print(topic);
  Serial.print(": ");
  msgtopic = String((char*)topic);
  msg = "";
  char msgchar[length];
  for (int i = 0; i < length; i++) { // Concat payload char to string (msg)
    msg += (char)payload[i];
    msgchar[i] = (char)payload[i];
  }
  Serial.println(msg);
  if(msgtopic =="TF-IIOT/NODE01/YS/011"){
    if(msg == "0"){mod = "manual";}
    else if (msg == "1"){mod = "auto";}
    client.publish("TF-IIOT/NODE01/YI/011", msgchar); 
    for(int i=0;i<length;i++){
      YI[i] = msgchar[i]; 
    }
  }
  if(msgtopic =="TF-IIOT/NODE01/CC/011"){
    treshold = msg.toInt(); 
    for(int i=0;i<length;i++){
      CC[i] = msgchar[i]; 
    }
  }
  if(msgtopic =="TF-IIOT/NODE01/DVR/011"){
    R = msg.toInt();
    pixels.setPixelColor(1, pixels.Color(R, G, B));
    pixels.show();
    client.publish("TF-IIOT/NODE01/DIR/011", msgchar);
    for(int i=0;i<length;i++){
      DIR[i] = msgchar[i]; 
    } 
  }
  if(msgtopic =="TF-IIOT/NODE01/DVG/011"){
    G = msg.toInt();
    pixels.setPixelColor(1, pixels.Color(R, G, B));
    pixels.show();
    client.publish("TF-IIOT/NODE01/DIG/011", msgchar);   
    for(int i=0;i<length;i++){
      DIG[i] = msgchar[i]; 
    }
    Serial.println (G);
  }
  if(msgtopic =="TF-IIOT/NODE01/DVB/011"){
    B = msg.toInt();
    pixels.setPixelColor(1, pixels.Color(R, G, B));
    pixels.show();  
    client.publish("TF-IIOT/NODE01/DIB/011", msgchar);
    for(int i=0;i<length;i++){
      DIB[i] = msgchar[i]; 
    }
  }
 
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      client.subscribe("TF-IIOT/NODE01/CC/011");
      client.subscribe("TF-IIOT/NODE01/YS/011");
      client.subscribe("TF-IIOT/NODE01/DVR/011");
      client.subscribe("TF-IIOT/NODE01/DVG/011");
      client.subscribe("TF-IIOT/NODE01/DVB/011");
      client.publish("TF-IIOT/NODE01/DIR/011",DIR);
      client.publish("TF-IIOT/NODE01/DIG/011",DIG);
      client.publish("TF-IIOT/NODE01/DIB/011",DIB);
      client.publish("TF-IIOT/NODE01/YI/011",YI);   
      } 
      else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

//WEMOS SETUP------------
void setup() {
  Serial.begin(115200);
  //WEMOS LIGHT SENSOR-------------------
  LightSensor.begin();
  Serial.println("Sensor ready");
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  //WEMOS LED STRIP
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(15, INPUT);
  //sesuatu untuk led strip
  #if defined(__AVR_ATtiny85__) && (F_CPU == 16000000)
  clock_prescale_set(clock_div_1);
  #endif
  pixels.begin(); // INITIALIZE NeoPixel strip object (REQUIRED)
  pixels.clear();//matikan dulu di awal
  pixels.show();
}


//WEMOS LOOP

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  
  client.loop();
  
  long now = millis();  
  //============loop mengirim data setiap 1 detik=======
  if (now - lastMsg > 1000) {
    lastMsg = now;
    lux = LightSensor.GetLightIntensity();
    sprintf (msg4, "%f", lux);
    Serial.print(" % | Lux ");
    Serial.println(msg4);
    client.publish("TF-IIOT/NODE01/CT/011", msg4);
  }
  
  //============loop membaca alarm/instrument setiap 0.1 detik=======
  if (now - lastRead > 100) {
    lastRead = now;
    //==================mode alarm============
    if (mod=="auto"){
      lux = LightSensor.GetLightIntensity();
      if (lux>treshold){
        pixels.clear();  
        pixels.show();
      }
      else{ 
        pixels.setPixelColor(1, pixels.Color(R, G, B));
        pixels.show();
      }
    }
  }
}    
