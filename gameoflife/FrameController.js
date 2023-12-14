/**
 * Holds information about the camera location and scale.
 * Also holds method for drawing visible cells to screen.
 */
class FrameControl{
    constructor(cellsAcrossScreen, kSize, cm, canvas){
        this.cellsAcrossScreen = cellsAcrossScreen;
        this.cellSize = 800/cellsAcrossScreen;
        this.chunkSize = kSize;
        this.chunkManager = cm;
        this.canvas = canvas;
        this.cameraOffset = [0,0]; //stored in raw pix
        this.drawFrame = 0;
    }

    drawBoardFrom(){
        //draw all chunks for the moment
        ctx.fillStyle = "#000000";
        ctx.fillRect(0,0,800,800); 
        for(let i = 0; i < this.chunkManager.chunkList.length; i++){
            this.drawChunk(this.chunkManager.getChunkI(i));
        }
        this.drawFrame++;
    }

    drawChunk(chunk){
        const ctx = this.canvas.getContext("2d");
        let [ckX, ckY] = [chunk.kX * this.chunkSize, chunk.kY * this.chunkSize];
        if(!chunk.inFocus){
            ctx.fillStyle = "#101c1c"
            ctx.fillRect(ckX * this.cellSize - this.cameraOffset[0],ckY* this.cellSize - this.cameraOffset[1],this.chunkSize*this.cellSize,this.chunkSize*this.cellSize);
            return; //empty chunk
        }
        for(let i = 0; i < this.chunkSize; i++){
            for(let j = 0; j < this.chunkSize; j++){
                if(this.chunkManager.getCellStateC(ckX + i, ckY + j, this.chunkManager.mainCellSide)){
                    ctx.fillStyle = "#b0d0b0"; //on
                }else{
                    ctx.fillStyle = "#202020"; //off
                }
                ctx.fillRect((ckX + i) * this.cellSize - this.cameraOffset[0], (ckY + j) * this.cellSize - this.cameraOffset[1], this.cellSize, this.cellSize);
            }
        }

    }
    changeRuleTimeTaken(timeTakenMS){
        timeTakenLabel.innerHTML = "The last rule took " + timeTakenMS + " milliseconds to complete."
    }

    moveCamLeft(units){
        this.cameraOffset[0] -= units*this.cellSize;
    }
    moveCamRight(units){
        this.cameraOffset[0] += units*this.cellSize;
    }
    moveCamUp(units){
        this.cameraOffset[1] -= units*this.cellSize;
    }
    moveCamDown(units){
        this.cameraOffset[1] += units*this.cellSize;
    }

    zoomIn(units){
        this.cellsAcrossScreen = - units + this.cellsAcrossScreen;
        this.cellSize = 800/this.cellsAcrossScreen;
    }

    zoomOut(units){
        this.cellsAcrossScreen = units + this.cellsAcrossScreen;
        this.cellSize = 800/this.cellsAcrossScreen;
    }

}

mainCanvas.addEventListener("click", onClick, false);

function onClick(e){
    stopRun();
    let [pX, pY] = getMousePosOnCanvas(e);
    //get cell position from pixel positon
    let [cX, cY] = [Math.floor((pX+fControl.cameraOffset[0])/fControl.cellSize), Math.floor((pY+fControl.cameraOffset[1])/fControl.cellSize)];
    chunkManager.swapCellState(cX, cY, chunkManager.mainCellSide); 
    //fControl.drawCell(cX,cY);
    drawBoard();
}

function getMousePosOnCanvas(e){
    var element = mainCanvas;
    var offsetX = 0, offsetY = 0;
    if (element.offsetParent) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
    }
    return [e.pageX - offsetX, e.pageY - offsetY];
}


const leftButton = document.getElementById("left_move");
leftButton.addEventListener("click", moveLeft);
const rightButton = document.getElementById("right_move");
rightButton.addEventListener("click", moveRight);
const upButton = document.getElementById("up_move");
upButton.addEventListener("click", moveUp);
const downButton = document.getElementById("down_move");
downButton.addEventListener("click", moveDown);
const inputMoveSpeed = document.getElementById("move_speed")
inputMoveSpeed.value = 10;

const zoomInButton = document.getElementById("zoom_in");
zoomInButton.addEventListener("click", zoomIn);
const zoomOutButton = document.getElementById("zoom_out");
zoomOutButton.addEventListener("click", zoomOut);

const randomFillScreenButton = document.getElementById("randomFillScreen");
randomFillScreenButton.addEventListener("click", randomFill)

const clearScreenButton = document.getElementById("clearScreen");
clearScreenButton.addEventListener("click", clearScreen);

const timeTakenLabel = document.getElementById("time_taken_label");
timeTakenLabel.innerHTML = "Run to find how long a rule run takes.";

function moveLeft(){
    fControl.moveCamLeft(Number(inputMoveSpeed.value));
    drawBoard();
}
function moveRight(){
    fControl.moveCamRight(Number(inputMoveSpeed.value));
    drawBoard();
}
function moveUp(){
    fControl.moveCamUp(Number(inputMoveSpeed.value));
    drawBoard();
}
function moveDown(){
    fControl.moveCamDown(Number(inputMoveSpeed.value));
    drawBoard();
}

function zoomIn(){
    fControl.zoomIn(Number(inputMoveSpeed.value));
    drawBoard();
}

function zoomOut(){
    fControl.zoomOut(Number(inputMoveSpeed.value));
    drawBoard();
}

function randomFill(){
    chunkManager.fillRootWithRandom(8,120,0.2);
    drawBoard();
}

function clearScreen(){
    chunkManager.clearBoard();
    drawBoard();
}
