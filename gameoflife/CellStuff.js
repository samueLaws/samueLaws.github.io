//holds the index for the two last accessed chunks
class ChunkQueue{
    constructor(size,rootChunk){
        this.maxSize = size;
        this.chunks = [];
        while(this.chunks.length < this.maxSize){this.chunks.push(rootChunk);}
        this.queueNextChunkIndex = 0;
    }
    add(chunk){
        this.chunks[this.queueNextChunk] = chunk;
        this.nextPointer();
    }
    check(kX, kY){
        //checks if a k pair provided is found here already.
        for(let i = 0; i < this.maxSize; i++){
            if(this.chunks[i].kX == kX && this.chunks[i].kY == kY){
                return true;
            }
        }
        return false;
    }
    get(kX, kY){
        for(let i = 0; i < this.maxSize; i++){
            if(this.chunks[i].kX == kX && this.chunks[i].kY == kY){
                return this.getI(i);
            }
        }    
        return false
    }
    getI(index){
        if(index < 0 || index >= this.maxSize){
            //should return an error
            return false; //as an invalid return
        }
        return this.chunks[index];
    }
    nextPointer(){
        this.queueNextChunkIndex = (this.queueNextChunkIndex + 1)%this.maxSize;
    }
}

class ChunkManager{
    constructor(chunkSize){
        this.ruleTimeTaken = Date.now();
        this.chunkList = [];
        this.chunkSize = chunkSize;
        this.mainCellSide = 'a';
        this.backCellSide = 'b';
        this.addRootChunk();
        this.recentlyCalledQueue = new ChunkQueue(5,this.chunkList[0]);
        this.customRules = [[false,false,false,false,false,false,false,false],[true,true,true,true,true,true,true,true]]; // off | on, //unimplemented
        this.neighbours = [-1,-1,0,-1,1,-1,-1,0,1,0,-1,1,0,1,1,1]; //points to 8 adjacent square relative positions
        // chunk neighbours, if the rule changes this needs to be updated, stored in pairs of x y change
        // also cell neighbours used in rule.
        this.reviveRootChunk();
        this.fillRootWithRandom();
    }
    clearBoard(){
        let chunk;
        let i, j;
        for(let index = 0; index < this.chunkList.length ; index++){
            chunk = this.getChunkI(index);
            for(i = 0; i < this.chunkSize; i++){
                for(j = 0; j < this.chunkSize; j++){
                    this.setCellState(chunk.kX,chunk.kY,i,j,this.mainCellSide,false);
                }
            }
        }
    }

    getChunkI(index){
        //check index valid
        return this.chunkList[index];
    }

    getChunk(kX, kY){
        //compare against the recently called queue.
        //--------------------------------------
        if(this.recentlyCalledQueue.check(kX,kY)){
            return this.recentlyCalledQueue.get(kX,kY);
        }

        let chunk;
        for(let i = 0; i < this.chunkList.length; i++){
            chunk = this.getChunkI(i)
            if(chunk.checkK(kX,kY)){
                this.recentlyCalledQueue.add(chunk);
                return chunk;
            }
        }
        //add a new chunk to this position, set it to live, only reach here on the mouse swap key
        chunk = this.addDeadChunk(kX,kY);
        this.revive(chunk);
        return chunk;
    }

    addRootChunk(){
        // add a chunk at 0,0 this is the one we start with, by constructing this one, when it is set to focus 4 more are automatically constructed.
        let chunk = new Chunk(0,0,this.chunkSize);
        this.chunkList.push(chunk);
    }
    reviveRootChunk(){
        this.revive(this.chunkList[0]);
    }

    addDeadChunk(kX,kY){
        //first checks if a chunk exists at this position
        if(this.checkChunkExists(kX,kY)){
            return;
        }
        //then construct new chunk and add with that address
        let chunk = new Chunk(kX,kY,this.chunkSize)
        this.addChunk(chunk);
        return chunk;
    }

    addChunk(chunk){
        //leave chunkList unordered for the moment, this is the only place where it is added to. If i were to add this chunk a the appropriate place it could stay ordered.
        //could order here
        this.chunkList.push(chunk);
        //if these were ordered they could be added by binary search,
        //and found by binary search.
    }

    revive(chunk){
        if(chunk.inFocus){
            return false;
        }
        //set this chunk to in focus,
        chunk.activate();
        //sequentially check if each neighbour exists and if not create it
        let kX, kY;
        for(let pair = 0; pair < this.neighbours.length/2; pair++){
            kX = chunk.kX + this.neighbours[pair*2];
            kY = chunk.kY + this.neighbours[pair*2 + 1];
            if(!this.checkChunkExists(kX,kY)){
                this.addDeadChunk(kX,kY);
            }
        }
    }
    checkChunkExists(kX,kY){
        for(let i = 0; i < this.chunkList.length; i++){
            if(this.getChunkI(i).checkK(kX,kY)){
                return true;
            }
        }
        return false;
    }
    cellToChunkAndInnerCell(cX,cY){
        //find cell coords, inner cell is always positive
        let icX = ((cX%this.chunkSize) + this.chunkSize) % this.chunkSize; //negative mod fucker
        let icY = ((cY%this.chunkSize) + this.chunkSize) % this.chunkSize;
        //find chunk coords
        let kX = Math.floor((cX - icX)/this.chunkSize);
        let kY = Math.floor((cY - icY)/this.chunkSize);
        return [kX, kY, icX, icY];
    }

    swapCellState(cX, cY, side){
        //find and swap at that cell
        let cAic = this.cellToChunkAndInnerCell(cX,cY);
        //if the chunk is asleep set it to awake
        let chunk = this.getChunk(cAic[0], cAic[1]);
        if(!chunk.inFocus){
            this.revive(chunk);
        }
        let state = !this.getCellState(cAic[0],cAic[1], cAic[2],cAic[3], side);
        this.setCellState(cAic[0],cAic[1], cAic[2],cAic[3], side, state);   
    }

    getCellState(kX,kY, icX,icY, side){
        //get chunk
        let chunk = this.getChunk(kX,kY);
        if(!chunk instanceof Chunk){
            console.log(chunk); //error
        }
        //get that cell state within that chunk
        return chunk.getCellStateC(icX, icY, side);
    }
    getCellStateC(cX, cY, side){
        let cAic = this.cellToChunkAndInnerCell(cX, cY);
        return this.getCellState(cAic[0],cAic[1], cAic[2],cAic[3], side);
    }

    setCellState(kX,kY, icX,icY, side, state){
        let chunk = this.getChunk(kX,kY);
        if(!chunk instanceof Chunk){
            console.log(chunk); //error
        }
        chunk.setCellState(icX, icY, side, state);
    }
    setCellStateC(cX, cY, side, state){
        let cAic = this.cellToChunkAndInnerCell(cX, cY);
        this.setCellState(cAic[0],cAic[1], cAic[2],cAic[3], side, state);
    }

    bringIntoFocus(chunk){
        chunk.inFocus = true;
        //double check adjacent tiles are initialized
    }

    doRule(){
        //get time now
        let timeNow = Date.now();
        let chunksToWakeUp = [];
        let chunksToKill = []; //NOT USED YET
        //iterate over all cells
        let resultOfThisChunk;
        for(let chunkIndex = 0; chunkIndex < this.chunkList.length; chunkIndex++){
            let chunk = this.getChunkI(chunkIndex);
            if(!chunk.inFocus){
                continue;
            }
            //go over all the cells in this chunk
            resultOfThisChunk = this.ruleInChunk(chunk);
            if(!resultOfThisChunk){
                chunksToKill.push(chunk);
            }
            //go over all neighbouring cells that might be out of focus, that need setting in focus. by setting a cell within a chunk it automatically sets it to in focus
            //get 4 adjacent chunks
            let chunkNeighbours = [-1,0,0,-1,1,0,0,1];
            let otherChunk, needsWaking;
            for(let neighbourIndex = 0; neighbourIndex < chunkNeighbours.length/2; neighbourIndex++){
                otherChunk = this.getChunk(chunk.kX + chunkNeighbours[neighbourIndex*2], chunk.kY + chunkNeighbours[neighbourIndex*2 + 1])
                if(!otherChunk.inFocus){
                    needsWaking = this.ruleAlongEdgeOf(otherChunk,neighbourIndex);
                    if(needsWaking){
                        chunksToWakeUp.push(otherChunk);
                    }
                }
            }
            //technically over corner neighbours might need checking at some point
            //corner cells might be repeated if the dead chunk makes a corner
        }
        //make any new chunks in focus, might get duplicates but its okay.
        let otherChunk;
        while(chunksToWakeUp.length > 0){
            otherChunk = chunksToWakeUp.pop()
            this.revive(otherChunk);
        }
        while(chunksToKill.length > 0){ //NOT USED YET, no pruning to add to this yet.
            //console.log("sleeping stuff");
            otherChunk = chunksToKill.pop()
            otherChunk.pushOutOfFocus();
        }
        //then at the end swap the CellSide
        this.swapSide();
        this.ruleTimeTaken = Date.now()-timeNow;
    }
    ruleInChunk(chunk){ //this could be ran concurrently?
        let result, sum = 0;
        for(let i = 0; i < this.chunkSize; i++){
            for(let j = 0; j < this.chunkSize; j++){
                result = this.ruleOnThisCell(chunk.kX * this.chunkSize + i, chunk.kY * this.chunkSize + j);
                if(result){
                    sum += 1;
                }
            }
        }
        //could do somehting if sum = 0, meaining this cell is empty, probably add it to a dieing chunks list
        if(sum == 0){
            return false;
        }else{
            return true;
        }
    }

    ruleAlongEdgeOf(chunk, edge){ // edge should actually be the shared edge
        let edgeDetails = this.getEdgeDetails(edge); // in form of [axisSelector,deltaX,deltaY]
        let needsWaking, sum = 0; //keep track of any live cells that need their chunk waking
        for(let i = 0; i < this.chunkSize; i++){ //to adapt this to allow rules that follow lines of different length change this for limit to one recieved form edgeDetails
            needsWaking = this.ruleOnThisCell(chunk.kX * this.chunkSize + edgeDetails[0]*i + edgeDetails[1],chunk.kY * this.chunkSize + (1-edgeDetails[0])*i +  edgeDetails[2]);
            if(needsWaking){
                sum++;
            }
        }
        if(sum > 0){
            return true;
        }else{
            return false;
        }
    }

    getEdgeDetails(edge){
        //edge is 0,1,2,3 for rotating round right, bottom, left, top
        //zero index dictates whether x or y should iterate,
        //first index dictates start value of x.
        //second index dictates start value of y.
        let edgeDetails = [0,0,0];
        switch(edge){
            case 0:
                //right
                edgeDetails[0] = 0;
                edgeDetails[1] = this.chunkSize-1;
                edgeDetails[2] = 0;
                break;
            case 1:
                //bottom
                edgeDetails[0] = 1;
                edgeDetails[1] = 0;
                edgeDetails[2] = this.chunkSize-1;
                break;
            case 2: 
                //left
                edgeDetails[0] = 0;
                edgeDetails[1] = 0;
                edgeDetails[2] = 0;
                break;
            case 3:
                //top
                edgeDetails[0] = 1;
                edgeDetails[1] = 0;
                edgeDetails[2] = 0;
                break;
            default:
                //uh oh
        }
        return edgeDetails;
    }

    //somehow abstact this behaviour to allow other rules
    ruleOnThisCell(cX, cY){
        //get sum
        let sum = this.getNeighbourCount(cX, cY, this.mainCellSide);
        let thisCellState = this.getCellStateC(cX, cY, this.mainCellSide);

        //change this function to swap rules
        let setting;
        if(this.customRules == true){
            setting = this.getRuleOutcomeCustom(sum,thisCellState);
        }else{
            setting = this.getRuleOutcomeStandard(sum,thisCellState);
        }

        //find the chunk and cell coords
        let cAic = this.cellToChunkAndInnerCell(cX, cY);
        this.setCellState(cAic[0], cAic[1], cAic[2], cAic[3], this.backCellSide, setting)
        return setting;
    }
    getRuleOutcomeCustom(sum,thisCellState){
        return customRules[thisCellState][sum];
    }
    getRuleOutcomeStandard(sum,thisCellState){
        if(sum == 2 && thisCellState){
            return true;
        }else if(sum == 3){
            return true;
        }else{
            return false;
        }
    }

    getNeighbourCount(cX, cY, side){
        let cAic;
        let sum = 0;
        for(let i = 0; i < this.neighbours.length/2; i++){
            cAic = this.cellToChunkAndInnerCell(cX + this.neighbours[i*2],cY + this.neighbours[i*2 + 1]);
            sum += this.getCellState(cAic[0], cAic[1], cAic[2], cAic[3], side);
        }
        return sum;
    }
    swapSide(){
        if(this.mainCellSide == 'a'){
            this.mainCellSide = 'b';
            this.backCellSide = 'a';
        }else{
            this.mainCellSide = 'a';
            this.backCellSide = 'b';
        }
    }
    fillRootWithRandom(ll,ul,p){
        for(let i = ll; i < ul; i++){
            for(let j = ll; j < ul; j++){
                if(Math.random() < p){
                    this.swapCellState(i,j,this.mainCellSide);
                }
            }
        }
    }
}

class Chunk{
    constructor(kX, kY, cellsAcross){
        this.kX = kX;
        this.kY = kY;
        this.cellsAcross = cellsAcross;
        this.cellsA = this.newCells();
        this.cellsB = this.newCells();
        this.inFocus = false; //focus describes whether it should handle its own edges, if false then presumably no active cells within this chunk.
        this.focusInt = 0;
        //if a chunk becomes in focus it needs its neighbours initializing for possible use in next frame
    }

    newCells(){
        let cells = [];
        cells.length = this.cellsAcross;
        for(let i = 0; i < cells.length; i++){
            cells[i] = []
            cells[i].length = cells.length;
            for(let j = 0; j < cells.length; j++){
                cells[i][j] = false;
            }
        }
        return cells;
    }
    pushOutOfFocus(){
        this.focusInt++;
        if(this.focusInt > 3){ //this is the number of frames it has to be empty before it auto hides it
            this.inFocus = false;
        }
    }

    activate(){
        this.inFocus = true;
        this.focusInt = 0;
    }

    checkK(kX,kY){
        if(this.kX == kX && this.kY == kY){
            return true;
        }else{
            return false;
        }
    }

    getCellStateC(icX, icY, side){
        //verify coords in range?
        this.indexCheck(icX, icY);
        if(side == 'a'){
            return this.cellsA[icX][icY];
        }else{
            return this.cellsB[icX][icY];
        }
    }
    indexCheck(icX, icY){
        if(icX < 0 || icX > this.cellsAcross || icY < 0 || icY > this.cellsAcross){
            console.log("illegal index")
        }
    }

    setCellState(icX, icY, side, state){
        this.indexCheck(icX, icY);
        if(state){
            this.focusInt = 0; //assume it will be in focus if something is being written
        }
        if(side == 'a'){
            this.cellsA[icX][icY] = state;
        }else{
            this.cellsB[icX][icY] = state;
        }
    }
}