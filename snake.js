const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.height = 500;
canvas.width = 500;

// fps calculation
let t0 = 0;
let fps = 0;
let t1 = 0;
let ifps = 0;

// control options
let lThroughPass = true;
let gameMode = 'Level1';
let toggleWalls = 0; // 0 = none, 1 = border, 2 = central I
let speed = 7;
let notPaused = true;

// lists of positions on grid
let apples = [];
let walls = [];

// objects
let player1 = [];
let player2 = [];

// p1
const p1Colour = 'green';
let p1headFacing = 0;
let p1Position = [[24,49], [-1,-1], [-1, -1], [-1,-1], [-1, -1], [-1,-1], [-1, -1]];
const p1Controls = ['ArrowUp','ArrowLeft','ArrowDown','ArrowRight'];
//p2
const p2Colour = 'blue';
let p2headFacing = 2;
let p2Position = [[25,0], [-1,-1], [-1, -1], [-1,-1], [-1, -1], [-1,-1], [-1, -1]];
const p2Controls = ['w','a','s','d'];

// [[p1starttingPos] [p2StartingPos] [walls]]
const level1 = [[],[],[]];

/////////////////////////// Classes ////////////////////////////////////////////

class Board {
  constructor(width, height){
    this.width = 50;
    this.height = 50;
    this.squarewidth = canvas.width / this.width;
    this.squareheight = canvas.height / this.height;
  }
}

class NewBoard { // not currently in use //
//this board is a dynamic board that can be placed anywhere in the canvas.
//I intend on making it able to play multiple games, however within this section I am making it only able to play snake
//my goal is to eventually remove this class from this .js file for readability purposes.
  constructor(numWide, numHigh, startx, starty, endx, endy) {
    this.numSqWide = numWide;
    this.numSqHigh = numHigh;
    this.width = endx - startx;
    this.height = endy - starty;
    this.squarewidth = this.width / this.squares_wide;
    this.squareheight = this.width / this.squares_high;

    this.objects = []; // to hold all objects that are playing on this board
    //this.settings = this will hold the settings for the various games, Snake will hold speed, controls? , wa
  }

  drawTile() {
  }

}

class Snake {
  constructor(startingPos, facingDirection, colour, controls){
    this.headFacing = facingDirection;
    this.body = startingPos;
    this.growCounter = 0;
    this.score = 0;
    this.colour = colour;
    this.speed = speed;
    this.counter = 0; /* counter should be part of the NewBoard class, as this is used for the drawing on the board */
    this.controls = controls; // ['w','a','s','d'] or ['up','left','down','right']
    // could find a way to manage a settings area, to allow resetting keys.
  }

  draw(){
    ctx.beginPath();
    ctx.fillStyle = this.colour;
    this.smoothMovement();
    ctx.fill();
  }

  smoothMovement() { //could this be done in relation to the board rather than the snake?
    let bodyLength = this.body.length - 1 ;

    for (let i = 0; i < this.body.length ; i++) {
      let xPos = this.body[i][0] * board.squarewidth;
      let yPos = this.body[i][1] * board.squareheight;
      let width = board.squarewidth;
      let height = board.squareheight;

      if (i === 0){ //smooth head movement
        if ((this.body[0][0] - 1) === this.body[1][0]){ // left
          xPos -= board.squarewidth ;
          width += (this.counter/this.speed) * board.squarewidth;
        }  else if ((this.body[0][0] + 1) === this.body[1][0]){ //right
          xPos -= ((this.counter/this.speed) -1) * board.squarewidth ;
          width  += (this.counter/this.speed) * board.squarewidth;
        }  else if ((this.body[0][1] - 1) === this.body[1][1]){ //down
          yPos -= board.squareheight ;
          height += (this.counter/this.speed) * board.squareheight;
        }  else if ((this.body[0][1] + 1) === this.body[1][1]){ //up
          yPos -= ((this.counter/this.speed) - 1) * board.squareheight ;
          height += (this.counter/this.speed) * board.squareheight;
        }
      }  else if (i === this.body.length - 1){ //smooth rear movement
        if ((this.body[bodyLength][0] - 1) === this.body[bodyLength - 1][0]){
          xPos -= board.squarewidth ;
          width += (1-(this.counter/this.speed)) * board.squarewidth;
        }  else if ((this.body[bodyLength][0] + 1) === this.body[bodyLength - 1][0]){
          xPos += ((this.counter/this.speed)) * board.squarewidth ;
          width -= ((this.counter/this.speed)) * board.squarewidth;
        }  else if ((this.body[bodyLength][1] - 1) === this.body[bodyLength - 1][1]){
          yPos -= board.squareheight ;
          height += (1-(this.counter/this.speed)) * board.squareheight;
        }  else if ((this.body[bodyLength][1] + 1) === this.body[bodyLength - 1][1]){
          yPos += ((this.counter/this.speed)) * board.squareheight ;
          height -= ((this.counter/this.speed)) * board.squareheight;
        }
      }
      ctx.rect(xPos,yPos,width,height);
    }
  }

  applyFrame() {
    this.counter++;
    if (this.counter >= this.speed) {
      this.counter = 0;
      this.checkCollisions();
      this.move();
    }
    this.draw();
  }

  hitSelf(check){
    for (let iTemp = 0; iTemp < this.body.length - 1; iTemp++) {
      if (this.body[iTemp][0] === check[0] && this.body[iTemp][1] === check[1]) {
        return true;
      }
    }
  }

  checkCollisions(){
    let head = this.body[0]
    let xPos = head[0];
    let yPos = head[1];
    this.nextPosition = [];

    switch (this.headFacing){
      case 0: // up
        this.nextPosition = [head[0], head[1] - 1]
        break;
      case 1: // right
        this.nextPosition = [head[0] + 1, head[1]]
        break;
      case 2: // down
        this.nextPosition = [head[0], head[1] + 1]
        break;
      case 3: // left
        this.nextPosition = [head[0] - 1 , head[1]]
        break;
    }
    this.loopAround();

    if (this.hitSnake(this.nextPosition)){
      endGame();
    }
    if (this.hitWall(this.nextPosition)) {
      endGame();
    }
    if (this.getApple(this.nextPosition)){
      this.grow();
    }
  }

  loopAround(){
    if (this.nextPosition[0] < 0){
      this.nextPosition[0] = board.width;
    }
    else if (this.nextPosition[0] >= board.width){
      this.nextPosition[0] = 0;
    }
    else if (this.nextPosition[1] < 0){
      this.nextPosition[1] = board.height;
    }
    else if( this.nextPosition[1] >= board.height){
      this.nextPosition[1] = 0;
    }
  }

  hitSnake(check) {
    if (player1.length > 0) {
      for (let iTemp = 0; iTemp < player1[0].body.length - 1; iTemp++) {
        if (player1[0].body[iTemp][0] === check[0] && player1[0].body[iTemp][1] === check[1]) {
          return true;
        }
      }
    }

    if (player2.length > 0) {
      for (let iTemp = 0; iTemp < player2[0].body.length - 1; iTemp++) {
        if (player2[0].body[iTemp][0] === check[0] && player2[0].body[iTemp][1] === check[1]) {
          return true;
        }
      }
    }
  }

  hitWall(position){
    for (let i = 0; i < walls.length; i++) {
      if (walls[i][0] === position[0] && walls[i][1] === position[1]) {
        return true;
      }
    }
  }

  getApple(position){
    for (let i = 0; i < apples.length ; i++){
      if (apples[i][0] === position[0] && apples[i][1] === position[1]) {
        apples.splice(i,1);
        replaceApple(5);
        this.score += 1 * this.speed;
        return true;
      }
    }
  }

  grow(){
    this.growCounter++;
  }

  move(){
    let head = this.body[0]

    if (this.growCounter > 0) {
      this.growCounter--;
    } else {
      this.body.pop(); //remove tail square
    }

    this.body.unshift(this.nextPosition);
  }

  facingChange(direction){
    if (this.validMove(direction)) {
      this.headFacing = direction;
    }
  }

  validMove(check){
    let testPosition = [];
    let head = this.body[0];

    switch (check){
      case 0: // up
        testPosition = [head[0], head[1] - 1]
        break;
      case 1: // right
        testPosition = [head[0] + 1, head[1]]
        break;
      case 2: // down
        testPosition = [head[0], head[1] + 1]
        break;
      case 3: // left
        testPosition = [head[0] - 1 , head[1]]
        break;
    }

    if (this.body[1][0] === testPosition[0] && this.body[1][1] === testPosition[1]) {
      return false;
    } else {
      return true;
    }
  }
}
//////////////////////////////////// functions /////////////////////////////////

function endGame(){
  notPaused = false;
}

function pause() {
  notPaused = false
}

function placeApple(times = 1){
  for (let i = 0; i < times; i++) {
    let notPlaced = true;

    while (notPlaced) {
      let taken = false;
      let xPos = Math.floor(Math.random() * board.width);
      let yPos = Math.floor(Math.random() * board.height);

      if (this.checkPlacement([xPos,yPos])) {
        apples.push([xPos,yPos]);
        notPlaced = false;
      }
    }
  }
}

function replaceApple(appleLimit) {
  if (apples.length < appleLimit) {
    placeApple();
  }
}

function checkPlacement(position) {
  let xPos = position[0];
  let yPos = position[1];

  for (let i = 0; i < apples.length ; i++){
    if (apples[i][0] === xPos && apples[i][1] === yPos) {
      return false;
    }
  }

  for (let i = 0; i < walls.length ; i++){
    if (walls[i][0] === xPos && walls[i][1] === yPos) {
      return false;
    }
  }
  if (player1.length > 0) { //player1 exists
    for (let i = 0; i < player1[0].length ; i++){
      if (player1[i][0] === xPos && player1[i][1] === yPos) {
        return false;
      }
    }
  }
  if (player2.length > 0){ //player 2 exists
    for(let i = 0;i < player2[0].length; i++){
      if (player2[i][0] === xPos && player2[i][1] === yPos) {
        return false;
      }
    }
  }
  return true;
}

function drawSquares(list, colour){
  ctx.beginPath();
  ctx.fillStyle = colour;
  for (let i = 0; i < list.length; i++){
    let xPos = list[i][0] * board.squarewidth;
    let yPos = list[i][1] * board.squareheight;
    ctx.rect(xPos,yPos,board.squarewidth,board.squareheight);
  }
  ctx.fill();
  ctx.stroke();
}

function createBorders(){
  // adds borders to the walls list
  for (let i = 0; i < board.width ; i++){
    if (lThroughPass && (i > 22 && i < 27)){
      continue;
    }
    walls.push([i,0]);
    walls.push([i,board.height - 1]);
  }
  for (let i = 1; i < board.height - 1 ; i++){
    if (lThroughPass && (i > 22 && i < 27)){
      continue;
    }
    walls.push([0,i]);
    walls.push([board.width - 1 ,i]);
  }
}

function prepareLevel(level) {
  p1Position = level[0]
  p2Position = level[1]
  walls = level[2]
 }

//////////////////////////////// event listeners ///////////////////////////////
document.addEventListener('keydown', (event) => { /*checks if the key is down, so repeats if held down*/
  const keyName = event.key;

  //when a direction key is pressed, alter the snakes head facing direction.
  //PLAYER1
  if (keyName === p1Controls[0]) {
    player1[0].facingChange(0)
    return;
  }
  if (keyName === p1Controls[3]) {
    player1[0].facingChange(1)
    return;
  }
  if (keyName === p1Controls[2]) {
    player1[0].facingChange(2)
    return;
  }
  if (keyName === p1Controls[1]) {
    player1[0].facingChange(3)
    return;
  }
  //PLAYER2
  if (keyName === p2Controls[0]) {
    player2[0].facingChange(0)
    return;
  }
  if (keyName === p2Controls[3]) {
    player2[0].facingChange(1)
    return;
  }
  if (keyName === p2Controls[2]) {
    player2[0].facingChange(2)
    return;
  }
  if (keyName === p2Controls[1]) {
    player2[0].facingChange(3)
    return;
  }

  if (keyName === 'p') {
    notPaused = !notPaused;
    return;
  }
}, false);

/////////////////////below directly interacts with HTML/////////////////////////

function newApple( number = 1 ) {
  placeApple(number)
}

function createPlayer1(){
  player1.push(new Snake( p1Position, p1headFacing, p1Colour, p1Controls));
}

function createPlayer2(){
  player2.push(new Snake( p2Position, p2headFacing, p2Colour, p2Controls));
}

function startNewGame(){
  player1.push(new Snake( p1Position, p1headFacing, p1Colour, p1Controls));
  player2.push(new Snake( p2Position, p2headFacing, p2Colour, p2Controls));
  placeApple();
}

function changeWalls(){
  toggleWalls ++;
  if (toggleWalls === 0) {
    walls = [];
  } else if (toggleWalls === 1) {
    walls = [];
    createBorders();
  }
}

////////////////////////////// end of buttons //////////////////////////////////

function nextFrame() {

  t1 = performance.now();
  fps = Math.floor((1/(t1 - t0)) * 1000);
  t0 = performance.now();

  if (ifps === 0) {
    document.getElementById("FPS").innerHTML = fps;
  }

  if (notPaused){
    canvas.width = canvas.width; //clears canvas

    drawSquares(walls, 'grey');
    drawSquares(apples, 'red');

    if (player1.length > 0) {
      player1[0].applyFrame();
      document.getElementById("P1Score").innerHTML = "P1: " + player1[0].score.toString();
    }

    if (player2.length > 0) {
      player2[0].applyFrame();
      document.getElementById("P2Score").innerHTML = "P2: " + player2[0].score.toString();
    }

    ifps++;
    if (ifps === 50) {
      // newApple();
      ifps = 0;
    }

  } //notPaused
  else {
    //drawCollisionSquare();
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.fillText("PAUSED", canvas.width/2 - 75, canvas.height/2 - 10);
  }
}

const board = new Board(50,50);

createBorders();

//setInterval(nextFrame, 10);

startgame = setInterval(nextFrame, 10);

function exitGame() {
  clearInterval(startgame);
}
