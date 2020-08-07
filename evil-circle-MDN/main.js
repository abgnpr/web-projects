// https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Adding_bouncing_balls_features

// setup canvas

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const p = document.querySelector('.balls-left');

const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

// function to generate random number
function random(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }


// Shape: base
function Shape(x, y, velX, velY) {
  this.x = x;
  this.y = y;
  this.velX = velX;
  this.velY = velY;
  this.exists = true;
}

// show ball
Shape.prototype.draw = function () {
  ctx.beginPath();
  ctx.fillStyle = this.color;
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  ctx.fill();
}

// rebound
Shape.prototype.update = function () {
  if ((this.x + this.size) >= width)
    this.velX = -(this.velX);
  if ((this.x - this.size) <= 0)
    this.velX = -(this.velX);
  if ((this.y + this.size) >= height)
    this.velY = -(this.velY);
  if ((this.y - this.size) <= 0)
    this.velY = -(this.velY);

  this.x += this.velX;
  this.y += this.velY;
}

// color change on collision
Shape.prototype.collisionDetect = function () {
  for (let ball of balls) {
    if (this !== ball) {
      const dx = this.x - ball.x;
      const dy = this.y - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy); // pythagoran theorem

      if (distance < (this.size + ball.size))
        ball.color = `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`;
    }
  }
}


// Ball: derived
function Ball(x, y, velX, velY, color, size) {
  Shape.call(this, x, y, velX, velY);
  this.color = color;
  this.size = size;
}

// inherit the protoype
Ball.prototype = Object.create(Shape.prototype);

// fix the constructor
Object.defineProperty(Ball.prototype, 'constructor', {
  value: Ball,
  enumerable: false,
  writable: true
});

// create an array of balls
const balls = [];
while (balls.length < 100) {
  let size = random(10, 20);
  let ball = new Ball(
    random(0 + size, width - size),
    random(0 + size, height - size),
    random(-10, 10),
    random(-10, 10),
    `rgb(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)})`,
    size
  );

  balls.push(ball);
}

// initialize number of balls remaining
let ballsLeft = balls.length;
p.textContent = `balls left: ${ballsLeft}`;

// EvilCircle: derived
function EvilCircle(x, y) {
  Shape.call(this, x, y, 20, 20);
  this.color = 'white';
  this.size = 10;
}

// inherit the protoype
EvilCircle.prototype = Object.create(Shape.prototype);

// fix the constructor
Object.defineProperty(EvilCircle.prototype, 'constructor', {
  value: EvilCircle,
  enumerable: false,
  writable: true
});

// show evil circle
EvilCircle.prototype.draw = function () {
  ctx.beginPath();
  ctx.strokeStyle = this.color;
  ctx.lineWidth = 3;
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  ctx.stroke();
}

// keeps evil circle within canvas limits
EvilCircle.prototype.checkBounds = function () {
  if ((this.x + this.size) >= width)
    this.x -= this.size;
  if ((this.x - this.size) <= 0)
    this.x += this.size;
  if ((this.y + this.size) >= height)
    this.y -= this.size;
  if ((this.y - this.size) <= 0)
    this.y += this.size;
}

// enables W-S-A-D movement of the evil circle
EvilCircle.prototype.setControls = function () {
  let _this = this;
  window.onkeydown = function (e) {
    if (e.key === 'a') {
      _this.x -= _this.velX;
    } else if (e.key === 'd') {
      _this.x += _this.velX;
    } else if (e.key === 'w') {
      _this.y -= _this.velY;
    } else if (e.key === 's') {
      _this.y += _this.velY;
    }
  }
}

// swallows balls
EvilCircle.prototype.collisionDetect = function () {
  for (let ball of balls) {
    if (ball.exists) {
      const dx = this.x - ball.x;
      const dy = this.y - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy); // pythagoran theorem

      if (distance < (this.size + ball.size)) {
        ball.exists = false;
        p.textContent = 'balls left: ' + (--ballsLeft);
      }
    }
  }
}

// create an evil circle
let evilCircle = new EvilCircle(
  random(20, width - 20),
  random(20, height - 20)
);

evilCircle.setControls();

// animation loop
function loop() { // each iteration updates a frame
  ctx.fillStyle = 'rgba(0, 0, 0, 1)';
  ctx.fillRect(0, 0, width, height);

  // update all the balls in each frame
  for (let ball of balls) {
    if (ball.exists) {
      ball.draw();
      ball.update();
      ball.collisionDetect();
    }
  }

  evilCircle.draw();
  evilCircle.checkBounds();
  evilCircle.collisionDetect();

  requestAnimationFrame(loop);
}

loop();
