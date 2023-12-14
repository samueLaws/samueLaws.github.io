const mainCanvas = document.getElementById("main_canvas");
const ctx = mainCanvas.getContext("2d");
mainCanvas.addEventListener("mousemove", (ev) => myFrameDrawer.changePerspective(ev));
const button = document.getElementById("start_button");
button.addEventListener("click", drawDots);
function clearFrame(){
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,mainCanvas.width,mainCanvas.height);
}

function drawDot(x,y,d,brightness){
    //x,y are 0-1 , d is diameter of the dot
    ctx.fillStyle = rgb(brightness*255,brightness*255,brightness*255);
    ctx.beginPath();
    ctx.ellipse(x,y,d,d,0,0,2*Math.PI);
    ctx.fill();
}

function rgb(r, g, b){
    return ["rgb(",r,",",g,",",b,")"].join("");
  }




//main program entry point here
const myFrameDrawer = new MyFrameDrawer(0.05);
myFrameDrawer.start();
