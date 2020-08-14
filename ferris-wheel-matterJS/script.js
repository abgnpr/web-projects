// import "./lib/matter";

const html = document.querySelector('html');

// utility
const vwTOpx = (w) => (w / 100) * html.clientWidth;
const vhTOpx = (h) => (h / 100) * html.clientHeight;
const vminTOpx = (x) => html.clientHeight < html.clientWidth ? (x / 100) * html.clientHeight : (x / 100) * html.clientWidth;
const pxTOvh = (x) => x / html.clientHeight * 100;
const pxTOvw = (x) => x / html.clientWeight * 100;
const degTOrad = (x) => x * Math.PI / 180;


// Matter.js setup___________________________________________________

// module aliases
let Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Body = Matter.Body,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite,
  Constraint = Matter.Constraint,
  Mouse = Matter.Mouse,
  MouseConstraint = Matter.MouseConstraint,
  Vector = Matter.Vector;


// create an engine
let engine = Engine.create();

// create a renderer
let render = Render.create({
  element: document.querySelector(".matter-world"),
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    showConvexHulls: true,
    wireframes: false
  }
});

// add mouse control
World.add(engine.world, MouseConstraint.create(engine, {
  mouse: Mouse.create(render.canvas),
  constraint: { stiffness: 0.2, render: { visible: false } }
}));


// A new group number for collision filter.
const wheelGroup = Body.nextGroup(true);
// Parts of the ferris wheel (eg frame, gondola etc..)
// will have this group so that they do not collide.


// My custom composite bodies
const CustomComposites = {

  // creates and returns a new gondola (the ferris wheel seating area)
  gondola: function (x, y, wheelFrame) {

    // triangular cap
    let r = 2.9; // traingle radius
    let h = r + r / 2; // triangle height
    let cap = Bodies.polygon(x, y, 3, vminTOpx(r), {  // triangle
      angle: degTOrad(90),
      chamfer: { radius: [0, vminTOpx(1), 0] },
    });

    // square basket
    let l = 4.2; // square length
    let b = r * Math.sqrt(3); // square bredth
    let basket = Bodies.rectangle(x, y + vminTOpx(h - r + l / 2), vminTOpx(b), vminTOpx(l), {
      chamfer: { radius: [0, 0, vminTOpx(1), vminTOpx(1)] },
      density: 0
    });

    // gondola gate
    let gatePosY = basket.position.y + vminTOpx(l / 8);
    let gate = Bodies.rectangle(basket.position.x, gatePosY, vminTOpx(b / 3), vminTOpx(3 * l / 4), {
      chamfer: { radius: [vminTOpx(0.7), vminTOpx(0.7), 0, 0] },
      density: 0
    });

    // circular joint (attaches to wheel frame)
    let jointPosY = (cap.position.y + cap.vertices[1].y) / 2;
    let joint = Bodies.circle(x, jointPosY, vminTOpx(0.5));

    // gondola : a compound object made up of cap, basket, gate and joint
    let body = Body.create({
      parts: [cap, basket, gate, joint],
      collisionFilter: { group: wheelGroup },
      density: 0.01,
    });

    // a constraint to attach the gondola to the wheel frame
    let link = Constraint.create({
      bodyA: body,
      pointA: Vector.sub(joint.position, body.position),
      bodyB: wheelFrame,
      pointB: Vector.sub({ x: x, y: y }, wheelFrame.position),
      length: 0,
      stiffness: 1,
      render: { lineWidth: 0.7 }
    });

    let gondolaComposite = Composite.create();
    Composite.add(gondolaComposite, [body, link]);
    return gondolaComposite;
  }

};

// ferris wheel object
function FerrisWheel(x_vw, y_vh) {

  this.x = vwTOpx(x_vw);
  this.y = vhTOpx(y_vh);
  this.radius = vminTOpx(40); // radius  } hard
  this.numSeats = 15; // number of seats } coded

  let frameOptions = {
    render: {
      fillStyle: 'rgba(0, 0, 0, 0)',
      strokeStyle: 'white',
      lineWidth: 2
    }
  };

  // wheel frame
  this.frame = Body.create({
    parts: [
      Bodies.circle(this.x, this.y, vminTOpx(30), frameOptions), // big circle
      Bodies.polygon(this.x, this.y, this.numSeats, this.radius, frameOptions), // polygon
      Bodies.circle(this.x, this.y, vminTOpx(10), frameOptions) // small circle
    ],
    collisionFilter: { group: wheelGroup }
  });

  // spokes from center to polgon vertices
  this.spokes = [];
  for (let vertex of this.frame.vertices) {
    this.spokes.push(Constraint.create({
      bodyA: this.frame,
      bodyB: this.frame,
      pointB: Vector.sub({ x: vertex.x, y: vertex.y }, this.frame.position), // polygon vertex
      render: { anchors: false, lineWidth: 0.3 }
    }));
  }

  // gondolas
  this.gondolas = [];
  for (let vertex of this.frame.vertices) {
    this.gondolas.push(CustomComposites.gondola(vertex.x, vertex.y, this.frame));
  }

  this.show = function () { World.add(engine.world, [this.frame, ...this.spokes, ...this.gondolas]); }
}

// ground object
function Ground(center_vw, elevation_vh, span_vw, thickness_vh) {
  this.center = vwTOpx(center_vw);
  this.elevation = vhTOpx(elevation_vh);
  this.span = vwTOpx(span_vw);
  this.thickness = vhTOpx(thickness_vh);
  this.body = Bodies.rectangle(this.center, this.elevation, this.span, this.thickness, { isStatic: true });

  this.show = function () { World.add(engine.world, this.body); }
}

// support object
function Support(body, base) {
  this.body = body;
  this.base = base;

  let renderOptions = {
    lineWidth: 5,
    strokeStyle: 'rgba(255, 255, 255, 0.3)'
  };

  this.left = Constraint.create({
    pointA: { x: this.base.center - vwTOpx(10), y: this.base.elevation },
    bodyB: this.body,
    renderOptions
  });

  this.right = Constraint.create({
    pointA: { x: this.base.center + vwTOpx(10), y: this.base.elevation },
    bodyB: this.body,
    renderOptions
  });

  this.show = function () { World.add(engine.world, [this.left, this.right]); }
}


// create object instances
const ferrisWheel = new FerrisWheel(50, 45);
const ground = new Ground(50, 53 + pxTOvh(ferrisWheel.radius), 60, 0.5);
const support = new Support(ferrisWheel.frame, ground);

// display them
ferrisWheel.show();
ground.show();
support.show();

// rotate the ferris wheel by applying torque
setInterval(() => { ferrisWheel.frame.torque = 5; }, 100);


// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);


// reload on resize
window.onresize = () => document.location.reload();
