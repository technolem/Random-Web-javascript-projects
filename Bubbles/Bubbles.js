var maxWidth = window.innerWidth;
var maxHeight = window.innerHeight;
var maxBubbleSize = 100;
var maxBubbleSpeed = 1.5;
var maxBubbles = 50;
var maxBubbleLife = 20000; //milliseconds
var bubbles = [];

var bubblePop = new Audio('pop.wav');

canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");

canvas.width = maxWidth;
canvas.height = maxHeight;

function makeStruct(names){ 
    names = names.split(' ');
    count = names.length;
    function constructor() {
        for (var i=0; i<count; i++){
            this[names[i]] = arguments[i];
        }
    }
    
    return constructor;
}

var Bubble = makeStruct("size highlightPos highlightLen speed position life color highlight"); 

function makeBubble() {
    size = Math.floor(Math.random() * (maxBubbleSize - 11) + 10);
    highlightPos =  (size * .6) + (size * Math.random() * .3);
    highlightLen = [];
    highlightLen[0] = Math.PI * 2 * Math.random();
    highlightLen[1] = highlightLen[0] + (.5 * Math.random() * Math.PI) + .5;
    speed = [(Math.random() * maxBubbleSpeed)
            ,(Math.random() * maxBubbleSpeed)];
    
    if (Math.random() < .5) { speed[0] *= -1; }
    if (Math.random() < .5) { speed[1] *= -1; }
    
    position = [Math.floor(Math.random() * (maxWidth + 1 - (2 * size)) + size) 
               ,Math.floor(Math.random() * (maxHeight + 1 - (2 * size)) + size)];
    life = performance.now() + (.25 * maxBubbleLife) + (Math.random() * .75 * maxBubbleLife);
    
    r = Math.floor(Math.random() * 181 + 20);
    g = Math.floor(Math.random() * 181 + 20);
    b = Math.floor(Math.random() * 181 + 20);
    
    color = 'rgb(' + r + ',' + g + ',' + b + ')';
    
    r += 55; g+= 55; b+= 55;
    
    highlight = 'rgb(' + r + ',' + g + ',' + b + ')';
                     
    var bubble = new Bubble(size, highlightPos, highlightLen, speed, position, life, color, highlight);
    
    bubbles.push(bubble);
}

function boundryCheck(bubble){
    if (bubble.position[0] - bubble.size < 0) { 
        bubble.position[0] = bubble.size;
        bubble.speed[0] *= -1;
    }
    else if (bubble.position[0] + bubble.size > maxWidth) { 
        bubble.position[0] = maxWidth - bubble.size;
        bubble.speed[0] *= -1;
    }
    if (bubble.position[1] - bubble.size < 0) { 
        bubble.position[1] = bubble.size;
        bubble.speed[1] *= -1;
    }
    else if (bubble.position[1] + bubble.size > maxHeight) { 
        bubble.position[1] = maxHeight- bubble.size;
        bubble.speed[1] *= -1;
    }    
}



// runs through all bubbles, and checks collisions with bubbles in front, resolves for both. n^2 / 2 time
function collisionCheck(){
    for (var i=0; i< bubbles.length; i++){
        for (var j=i+1; j<bubbles.length; j++){
            var x = (bubbles[i].position[0] - bubbles[j].position[0]);
            var y = (bubbles[i].position[1] - bubbles[j].position[1]);
            var d = Math.sqrt(x*x + y*y);
            var s = bubbles[i].size + bubbles[j].size;
            
            if (s > d) {
                var moveX = Math.sqrt(Math.abs(x));
                var moveY = Math.sqrt(Math.abs(y));
                if (bubbles[i].position[0] < bubbles[j].position[0]) { moveX *= -1; }
                if (bubbles[i].position[1] < bubbles[j].position[1]) { moveY *= -1; }
                bubbles[i].position[0] += moveX * (bubbles[j].size / s);
                bubbles[i].position[1] += moveY * (bubbles[j].size / s);                
                bubbles[j].position[0] -= moveX * (bubbles[i].size / s);
                bubbles[j].position[1] -= moveY * (bubbles[i].size / s);
                bubbles[i].speed[0] *= -1;
                bubbles[i].speed[1] *= -1;
                bubbles[j].speed[0] *= -1;
                bubbles[j].speed[1] *= -1;
            }
        }
    }
}


function bubbleUpdater() {
    time = performance.now();
    for (var i = (bubbles.length - 1); i > -1; i--) {
        if (bubbles[i].life < time) { bubbles.splice(i, 1); bubblePop.play(); }
        else { bubbles[i].position[0] += bubbles[i].speed[0];
                bubbles[i].position[1] += bubbles[i].speed[1];
                boundryCheck(bubbles[i]);}
    }
    collisionCheck();
}

function bubbleSpawner() {
    if (bubbles.length < maxBubbles) { makeBubble(); }
}

function drawBubbles() {
    for (var i=0; i<bubbles.length; i++){
        ctx.beginPath();
        ctx.strokeStyle = bubbles[i].color;
        ctx.arc(bubbles[i].position[0], bubbles[i].position[1], bubbles[i].size, 0, 2 * Math.PI);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.strokeStyle = bubbles[i].highlight;
        ctx.arc(bubbles[i].position[0], bubbles[i].position[1], 
                bubbles[i].highlightPos, bubbles[i].highlightLen[0], bubbles[i].highlightLen[1]);
        ctx.stroke();
    }
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0,0, maxWidth, maxHeight);
    
    drawBubbles();
}

function resized(event) {
    maxWidth = window.innerWidth;
    maxHeight = window.innerHeight;
    canvas.width = maxWidth;
    canvas.height = maxHeight;
}

window.onresize = resized;

setInterval(draw, 1000/60);
setInterval(bubbleSpawner, 1000);
setInterval(bubbleUpdater, 10);

