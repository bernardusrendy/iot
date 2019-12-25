/////***** CONFIGURATION & SETUP *****/////
// Broker
const BROKER_ADDR = "localhost";
const BROKER_PORT = "3000";
// Topic with wildcard
const SYS_TOPIC = "TF-IIOT/";
const SYS_TOPIC2 = "TF-IIOT/#";
const TAG_TOPIC = "CT";
// MQTT Setup
var broker_url = "ws://" + BROKER_ADDR + ":" + BROKER_PORT;
var client = mqtt.connect(broker_url);

/////***** VARIABLE *****/////
// Declaration
var slider = []; // value slider
var sliderVal = []; // value slider di tulisan html
// array berukuran 17, dengan index 0 = 0
var nodeState = [0]; // node yang true
var YI = [0]; // value indikator
var CT = [0]; // value LDR
var R = [0]; // value R untuk warna
var G = [0]; // value G untuk warna
var B = [0]; // value B untuk warna
var color = [0]; // value hexadecimal bwt warna
// Array data untuk mempersingkat kode kemudian
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
// Update value Slider di backend
// SLIDER RGB
for (let i = 0; i < 3; i++) {
  slider[i] = document.getElementById("slider" + RGB[i]);
  sliderVal[i] = document.getElementById("sliderVal" + RGB[i]); // Ambil Value
  sliderVal[i].innerHTML = slider[i].value; // Display the default slider value

  //Update the current slider value (each time you drag the slider handle)
  slider[i].oninput = function() {
    sliderVal[i].innerHTML = this.value;
  };
}
// SLIDER CC
slider[3] = document.getElementById("sliderCC");
sliderVal[3] = document.getElementById("sliderValCC"); // Ambil Value
sliderVal[3].innerHTML = slider[3].value; // Display the default slider value

//Update the current slider value (each time you drag the slider handle)
slider[3].oninput = function() {
  sliderVal[3].innerHTML = this.value;
};

//**** HEATMAP LDR ****//
const E_HEATMAP = "e-heatmap";
// interval heatmap akan diupdate
const UPDATE_INTERVAL = 1000;
const CT_MAX = 5000;
const CT_MIN = 0;

const HEATMAP_SCALE = 400 / 5;

// hitung berapa data yang sudah diterima
var received_count = 0;
var value_max = 0;
var value_min = 1000;

// heatmap
// create configuration object
var config = {
  container: document.getElementById(E_HEATMAP)
};

// data-data heatmap
var heatmap = h337.create(config);
var heatmap_data = {
  max: CT_MAX,
  min: CT_MIN,
  data: []
};

// map untuk mempercepat akses ke heatmap_data
var mapCT = new Map();

// Fungsi-fungsi untuk update UI

// memasukkan data CT ke heatmap
async function onReceiveCT(node, value) {
  point = mapCT.get(node);
  if (point != null) {
    point.value = value;
    received_count += 1;
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
      point.value = node.PX * node.PY * 300;
      heatmap_data.data.push(point);
      mapCT.set(node.NODE, point);
    }
    heatmap.setData(heatmap_data);
    return true;
  } else {
    shtml = "Cannot get the nodes";
    document.getElementById(E_HEATMAP).innerHTML = shtml;
    return false;
  }
}

// menampilkan heatmap kalau ada data yang sudah berubah
function viewUpdateHeatmap() {
  if (received_count > 0) {
    heatmap.setData(heatmap_data);
    received_count = 0;
  }
}

async function getNodes() {
  url = "/api/nodes";
  response = await fetch(url);
  rjson = await response.json();
  return rjson;
}

viewHeatmap();


/////***** MQTT *****/////
// Run when connected (continuous)
client.on("connect", function() {
  console.log("client connected at %s:%s", BROKER_ADDR);
  console.log("MQTT client connected to " + broker_url);
  // siap terima semua data CT
  topic = SYS_TOPIC + "+/" + TAG_TOPIC + "/#";
  client.subscribe(topic);
  timer = setInterval(viewUpdateHeatmap, UPDATE_INTERVAL);
  client.subscribe(SYS_TOPIC2);
});

client.on("message", function(topic, message) {
  // decode topic : SYS/NODE/TAG/NUM
  var fields = topic.split("/"); // split topic menjadi array
  sNode = fields[1]; // snode = NODE01 atau NODE02 dsb
  sNode = sNode.slice(4, 6); // snode = 01, 02 ,, 11, .... dsb
  sNode = parseInt(sNode); // snode = 1, 2 ,3 ... dsb

  sTag = fields[2]; // sTAG = CT dsb
  value = parseInt(message, 10); // isi atau message dari topicnya

  /// Simpan data sementara untuk mempermudah pengolahan data
  saveData(sNode, sTag, value);

  // data bwt heatmap LDR
  node = fields[1];

  // Update Heatmap LDR jika topic yg didapat == CT
  // Update Heatmap LED jika topic yg didapat bukan CT
  if (sTag == "CT") {
    onReceiveCT(node, value);
  } else {
    updateHMI();
  }
});

/////***** FUNCTION *****/////
/**
 * Fungsi dipanggil ketika tombol publish di HTML di click
 * 
 * Fungsi akan mempublish 5 variabel (CC, YS, DVR, DVG, DVB)
 * hanya pada node yang di tick pada HTML
 */
function publish() {
  // Check state auto
  if (document.getElementById("checkboxAuto").checked == true) {
    stateAuto = 1;
  } else {
    stateAuto = 0;
  }

  //  Konversi posisi x y ke node 1-16
  var z = 1;
  for (let i = 1; i < 5; i++) {
    for (let u = 1; u < 5; u++) {
      // Check checkbox state and save it in the array
      nodeState[z] = document.getElementById(
        "x" + u.toString() + "y" + i.toString()
      ).checked;
      z++;
    }
  }

  // Loop 16 kali untuk tiap node
  for (let i = 1; i < 17; i++) {
    // Publish when checkbox is ticked
    if (nodeState[i] == true) {
      // Publish RGB topic
      for (let u = 0; u < 3; u++) {
        // Menyesuaikan format topic
        if (i < 10) {
          topicPublish =
            SYS_TOPIC + "NODE" + "0" + i + "/DV" + RGB[u] + "/0" + i + "1";
        } else {
          topicPublish = SYS_TOPIC + "NODE" + i + "/DV" + RGB[u] + i + "1";
        }
        client.publish(topicPublish, slider[u].value.toString());
      }

      // Publish CC topic
      // Menyesuaikan format topic
      if (i < 10) {
        topicPublish = SYS_TOPIC + "NODE" + "0" + i + "/CC" + "/0" + i + "1";
      } else {
        topicPublish = SYS_TOPIC + "NODE" + i + "/CC" + i + "1";
      }
      client.publish(topicPublish, slider[3].value.toString());

      // Publish State Auto
      if (i < 10) {
        topicPublish = SYS_TOPIC + "NODE" + "0" + i + "/YS" + "/0" + i + "1";
      } else {
        topicPublish = SYS_TOPIC + "NODE" + i + "/YS" + i + "1";
      }
      client.publish(topicPublish, stateAuto.toString());
    }
  }
}

/**
 * @param {*} sNode = nilai node
 * @param {*} sTag = tipe data yang ingin disimpan
 * @param {*} value = nilai data yang disimpata
 */

function saveData(sNode, sTag, value) {
  switch (sTag) {
    case "CT":
      CT[sNode] = value;
      break;
    case "YI":
      YI[sNode] = value;
      break;
    case "DIR":
      R[sNode] = value;
      break;
    case "DIG":
      G[sNode] = value;
      break;
    case "DIB":
      B[sNode] = value;
      break;
  }
  // Anti error undefined + edit RGB menjadi hexa
  if (R[sNode] != undefined && G[sNode] != undefined && B[sNode] != undefined) {
    color[sNode] = rgbToHex(R[sNode], G[sNode], B[sNode]);
  }
}

// Fungsi untuk konversi RGB ke Hexa
/**
 * 
 * @param {*} c = angka yang akan dikonversi ke format hexa
 * return string dengan panjang 2
 */
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
/**
 * 
 * @param {*} r = value Red yang akan di konversikan
 * @param {*} g = value Green yang akan di konversikan
 * @param {*} b = value Blue yang akan di konversikan
 * return string yang sudah bisa digunakan langsung pada HTML sesuai dengan nilai input RGB
 */
function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


/**
 * Fungsi untuk mengupdate warna pada heatmap LED
 */
function updateHMI() {
  var z = 1;
  // Konversi Node menjadi posisi dan looping tiap posisi
  for (let i = 1; i < 5; i++) {
    for (let u = 1; u < 5; u++) {
      // Update warna
      document.getElementById("map_x" + u + "y" + i).style.backgroundColor =
        color[z];
      z++;
    }
  }
}

/**
 * Digunakan untuk update tickbox ketika radioclick yang bersesuaian ditekan pada HTML
 */
function radioClick() {
  for (let i = 0; i < 7; i++) {
    if (document.getElementById(radio[i]).checked == true) {
      if (i == 0) {
        check(0, 1, 1);
        check(0, 2, 1);
        check(0, 3, 1);
        check(0, 4, 1);
      } else if (i == 1) {
        check(1, 0, 1);
        check(2, 0, 0);
        check(3, 0, 0);
        check(4, 0, 0);
      } else if (i == 2) {
        check(2, 0, 1);
        check(3, 0, 1);
        check(1, 0, 0);
        check(4, 0, 0);
      } else if (i == 3) {
        check(4, 0, 1);
        check(1, 2, 0);
        check(2, 2, 0);
        check(3, 0, 0);
      } else if (i == 4) {
        check(0, 1, 1);
        check(0, 2, 0);
        check(0, 3, 0);
        check(0, 4, 0);
      } else if (i == 5) {
        check(0, 1, 0);
        check(0, 2, 1);
        check(0, 3, 1);
        check(0, 4, 0);
      } else {
        check(0, 1, 0);
        check(0, 2, 0);
        check(0, 3, 0);
        check(0, 4, 1);
      }
    }
  }
}

/**
 * Digunakan untuk mengubah checkbox antar baris dengan cepat
 * @param {*} x = koordinat x pada HMI 
 * @param {*} y = koordinat y pada HMI
 * @param {*} type => 1 = tick, 0 = untick
 */
function check(x, y, type) {
  if (type == 1) {
    var val = true;
  } else {
    var val = false;
  }
  if (x == 0) {
    for (let i = 1; i < 5; i++) {
      document.getElementById(
        "x" + i.toString() + "y" + y.toString()
      ).checked = val;
    }
  } else {
    for (let i = 1; i < 5; i++) {
      document.getElementById(
        "x" + x.toString() + "y" + i.toString()
      ).checked = val;
    }
  }
}

/**
 * Void reset digunakan mengembalikan tampilan controll HMI ke default awal 
 */

function reset() {
  // 16 nodes
  check(0, 1, 0);
  check(0, 2, 0);
  check(0, 3, 0);
  check(0, 4, 0);
  // radio button
  for (let i = 0; i < 7; i++) {
    document.getElementById(radio[i]).checked = false;
  }
  // SLIDER RGB
  for (let i = 0; i < 3; i++) {
    document.getElementById("slider" + RGB[i]).value = 50;
    document.getElementById("sliderVal" + RGB[i]).innerHTML = 50; // Ambil Value
  }
  // SLIDER CC
  document.getElementById("sliderCC").value = 50;
  sliderVal[3] = document.getElementById("sliderValCC").innerHTML = 50; // Ambil Value

  // state Auto
  document.getElementById("checkboxAuto").checked = false;
}
