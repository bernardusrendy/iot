/*----------------------
mqtt2sql.js: MQTT Subscriber who inputs message to SQL Database
------------------------*/

//---- MQTT subscriber
var mqtt = require('mqtt')
const brokerAddress = '192.168.43.131'
const SYS = 'TF-IIOT/'

var mqtt2sql = mqtt.connect('mqtt://'+ brokerAddress)

mqtt2sql.on('connect', function () {
  mqtt2sql.subscribe(SYS + '#');
})

mqtt2sql.on('message', function (topic, message) {
  console.log(topic + ' : ' + message.toString());	//debug
  insert_message(topic, message);
})

//---- SQL connection
var mysql = require('mysql');
const dbName = 'iiot03';

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: dbName
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

function insertData2(con, tag_id, value) {
  var sql = "INSERT INTO DATA (TAG_ID, DTIME, VALUE) VALUES ("
     + tag_id +", NOW(), "+value+")";
  console.log(sql);	//debugging
  con.query(sql, function (err, result) {
     if (err) throw err;
     console.log("  1 record inserted"); //debugging
  });
}

function insertData1(con, sNode, sTag, value) {
  var sql = "SELECT ID FROM TAG WHERE Tag='"+sTag+"'";  //query sql
  console.log(sql); //debug
  con.query(sql, function (err, result, fields) {
     if (err) throw err;
     //console.log(result);
     tag_id = result[0].ID;
     insertData2(con, tag_id, value);
  });
  return 0;
}

//---- insert_message() v1
function insert_message(topic, message) {
	// console.log(topic);		//debugging
	var fields = topic.split('/')
  // agar jelas
  sNode = fields[1];
  sTag = fields[2]+fields[3];
  value = parseInt(message, 10);

  // cari dulu ID dari insert_message
  con.connect(function(err) {
    insertData1(con, sNode, sTag, value);
  });
}
