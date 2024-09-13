var rowList;
let matrixSize = 9;
//text entrybox
//button to submit
const btn = document.getElementById("btn");


btn.addEventListener('click',function(){
  //break into 
  
  
  var txt = document.getElementById("lineSum").value;
  if(txt.charAt(1) == '+'){
   rowAdd(txt.charAt(0)-1,txt.charAt(2)-1);
  }else if(txt.charAt(1) == '='){
    o1 = txt.charAt(0)-1;
    o2 = txt.charAt(2)-1;
    rowAdd(o1,o2);
    rowAdd(o2,o1);
    rowAdd(o1,o2);
  }
});

function genIdentity(dim){
  G = [];
  for(j = 0; j < dim;j++){
    G.push([]);
    for(i = 0;i < dim; i++){
      G[j].push([0]);
      if(i==j){
        G[j][i] = 1;
      }
    }
  }
  return G;
}
function genMatrix(dim){
  G = [];
  k = 0;
  l = 0;
  for(j = 0;j < dim*dim;j++){
    G.push([]);
    for(i = 0;i < dim*dim;i++){
      G.push([0]);
    }
  }
  
  // start B I
  // end I B
  for(j = 0;j < dim;j++){
      
  }
  
  
}

const B = genMatrix(4);


const A = [[1,1,0,1,0,0,0,0,0],
           [1,1,1,0,1,0,0,0,0],
           [0,1,1,0,0,1,0,0,0],
           [1,0,0,1,1,0,1,0,0],
           [0,1,0,1,1,1,0,1,0],
           [0,0,1,0,1,1,0,0,1],
           [0,0,0,1,0,0,1,1,0],
           [0,0,0,0,1,0,1,1,1],
           [0,0,0,0,0,1,0,1,1]
            ];
function setup() {
  createCanvas(400, 400);
}


function writeA(x1,y1,x2,y2,numCells) {
  //presumed square
  cellW = (x2-x1)/numCells;
  
  startX = x1 + cellW/2;
  startY = y1 + cellW/2;

  for(let j = 0; j < 9; j++ ){
    for(let i = 0; i < 9; i++){
    
      //i -> y
      //j -> x
      push();
      textSize(25);
      text(A[j][i],startX+i*cellW,startY+j*cellW);
      pop();
    }
  }
}

function rowAdd(row1,row2){
  for(i = 0; i < 9; i++){
    A[row1][i] = A[row1][i] ^ A[row2][i];
  }
}

function draw() {
  background(220);
  //rect(30,30,340,340)
  let p1 = { x: 60, y: 30 };
  let p2 = { x: 50, y: 50 };
  let p3 = { x: 50, y: 300 };
  let p4 = { x: 60, y: 320 };
  line(p1.x,p1.y,p2.x,p2.y);
  line(p2.x,p2.y,p3.x,p3.y);
  line(p3.x,p3.y,p4.x,p4.y)
  
  line(400-p1.x,p1.y,400-p2.x,p2.y);
  line(400-p2.x,p2.y,400-p3.x,p3.y);
  line(400-p3.x,p3.y,400-p4.x,p4.y);
  writeA(p1.x,p1.y,400-p4.x,p4.y,matrixSize);
}


//set up grid
//do default of 3x3