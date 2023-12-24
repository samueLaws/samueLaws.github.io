const mainCanvas = document.getElementById("main_canvas");
const ctx = mainCanvas.getContext("2d");

ctx.fillStyle = "black";
ctx.fillRect(0,0,mainCanvas.width,mainCanvas.height)

const ball = new Ball();
ball.setPos(400,400);
ball.setVel(2,0.4);


var nextStep = false;
var autoInterval;

setupStepper();
function setupStepper(){
    autoInterval = setInterval(frameStep,5000);
    nextStep = true;    
}

var skipCount = 0;
var frameCount = 0;

function frameStep(){
    if(!nextStep){
        skipCount += 1;
        console.log("update skipped.");
        return;
    }
    nextStep = false;
    frameCount += 1;
    
    //implement standard frame start
    stepProcess();
    drawFrame();
    
    skipCount = 0;
    nextStep = true;
}


function stepProcess(){
    //for the moment do standard time step approx
    ball.stepForward(1);
}


function drawFrame(){
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,mainCanvas.width,mainCanvas.height)

    //draw a ball at its currently calculated position
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.ellipse(ball.position[0], ball.position[1], ball.size, ball.size, 0, 0, 2*Math.PI);
    ctx.fill();
}