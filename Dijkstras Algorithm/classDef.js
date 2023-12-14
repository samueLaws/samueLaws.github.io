class Node {
    //pass in bounds for random generation at some point
    constructor(i,x,y,connections,fullList){
        this.index = i;
        this.pos = new Vector(x,y,0);
        this.size = 10;
        this.closestNeighbours = [];
        this.closestNeighbourCosts = [];
        this.closestNeighbours.length = connections;
        this.closestNeighbourCosts.length = connections;
        this.whichNeighbourFirst = []; //list of the directions to travel to reach to each node, uses global indexes.
        this.whichNeighbourFirst.length = fullList.length;
    }
    getPos(){
        return this.pos;
    }

    getNeighboursIndexes(){
        let newArray = new MyArray();
        for(let i = 0; i < this.closestNeighbours.length;i++){
            newArray.add(this.closestNeighbours[i].index);
        }
        return newArray;
    }
    addNeighbour(node){
        this.closestNeighbours.length += 1;
        this.closestNeighbours[this.closestNeighbours.length-1] = node;
    }

    knowsAbout(otherNode){
        //if the other node can be found in my closestNeighbours, return true
        for(let i = 0; i < this.closestNeighbours; i++){
            if(this.closestNeighbours[i].index == otherNode.index){
                return true;
            }
        }
        return false;
    }

    getDiff(otherNode){
        //returns a vector
        return otherNode.pos.copy().sub(this.pos);
    }
    getDistTo(otherNode){
        return this.getDiff(otherNode).mag();
    }
    assignClosestConnections(nodeList){
        let closestDist = [];//max dist is diagonal at 800*1.414
        closestDist.length = this.closestNeighbours.length;
        closestDist.fill(1200);//just over diagonal max length
        for(let i = 0; i < nodeList.length; i++){
            let node = nodeList[i];
            if(node.index == this.index){
                continue;
            }
            let dist = this.getDistTo(node);
            //riffle into the closestNeighbours
            this.riffleIntoClosest(node,dist,closestDist);   
        }
        //assign closestDist array to closestNeighourCosts, they are identical, should be done in riffleIntoClosest
        this.closestNeighbourCosts = closestDist;
    }
    riffleIntoClosest(node,dist,closeDistArray){
        //REFACTOR
        for(let highestIndexCompare = 0; highestIndexCompare < closeDistArray.length; highestIndexCompare ++ ){
            if(dist < closeDistArray[highestIndexCompare]){
                //place in at highestIndexCompare then push the rest up
                for(let shuffleIndex = closeDistArray.length-2; shuffleIndex >= highestIndexCompare; shuffleIndex--){
                    //riffle down pushing them up, creates a gap to put the last one at
                    closeDistArray[shuffleIndex+1] = closeDistArray[shuffleIndex];
                    this.closestNeighbours[shuffleIndex+1] = this.closestNeighbours[shuffleIndex];
                }
                closeDistArray[highestIndexCompare] = dist;
                this.closestNeighbours[highestIndexCompare] = node;
                break;
            }
        }
    }
}


class Vector {
    constructor(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static new(x,y,z){
        return new Vector(x,y,z);
    }
    static new2D(x,y){
        return new Vector(x,y,0);;
    }

    static splat(x){
        return new Vector(x,x,x);
    }
    //how to define a mapping from one vector space to another.
    //use a matrix multiplication

    //3v to 2v uses 
    add(vector){
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
        return this;
    }

    sub(vector){
        this.x -= vector.x;
        this.y -= vector.y;
        this.z -= vector.z;
        return this;
    }

    times(scalar){
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }
    timesPieceWise(vector){
        this.x *= vector.x;
        this.y *= vector.y;
        this.z *= vector.z;
    }

    multiply(matrix){
        this.x = matrix[0][0]*this.x + matrix[1][0]*this.y + matrix[2][0]*this.z; //[[(0,0),(0,1),(0,2)],[(1,0),(1,1)...],[]]
        this.y = matrix[0][1]*this.x + matrix[1][1]*this.y + matrix[2][1]*this.z;
        this.z = matrix[0][2]*this.x + matrix[1][2]*this.y + matrix[2][2]*this.z;
        return this;
    }
    copy(){
        return new Vector(this.x,this.y,this.z);
    }
    mag(){
        return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
    }

}

class MyArray{
    constructor(){
        this.list = [];
        this.endPointer = 0;
        
    }

    static fromArray(array){
        let newArray = new MyArray();
        for(let i = 0; i < array.length; i++){
            newArray.add(array[i]);
        }
        return newArray;
    }
    
    add(item){
        this.list[this.endPointer] = item;
        this.endPointer++;
    }
    addListDiff(otherList){
        this.addList(this.getArrayDifference(otherList));
    }

    addList(otherList){
        for(let i = 0; i < otherList.endPointer; i++){
            this.add(otherList.get(i));
        }
    }

    pop(){
        if(this.endPointer == 0){
            return;//doesnt exist
        }
        this.endPointer--;
        this.list[this.endPointer];
    }

    get(index){
        return this.list[index];
    }

    getArrayDifference(otherArray,thisCompIndex,otherCompIndex){
        //returns a new array that contains this array minus those in the other array
        let newArray = new MyArray();
        for(let i = 0; i < this.endPointer; i++){
            let contained = false;
            for(let j = 0; j < otherArray.endPointer; j++){
                if(otherArray.get(j)[otherCompIndex] == this.get(i)[thisCompIndex]){
                    contained = true;
                    break;
                }
            }
            if(!contained){
                newArray.add(this.get(i));
            }
        }
        return newArray;
    }

    contains(item){
        for(let i = 0; i < this.endPointer; i++){
            if(this.get(i) == item){
                return true;
            }
        }
        return false;
    }

    getArrayIntersection(otherArray,thisCompIndex,otherCompIndex){
        
        let newArray = new MyArray();
        for(let i = 0; i < this.endPointer; i++){
            let thisCompVal;
            if(thisCompIndex != -1){
                thisCompVal = this.get(i);
            }else{
                thisCompVal = this.get(i)[thisCompIndex];
            }
            for(let j = 0 ; j < otherArray.endPointer; j++){
                let otherCompVal;
                if(otherCompIndex != -1){
                    otherCompVal = otherArray.get(i)
                }else{
                    otherCompVal = otherArray.get(j)[otherCompIndex];
                }
                
                if(otherCompVal == thisCompVal){
                    newArray.add(this.get(i));
                }
            }
        }
        return newArray;
    }
}