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
  constraint: {
    stiffness: 1,
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
const degTOrad = (x) => x * Math.PI / 180;

// objects

// categories
const group = Body.nextGroup(true);

const Template = {
  seat: function (junction) {
    this.x = junction.position.x;
    this.y = junction.position.y;
    const r = 2.5; // traingle radius
    const h = r + r / 2; // triangle height
    const l = 4; // square length
    const b = r * Math.sqrt(3);// square bredth

    let cap = Bodies.polygon(this.x, this.y, 3, vminTOpx(r), { angle: degTOrad(90) });
    let basket = Bodies.rectangle(this.x, this.y + vminTOpx(h - r + l / 2), vminTOpx(b), vminTOpx(l));
    let a = Bodies.circle(this.x, cap.position.y, 0.4);
    return Body.create({
      parts: [cap, basket, a],
      collisionFilter: { group: group },
      restitution: 0,
      density: 0.01,
      frictionAir: 0.05
    });
  }
};

function Ground(center_vw, elevation_vh, span_vw, thickness_vh) {
  this.center = vwTOpx(center_vw);
  this.elevation = vhTOpx(elevation_vh);
  this.span = vwTOpx(span_vw);
  this.thickness = vhTOpx(thickness_vh);
  this.body = Bodies.rectangle(this.center, this.elevation, this.span, this.thickness, { isStatic: true });

  this.show = function () { World.add(engine.world, this.body); }
}

function FerrisWheel(x_vw, y_vh) {
  this.x = vwTOpx(x_vw);
  this.y = vhTOpx(y_vh);
  this.radius = vminTOpx(40);
  this.numSeats = 24;

  // this.body = Composite.create();

  // Composite.add(this.body, )

  // wheel frame
  this.frame = [
    // big circle
    Bodies.circle(this.x, this.y, vminTOpx(30)),
    // polygon
    Bodies.polygon(this.x, this.y, this.numSeats, this.radius),
    // small circle
    Bodies.circle(this.x, this.y, vminTOpx(10))
  ];

  // junction points
  this.junctions = [];
  for (let vertex of this.frame[1].vertices /* frame[1]: polygon */) {
    this.junctions.push(Bodies.circle(vertex.x, vertex.y, vminTOpx(0.4), { label: 'Junction' }));
  }

  this.body = Body.create({
    parts: [...this.frame, ...this.junctions],
    collisionFilter: { group: group }
  });

  // spokes from center to junction points
  this.spokes = [];
  for (let junction of this.junctions) {
    this.spokes.push(Constraint.create({
      bodyA: this.body, // polygon's center
      bodyB: junction,
      render: { anchors: false, lineWidth: 0.3 }
    }));
  }

  this.seats = [];
  this.seatLinks = [];
  for (let junction of this.junctions) {
    let seat = Template.seat(junction);
    let a = seat.parts[1];
    this.seatLinks.push(Constraint.create({
      bodyA: seat,
      pointA: Vector.sub(a.position, seat.position),
      bodyB: this.body,
      pointB: Vector.sub(junction.position, this.body.position),
      length: 0,
      stiffness: 1
    }));
    this.seats.push(seat);
  }

  this.show = function () { World.add(engine.world, [this.body, ...this.spokes, ...this.seats, ...this.seatLinks]); }
}

function Support(wheel, base) {
  this.wheel = wheel;
  this.base = base;

  let renderOptions = {
    lineWidth: 5,
    strokeStyle: 'rgba(255, 255, 255, 0.3)'
  };

  this.left = Constraint.create({
    pointA: { x: this.base.center - vwTOpx(10), y: this.base.elevation },
    bodyB: this.wheel.body,
    renderOptions
  });

  this.right = Constraint.create({
    pointA: { x: this.base.center + vwTOpx(10), y: this.base.elevation },
    bodyB: this.wheel.body,
    renderOptions
  });

  this.show = function () { World.add(engine.world, [this.left, this.right]); }
}

const ferrisWheel = new FerrisWheel(50, 45);
const ground = new Ground(50, 53 + pxTOvh(ferrisWheel.radius), 60, 0.5);
const support = new Support(ferrisWheel, ground);

ground.show();
support.show();
ferrisWheel.show();

setInterval(() => {
  ferrisWheel.body.torque = 1;
}, 100);


// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);

// reload on resize
window.onresize = () => document.location.reload();
