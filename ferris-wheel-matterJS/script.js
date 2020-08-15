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
  Vector = Matter.Vector,
  Vertices = Matter.Vertices,
  Common = Matter.Common;


// create an engine
let engine = Engine.create();

// create a renderer
let render = Render.create({
  element: document.querySelector(".matter-world"),
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    // showConvexHulls: true,
    wireframes: false,
    background: 'linear-gradient(#87ceeb 70%, white 80%)',
    // showPositions: true,
    pixelRatio: 'auto'
  }
});

// add mouse control
World.add(engine.world, MouseConstraint.create(engine, {
  mouse: Mouse.create(render.canvas),
  constraint: { stiffness: 0.2, render: { visible: false } }
}));

// __________________________________________________________________


// Groups and categories for collision filter.

let Groups = {
  wheel: -1
  // Parts of the ferris wheel (eg frame, gondola etc..)
  // will have this group so that they do not collide.
}

let Categories = {
  axle: Body.nextCategory(true),
  support: Body.nextCategory(true)
}

const CustomBodies = {

  axleCup: function (axle) {
    let r = axle.circleRadius;
    let x = axle.position.x;
    let y = axle.position.y + r;
    return Bodies.fromVertices(x, y,
      Vertices.fromPath(`  
        0, 0
        0, ${4 * r}
        ${6 * r}, ${4 * r}
        ${6 * r}, 0
        ${4 * r}, 0
        ${4 * r}, ${2 * r}
        ${2 * r}, ${2 * r}
        ${2 * r}, 0`
      ),
      {
        collisionFilter: { category: Categories.support, mask: Categories.axle },
        density: 0.01, mass: 1000, isStatic: true, restitution: 0,
        render: { fillStyle: '#2475B0' },
      }, true
    );
  },

  pedestal: function (axleCup, wheel, base) {
    let r = wheel.axleRadius;
    let R = wheel.radius;
    let w = R / 2;
    let h = base.top - axleCup.position.y + (2 * r);

    // some adjustment vodoo!
    let posX = axleCup.position.x;
    let leftPosX = posX - (1.8 * r) - (w / 2);
    let rightPosX = posX + (1.8 * r) + (w / 2);
    let posY = (wheel.position.y + base.position.y) / 1.892;

    return Body.create({
      parts: [
        Bodies.fromVertices(leftPosX, posY,
          Vertices.fromPath(`${w},0  0,${h}  ${w / 2},${h}  ${w},${h / 2}`),
          { render: { fillStyle: '#192A56' }, }
        ),
        Bodies.fromVertices(rightPosX, posY,
          Vertices.fromPath(`0,0  ${w},${h}  ${w / 2},${h}  0,${h / 2}`),
          { render: { fillStyle: '#2475B0' } }
        ),
      ],
      collisionFilter: { group: -1, category: Categories.support, mask: Categories.axle },
      density: 0.01, mass: 1000, isStatic: true, restitution: 0,
    });
  }

};

// My custom composite bodies
const CustomComposites = {

  // creates and returns a new gondola (the ferris wheel seating area)
  gondola: function (x, y, wheelFrame) {

    const color = Common.choose(['#d63031', '#00b894', '#0984e3', '#6c5ce7']); // todo: randomize
    const gateColor = '#c8d6e5be';

    // triangular cap
    let r = 4; // traingle radius
    let h = r + r / 2; // triangle height
    let cap = Bodies.polygon(x, y, 3, vminTOpx(r), {  // triangle
      render: { fillStyle: '#176baf', lineWidth: vminTOpx(1), strokeStyle: '#176baf' },
      chamfer: { radius: [0, vminTOpx(4), 0] },
      angle: degTOrad(90),
      density: 0.005
    });

    // square basket
    let l = 4.5; // square length
    let b = r * Math.sqrt(3); // square bredth
    let basket = Bodies.rectangle(x, y + vminTOpx(h - r + l / 2), vminTOpx(b), vminTOpx(l), {
      render: { fillStyle: '#045292', lineWidth: 0 },
      chamfer: { radius: [0, 0, vminTOpx(2.5), vminTOpx(2.5)] },
      density: 0.005
    });

    // gondola gate
    let gatePosY = basket.position.y + vminTOpx(l / 8);
    let gate = Bodies.rectangle(basket.position.x, gatePosY, vminTOpx(b / 3.5), vminTOpx(3 * l / 4), {
      render: { fillStyle: gateColor, lineWidth: 0 },
      chamfer: { radius: [vminTOpx(0.7), vminTOpx(0.7), 0, 0] },
      density: 0
    });

    // circular joint (attaches to wheel frame)
    let jointPosY = (cap.position.y + cap.vertices[1].y) / 2;
    let joint = Bodies.circle(x, jointPosY, vminTOpx(0.5), {
      render: { fillStyle: 'black' },
    });

    // gondola : a compound object made up of cap, basket, gate and joint
    let body = Body.create({
      parts: [cap, basket, gate, joint],
      collisionFilter: { group: Groups.wheel },
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
      render: { lineWidth: vminTOpx(0.5), strokeStyle: '#ff9f43' },
    });

    let gondolaComposite = Composite.create();
    Composite.add(gondolaComposite, [body, link]);
    return gondolaComposite;
  }

};

// ferris wheel object
function FerrisWheel(x_vw, y_vh) {

  let x = vwTOpx(x_vw);
  let y = vhTOpx(y_vh);
  this.radius = vminTOpx(42);
  this.axleRadius = vminTOpx(2);
  const numSeats = 14; // number of seats

  // wheel frame
  this.frame = Body.create({
    parts: [
      Bodies.polygon(x, y, 2 * numSeats, this.radius - vminTOpx(12), {
        render: { fillStyle: '0', strokeStyle: '#576574', lineWidth: vminTOpx(0.6) },
        density: 0.0003
      }),
      Bodies.circle(x, y, this.radius - vminTOpx(2), {
        render: { fillStyle: '0', strokeStyle: '#ff9f43', lineWidth: vminTOpx(2.5) },
        density: 0.0003
      }),
      Bodies.polygon(x, y, numSeats, this.radius, {
        render: { fillStyle: '0', strokeStyle: '#ff9f43', lineWidth: vminTOpx(2) },
        density: 0.0003
      }),
      Bodies.circle(x, y, vminTOpx(10), {
        render: { fillStyle: '#ff9f43', strokeStyle: '#ee5253', lineWidth: vminTOpx(1.5) },
        density: 0.0003
      })
    ],
    collisionFilter: { group: Groups.wheel }
  });

  this.position = this.frame.position;

  this.axle = Bodies.circle(this.position.x, this.position.y, this.axleRadius, {
    collisionFilter: {
      // group: -1,
      mask: Categories.support,
      category: Categories.axle
    },
    friction: 0,
    density: 0.005,
    mass: 200,
    restitution: 1,
    // isStatic: true
  });

  this.axis = Constraint.create({
    bodyA: this.frame,
    bodyB: this.axle,
    length: 0
  })

  // spokes from center to polgon vertices
  this.spokes = [];
  for (let vertex of this.frame.vertices) {
    this.spokes.push(Constraint.create({
      bodyA: this.frame,
      bodyB: this.frame,
      pointB: Vector.sub({ x: vertex.x, y: vertex.y }, this.frame.position), // polygon vertex
      render: { anchors: false, lineWidth: 0.6, strokeStyle: 'black' }
    }));
  }

  // gondolas
  this.gondolas = [];
  for (let vertex of this.frame.vertices) {
    this.gondolas.push(CustomComposites.gondola(vertex.x, vertex.y, this.frame));
  }

  this.show = function () { World.add(engine.world, [this.frame, ...this.spokes, this.axle, this.axis, ...this.gondolas]); }
}

// ground object
function Ground(x_vw, y_vh, span_vw, thickness_vh) {
  let x = vwTOpx(x_vw);
  let y = vhTOpx(y_vh);
  this.span = vwTOpx(span_vw);
  this.thickness = vhTOpx(thickness_vh);
  this.body = Bodies.rectangle(x, y, this.span, this.thickness, { isStatic: true });
  this.position = this.body.position;
  this.top = y - (this.thickness / 2);

  this.show = function () { World.add(engine.world, this.body); }
}

// support object
function Support(body, base) {
  this.axleCup = CustomBodies.axleCup(body.axle);
  this.pedestal = CustomBodies.pedestal(this.axleCup, body, base);
  this.show = function () { World.add(engine.world, [this.pedestal, this.axleCup]); }
}


// create object instances
const ferrisWheel = new FerrisWheel(50, 45);
const ground = new Ground(50, 53 + pxTOvh(ferrisWheel.radius), 60, 1);
const support = new Support(ferrisWheel, ground);

// display them
ferrisWheel.show();
ground.show();
support.show();

// rotate the ferris wheel by applying torque
setInterval(() => { ferrisWheel.frame.torque = 50; }, 100);


// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);


// reload on resize
window.onresize = () => document.location.reload();
