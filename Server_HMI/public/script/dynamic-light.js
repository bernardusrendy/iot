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
