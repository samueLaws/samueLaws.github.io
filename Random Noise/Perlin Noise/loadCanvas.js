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
const n = 20;
const m = 20;
const vectorMatrix = new Matrix(n+1,m+1);
vectorMatrix.forEachIndex(Vector.newXYUnitary);


//function to find color within a pos(x,y)
const valueRange = [-1,1];
const paramRange = [[0,800],[0,800]];
const vectorSpacing = [(paramRange[0][1]-paramRange[0][0])/n,(paramRange[1][1]-paramRange[1][0])/m];
const halfDiagonalDistance = Math.sqrt(vectorSpacing[0]*vectorSpacing[0] + vectorSpacing[1]*vectorSpacing[1])/2;



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
function findSmoothValueAt(x,y){
    let sqIndx = findIndexPos(x,y);
    let posWithinSquare = getLocalPos(x,y);
    let closestFourVerteces = [vectorMatrix.get(sqIndx[0],sqIndx[1]),vectorMatrix.get(sqIndx[0]+1,sqIndx[1]),vectorMatrix.get(sqIndx[0]+1,sqIndx[1]+1),vectorMatrix.get(sqIndx[0],sqIndx[1]+1)];
    let positionFromCorners = getPosFromCorners(posWithinSquare);
    //cw around the vertex
    let distances = getDistanceFromEachCorner(positionFromCorners);
    let dotProducts = getDotProducts(positionFromCorners,closestFourVerteces); //the center vector is 

    let distributions = distribution_Smooth(posWithinSquare);
    let sum = 0;
    for(let i = 0; i < 4; i++){
        sum += dotProducts[i]*distributions[i];
    }
    return sum; //-1 to 1
}

function getLocalPos(x,y){
    let arr = [];
    arr.length = 2;
    arr[0] = (x-paramRange[0][0]) % vectorSpacing[0];
    arr[1] = (y-paramRange[1][0]) % vectorSpacing[1];
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
        arr[i][0] = arr[i][0]/halfDiagonalDistance;
        arr[i][1] = arr[i][1]/halfDiagonalDistance;
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
        products[i] = vectorsFromEach[i][0]*fourVectors[i].x + vectorsFromEach[i][1]*fourVectors[i].y; //vectors form each are not scaled down to unitary, div each by the diagonal length of a square
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
function distribution_Smooth(posWithinSquare){
    //scale pos within square down to 0-1
    let pos = [posWithinSquare[0]/vectorSpacing[0],posWithinSquare[1]/vectorSpacing[1]];

    let weights = [];
    weights.length = 4;
    //linear transformation for each distance from weighting of 0-1,
    //then scale down the weighting to limit sum to 1
    weights[0] = (1-pos[0])*(1-pos[1]);
    weights[1] = (pos[0])*(1-pos[1]);
    weights[2] = (pos[0])*(pos[1]);
    weights[3] = (1-pos[0])*(pos[1]);

    let weightSum = 0;
    for(let i = 0; i < 4; i++){
        weightSum += weights[i];
    }
    for(let i = 0; i < 4; i++){
        weights[i] = weights[i]/weightSum;
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

//get each pixel value,
paintCanvas();
function paintCanvas(){
    let minW = 128;
    let maxW = 128;
    for(let i = 0; i < 800; i++){
        for(let j = 0; j < 800; j++){
            let w = findSmoothValueAt(i,j)*128+128;// desired output is -1-1
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

