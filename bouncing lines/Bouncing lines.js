var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// get colors, to make background and foregroud different: add 64 + random(128) to the color, modulo 255)
// get two different points, and move them around every few seconds, 
// when they reach an edge bounce them and change their speed, and the colors.
// draw a line between these points, with the above colors.

var maxHeight = 600;
var maxWidth = 900;
var maxSpeed = 20;
var clearNext = false;

canvas.height = maxHeight;
canvas.width = maxWidth;

var backgroundColor = [0,0,0];
var lineColor = [0,0,0];

var lineSegment =  [Math.floor(Math.random() * maxWidth),
                    Math.floor(Math.random() * maxHeight),
                    Math.floor(Math.random() * maxWidth),
                    Math.floor(Math.random() * maxHeight)]; //x1,y1,x2,y2
        
var lineSpeed =  [Math.random() * maxSpeed * 2 - maxSpeed,
                  Math.random() * maxSpeed * 2 - maxSpeed,
                  Math.random() * maxSpeed * 2 - maxSpeed,
                  Math.random() * maxSpeed * 2 - maxSpeed]; //x1,y1,x2,y2
                  

function clampColors(color) {
    color[0] = color[0] % 256;
    color[1] = color[1] % 256;
    color[2] = color[2] % 256;
}

function copyColor(color1, color2) {
    color1[0] = color2[0];
    color1[1] = color2[1];   
    color1[2] = color2[2];
}

function getColors() {
    tempColor = [Math.floor(Math.random() * 256), 
                 Math.floor(Math.random() * 256), 
                 Math.floor(Math.random() * 256)];
    
    copyColor(backgroundColor, tempColor);
    
    tempColor = [tempColor[0] + 64 + Math.floor(Math.random() * 128),
                 tempColor[1] + 64 + Math.floor(Math.random() * 128),
                 tempColor[2] + 64 + Math.floor(Math.random() * 128)];
                
    
    clampColors(tempColor);
    copyColor(lineColor, tempColor);        
        
    if (clearNext) { clearNext = false; ctx.beginPath(); }
}

function boundryCheck() {
  for (i=0; i<4; i = i + 2) {
      if (lineSegment[i] < 0) {
          lineSegment[i] = 0;
          lineSpeed[i] = Math.random() * maxSpeed;
          getColors();
      }
      else if (lineSegment[i] > maxWidth) {
          lineSegment[i] = maxWidth;
          lineSpeed[i] = Math.random() * -maxSpeed;
          getColors();
      }
      
      if (lineSegment[i+1] < 0) {
          lineSegment[i+1] = 0;
          lineSpeed[i+1] = Math.random() * maxSpeed;
          getColors(); 
      }
      else if (lineSegment[i+1] > maxHeight) {
          lineSegment[i+1] = maxHeight;
          lineSpeed[i+1] = Math.random() * -maxSpeed;
          getColors();
      }
  }
}

function updatePosition() {
    for (i=0; i<4; i++){
        lineSegment[i] += lineSpeed[i];
    }    
}

function gameLoop() {
    // update position. 
    // on collision: gen new speed in the reverse direction, and get new colors
    // draw
    
    updatePosition();
    boundryCheck();
    draw();    
    
}

function draw() {
    ctx.fillStyle = 'rgb(' + backgroundColor[0] + ',' + backgroundColor[1] + ',' + backgroundColor[2] + ')';
    ctx.fillRect(0, 0, maxWidth, maxHeight);
    
    ctx.strokeStyle = 'rgb(' + lineColor[0] + ',' + lineColor[1] + ',' + lineColor[2] + ')';
    ctx.moveTo(lineSegment[0], lineSegment[1]);
    ctx.lineTo(lineSegment[2], lineSegment[3]);
    ctx.stroke();
}

function clearScreen() {
    clearNext = true;
}

setInterval(clearScreen, 30000);
setInterval(gameLoop, 33);



















