//5 by 5 grid
//current position represented by a 25 length array/vector
//randomly generated with a 50/50 chance of being on or off
//edited by hand

//not checking if it is possible to solve yet----
var SceneMode = "Play";//"Edit","Play"
var CurrentBoard = [];
var CurrentSelected;

//fills the board with zeros
for(let i = 0; i < 25; i++){
    CurrentBoard[i] = 0;
  }


function setup() {
  createCanvas(500, 500);
  var ChangeModeButton = createButton("Swap modes");
  ChangeModeButton.mousePressed(SwapMode);
  var CheckVictory = createButton("Did I win?");
  CheckVictory.mousePressed(CheckWin);
  var RandomMap = createButton("Randomise");
  RandomMap.mousePressed(RandomiseBoard);
  RandomiseBoard()
}

function CheckWin(){
  let count = 0
  for(let i = 0; i < 25; i++){
    if(CurrentBoard[i]== 0){
       count++;
    }
  }
  if(count == 0){
    print("You Won");
  }else{
    print("Not quite there yet");
  }
}

function RandomiseBoard(){
  for(let i = 0; i < 25; i++){
    if(random([0,1])){
      CurrentSelected = i
      mouseClicked();
    }
  }
}

function SwapMode() {
  //Modeonly affects the effect an action has on the board;
  if (SceneMode == "Edit"){
    //Make Changes required for Scene to become Play
    
    SceneMode = "Play";
  }else{//assumed SceneMode == "Play"
    //Make Changes required for Scene to become Edit
    
    
    SceneMode = "Edit";
  }
}

function defineCurrentSelected(mX,mY){
  //encode mouse position into grid coords
  let rMX = (mX%100) - 50;
  let rMY = (mY%100) - 50;
  
  let distFromOriginS = rMX*rMX + rMY*rMY;
  let circleRadiusS = 30*30;
  if(distFromOriginS < circleRadiusS){
    let i = Math.floor(mX/100);
    let j = Math.floor(mY/100);
    CurrentSelected = i + j*5;
  }
  else{
    CurrentSelected = 30;
  }
}

function mouseClicked(){
  ChangeLight(CurrentSelected);
  if(SceneMode == "Play"){
    //change adjacent tiles
    //conditional for edge side wrapping removal
    if(CurrentSelected%5 == 0){
      ChangeLight(CurrentSelected - 5);
      ChangeLight(CurrentSelected + 1);
      ChangeLight(CurrentSelected + 5);   
    }else if((CurrentSelected+1)%5 == 0){
      ChangeLight(CurrentSelected - 5);
      ChangeLight(CurrentSelected - 1);
      ChangeLight(CurrentSelected + 5);
    }else{
      ChangeLight(CurrentSelected - 5);
      ChangeLight(CurrentSelected - 1);
      ChangeLight(CurrentSelected + 1);
      ChangeLight(CurrentSelected + 5);
    }
  }
}

function ChangeLight(n){
  if (CurrentBoard[n] == 1)
    CurrentBoard[n] = 0;
  else{
    CurrentBoard[n] = 1;
  }
}

function draw() {
  background(220);
  //drawing grid
  for(let i = 1; i <5; i++){
    line(0,i*100,500,i*100);
    line(i*100,0,i*100,500);
  }
  defineCurrentSelected(mouseX,mouseY);
  
  text(SceneMode,5,10);
  for(let i = 0; i < 5 ; i++){
    for(let j =0; j < 5 ;j++){
      var pos = i*5 + j;
      //CurrentBoard[i] current state
      if(CurrentSelected == pos){
        fill(200);//light gray for mouse hover
      }else if(CurrentBoard[pos] == 1){
        //draw as on
        fill(255,255,169);//Yellow
      }else{
        //draw as off
        fill(110);
      }
      circle(50+j*100,50+i*100,60);
    }
  }
}