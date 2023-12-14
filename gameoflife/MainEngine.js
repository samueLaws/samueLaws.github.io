const mainCanvas = document.getElementById("mainCanvas");
const ctx = mainCanvas.getContext("2d");
mainCanvas.width = 800;
mainCanvas.height = 800;

const stepButton = document.getElementById("step_button");
stepButton.addEventListener("click", stepOnce);

const startButton = document.getElementById("start_button");
startButton.addEventListener("click", startRun);

const stopButton = document.getElementById("stop_button");
stopButton.addEventListener("click", stopRun);

const inputBoxNumber = document.getElementById("step_count");
setStepCount(1000);

const stepSpeedInput = document.getElementById("step_speed");
stepSpeedInput.value = 100;
var frame = 0;

var stepperInterval;
var stopStepperInterval;
var defaultStepsLeft = getStepCount();
var stepsLeft = defaultStepsLeft;

ctx.fillStyle = "#000000";
ctx.fillRect(0,0,mainCanvas.width,mainCanvas.height);

//cellsPerChunk - a smaller number works better as it loads fewer unneccessary cells
//defaultCellWidth - the starting viewport
let cellsPerChunk = 32, defaultCellWidth = 32;
const chunkManager = new ChunkManager(cellsPerChunk);
const fControl = new FrameControl(defaultCellWidth,cellsPerChunk,chunkManager,mainCanvas);

drawBoard();

function getStepCount(){
    return inputBoxNumber.value;
}

function setStepCount(number){
    inputBoxNumber.value = number;
}

function stepOnce(){
    doRuleThenDraw();
}
function startRun(){
    // stop an old one if it is running
    if(stepperInterval != null){
        stopRun();
    }
    //start a timer
    let frameTimeInterval = Number(stepSpeedInput.value);
    stepperInterval = setInterval(doRuleThenDraw, frameTimeInterval);
    stopStepperInterval = setTimeout(stopRun, defaultStepsLeft*frameTimeInterval + 10);
}
function stopRun(){
    //stop the timer if it is already running
    if(stepperInterval != null){
        clearInterval(stepperInterval);
        clearInterval(stopStepperInterval);
    }
    stepsLeft = defaultStepsLeft;
}

function doRule(){
    //execute the rule
    chunkManager.doRule();
    frame++;
    fControl.changeRuleTimeTaken(chunkManager.ruleTimeTaken);
    checkIfNeedInterupt(chunkManager.ruleTimeTaken);
}
function drawBoard(){
    //draw the cells that are visible
    fControl.drawBoardFrom(chunkManager);
}

function doRuleThenDraw(){
    //get rule time
    doRule();
    //get draw time
    drawBoard();
}

function checkIfNeedInterupt(timeTaken){
    //if the time taken is larger than the current frameTimeInterval, pause the run and increase the frameTimeInterval.
    if(timeTaken > stepSpeedInput.value){
        stepSpeedInput.value = timeTaken;
        if(stopStepperInterval != null){ //autorun scheduled
            stopRun(); 
        }
    }

    //alternatively add a max frame time taken to induce the pause
}