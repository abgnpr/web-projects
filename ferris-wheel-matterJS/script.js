// import "./lib/matter.js";

const html = document.querySelector('html');

// module aliases
let Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Constraint = Matter.Constraint,
  Mouse = Matter.Mouse,
  MouseConstraint = Matter.MouseConstraint;

// create an engine
let engine = Engine.create();

// create a renderer
let render = Render.create({
  element: document.querySelector(".matter-world"),
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight
  }
});

// add mouse control
World.add(engine.world, MouseConstraint.create(engine, {
  mouse: Mouse.create(render.canvas),
  constraint: {
    stiffness: 0.2,
    render: {
      visible: false
    }
  }
}));


// utility
const vwTOpx = (w) => (w / 100) * html.clientWidth;
const vhTOpx = (h) => (h / 100) * html.clientHeight;
const vminTOpx = (x) => html.clientHeight < html.clientWidth ? (x / 100) * html.clientHeight : (x / 100) * html.clientWidth;
const pxTOvh = (x) => x / html.clientHeight * 100;
const pxTOvw = (x) => x / html.clientWeight * 100;


// objects

function Ground(center_vw, elevation_vh, span_vw, thickness_vh) {
  this.center = vwTOpx(center_vw);
  this.elevation = vhTOpx(elevation_vh);
  this.span = vwTOpx(span_vw);
  this.thickness = vhTOpx(thickness_vh);
  this.body = Bodies.rectangle(this.center, this.elevation, this.span, this.thickness, { isStatic: true });

  World.add(engine.world, this.body);
}

function FerrisWheel(x_vw, y_vh) {
  this.x = vwTOpx(x_vw);
  this.y = vhTOpx(y_vh);
  this.radius = vminTOpx(30);
  this.body = Bodies.polygon(this.x, this.y, 8, this.radius, { torque: 1000 });

  World.add(engine.world, this.body);
}

function Support(wheel, base) {
  this.wheel = wheel;
  this.base = base;

  this.left = Constraint.create({
    pointA: { x: this.base.center - vwTOpx(10), y: this.base.elevation },
    bodyB: this.wheel.body
  });

  this.right = Constraint.create({
    pointA: { x: this.base.center + vwTOpx(10), y: this.base.elevation },
    bodyB: this.wheel.body
  });

  World.add(engine.world, [this.left, this.right]);
}

const ferrisWheel = new FerrisWheel(50, 50);
const ground = new Ground(50, 55 + pxTOvh(ferrisWheel.radius), 44, 1);
const support = new Support(ferrisWheel, ground);


// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);
