// setup canvas

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

// function to generate random number
function random(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ball object
function Ball(x, y, velX, velY, color, size) {
  this.x = x;
  this.y = y;
  this.velX = velX;
  this.velY = velY;
  this.color = color;
  this.size = size;
}

Ball.prototype.draw = function () {
  ctx.beginPath();
  ctx.fillStyle = this.color;
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  ctx.fill();
}

// rebound
Ball.prototype.update = function () {
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
Ball.prototype.collisionDetect = function () {
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

// animation loop
function loop() { // each iteration updates a frame
  ctx.fillStyle = 'rgba(0, 0, 0, 1)';
  ctx.fillRect(0, 0, width, height);

  // update all the balls in each frame
  for (let ball of balls) {
    ball.draw();
    ball.update();
    // ball.collisionDetect();
  }

  requestAnimationFrame(loop);
}

loop();


