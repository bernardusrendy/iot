//**************************************Library Pin and Configuration used in programs******************************************************//
//ESP8266 Library//
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <SPI.h>

//Light sensor Library//
#include <BH1750FVI.h>

//LED STRIP LIBRARY//
#include <Adafruit_NeoPixel.h> 

//Network and MQTT configuration// 
const char* ssid = "TF-IIOT";//Username WiFi used//
const char* password = "industri40";//Password of WiFi used//
const char* mqtt_server = "192.168.1.100";//IP Adress of device used//

// Light sensor initial settings//
uint8_t ADDRESSPIN = 13;
BH1750FVI::eDeviceAddress_t DEVICEADDRESS = BH1750FVI::k_DevAddress_H;
BH1750FVI::eDeviceMode_t DEVICEMODE = BH1750FVI::k_DevModeContHighRes;
// Create the Lightsensor instance//
BH1750FVI LightSensor(ADDRESSPIN, DEVICEADDRESS, DEVICEMODE);

//LED Strip initial settings//
#define LEDPIN    0
#define NUMPIXELS 3
Adafruit_NeoPixel pixels(NUMPIXELS, LEDPIN, NEO_GRB + NEO_KHZ800); //Define how the LED Strip function is written in this program


WiFiClient espClient;
PubSubClient client(espClient);

//***********************************************STATE AND FLOW CONTROL***************************************************************************//
//STATE VARIABLE
long lastMsg = 0; //Last time message was sent //
long lastRead = 0; //Last time message was read//
String msg, msgtopic; //Message from topic//
int R,G,B; //The RGB Value (Red,Green,Blue) value of LED Strip //
int tick =0;
int treshold = 1000;
String mod = "manual";//The initial mode of system//
float lux; //The value of Light intensity from LUX//
//CALLBACK FUNCTION CHAR ARRAY
char msg4[50]; //char array used to received message , used to save what message received//
char YI[]="0"; //char array used to received message with purpose to change the state of program//
char DIR[]="128"; //char array used to received message with purpose to change the value of R ( Red value ) of LED Strip//
char DIG[]="128"; //char array used to received message with purpose to change the value of G ( Green value ) of LED Strip//
char DIB[]="128"; //char array used to received message with purpose to change the value of B ( Blue value ) of LED Strip//
char CC[] ="1000";

//SETUP WiFi CONNECTION
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

//*****************************************************************CALLBACK FUNCTION**************************************************************//
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message received on topic ");
  Serial.print(topic);
  Serial.print(": ");
  msgtopic = String((char*)topic);
  char msgchar[length];
  msg = "";
  for (int i = 0; i < length; i++) { // Concat payload char to string (msg)
    msg += (char)payload[i];
    msgchar[i] = (char)payload[i];
  }
  Serial.println(msg);
  if(msgtopic =="TF-IIOT/NODE01/YS/011"){ //Callback function for YS to change the mode of system (auto or manual)
    if(msg == "0"){mod = "manual";}
    else if (msg == "1"){mod = "auto";}
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
  if(msgtopic =="TF-IIOT/NODE01/DVR/011"){ //Callback function for DIR to change the R value of LED Strip//
    R = msg.toInt();
    pixels.setPixelColor(1, pixels.Color(R, G, B));
    pixels.show();
    for(int i=0;i<length;i++){
      DIR[i] = msgchar[i]; 
    } 
  }
  if(msgtopic =="TF-IIOT/NODE01/DVG/011"){ //Callback function for DIR to change the R value of LED Strip//
    G = msg.toInt();
    pixels.setPixelColor(1, pixels.Color(R, G, B));
    pixels.show();
    for(int i=0;i<length;i++){
      DIG[i] = msgchar[i]; 
    }
  }
  if(msgtopic =="TF-IIOT/NODE01/DVB/011"){ //Callback function for DIR to change the R value of LED Strip//
    B = msg.toInt();
    pixels.setPixelColor(1, pixels.Color(R, G, B));
    pixels.show();  
    for(int i=0;i<length;i++){
      DIB[i] = msgchar[i]; 
    }
  } 
}

//RECONNECT CONFIGURATION
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

//************************************************************************SETUP AND LOOP**********************************************************************

//WEMOS SETUP//
void setup() {
  Serial.begin(115200);
  //WEMOS-Light sensor Settings
  LightSensor.begin();
  Serial.println("Sensor ready");
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  //Wemos-LED Strip Settings//
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(15, INPUT);
  //Some code for LED Strip//
  #if defined(__AVR_ATtiny85__) && (F_CPU == 16000000)
  clock_prescale_set(clock_div_1);
  #endif
  pixels.begin(); // INITIALIZE NeoPixel strip object (REQUIRED)//
  pixels.clear(); //Create light off initial condition//
  pixels.show();
}


//WEMOS LOOP//
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  
  client.loop();
  
  long now = millis();  
  //Loop send data every 1 second//
  if (now - lastMsg > 1000) {
    lastMsg = now;
    lux = LightSensor.GetLightIntensity(); //Code for Light Sensor to start read the Light Intensity every 1 second//
    sprintf (msg4, "%f", lux);
    Serial.print(" % | Lux ");
    Serial.println(msg4);
    client.publish("TF-IIOT/NODE01/CT/011", msg4); //Publish the message received//
    client.publish("TF-IIOT/NODE01/DIR/011", DIR); //Publish the message received and the change of R value in LED Strip//
    client.publish("TF-IIOT/NODE01/DIG/011", DIG); //Publish the message received and the change of G value in LED Strip//
    client.publish("TF-IIOT/NODE01/DIB/011", DIB); //Publish the message received and the change of B value in LED Strip//
    client.publish("TF-IIOT/NODE01/YI/011", YI);  //Publish the message received and the change of state in system//
  }
  
  //Loop for auto mode that read data every 0.1 second//
  if (now - lastRead > 100) {
    lastRead = now;
    //Auto Mode
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
