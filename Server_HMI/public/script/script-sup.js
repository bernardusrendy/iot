const BROKER_ADDR = '127.0.0.1';
const BROKER_PORT = '3000';

const SYS_TOPIC = 'TF-IIOT/';
const TAG_TOPIC = 'CT';       // tag yang akan masuk chart

// nama eleman HTML
const E_NODES = 'e-nodes';
const E_TAGS = 'e-tags';
const E_CHART = 'e-chart';


// Nilai boolean
const OFF = 0;
const ON = 1;
const INVALID=2;

// warna LED untuk status
const led_colors = [
  "rgb(46, 204, 113)",   // 0: off
  "rgb(231, 76, 60)",    // 1: on
  "darkgrey"];           // invalid


// chart.js, multiline
var config = {
  type: 'line',
  data: {
    labels: [-9, -8, -7, -6, -5, -4, -3, -2, -1, 0],  // akan diisi waktu
    datasets: [{
      label: 'CT',
      backgroundColor: window.chartColors.red,
      borderColor: window.chartColors.red,
      fill: false,
      data: [],   // sebaiknya diisi inisial
    }]
  },
  options: {
    responsive: true,
    title: {
      display: true,
      text: 'IOT NODE'
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    scales: {
      xAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Sampling'
        }
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Brightness (lx)'
        }
      }]
    }
  }
};


// obyek-obyek yang sedang di supervisory
var nodes;
var active_node="";
var active_node_id=0;
var active_tag="";
var active_tag_id=0;

// pointer agar cepat akses data chart
var active_chart_title = config.data.datasets[0].title;
var active_chart_data = config.data.datasets[0].data;

// MQTT Setup
var broker_url = 'ws://'+BROKER_ADDR+":"+BROKER_PORT;
var client = mqtt.connect(broker_url);

// Run when connected (continuous)
client.on('connect', function() {
    console.log('MQTT client connected to '+broker_url);
})

// Run when message received
client.on('message', function(topic, message) {   
    // decode topic
    // SYS/NODE/TAG/NUM
    fields = topic.split("/");
    tag = fields[2] + fields[3];
    value = parseInt(message.toString('utf-8'),10);
    //console.log('Received %s = %d', tag, value);
    viewUpdateTag(tag, value);
    if (tag == active_tag) {
      viewUpdateChart(value);
    }
})


//----------------------------------------------------
// Fungsi-fungsi REST
async function getNodes() {
  url = '/api/nodes';
  //console.log('Get :', url);
  response = await fetch(url);
  rjson = await response.json();
  //console.log(JSON.stringify(rjson));
  return rjson;
}

// Fungsi-fungsi REST
async function getTags(node_id) {
  url = '/api/tags/'+node_id;
  //console.log('Get :', url);
  response = await fetch(url);
  myJson = await response.json();
  // console.log(JSON.stringify(myJson));
  return myJson;
}

// mengisi data awal, memakai web Service
async function getData(tag_id, len) {
  url = '/api/data/'+tag_id+'/'+len.toString();
  console.log('Get :', url);
  response = await fetch(url);
  rjson = await response.json();
  console.log("FETCH ="+JSON.stringify(rjson));
  return rjson;
}

// ------------------------------------------------------------
// Fungsi-fungsi untuk update UI

// fungsi ganti active_node 
// value berisi "node/node_id"
async function onChangeNode(value) {
  // berhenti subscribe node lama
  if (active_node != "") {
    client.unsubscribe(SYS_TOPIC+active_node+'/#');
  }

  // decode node baru
  fields = value.split('/');
  active_node = fields[0];
  active_node_id = parseInt(fields[1],10);

  // pisahkan nomor node
  node_num = active_node.substr(4);
  active_tag = TAG_TOPIC + node_num + '1';

  // tampilkan tags node baru
  await viewTags();

  // tampilkan char node baru
  await viewChart();

  // subscribe node baru
  client.subscribe(SYS_TOPIC+active_node+'/#');

}

async function viewNodes() {
  nodes = await getNodes();
  if (nodes) {
    // build menu sesuai hak
    shtml=`<select class="form-control" name="IOT-NODES" onchange="onChangeNode(this.value)">`;
    for (node of nodes) {
      shtml += `<option value="${node.NODE}/${node.ID}">${node.NODE}</option>`;
    }
    shtml+=`</select>`;
    onChangeNode(nodes[0].NODE+'/'+nodes[0].ID);
  }
  else {
    shtml="Cannot get the nodes";
  }
  //console.log(shtml);
  // ganti element
  document.getElementById(E_NODES).innerHTML = shtml;
}

async function viewTags() {
  tags = await getTags(active_node_id);
  console.log("TAG="+active_tag);
  if (tags) {
    // build table sesuai tags
    shtml=`<table class="table">`;
    for (tag of tags) {
      shtml += `<tr><td>${tag.TAG}</td><td id="${tag.TAG}">0</td></tr>`;
      // simpan tag_id agar nanti lebih cepat ambil data
      if (tag.TAG == active_tag) {
        active_tag_id = tag.ID;
        console.log("TAG_ID="+active_tag_id);
      }
    }
    shtml+=`</table>`;
  }
  else {
    shtml="Cannot fetch the node's tags";
  }
  //console.log(shtml);
  // ganti element
  document.getElementById(E_TAGS).innerHTML = shtml;
}

function viewUpdateTag(tag, value){ 
  e=document.getElementById(tag);
  if (e) {
    e.innerHTML = value;
    //console.log("Update "+tag+"="+value.toString());
  }
}

async function viewChart() {
  config.options.title.text = active_node;
  config.data.datasets[0].label = active_tag;
  config.data.datasets[0].data = [];  

  rdata = await getData(active_tag_id, 10);
  console.log("DATA = "+JSON.stringify(rdata));
  if (rdata != null) {
    for (i=0; i<rdata.length; i++) {
      //console.log(JSON.stringify(data[i]));
      config.data.datasets[0].data.push(rdata[i].VALUE).toFixed(2);
    }
    chart.update();
  }
}

// Update chart
function viewUpdateChart(value) {
  if (config.data.datasets[0].data.length > 10) {
    config.data.datasets[0].data.shift();
  }
  config.data.datasets[0].data.push(value).toFixed(2);
  chart.update();  
}

var ctx = document.getElementById(E_CHART).getContext('2d');
var chart = new Chart(ctx, config);
viewNodes();

/// SLIDER R
var sliderR = document.getElementById("sliderR");
var sliderValR = document.getElementById("sliderValR");
sliderValR.innerHTML = sliderR.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
sliderR.oninput = function() {
  sliderValR.innerHTML = this.value;
  R = this.value;
  console.log(this.value);
};

/// SLIDER G
var sliderG = document.getElementById("sliderG");
var sliderValG = document.getElementById("sliderValG");
sliderValR.innerHTML = sliderR.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
sliderG.oninput = function() {
  sliderValG.innerHTML = this.value;
  G = this.value;
  console.log(this.value);
};

/// SLIDER B
var sliderB = document.getElementById("sliderB");
var sliderValB = document.getElementById("sliderValB");
sliderValB.innerHTML = sliderB.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
sliderB.oninput = function() {
  sliderValB.innerHTML = this.value;
  B = this.value;
  console.log(this.value);
};

/// SLIDER CC
var sliderCC = document.getElementById("sliderCC");
var sliderValCC = document.getElementById("sliderValCC");
sliderValCC.innerHTML = sliderCC.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
sliderCC.oninput = function() {
  sliderValCC.innerHTML = this.value;
  CC = this.value;
  console.log(this.value);
};

var RGB = ["R", "G", "B"];

function reset() {
  // SLIDER RGB
  for (let i = 0; i < 3; i++) {
    document.getElementById("slider" + RGB[i]).value = 50;
    document.getElementById("sliderVal" + RGB[i]).innerHTML = 50; // Ambil Value
    // sliderVal[i].innerHTML = slider[i].value; // Display the default slider value
    // console.log(slider[i].value)
  }
  // // SLIDER CC
  document.getElementById("sliderCC").value = 50;
  document.getElementById("sliderValCC").innerHTML = 50; // Ambil Value
  // sliderVal[3].innerHTML = slider[3].value; // Display the default slider value
  // console.log(slider[3].value)

  // state Auto
  document.getElementById("checkboxAuto").checked = false;
}

function publish() {
  var autoManual;
  if (document.getElementById("checkboxAuto").checked == true) {
    autoManual = 1;
  } else {
    autoManual = 0;
  }
  client.publish(
    SYS_TOPIC + "NODE01/CC/011",
    document.getElementById("sliderCC").value.toString(),
    { retain: true }
  );
  client.publish(SYS_TOPIC + "NODE01/YS/011", autoManual.toString(), {
    retain: true
  });
  client.publish(
    SYS_TOPIC + "NODE01/DVR/011",
    document.getElementById("sliderR").value.toString(),
    { retain: true }
  );
  client.publish(
    SYS_TOPIC + "NODE01/DVG/011",
    (document.getElementById("sliderG"), value).toString(),
    { retain: true }
  );
  client.publish(
    SYS_TOPIC + "NODE01/DVB/011",
    document.getElementById("sliderB").value.toString(),
    { retain: true }
  );

  // For monitoring
  // console.log(document.getElementById("sliderCC").value.toString());
  // console.log(autoManual.toString())
  // console.log(document.getElementById("sliderR").value.toString())
  // console.log(document.getElementById("sliderG").value.toString())
  // console.log(document.getElementById("sliderB").value.toString())
}
