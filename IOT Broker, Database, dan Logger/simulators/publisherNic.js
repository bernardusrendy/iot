//---- Configuratior
const BROKER_ADDR = "localhost";
const SYS_TOPIC = "TF-IIOT/";

var mqtt = require("mqtt");
var client = mqtt.connect("mqtt://" + BROKER_ADDR);



client.on("connect", function() {
  setInterval(publish, 1000);
});

function publish() {
    var time = new Date()
    value = Math.round(Math.abs(Math.sin(time.getSeconds()))*100%255)
    // console.log(value)
  for(let i = 1; i<17; i++){
      if(i<10){
        client.publish(SYS_TOPIC + "NODE0" + i + "/CT/011", value.toString(), { retain: true });
        client.publish(SYS_TOPIC + "NODE0" + i + "/YI/011", "1", { retain: true });
        client.publish(SYS_TOPIC + "NODE0" + i + "/DIR/011", ((value+value)%255).toString(), { retain: true });
        client.publish(SYS_TOPIC + "NODE0" + i + "/DIG/011", value.toString(), { retain: true });
        client.publish(SYS_TOPIC + "NODE0" + i + "/DIB/011", ((value*value)%255).toString(), { retain: true });
      }
      else{
        client.publish(SYS_TOPIC + "NODE" + i + "/CT/011", value.toString(), { retain: true });
        client.publish(SYS_TOPIC + "NODE" + i + "/YI/011", "1", { retain: true });
        client.publish(SYS_TOPIC + "NODE" + i + "/DIR/011", ((value+value)%255).toString(), { retain: true });
        client.publish(SYS_TOPIC + "NODE" + i + "/DIG/011", value.toString(), { retain: true });
        client.publish(SYS_TOPIC + "NODE" + i + "/DIB/011", ((value*value)%255).toString(), { retain: true });
      }
    //   console.log("TOPIC", SYS_TOPIC + "NODE" + i + "/CT/011")
    }
}

client.on("message", function(topic, message) {
  // decode the topic
//   fields = topic.split("/");
//   sNode = fields[1];
//   sNodeNum = sNode.split("NODE");
//   sTag = fields[2];
//   sTagNum = fields[3];
//   value = parseInt(message, 10);

//   console.log(
//     "Received NODE" + sNodeNum + "/" + sTag + sTagNum + "=" + value.toString()
//   );
});
