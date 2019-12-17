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
=======
int RGB[16][3]; // array 16 lampu, 3 warna

function pat_reset(){ //semua warna jadi nol
  for(i = 0; i<16; i++){
    for(j = 0; j<3; j++){
      RGB[i][j] = 0;
    }
  }
}

function pat_blosom(int i = 1, int u = 2){
  i = i%2; //i = initial condition //u untuk warna
  u = u%3;
  if (i = 0){
    RGB[0][u]=255; RGB[1][u]=0; RGB[2][u]=0; RGB[3][u]=255;
    RGB[4][u]=0; RGB[5][u]=255; RGB[6][u]=255; RGB[7][u]=0;
    RGB[8][u]=0; RGB[9][u]=255; RGB[10][u]=255; RGB[11][u]=0;
    RGB[12][u]=255; RGB[13][u]=0; RGB[14][u]=0; RGB[15][u]=255;
  }
  if (i = 1){
    RGB[0][u]=0; RGB[1][u]=200; RGB[2][u]=200; RGB[3][u]=0;
    RGB[4][u]=200; RGB[5][u]=0; RGB[6][u]=0; RGB[7][u]=200;
    RGB[8][u]=200; RGB[9][u]=0; RGB[10][u]=0; RGB[11][u]=200;
    RGB[12][u]=0; RGB[13][u]=200; RGB[14][u]=200; RGB[15][u]=0;
  }
  i++
}

function pat_wave(int i = 1, int u = 2){
  i = i%4; //i = phase //u untuk warna
  u = u%3;
  if (i = 0){
    RGB[0][u]=200; RGB[1][u]=0; RGB[2][u]=0; RGB[3][u]=0;
    RGB[4][u]=200; RGB[5][u]=0; RGB[6][u]=0; RGB[7][u]=0;
    RGB[8][u]=200; RGB[9][u]=0; RGB[10][u]=0; RGB[11][u]=0;
    RGB[12][u]=200; RGB[13][u]=0; RGB[14][u]=0; RGB[15][u]=0;
  }
  if (i = 1){
    RGB[0][u]=0; RGB[1][u]=200; RGB[2][u]=0; RGB[3][u]=0;
    RGB[4][u]=0; RGB[5][u]=200; RGB[6][u]=0; RGB[7][u]=0;
    RGB[8][u]=0; RGB[9][u]=200; RGB[10][u]=0; RGB[11][u]=0;
    RGB[12][u]=0; RGB[13][u]=200; RGB[14][u]=0; RGB[15][u]=0;
  }
  if (i = 2){
    RGB[0][u]=0; RGB[1][u]=0; RGB[2][u]=200; RGB[3][u]=0;
    RGB[4][u]=0; RGB[5][u]=0; RGB[6][u]=200; RGB[7][u]=0;
    RGB[8][u]=0; RGB[9][u]=0; RGB[10][u]=200; RGB[11][u]=0;
    RGB[12][u]=0; RGB[13][u]=0; RGB[14][u]=200; RGB[15][u]=0;
  }
  if (i = 3){
    RGB[0][u]=0; RGB[1][u]=0; RGB[2][u]=0; RGB[3][u]=200;
    RGB[4][u]=0; RGB[5][u]=0; RGB[6][u]=0; RGB[7][u]=200;
    RGB[8][u]=0; RGB[9][u]=0; RGB[10][u]=0; RGB[11][u]=200;
    RGB[12][u]=0; RGB[13][u]=0; RGB[14][u]=0; RGB[15][u]=200;
  }
}
