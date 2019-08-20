var maxWidth = window.innerWidth;
var maxHeight = window.innerHeight;
var triangles = [];
var maxTriangles = 10;
var maxSpeed = 15;
var spinFactor = .02;
var maxSpin = .05;
var minSize = 20;
var maxSize = 150;
var maxLife = 30000;

canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");

canvas.width = maxWidth;
canvas.height = maxHeight;


function makeStruct(names){
    names = names.split(" ");
    count = names.length;
    function constructor(){
        for (var i=0; i<count; i++){
            this[names[i]] = arguments[i];
        }
    }
    return constructor;
}

var Triangle = makeStruct("color speed spin rotation center radius life");

function makeRandColor(min, max){
    var r = Math.floor((Math.random() * (max + 1 - min)) + min);
    var g = Math.floor((Math.random() * (max + 1 - min)) + min);
    var b = Math.floor((Math.random() * (max + 1 - min)) + min);
    
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function makeTriangle(){ 
    var color = makeRandColor(20, 255);  
    var baseSpeed = Math.random() * maxSpeed;
    var speed = [];
    var spin = Math.abs(spinFactor * baseSpeed);
    baseSpeed *= baseSpeed;
    var rotation = Math.random() * Math.PI * 2;
    var center = [];
    var radius = (Math.random() * (maxSize - minSize)) + minSize;
    var life = (Math.random() * maxLife * .9) + (.1 * maxLife) + performance.now();
    
    speed[0] = Math.random() * baseSpeed;
    speed[1] = Math.sqrt(baseSpeed -speed[0]);
    speed[0] = Math.sqrt(speed[0]);
    
    if (Math.random() > .5) { speed[0] *= -1; };
    if (Math.random() > .5) { speed[1] *= -1; };
    
    center[0] = (Math.random() * (maxWidth  - radius - radius)) + radius;
    center[1] = (Math.random() * (maxHeight - radius - radius)) + radius;
    
    var triangle = new Triangle(color, speed, spin, rotation, center, radius, life);
    triangles.push(triangle);
}

function getCoords(triangle){
    r = triangle.radius;
    rot = triangle.rotation;
    increase = Math.PI * 2 / 3
    var coords = [];
    coords[0] = (r * Math.cos(rot)) + triangle.center[0];
    coords[1] = (r * Math.sin(rot)) + triangle.center[1];
    coords[2] = (r * Math.cos(rot + increase)) + triangle.center[0];
    coords[3] = (r * Math.sin(rot + increase)) + triangle.center[1];
    coords[4] = (r * Math.cos(rot + (increase * 2))) + triangle.center[0];
    coords[5] = (r * Math.sin(rot + (increase * 2))) + triangle.center[1];
    
    return coords;
}

function drawTriangle(triangle){
    var coords = getCoords(triangle);
    ctx.beginPath()
    ctx.strokeStyle = triangle.color;
    
    ctx.moveTo(coords[0], coords[1]);
    ctx.lineTo(coords[2], coords[3]);
    ctx.lineTo(coords[4], coords[5]);
    ctx.lineTo(coords[0], coords[1]);
    
    ctx.stroke();
    
}

var oldTime = performance.now();

function draw(time) {
    var timePassed = time - oldTime;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, maxWidth, maxHeight);
    
    for (var i=0; i<triangles.length; i++){
        drawTriangle(triangles[i]);
    }

    //console.log((1/(timePassed / 1000)) + " frames per second");
    oldTime = time;
}

function drawLoop(time){
    draw(time);
    window.requestAnimationFrame(drawLoop);
}

function resize(){
    maxWidth = window.innerWidth;
    maxHeight = window.innerHeight;
    canvas.width = maxWidth;
    canvas.height = maxHeight;
}

function distForm(x1, y1, x2, y2){
    x = x1 - x2;
    y = y1 - y2;
    d = Math.sqrt(x*x + y*y);
    
    return d;
}

function boundryCheck(){
    for (var i = 0; i < triangles.length; i++){
        if (triangles[i].center[0] - triangles[i].radius < 0) {
           var coords = getCoords(triangles[i]);           
           for (var j=0; j < 6; j += 2){
               if (coords[j] < 0) {
                   triangles[i].spin *= -1;
                   triangles[i].speed[0] *= -1;
                   triangles[i].center[0] -= coords[j]; 
               }
           }
        }
        else if (triangles[i].center[0] + triangles[i].radius > maxWidth) {
           var coords = getCoords(triangles[i]);
           for (var j=0; j < 5; j += 2){
               if (coords[j] > maxWidth) {
                   triangles[i].spin *= -1;
                   triangles[i].speed[0] *= -1;
                   triangles[i].center[0] -= (coords[j] - maxWidth);
               }
           }
        }
        
        if (triangles[i].center[1] - triangles[i].radius < 0) {
           var coords = getCoords(triangles[i]);
           for (var j=1; j < 6; j += 2){
               if (coords[j] < 0) {
                   triangles[i].spin *= -1;
                   triangles[i].speed[1] *= -1;
                   triangles[i].center[1] -= coords[j];
               }
           }
        }
        else if (triangles[i].center[1] + triangles[i].radius > maxHeight) {
           var coords = getCoords(triangles[i]);
           for (var j=1; j < 6; j += 2){
               if (coords[j] > maxHeight) {
                   triangles[i].spin *= -1;
                   triangles[i].speed[1] *= -1;
                   triangles[i].center[1] -= coords[j] - maxHeight;
               }
           }
        }
    }
}

function isIntersecting(point1, point2, point3, point4){
    var denom = ((point2[0] - point1[0]) * (point4[1] - point3[1])) - 
                 ((point2[1] - point1[1]) * (point4[0] - point3[0]));
    var num1 =  ((point1[1] - point3[1]) * (point4[0] - point3[0])) - 
                 ((point1[0] - point3[0]) * (point4[1] - point3[1]));
    var num2 =  ((point1[1] - point3[1]) * (point2[0] - point1[0])) - 
                 ((point1[0] - point3[0]) * (point2[1] - point1[1]));
                 
    var r = num1 / denom;
    var s = num2 / denom;
    
    return (r >= 0 && r <=1) && (s >=0 && s <=1);
}

function collision(){
    function resolveCollision(tri1, tri2, point){
        var x = 1;
        var y = 1;
        var dist = distForm(point[0], point[1], tri2.center[0], tri2.center[1]);
        if (tri1.center[0] < tri2.center[0]) { x = -1; }
        if (tri1.center[1] < tri2.center[1]) { y = -1; }
        
        tri1.spin *= x *(tri2.radius / tri1.radius); 
        if (tri1.spin > maxSpin) { tri1.spin = maxSpin; }
        
        tri2.speed[0] = Math.abs(tri2.speed[0]) * -x * 
                        Math.sqrt((tri1.radius / tri2.radius) * Math.abs(tri1.speed[0] / tri2.speed[0]));
        tri2.speed[1] = Math.abs(tri2.speed[1]) * -y * 
                        Math.sqrt((tri1.radius / tri2.radius) * Math.abs(tri1.speed[1] / tri2.speed[1]));
        
        if (tri2.speed[0] > maxSpeed){ tri2.speed[0] = maxSpeed; };
        if (tri2.speed[1] > maxSpeed){ tri2.speed[1] = maxSpeed; };
        
        tri1.speed[0] = Math.abs(tri1.speed[0]) * x * 
                        Math.sqrt((tri2.radius / tri1.radius) * Math.abs(tri2.speed[0] / tri1.speed[0]));
        tri1.speed[1] = Math.abs(tri1.speed[1]) * x * 
                        Math.sqrt((tri2.radius / tri1.radius) * Math.abs(tri2.speed[1] / tri1.speed[1]));
        
        if (tri1.speed[0] > maxSpeed){ tri1.speed[0] = maxSpeed; };
        if (tri1.speed[1] > maxSpeed){ tri1.speed[1] = maxSpeed; };
        
        tri1.center[0] += Math.sqrt(dist * (tri2.radius / tri1.radius)) * x;
        tri1.center[1] += Math.sqrt(dist * (tri2.radius / tri1.radius)) * y;
        tri2.center[0] -= Math.sqrt(dist * (tri1.radius / tri2.radius)) * x;
        tri2.center[1] -= Math.sqrt(dist * (tri1.radius / tri2.radius)) * y;
    }
    for (var i = 0; i<triangles.length; i++){
        for (var j = i + 1; j<triangles.length; j++){
            var dist = distForm(triangles[i].center[0], 
                                 triangles[i].center[1], 
                                 triangles[j].center[0], 
                                 triangles[j].center[1]);
                                 
            if (dist < (triangles[i].radius + triangles[j].radius)){
                var coords1 = getCoords(triangles[i]);
                var coords2 = getCoords(triangles[j]);
                var pointA = [coords1[0], coords1[1]];
                var pointB = [coords1[2], coords1[3]];
                var pointC = [coords1[4], coords1[5]];
                var pointD = [coords2[0], coords2[1]];
                var pointE = [coords2[2], coords2[3]];
                var pointF = [coords2[4], coords2[5]];
                
                if (isIntersecting(triangles[i].center, pointA, pointD, pointE)) {
                    resolveCollision(triangles[i], triangles[j], pointA);
                }
                else if (isIntersecting(triangles[i].center, pointA, pointD, pointF)) {
                    resolveCollision(triangles[i], triangles[j], pointA);
                }
                else if (isIntersecting(triangles[i].center, pointA, pointF, pointE)) {
                    resolveCollision(triangles[i], triangles[j], pointA);
                }
                else if (isIntersecting(triangles[i].center, pointB, pointD, pointE)) {
                    resolveCollision(triangles[i], triangles[j], pointB);
                }
                else if (isIntersecting(triangles[i].center, pointB, pointD, pointF)) {
                    resolveCollision(triangles[i], triangles[j], pointB);
                }
                else if (isIntersecting(triangles[i].center, pointB, pointF, pointE)) {
                    resolveCollision(triangles[i], triangles[j], pointB);
                }
                else if (isIntersecting(triangles[i].center, pointC, pointD, pointE)) {
                    resolveCollision(triangles[i], triangles[j], pointC);
                }
                else if (isIntersecting(triangles[i].center, pointC, pointD, pointF)) {
                    resolveCollision(triangles[i], triangles[j], pointC);
                }
                else if (isIntersecting(triangles[i].center, pointC, pointF, pointE)) {
                    resolveCollision(triangles[i], triangles[j], pointC);
                }
                
                if (isIntersecting(triangles[j].center, pointD, pointA, pointB)) {
                    resolveCollision(triangles[j], triangles[i], pointD);
                }
                else if (isIntersecting(triangles[j].center, pointD, pointA, pointC)) {
                    resolveCollision(triangles[j], triangles[i], pointD);
                }
                else if (isIntersecting(triangles[j].center, pointD, pointC, pointB)) {
                    resolveCollision(triangles[j], triangles[i], pointD);
                }
                else if (isIntersecting(triangles[j].center, pointE, pointA, pointB)) {
                    resolveCollision(triangles[j], triangles[i], pointE);
                }
                else if (isIntersecting(triangles[j].center, pointE, pointA, pointC)) {
                    resolveCollision(triangles[j], triangles[i], pointE);
                }
                else if (isIntersecting(triangles[j].center, pointE, pointC, pointB)) {
                    resolveCollision(triangles[j], triangles[i], pointE);
                }
                else if (isIntersecting(triangles[j].center, pointF, pointA, pointB)) {
                    resolveCollision(triangles[j], triangles[i], pointF);
                }
                else if (isIntersecting(triangles[j].center, pointF, pointA, pointC)) {
                    resolveCollision(triangles[j], triangles[i], pointF);
                }
                else if (isIntersecting(triangles[j].center, pointF, pointC, pointB)) {
                    resolveCollision(triangles[j], triangles[i], pointF);
                }
            }
        }
    }
}

function spawner(){
    if (triangles.length < maxTriangles) { makeTriangle(); };
}

function mainLoop(){
    time = performance.now();
    for (var i = triangles.length -1; i > -1; i--){
        if (triangles[i].life < time){ triangles.splice(i, 1); }
        else{
            triangles[i].rotation += triangles[i].spin;
            triangles[i].center[0] += triangles[i].speed[0];
            triangles[i].center[1] += triangles[i].speed[1];
        }
    }
    boundryCheck();
    collision();
}

drawLoop();
setInterval(mainLoop, 1000/30);
setInterval(spawner, 3000)
window.addEventListener("resize", resize);





