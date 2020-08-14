// import "./lib/matter";

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
    showConvexHulls: true
  }
});

// add mouse control
World.add(engine.world, MouseConstraint.create(engine, {
  mouse: Mouse.create(render.canvas),
  constraint: { stiffness: 0.2, render: { visible: false } }
}));


// utility
const vwTOpx = (w) => (w / 100) * html.clientWidth;
const vhTOpx = (h) => (h / 100) * html.clientHeight;
const vminTOpx = (x) => html.clientHeight < html.clientWidth ? (x / 100) * html.clientHeight : (x / 100) * html.clientWidth;
const pxTOvh = (x) => x / html.clientHeight * 100;
const pxTOvw = (x) => x / html.clientWeight * 100;
const degTOrad = (x) => x * Math.PI / 180;

// for collision filter
const wheelGroup = Body.nextGroup(true);


const CustomComposites = {

  gondola: function (x, y, wheelFrame) {
    let gondolaComposite = Composite.create();

    let r = 2.5; // traingle radius
    let h = r + r / 2; // triangle height
    let cap = Bodies.polygon(x, y, 3, vminTOpx(r), { angle: degTOrad(90), chamfer: { radius: [0, vminTOpx(1), 0] } }); // triangle

    let l = 4; // square length
    let b = r * Math.sqrt(3);// square bredth
    let basket = Bodies.rectangle(x, y + vminTOpx(h - r + l / 2), vminTOpx(b), vminTOpx(l));

    let jointPos = (cap.position.y + cap.vertices[1].y) / 2;
    let joint = Bodies.circle(x, jointPos, vminTOpx(0.5));

    let body = Body.create({
      parts: [cap, basket, joint],
      collisionFilter: { group: wheelGroup },
      density: 0.01,
    });

    let link = Constraint.create({
      bodyA: body,
      pointA: Vector.sub(joint.position, body.position),
      bodyB: wheelFrame,
      pointB: Vector.sub({ x: x, y: y }, wheelFrame.position),
      length: 0,
      stiffness: 1,
      render: { lineWidth: 0.7 }
    });

    Composite.add(gondolaComposite, [body, link]);
    return gondolaComposite;
  }

};

function FerrisWheel(x_vw, y_vh) {
  this.x = vwTOpx(x_vw);
  this.y = vhTOpx(y_vh);
  this.radius = vminTOpx(40); // radius  } hard
  this.numSeats = 14; // number of seats } coded

  // wheel frame
  this.frame = Body.create({
    parts: [
      Bodies.circle(this.x, this.y, vminTOpx(30)), // big circle
      Bodies.polygon(this.x, this.y, this.numSeats, this.radius), // polygon
      Bodies.circle(this.x, this.y, vminTOpx(10)) // small circle
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

function Ground(center_vw, elevation_vh, span_vw, thickness_vh) {
  this.center = vwTOpx(center_vw);
  this.elevation = vhTOpx(elevation_vh);
  this.span = vwTOpx(span_vw);
  this.thickness = vhTOpx(thickness_vh);
  this.body = Bodies.rectangle(this.center, this.elevation, this.span, this.thickness, { isStatic: true });

  this.show = function () { World.add(engine.world, this.body); }
}

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

const ferrisWheel = new FerrisWheel(50, 45);
const ground = new Ground(50, 53 + pxTOvh(ferrisWheel.radius), 60, 0.5);
const support = new Support(ferrisWheel.frame, ground);

ferrisWheel.show();
ground.show();
support.show();

setInterval(() => { ferrisWheel.frame.torque = 3; }, 100);


// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);

// reload on resize
window.onresize = () => document.location.reload();
