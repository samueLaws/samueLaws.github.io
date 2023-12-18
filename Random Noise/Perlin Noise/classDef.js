class Matrix {
    constructor(n,m){
        this.width = n;
        this.height = m;
        this.grid = Matrix.createMatrix(n,m,0);
    }

    get(x,y){
        return this.grid[x][y];    
    }

    set(x,y,val){
        this.grid[x][y] = val;
    }

    forEachIndex(parmesan){
        for(let i = 0; i < this.width; i++){
            for(let j = 0; j < this.height; j++){
                if(parmesan instanceof Function){
                    this.set(i,j,parmesan());
                }else{
                    this.set(i,j,parmesan);
                }
            }
        }
    }

    static createMatrix(n,m,defaultValue){
        let grid = [];
        grid.length = n;
        for(let i = 0; i < n; i++){
            grid[i] = [];
            grid[i].length = m;
            for(let j = 0; j < m; j++){
                grid[i][j] = defaultValue;
            }
        } 
        return grid;
    }
}


class Vector {
    constructor(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static newXYUnitary(){
        return Vector.newUnitary(1,1,0);
    }
    static newUnitary(xM,yM,zM){
        //2d unitary vector, int the dimensions selected (1s), prefering x,y
        let r = Math.random()*2*Math.PI;
        let x,y,z;
        if(xM == 1){
            x = Math.sin(r);
            if(yM == 1){
                y = Math.cos(r);
                z = 0;
            }else{
                y = 0;
                z = Math.cos(r);
            }
        }else{
            x = 0;
            y = Math.sin(r);
            z = Math.cos(r);
        }
        return new Vector(x,y,z);
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

    dotProduct(otherVector){
        let sum = 0;
        sum += this.x*otherVector.x;
        sum += this.y*otherVector.y;
        sum += this.z*otherVector.z;
        return sum;
    }


    limitTo(maxMag){
        let thisMag = this.mag();
        if(thisMag > maxMag){
            let ratio = maxMag/thisMag;
            this.times(ratio);
        }
    }

}