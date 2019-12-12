/////***** CONFIGURATION & SETUP *****/////
const BROKER_ADDR = "192.168.1.100";
const BROKER_PORT = "3000";
// Topic with wildcard
const SYS_TOPIC = "TF-IIOT/";
const SYS_TOPIC2= "TF-IIOT/#"
const TAG_TOPIC = 'CT';
// MQTT Setup
var broker_url = "ws://" + BROKER_ADDR + ":" + BROKER_PORT;
var client = mqtt.connect(broker_url);

/////***** VARIABLE *****/////
// Declaration
var position = [[0,0],[0,0]]; // x, y
var node = [0]; // node yang true
var color = [0];
var slider = [];
var sliderVal = [];
var YI = [0];
var CT = [0];
var R = [0];
var G = [0];
var B = [0];
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

var nodestate = [];
for (let i = 0; i < 16; i++) {
  nodestate.push("0");
}
//console.log(nodestate);

// SLIDER RGB
for (let i = 0; i < 3; i++) {
  slider[i] = document.getElementById("slider" + RGB[i]);
  sliderVal[i] = document.getElementById("sliderVal" + RGB[i]); // Ambil Value
  sliderVal[i].innerHTML = slider[i].value; // Display the default slider value
  // //console.log(slider[i].value)

  //Update the current slider value (each time you drag the slider handle)
  slider[i].oninput = function() {
    sliderVal[i].innerHTML = this.value;
    //console.log(slider[i].value);
  };
}

// SLIDER CC
slider[3] = document.getElementById("sliderCC");
sliderVal[3] = document.getElementById("sliderValCC"); // Ambil Value
sliderVal[3].innerHTML = slider[3].value; // Display the default slider value

//Update the current slider value (each time you drag the slider handle)
slider[3].oninput = function() {
  sliderVal[3].innerHTML = this.value;
  // //console.log(slider[3].value);
};

//**** HEATMAP ****//
const E_HEATMAP = 'e-heatmap';
// interval heatmap akan diupdate 
const UPDATE_INTERVAL = 1000;
const CT_MAX = 5000;
const CT_MIN = 0;

const HEATMAP_SCALE = 400/5;

// hitung berapa data yang sudah diterima
var received_count=0;
var value_max=0;
var value_min=1000;

// heatmap 
// create configuration object
var config = {
    container: document.getElementById(E_HEATMAP),
  };

// data-data heatmap
var heatmap = h337.create(config);
var heatmap_data = {
    max: CT_MAX,
    min: CT_MIN,
    data: []
}

// map untuk mempercepat akses ke heatmap_data
var mapCT = new Map();

// Fungsi-fungsi untuk update UI

// memasukkan data CT ke heatmap
async function onReceiveCT(node, value) {
    point = mapCT.get(node);
    if (point != null) {
        point.value = value;
        received_count +=1;
        ////console.log("Update "+node+"="+JSON.stringify(point));
    }
}

// mengambil data posisi (X,Y) semua node
// lalu menginisiasi tampilan heat map
async function viewHeatmap() {
  nodes = await getNodes();
  if (nodes) {
    // build heat map
    heatmap_data.data = []; /// kosongkan dulu
    for (node of nodes) {
        var point = new Object();
        point.x = node.PX * HEATMAP_SCALE;
        point.y = node.PY * HEATMAP_SCALE;
        point.value = node.PX*node.PY*300;
        heatmap_data.data.push(point);
        mapCT.set(node.NODE,point);
    }
    heatmap.setData(heatmap_data);
    //console.log('heatmap_data = '+JSON.stringify(heatmap_data));
    return true;
  }
  else {
    shtml="Cannot get the nodes";
    document.getElementById(E_HEATMAP).innerHTML = shtml;
    return false;
  }
}

// menampilkan heatmap kalau ada data yang sudah berubah 
function viewUpdateHeatmap() { 
    if (received_count > 0) {
        heatmap.setData(heatmap_data);
        received_count=0;
        //console.log('Heatmap repainted');
    }
}

async function getNodes() {
  url = '/api/nodes';
  ////console.log('Get :', url);
  response = await fetch(url);
  rjson = await response.json();
  ////console.log(JSON.stringify(rjson));
  return rjson;
}

viewHeatmap();

/////***** MQTT *****/////
// Run when connected (continuous)
client.on("connect", function() {
  //console.log("client connected at %s:%s", BROKER_ADDR);
  //console.log('MQTT client connected to '+broker_url);
  // siap terima semua data CT
  topic = SYS_TOPIC+'+/'+TAG_TOPIC+'/#';
  client.subscribe(topic);
  //console.log("Subscribe for "+topic);
  timer = setInterval(viewUpdateHeatmap, UPDATE_INTERVAL);
  client.subscribe(SYS_TOPIC2);
});

client.on('message', function(topic, message) {   
  // decode topic
  // SYS/NODE/TAG/NUM
  ////console.log('Received %s = %d', node, value);
  // //console.log("MQTT RECEIVED", topic + " : " + message.toString());

  // decode the topic
  var fields = topic.split("/");
  // //console.log("FIELDS", fields);
  node = fields[1];
  // value = parseInt(message.toString('utf-8'),10);
  sNode = fields[1]; // snode = NODE01 atau NODE02 dsb
  sNode = sNode.slice(4,6)
  sNode = parseInt(sNode) // snode = 1, 2 ,3 ... dsb

  //console.log(sNode)
  sTag = fields[2]; // sTAG = CT011 dsb
  value = parseInt(message, 10); // isi dari topicnya
  // //console.log("VALUE", value)
  saveData(sNode, sTag, value);
  if (sTag=="CT"){
    onReceiveCT(node, value);    
  }
  else{
    updateHMI();  
  }
})

/////***** FUNCTION *****/////
function publish() {
  // console.log("Hi")

  // Check state value
  if (document.getElementById("checkboxAuto").checked == true) {
    stateAuto = 1;
  } else {
    stateAuto = 0;
  }

  // console.log("State Auto", stateAuto);

  //  Konversi posisi ke node
  var z = 1;
  for (let i = 1; i < 5; i++) {
    for (let u = 1; u < 5; u++) {
      // Check checkbox state and save it in the array
      node[z] = document.getElementById(
        "x" + u.toString() + "y" + i.toString()
      ).checked;
      // position[i][u] = document.getElementById("x" + i.toString() + "y" + u.toString()).checked;
      // node[z] = position[i][u]
      z++;
    }
  }

  for (let i = 1; i < 17; i++) {
    // Get true if node is checked for 1 node
    // node[i] = document.getElementById("node" + i.toString()).checked;

    // Publish when checkbox is ticked
    if (node[i] == true) {
      // console.log("node", i, "PUBLISHED");

      // console.log("HERE", typeof i);
      // Publish RGB topic
      for (let u = 0; u < 3; u++) {
        if (i < 10) {
          topicPublish = SYS_TOPIC + "NODE" + "0" + i + "/DV" + RGB[u] + "/011";
        } else {
          topicPublish = SYS_TOPIC + "NODE" + i + "/DV" + RGB[u] + "/011";
        }
        // console.log(topicPublish, slider[u].value.toString());
        client.publish(topicPublish, slider[u].value.toString());
      }

      // Publish CC topic
      if (i < 10) {
        topicPublish = SYS_TOPIC + "NODE" + "0" + i + "/CC/011";
      } else {
        topicPublish = SYS_TOPIC + "NODE" + i + "/CC/011";
      }

      client.publish(topicPublish, slider[3].value.toString());
      // console.log(topicPublish, slider[3].value.toString());

      // Publish State Auto
      if (i < 10) {
        topicPublish = SYS_TOPIC + "NODE" + "0" + i + "/YS/011";
      } else {
        topicPublish = SYS_TOPIC + "NODE" + i + "/YS/011";
      }

      client.publish(topicPublish, stateAuto.toString());
      // console.log(topicPublish, stateAuto.toString());
    }
  }
  console.log(node);
}

function saveData(sNode, sTag, value) {
  // //console.log(sTag);
  //  Simpen data biar gampang ceritanya sih
  switch (sTag) {
    case "CT":
      CT[sNode] = value;
      break;
    case "YI":
      YI[sNode] = value;
      break;
    case "DIR":
      R[sNode] = value;
      // //console.log(R[sNode], G[sNode], B[sNode])
      break;
    case "DIG":
      G[sNode] = value;
      // //console.log(R[sNode], G[sNode], B[sNode])
      break;
    case "DIB":
      B[sNode] = value;
      // //console.log(R[sNode], G[sNode], B[sNode])
      break;
  }
  // Update array warna
  // //console.log(R[sNode] != undefined && G[sNode] != undefined && B[sNode] != undefined)
  if(R[sNode] != undefined && G[sNode] != undefined && B[sNode] != undefined){
    color[sNode] = rgbToHex(R[sNode], G[sNode], B[sNode]); 
    // updateHMI()
    // //console.log("NIC", color)
  }
}

function updateHMI() {
  var z = 1;
  // Konversi Node menjadi posisi dan looping tiap posisi
  for (let i = 1; i < 5; i++) {
    for (let u = 1; u < 5; u++) {
      // //console.log("map_x" + i.toString() + "y" + u.toString())
      // //console.log(document.getElementById("map_x" + i.toString() + "y" + u.toString()).style.backgroundColor)
      // //console.log(color[z])
      document.getElementById("map_x" + u + "y" + i).style.backgroundColor = color[z];
      z++;
      // //console.log("UPDATED")
    }
  }
}

// function changeColor(node) {
//   //console.log(
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

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function reset() {
  // 16 nodes
  check(0, 1, 0);
  check(0, 2, 0);
  check(0, 3, 0);
  check(0, 4, 0);
  // radio button
  for (let i = 0; i < 7; i++) {
    //console.log(document.getElementById(radio[i]).checked);
    // if(document.getElementById(radio[i]).checked == true){
    document.getElementById(radio[i]).checked = false;
    // }
  }

  // SLIDER RGB
  for (let i = 0; i < 3; i++) {
    document.getElementById("slider" + RGB[i]).value = 50;
    document.getElementById("sliderVal" + RGB[i]).innerHTML = 50; // Ambil Value
    // sliderVal[i].innerHTML = slider[i].value; // Display the default slider value
    // //console.log(slider[i].value)
  }
  // // SLIDER CC
  document.getElementById("sliderCC").value = 50;
  sliderVal[3] = document.getElementById("sliderValCC").innerHTML = 50; // Ambil Value
  // sliderVal[3].innerHTML = slider[3].value; // Display the default slider value
  // //console.log(slider[3].value)

  // state Auto
  document.getElementById("checkboxAuto").checked = false;
}