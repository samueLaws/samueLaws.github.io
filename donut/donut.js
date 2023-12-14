function drawDots(){
    clearFrame();
    
}

function donutFrame(Alpha, Beta){
    const R1 = 1;
    const R2 = 2;
    const K2 = 4;

    const K1 = mainCanvas.width * K2*3/(8*(R1+R2));

    const theta_spacing = 0.1;
    const phi_spacing = 2*Math.PI/16;

    const cosA = Math.cos(Alpha), sinA = Math.sin(Alpha);
    const cosB = Math.cos(Beta), sinB = Math.sin(Beta);

    //theta goes around the torus
    for(let theta = 0; theta<2*Math.PI; theta+=theta_spacing){
        
        //phi goes around the revolutions of the ring
        for(let phi = 0; phi < 2*Math.PI; phi+= phi_spacing){
            let tVar = Math.random()*0.01;
            let pVar = Math.random()*0.05;


            let thetaProp = theta/(2*Math.PI);
            
            const cosT = Math.cos(theta+ tVar), sinT = Math.sin(theta + tVar);
            
            const cosP = Math.cos(phi+ pVar + phi_spacing*thetaProp), sinP = Math.sin(phi +pVar + phi_spacing*thetaProp);

            //x,y coordinates of the circle, before revolving
            let circlex = R2 + R1*cosT;
            let circley = R1*sinT;

            //3d coords after rotation

            let x = circlex*(cosB*cosP + sinA*sinB*sinP) - circley*cosA*sinB;
            let y = circlex*(sinB*cosP - sinA*cosB*sinP) + circley*cosA*cosB; 
            let z = Math.abs(K2 + cosA*circlex*sinP + circley*sinA);
            let ooz = 1/z;

            let xp = mainCanvas.width/2 + K1*ooz*x;
            let yp = mainCanvas.height/2 - K1*ooz*y;
            
            //calc luminance
            let L = cosP*cosT*sinB - cosA*cosT*sinP - sinA*sinT + cosB*(cosA*sinT - cosT*sinA*sinP);
            
            //l is -sqrt(2) to sqrt(2)
            //mapping it to 0,1
            let l =0.2 + (L+Math.SQRT2)/(2*Math.SQRT2);
            
            drawDot(xp,yp,5,l);
        }
    }
}

function sphereFrame(){
    const R1 = 1;
    const R2 = 1;
    const K2 = 3; //z offset
    const xOff = 0;
    const yOff = -1;
    //find points over the sphere,
    const K1 = mainCanvas.width * K2*3/(8*(R1+R2));

    
    //rotate over different heights,
    //each height needs fewer points as the radius at that height is less
    const phi_spacing = Math.PI/24;
    const theta_spacing = Math.PI/12;
    for(let phi = 0; phi < Math.PI; phi += phi_spacing){

        for(let theta = 0; theta < Math.PI*2; theta += theta_spacing){
            let sinT = Math.sin(theta), sinP = Math.sin(phi);
            let cosT = Math.cos(theta), cosP = Math.cos(phi);
            //x,y <- theta, phi
            //z <- phi
            
            let z = cosP;
            
            let x = sinP*sinT; 
            let y = sinP*cosT;

            //offset away from the camera
            //y is that axis
            y = y + K2;
            x = x + xOff;
            z = z + yOff;
            if(y < 0.1){
                continue;
            }
            let ooy = 1/y;

            //project to screen.
            let xp = mainCanvas.width/2 + K1*ooy*x
            let yp = mainCanvas.width/2 - K1*ooy*z

            //calc luminance
            let L = -cosP*cosT - cosT*sinP - sinT + (sinT - cosT*sinP);
            if(L < 0){
                continue;
            }
            //l is -sqrt(2) to sqrt(2)
            //mapping it to 0,1
            let l = (L+Math.SQRT2)/(2*Math.SQRT2);

            drawDot(xp,yp,5,l);
        }
    }

}




class MyFrameDrawer{
    constructor(frameGap){
        this.frameGap = frameGap;
        this.frame = 100;
        this.interval;
        this.AspeedMod = 0.001;
        this.BspeedMod = 0.005;
        this.aOffset = 0;
        this.bOffset = 0;
    }

    drawNextFrame(){
        console.log("drawing frame: " + this.frame);
        let alpha = (this.frame*this.AspeedMod + this.aOffset)%(2*Math.PI); 
        let beta = (this.frame*this.BspeedMod + this.bOffset)%(2*Math.PI);
        this.frame += 1;
        clearFrame();
        donutFrame(alpha,beta);
    }

    start(){
        this.interval = setInterval(hackyThing, 1000*this.frameGap);
    }
    changePerspective(ev){
        let x = ev.clientX;
        let y = ev.clientY;
        this.aOffset = x*0.01;
        this.bOffset = y*0.01;
    }
}

function hackyThing(){
    myFrameDrawer.drawNextFrame();
}