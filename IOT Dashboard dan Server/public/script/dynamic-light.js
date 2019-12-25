/**
 * Fungsi pembuat pola
 * @param {*} i = faktor output pola
 * return array state nodes yang menyala dan mati
 */ 
function pat_blosom(i){
  var patCoor = [];
  patCoor[0] = 0;
  if (i%2 == 0){
    patCoor[1]=true; patCoor[2]=false; patCoor[3]=false; patCoor[4]=true;
    patCoor[5]=false; patCoor[6]=true; patCoor[7]=true; patCoor[8]=false;
    patCoor[9]=false; patCoor[10]=true; patCoor[11]=true; patCoor[12]=false;
    patCoor[13]=true; patCoor[14]=false; patCoor[15]=false; patCoor[16]=true;
  }
  if (i%2 == 1){
    patCoor[1]=false; patCoor[2]=true; patCoor[3]=true; patCoor[4]=false;
    patCoor[5]=true; patCoor[5]=false; patCoor[7]=false; patCoor[8]=true;
    patCoor[9]=true; patCoor[10]=false; patCoor[11]=false; patCoor[12]=true;
    patCoor[13]=false; patCoor[14]=true; patCoor[15]=true; patCoor[16]=false;
  }
  return patCoor;
}

// Fungsi yang dipanggil dari HTML
function kirim(){  
  setInterval(publish1(),1000);
}

// deklarasi 
var k = 0;

function publish1() {

  // Membangun pola
  var color = [200,0,0]
  var pattern = pat_blosom(k)

  for (let i = 1; i < 17; i++) {

    // Logic untuk nyala mati warna pola
    if(pattern[i] == true){
      color[0] = 200
    }
    else {
      color[0] = 0
    }

      // Publish RGB topic
      for (let u = 0; u < 3; u++) {
        if (i<10){
          topicPublish = "TF-IIOT/" + "NODE" + "0" + i + "/DV" + RGB[u] + "/0"+ i +"1";
        } else{
          topicPublish = "TF-IIOT/" + "NODE" + i + "/DV" + RGB[u] + "/"+ i + "1";
        }
        client.publish(topicPublish, color[u].toString());
      }
  }

  // Ubah pola untuk run berikutnya
  k++;
}
