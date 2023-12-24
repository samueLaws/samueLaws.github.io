class Ball{
    constructor(){
        this.position = new Vector2(0,0);
        this.velocity = new Vector2(0,0);
        this.size = 5;
        this.sw = new SceneWalls();
    }

    setPos(x,y){
        this.position.set(x,y);
    }

    setVel(x,y){
        this.velocity.set(x,y);   
    }

    stepForward(timeUnits){
        //project into the future this many times 
        let projectedPos = this.position.copy().add( this.velocity.copy().times(timeUnits) );
        

        //get the closest wall to bounce from
        let closestWall;
        let closestColl = 1200;
        for(let i = 0; i < 4; i++){
            let colDeets = this.sw.walls[i].checkCollision(this.position,projectedPos);
            if(!colDeets[0]){
                continue;
            }
            console.log(colDeets);
        }

        //detect if a collision has occured in this time
        //does the line from start to end collide

        //if it does collide, call this step forward function again but only that proportion until it collides, then again for the remaining time
        this.stepPower(timeUnits);
    }


    stepPower(timeUnits){
        this.position.add(this.velocity.copy().times(timeUnits));
    }
}


class SceneWalls{
    constructor(){
        this.walls = [];
        this.addBoundaries();
    }

    addBoundaries(){
        this.walls.push(new Wall(0,0,800,0));
        this.walls.push(new Wall(800,0,800,800));
        this.walls.push(new Wall(800,800,0,800));
        this.walls.push(new Wall(0,800,0,0));
    }
}

class Wall{
    constructor(a,b,c,d){
        this.start = new Vector2(a,b);
        this.end = new Vector2(c,d);
    }

    checkCollision(start,end){
        //This is wrong
        let dAx = end.x - start.x, dAy = end.y - start.y;
        let dBx = this.end.x - this.start.x, dBy = this.end.y - this.start.y;

        let denominator = dBx*dAy - dBy*dAx;
        if(denominator == 0){
            return [false,0,0];
        }

        let numLam = (this.start.y - start.y)*dAx - (this.start.x - start.x)*dAy;
        let numMue = dBy*(start.x-this.start.x) - dBx*(start.y-this.start.y);

        return [true,numMue,numLam];
        //return the proportion the other thing collides with this, 
        //return [null,lam,del] , null is true if the vectors are not parallel
    }
}

class Vector2 {
    constructor(x,y){
        this.x = x;
        this.y = y;
    }

    static new(x,y){
        return new Vector2(x,y);
    }
    static new2D(x,y){
        return new Vector2(x,y);;
    }

    static splat(x){
        return new Vector2(x,x);
    }
    
    set(x,y){
        this.x = x;
        this.y = y;
    }
    setVec(vec){
        this.x = vec.x;
        this.y = vec.y;
    }

    add(vector){
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    sub(vector){
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }

    times(scalar){
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    timesPieceWise(vector){
        this.x *= vector.x;
        this.y *= vector.y;
    }

    copy(){
        return new Vector2(this.x,this.y);
    }
    mag(){
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }
}