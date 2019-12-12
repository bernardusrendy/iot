function pat_blosom(i){
  var patCoor = [];
  patCoor[0] = 0;
  if (i = 0){
    patCoor[1]=true; patCoor[2]=false; patCoor[3]=false; patCoor[4]=true;
    patCoor[5]=false; patCoor[6]=true; patCoor[7]=true; patCoor[8]=false;
    patCoor[9]=false; patCoor[10]=true; patCoor[11]=true; patCoor[12]=false;
    patCoor[13]=true; patCoor[14]=false; patCoor[15]=false; patCoor[16]=true;
  }
  if (i = 1){
    patCoor[1]=false; patCoor[2]=true; patCoor[3]=true; patCoor[4]=false;
    patCoor[5]=true; patCoor[5]=false; patCoor[7]=false; patCoor[8]=true;
    patCoor[9]=true; patCoor[10]=false; patCoor[11]=false; patCoor[12]=true;
    patCoor[13]=false; patCoor[14]=true; patCoor[15]=true; patCoor[16]=false;
  }
  return patCoor;
}

function kirim(){
    var k = 0;
    var color = [200,0,0]
    var pattern = pat_blosom(k)
    setInterval(publish1(pattern,color),500);
    k++;
}

function publish1(pattern, color) {
  var node = pattern
  console.log(kirim)
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
        console.log(topicPublish, color[u].toString());
        client.publish(topicPublish, color[u].toString());
      }
    }
  }
  console.log(node);
}
