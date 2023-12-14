const mainCanvas = document.getElementById("main_canvas");
const ctx = mainCanvas.getContext("2d");

ctx.fillStyle = "black";
ctx.fillRect(0,0,mainCanvas.width,mainCanvas.height)


mainCanvas.addEventListener("click",onClickCanvas,false);
const connectionNodes = [0,1,0];
//generate 50 nodes
var listOfNodes = [];
var numberOfNodes = 64;
makeNewNetwork(numberOfNodes);

findRandomPair();

function getClickPosition(e){
    var element = mainCanvas;
    var offsetX = 0, offsetY = 0;

    if (element.offsetParent) {
      do {
        offsetX += element.offsetLeft;
        offsetY += element.offsetTop;
      } while ((element = element.offsetParent));
    }

    let x = e.pageX - offsetX;
    let y = e.pageY - offsetY;
    return [x,y];
}

function onClickCanvas(e){
    //get click location, assign the closest node to that location as one of the two ends for conneciton.
    let ar = getClickPosition(e);

    //get closest node
    let nIndex = getClosestNodeIndex(ar);


    //swap one of the two selected nodes for this one
    connectionNodes[2] = (connectionNodes[2] + 1) % 2;
    if(connectionNodes[2] == 1){
        //overwrite first node
        connectionNodes[0] = nIndex;
    }else{
        //overwrite second node
        connectionNodes[1] = nIndex;
    }
    //redraw the scene
    frameFunction();
    drawNodePair();
}

function getClosestNodeIndex(ar){
    let x = ar[0];
    let y = ar[1];
    //construct a new position here
    let mousePos = new Vector(x,y,0);

    let closestDist = 1400;
    let savedIndex = 0;
    for(let i = 0; i < listOfNodes.length; i++){
        let pos = listOfNodes[i].pos;
        let diff = pos.copy().sub(mousePos).mag();
        if(diff < closestDist){
            closestDist = diff;
            savedIndex = i;
        }
    }
    return savedIndex;
}

function fillNodes(){
    let connectionNumber = 2;
    let nodesAcross = Math.ceil(Math.sqrt(numberOfNodes)); 
    let widSpace = 800/nodesAcross;
    for(let i = 0; i < numberOfNodes; i++){
        let x = Math.random()*100 + (i%nodesAcross)*widSpace;
        let y = Math.random()*100 + (Math.floor(i/nodesAcross))*widSpace;
        listOfNodes[i] = new Node(i,x,y,connectionNumber,listOfNodes); 
    }
}

function findClosestNodes(){
    for(let i = 0 ; i < listOfNodes.length; i++){
        listOfNodes[i].assignClosestConnections(listOfNodes);
    }
    //make sure these nodes are two ways, copy any nodes between two sets so that they both contain each hosts, two  directional connections
    for(let i = 0; i < listOfNodes.length; i++){
        let thisNode = listOfNodes[i];
        for(let j = 0; j < thisNode.closestNeighbours.length; j++){
            let otherNode = thisNode.closestNeighbours[j];
            //check if otherNode knows about thisNode
            if(otherNode.knowsAbout(thisNode)){
                //nothing
            }else{
                otherNode.addNeighbour(thisNode);
            }
        }
    }
}

function dijkstrasAlgorithm(){
    //go through each index letting the other indexes know how to get here
    for(let senderIndex = 0; senderIndex < listOfNodes.length; senderIndex++){
        let senderNode = listOfNodes[senderIndex];
        let currentTotal = 0;

        let accessedNodes = new MyArray();//only grows [this global index,neighbourIndexToStepBack,distFromSource]
        let accessibleNodes = new MyArray();//what is accessible and the shortest distance to it
        //add sender to the accessed nodes.
        accessibleNodes.add([senderIndex,-1,0]); //global index to reach this, the previous step in the chain, the distance to the neighbourindex specified. (represents a connection)
        
        
        for(let k = 0;k < listOfNodes.length; k++){//maximum length, but might not fill completely
            let onlyAccessibleNodes = accessibleNodes.getArrayDifference(accessedNodes,0,0);
            if(onlyAccessibleNodes.endPointer == 0){
                break;
            }
            let lowestCost = onlyAccessibleNodes.get(0)[2];
            let smallestCostLocalIndex = 0;
            //get the node with the smallest cost.
            for(let kost = 0; kost < onlyAccessibleNodes.endPointer; kost++){
                if(onlyAccessibleNodes.get(kost)[2] <= lowestCost){
                    lowestCost = onlyAccessibleNodes.get(kost)[2];
                    smallestCostLocalIndex = kost;
                }
            }
            currentTotal = lowestCost;
            let thisNode = onlyAccessibleNodes.get(smallestCostLocalIndex);

            //add the lowest to the accessedNodes
            accessedNodes.add(thisNode);
            //add any neighbours of the lowest to the accessible nodes that are not already there.
            let nArray = listOfNodes[thisNode[0]].getNeighboursIndexes();
            let reducedArray = nArray.getArrayDifference(accessibleNodes,-1,0);
            for(let sj = 0; sj < reducedArray.endPointer; sj++){
                let otherNode = reducedArray.get(sj);
                //distance to this closest Node
                let distTo = listOfNodes[otherNode].getDistTo(listOfNodes[thisNode[0]])
                accessibleNodes.add([reducedArray.get(sj),thisNode[0],thisNode[2]+distTo]);
            }
            
            onlyAccessibleNodes = accessibleNodes.getArrayDifference(accessedNodes,0,0);// removes the first one basically, and adds the neighbours of it
            //for all neighbours of this node 
            let neighbours = onlyAccessibleNodes.getArrayIntersection(listOfNodes[thisNode[0]].getNeighboursIndexes(),0,-1)
            //that are also in the only accessible nodes
            for(let ni = 0; ni < neighbours.endPointer; ni++){
                let thisNeighbour = neighbours.get(ni); 
                let distanceTo = listOfNodes[thisNode[0]].getDistTo(listOfNodes[thisNeighbour[0]]);//distance from "thisNode" to "thisNeighbour"
                if(currentTotal + distanceTo < thisNeighbour[2]){
                    thisNeighbour[2] = currentTotal + distanceTo;
                    thisNeighbour[2] = thisNode[0];
                }
            }

        }        

        //go though all nodes setting all the accessedNodes in this array position to the appropriate one.
        //if the accessedNodes misses any, leave them as null.  

        for(let i = 0; i < accessedNodes.endPointer; i++){
            let thisAccess = accessedNodes.get(i);
            listOfNodes[thisAccess[0]].whichNeighbourFirst[senderIndex] = thisAccess[1];
        }
    }  
}


function makeNewNetwork(numberOfNodes){
    listOfNodes = []
    listOfNodes.length = numberOfNodes;
    fillNodes();
    findClosestNodes();
    dijkstrasAlgorithm();
}


//draw the nodes.
frameFunction();
var autoInterval;
//setupInterval();
function setupInterval(){
    if(autoInterval != null){
        clearInterval(autoInterval);
    }
    autoInterval = setInterval(frameFunction, 2000); //2 a second

    setTimeout(clearInt, 20000); //20 seconds     
}


function clearInt(){
    clearInterval(autoInterval)
}



function frameFunction(){
    clearCanvas();
    drawConnections();
    //drawClosestMarkers();
    drawNodeBodys();
    drawNodePair();
}


function clearCanvas(){
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,mainCanvas.width,mainCanvas.height)
}

function drawConnections(){
    for(let i = 0; i < listOfNodes.length; i++){
        let node = listOfNodes[i];
        for(let j = 0; j < node.closestNeighbours.length; j++){
            if(node.closestNeighbours[j].index != i ){//could exclude to produce one directional
                //draw white lines between them               
                drawConnectionBetween(node,node.closestNeighbours[j],"lightgrey",5)
            }
        }
    }
}
function drawConnectionBetween(nodeA, nodeB,color,weight){
    ctx.strokeStyle = color;
    ctx.strokeWeight = weight;
    ctx.beginPath();
    ctx.moveTo(nodeA.pos.x, nodeA.pos.y);
    ctx.lineTo(nodeB.pos.x, nodeB.pos.y);
    ctx.stroke();
}

function drawClosestMarkers(){
    for(let i = 0; i < listOfNodes.length; i++){
        let node = listOfNodes[i];
        let j = 0;
        //only for closest neighboyr node
        let otherPos = node.closestNeighbours[j].pos;
        //get the vector of this to the other, then get a quarter of it
        let relPos = otherPos.copy().sub(node.pos);
        relPos.times(0.5);

        ctx.strokeStyle = "green";
        ctx.strokeWeight = 8;
        ctx.beginPath();
        ctx.moveTo(node.pos.x, node.pos.y);
        ctx.lineTo(node.pos.x + relPos.x, node.pos.y + relPos.y);
        ctx.stroke();        
    
    }
}

function drawNode(node,color){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(node.pos.x, node.pos.y, node.size, node.size, 0, 0, 2*Math.PI);
    ctx.fill();
}

function drawNodeBodys(){    
    for(let i = 0; i < listOfNodes.length; i++){
        drawNode(listOfNodes[i],"GREY");
        
    }
}

function drawNodePair(){
    let n1 = listOfNodes[connectionNodes[0]];
    let n2 = listOfNodes[connectionNodes[1]];
    highlightShortestPath(n1,n2);
}

function findRandomPair(){
    connectionNodes[0] = Math.floor(Math.random()*listOfNodes.length);
    connectionNodes[1] = Math.floor(Math.random()*listOfNodes.length);
}
function highlightShortestPath(nodeA, nodeB){
    //draw first node GREEN
    drawNode(nodeA,"GREEN");
    drawNode(nodeB,"RED");
    //get the fastest path between them
    let currentNodeIndex = nodeA.index;
    if(nodeA.whichNeighbourFirst[nodeB.index] == null){ //not connected
        drawNode(nodeA,"BLUE")
        drawNode(nodeB,"BLUE")
    }else{
        let distanceSum = 0;
        while(currentNodeIndex != nodeB.index){
            nextNodeIndex = listOfNodes[currentNodeIndex].whichNeighbourFirst[nodeB.index];
            drawConnectionBetween(listOfNodes[currentNodeIndex],listOfNodes[nextNodeIndex],"yellow",30);
            //get the distance over these two
            distanceSum += listOfNodes[currentNodeIndex].getDistTo(listOfNodes[nextNodeIndex]);
            currentNodeIndex = nextNodeIndex;
        } 
    }
}
