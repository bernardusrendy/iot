/////***** CONFIGURATION & SETUP *****/////
const BROKER_ADDR = "192.168.43.131";
const BROKER_PORT = "3000";
// Topic with wildcard
const SYS_TOPIC = "TF-IIOT/";
// MQTT Setup
var broker_url = "ws://" + BROKER_ADDR + ":" + BROKER_PORT;
var client = mqtt.connect(broker_url);

/////***** VARIABLE *****/////
// Declaration
var position = [[0,0],[0,0]]; // x, y
var node = [0] // node yang true
var slider = [];
var sliderVal = [];
var RGB = ["R", "G", "B"];
var radio = [
  "semua",
  "kirix",
  "tengahx",
  "kananx",
  "kiriy",
  "tengahy",
  "kanany"
];
// var radioState = ["semua", "kirix", "tengahx", "kananx", "kiriy", "tengahy", "kanany"]
var nodestate = [];
for (let i = 0; i < 16; i++) {
  nodestate.push("0");
}
console.log(nodestate);
// SLIDER RGB
for (let i = 0; i < 3; i++) {
  slider[i] = document.getElementById("slider" + RGB[i]);
  sliderVal[i] = document.getElementById("sliderVal" + RGB[i]); // Ambil Value
  sliderVal[i].innerHTML = slider[i].value; // Display the default slider value
  // console.log(slider[i].value)

  //Update the current slider value (each time you drag the slider handle)
  slider[i].oninput = function() {
    sliderVal[i].innerHTML = this.value;
    console.log(slider[i].value);
  };
}
// // SLIDER CC
slider[3] = document.getElementById("sliderCC");
sliderVal[3] = document.getElementById("sliderValCC"); // Ambil Value
sliderVal[3].innerHTML = slider[3].value; // Display the default slider value

//Update the current slider value (each time you drag the slider handle)
slider[3].oninput = function() {
  sliderVal[3].innerHTML = this.value;
  // console.log(slider[3].value);
};

/////***** MQTT *****/////
// Run when connected (continuous)
client.on("connect", function() {
  console.log("client connected at %s:%s", BROKER_ADDR);

  // Subscribe pake wildcard
  //   client.subscribe(SYS_TOPIC);

  // for monitoring
  //   console.log("MQTT RECEIVED", topic + " : " + message.toString());

  // decode the topic
  //   var fields = topic.split("/");
  // console.log('FIELDS', fields)

  //   sNode = fields[1]; // snode = NODE01 atau NODE02 dsb
  //   sTag = fields[2] + fields[3]; // sTAG = CT011 dsb
  //   value = parseInt(message, 10); // isi dari topicnya
  // console.log("VALUE", value)
  //   updateHMI(sNode, sTag);
});

/////***** FUNCTION *****/////
function publish() {
  // console.log("Hi")

  // Check state value
  if (document.getElementById("checkboxAuto").checked == true) {
    stateAuto = 1;
  } else {
    stateAuto = 0;
  }

  console.log("State Auto", stateAuto);

  var z = 1;
  for(let i = 1; i<5; i++){
    for(let u = 1; u<5; u++){
      // Check checkbox state and save it in the array
      node[z] = document.getElementById("x" + u.toString() + "y" + i.toString()).checked;
      // position[i][u] = document.getElementById("x" + i.toString() + "y" + u.toString()).checked;
      // node[z] = position[i][u]
      z++
    }
  }

  for (let i = 1; i < 17; i++) {
    // Get true if node is checked for 1 node
    // node[i] = document.getElementById("node" + i.toString()).checked;

    // Publish when checkbox is ticked
    if (node[i] == true) {
      console.log("node", i, "PUBLISHED");

      console.log("HERE", typeof i)
      // Publish RGB topic
      for (let u = 0; u < 3; u++) {
        if (i<10){
          topicPublish = SYS_TOPIC + "NODE" + "0" + i + "/DV" + RGB[u] + "/0"+ i +"1";
        } else{
          topicPublish = SYS_TOPIC + "NODE" + i + "/DV" + RGB[u] + "/"+ i + "1";
        }
        console.log(topicPublish, slider[u].value.toString());
        client.publish(topicPublish, slider[u].value.toString());
      }

      // Publish CC topic
      if (i<10){
        topicPublish = SYS_TOPIC + "NODE" + "0" + i + "/CC" + "/0"+ i +"1";
      } else{
        topicPublish = SYS_TOPIC + "NODE" + i + "/CC" + "/"+ i + "1";
      }

      client.publish(topicPublish, slider[3].value.toString());
      console.log(topicPublish, slider[3].value.toString());

      // Publish State Auto
      if (i<10){
        topicPublish = SYS_TOPIC + "NODE" + "0" + i + "/YS" + "/0"+ i +"1";
      } else{
        topicPublish = SYS_TOPIC + "NODE" + i + "/YS" + "/"+ i + "1";
      }

      client.publish(topicPublish, stateAuto.toString());
      console.log(topicPublish, stateAuto.toString());
    }
  }
  console.log(node);
}

function updateHMI() {}

// function changeColor(node) {
//   console.log(
//     document.getElementById("node" + node.toString()).style.backgroundColor
//   );
//   document.getElementById("node" + node.toString()).style.backgroundColor =
//     "#be174f";
// }

function radioClick() {
  for (let i = 0; i < 7; i++) {
    if (document.getElementById(radio[i]).checked == true) {     
      if ((i == 0)) {
        check(0,1,1)
        check(0,2,1)
        check(0,3,1)
        check(0,4,1)
      } else if ((i == 1)) {
        check(1,0,1);
        check(2,0,0)
        check(3,0,0)
        check(4,0,0)
      } else if ((i == 2)) {
        check(2,0,1)
        check(3,0,1)
        check(1,0,0)
        check(4,0,0)
      } else if ((i == 3)) {
        check(4,0,1)
        check(1,2,0)
        check(2,2,0)
        check(3,0,0)
      } else if ((i == 4)) {
        check(0,1,1);
        check(0,2,0)
        check(0,3,0)
        check(0,4,0)
      } else if ((i == 5)) {
        check(0,1,0);
        check(0,2,1)
        check(0,3,1)
        check(0,4,0)
      } else {
        check(0,1,0);
        check(0,2,0)
        check(0,3,0)
        check(0,4,1)
      }
    }
  }
}

function check(x,y, type){
  if (type == 1){
    var val = true
  }
  else{
    var val = false
  }
  if (x == 0){
    for(let i=1; i<5; i++){
      document.getElementById("x"+i.toString()+"y"+y.toString()).checked = val;
    }
  } else{
    for(let i=1; i<5; i++){
      document.getElementById("x"+x.toString()+"y"+i.toString()).checked = val;
    }
  }
}