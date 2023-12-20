const mainCanvas = document.getElementById("main_canvas");
const ctx = mainCanvas.getContext("2d");

ctx.fillStyle = "black";
ctx.fillRect(0,0,mainCanvas.width,mainCanvas.height)

//n x m grid of vertex
//each vertex has a gradient vector

//dot product each point with its nearest grid node gradient value

//a smoothing function passes over, at each vertex the dot product is exact,
//a point takes on its 4 neighbours proportionally

//a position is made of the 4 dot products and the 4 distance scalers dividing each influence 


//could represent the different influences through a function, like only taking the closest.
const n = 8;
const m = 8;
const vectorMatrix = new Matrix(n+1,m+1);
vectorMatrix.forEachIndex(Vector.newXYUnitary);


//function to find color within a pos(x,y)
const valueRange = [-1,1];
const paramRange = [[0,800],[0,800]];
const vectorSpacing = [(paramRange[0][1]-paramRange[0][0])/n,(paramRange[1][1]-paramRange[1][0])/m];
const halfDiagonalDistance = Math.sqrt(vectorSpacing[0]*vectorSpacing[0] + vectorSpacing[1]*vectorSpacing[1])/2;


//currently only pre-interp stage

function findNonInterpValueAt(x,y){
    let sqIndx = findIndexPos(x,y);
    let posWithinSquare = getLocalPos(x,y);
    let closestFourVerteces = [vectorMatrix.get(sqIndx[0],sqIndx[1]),vectorMatrix.get(sqIndx[0]+1,sqIndx[1]),vectorMatrix.get(sqIndx[0]+1,sqIndx[1]+1),vectorMatrix.get(sqIndx[0],sqIndx[1]+1)];
    let positionFromCorners = getPosFromCorners(posWithinSquare);
    //cw around the vertex
    let distances = getDistanceFromEachCorner(positionFromCorners);
    let dotProducts = getDotProducts(positionFromCorners,closestFourVerteces); //the center vector is 

    let distributions = distribution_Closest(distances);
    let sum = 0;
    for(let i = 0; i < 4; i++){
        sum += dotProducts[i]*distributions[i];
    }
    return sum; //-1 to 1
}

function findInterpValueAt(x,y){
    let sqIndx = findIndexPos(x,y);
    let posWithinSquare = getLocalPos(x,y);
    let unitaryPosWithinSquare = [posWithinSquare[0]/vectorSpacing[0],posWithinSquare[1]/vectorSpacing[1]]
    let closestFourVerteces = [vectorMatrix.get(sqIndx[0],sqIndx[1]),vectorMatrix.get(sqIndx[0]+1,sqIndx[1]),vectorMatrix.get(sqIndx[0]+1,sqIndx[1]+1),vectorMatrix.get(sqIndx[0],sqIndx[1]+1)];
    let positionFromCorners = getPosFromCorners(posWithinSquare);    

    let dotProducts = getDotProducts(positionFromCorners,closestFourVerteces); 

    let distributions = get_smoothingFunctions(unitaryPosWithinSquare); //proportion each should be considered (0-1) summing to 1
    let sum = 0;
    for(let i = 0; i < 4; i++){
        sum += dotProducts[i]*distributions[i];
    }
    return sum; //-1 to 1
}
function get_smoothingFunctions(pos){
    //when at the center point the value should be 0 for all corners
    let distributions = []
    distributions.length = 4;
    distributions[0] = consFunc(1-pos[0],1-pos[1]);
    distributions[1] = consFunc(pos[0],1-pos[1]);
    distributions[2] = consFunc(pos[0],pos[1]);
    distributions[3] = consFunc(1-pos[0],pos[1]);
    return distributions;
}

function consFunc(x,y){
    return Math.max(0,(x*y));
}

function get_smoothingFunctionsBP(posWithinSquare){ 
    //PRODUCES A BOUNDARY PROBLEM
    let distributions = []
    distributions.length = 4;
    distributions[0] = pwdSmoothingFunctionLinear(1-posWithinSquare[0])*pwdSmoothingFunctionLinear(1-posWithinSquare[1]); //tl
    distributions[1] = pwdSmoothingFunctionLinear(posWithinSquare[0])*pwdSmoothingFunctionLinear(1-posWithinSquare[1]); //tr
    distributions[2] = pwdSmoothingFunctionLinear(posWithinSquare[0])*pwdSmoothingFunctionLinear(posWithinSquare[1]); //br
    distributions[3] = pwdSmoothingFunctionLinear(1-posWithinSquare[0])*pwdSmoothingFunctionLinear(posWithinSquare[1]); //bl
    return distributions;
}

function getLocalPos(x,y){
    let arr = [];
    arr.length = 2;
    arr[0] = (x-paramRange[0][0])%vectorSpacing[0];
    arr[1] = (y-paramRange[1][0])%vectorSpacing[1];
    return arr;
}
function getPosFromCorners(pos){
    let arr = [];
    arr.length = 4;
    arr[0] = [pos[0],pos[1]];
    arr[1] = [pos[0]-vectorSpacing[0],pos[1]];
    arr[2] = [pos[0]-vectorSpacing[0],pos[1]-vectorSpacing[1]];
    arr[3] = [pos[0],pos[1]-vectorSpacing[1]];

    //scale down by half the square size (max possible value), clamps to -1,1
    //slower to do it here but better?
    for(let i = 0; i < 4; i++){
        arr[i][0] = arr[i][0]/(halfDiagonalDistance*Math.SQRT2);
        arr[i][1] = arr[i][1]/(halfDiagonalDistance*Math.SQRT2);
    }
    return arr;
}
function findIndexPos(x,y){
    let xIndex = Math.floor((x-paramRange[0][0])/vectorSpacing[0]);
    let yIndex = Math.floor((y-paramRange[1][0])/vectorSpacing[1]);
    return [xIndex,yIndex];
}
function getMagnitude(x,y){
    return Math.sqrt(x*x + y*y);
}
function getDistanceFromEachCorner(positionFromCorners){
    let dists = [];
    dists.length = 4;
    for(let i = 0 ; i < 4; i++){
        dists[i] = getMagnitude(positionFromCorners[i][0],positionFromCorners[i][1]);
    }
    return dists;
}
function getDotProducts(vectorsFromEach,fourVectors){
    let products = [];
    products.length = 4;
    for(let i = 0; i < 4; i++){
        products[i] = (vectorsFromEach[i][0]*fourVectors[i].x + vectorsFromEach[i][1]*fourVectors[i].y); //vectors form each are not scaled down to unitary, div each by the diagonal length of a square
    }
    return products;
}
function distribution_Closest(distances){
    //determine how the distances should weight the output value as determined by the 4 dot product values,
    //weights should reasonably be 0-1 for interpolation
    let closestIndex = findIndexOfSmallestValue(distances);    
    let weights = [];
    weights.length = 4;
    for(let i = 0; i < 4; i++){
        if(closestIndex == i){
            weights[i] = 1;
        }else{
            weights[i] = 0;
        }
    }
    return weights;
}
function findIndexOfSmallestValue(array){ //non null array
    let smallestValue = array[0];
    let smallestIndex = 0;
    for(let i = 1; i < array.length; i++){
        if(array[i] < smallestValue){
            smallestIndex = i;
            smallestValue = array[i];
        }
    }
    return smallestIndex;
}

const pwPoints = [[0,0],[0.2,0.1],[0.8,0.9],[1,1]];
//sigmoid approximation
function pwdSmoothingFunctionLinear(x){
    for(let i = 0; i < pwPoints.length-1; i++){
        let pA = pwPoints[i];
        let pB = pwPoints[i+1];
        if(pA[0] <= x && x < pB[0]){
            let k = pB[1]*(x-pA[0])/(pB[0]-pA[0]) + pA[1]*(x-pB[0])/(pA[0]-pB[0]); 
            if(k < 0 || k > 1){
                let catchMe;
            }
            return k;
        }
    }
    if(x < 0){
        return 0;
    }else{
        return 1;
    }
}


//get each pixel value,
paintCanvas();
function paintCanvas(){
    let minW = 128;
    let maxW = 128;
    for(let i = 0; i < 800; i++){
        for(let j = 0; j < 800; j++){
            let w = findInterpValueAt(i,j)*128+128;// desired output is -1-1
            minW = Math.min(minW,w);
            maxW = Math.max(maxW,w);
            ctx.fillStyle = rgb(w,w,w);
            ctx.fillRect(i,j,1,1);
        }
    }
    console.log("range over " + minW + " to " + maxW);
}

function rgb(r,g,b){
    return "rgb("+r+","+g+","+b+")";
}

