/////***** CONFIGURATION & SETUP *****/////
// Broker
const BROKER_ADDR = "localhost";
const BROKER_PORT = "3000";
// Topic with wildcard
const TOPIC = "TF-IIOT/NODE01/CT/011" 
// MQTT Setup
var broker_url = "ws://" + BROKER_ADDR + ":" + BROKER_PORT;
var client = mqtt.connect(broker_url);
// variabel
var lux


/////***** MQTT *****/////
// Run when connected (continuous)
client.on("connect", function() {
    console.log("client connected at %s:%s", BROKER_ADDR);
    console.log("MQTT client connected to " + broker_url);
    client.subscribe(TOPIC);
  });
  
  client.on("message", function(topic, message) {
    // decode topic : SYS/NODE/TAG/NUM
    var fields = topic.split("/"); // split topic menjadi array
    sNode = fields[1]; // snode = NODE01 atau NODE02 dsb
    sNode = sNode.slice(4, 6); // snode = 01, 02 ,, 11, .... dsb
    sNode = parseInt(sNode); // snode = 1, 2 ,3 ... dsb
  
    sTag = fields[2]; // sTAG = CT dsb
    value = parseInt(message, 10); // isi atau message dari topicnya
  

    lux = document.getElementById(TOPIC); // Ambil Value
    lux.innerHTML = value; // Display the default slider value
});