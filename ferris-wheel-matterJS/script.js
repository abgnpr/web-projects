const html = document.querySelector('html');

// module aliases
let Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Body = Matter.Body,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite,
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
    height: window.innerHeight,
    showConvexHulls: true
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
  this.radius = vminTOpx(36);
  this.parts = [];

  let frame = Bodies.polygon(this.x, this.y, 12, this.radius);

  // circles
  this.parts.push(Bodies.circle(this.x, this.y, vminTOpx(34), { density: 0 }));
  this.parts.push(Bodies.circle(this.x, this.y, vminTOpx(10), { density: 0 }));

  // junctions
  for (let vertex of frame.vertices) {
    this.parts.push(Bodies.circle(vertex.x, vertex.y, vminTOpx(0.4), { label: 'Junction' }));
  }

  this.body = Body.create({ parts: this.parts });
  World.add(engine.world, this.body);

  // spokes
  for (let part of this.parts) {
    if (part.label === 'Junction') {
      World.add(engine.world, Constraint.create({
        bodyA: this.body,
        bodyB: part,
        render: {
          anchors: false,
          lineWidth: 0.1
        }
      }));
    }
  }
}

function Support(wheel, base) {
  this.wheel = wheel;
  this.base = base;

  let render = {
    lineWidth: 5,
    strokeStyle: 'rgba(255, 255, 255, 0.3)'
  };

  this.left = Constraint.create({
    pointA: { x: this.base.center - vwTOpx(10), y: this.base.elevation },
    bodyB: this.wheel.body,
    render
  });


  this.right = Constraint.create({
    pointA: { x: this.base.center + vwTOpx(10), y: this.base.elevation },
    bodyB: this.wheel.body,
    render
  });


  World.add(engine.world, [this.left, this.right]);
}


const ferrisWheel = new FerrisWheel(50, 45);
const ground = new Ground(50, 55 + pxTOvh(ferrisWheel.radius), 44, 1);
const support = new Support(ferrisWheel, ground);

setInterval(() => {
  ferrisWheel.body.torque = 0.000001;
}, 100);

function Human() {

}


// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);

window.onresize = () => document.location.reload();
