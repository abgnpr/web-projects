// import "./lib/matter";

const html = document.querySelector('html');

// utility
const vwTOpx = (w) => (w / 100) * html.clientWidth;
const vhTOpx = (h) => (h / 100) * html.clientHeight;
const vminTOpx = (x) => html.clientHeight < html.clientWidth ? (x / 100) * html.clientHeight : (x / 100) * html.clientWidth;
const pxTOvh = (x) => x / html.clientHeight * 100;
const pxTOvw = (x) => x / html.clientWeight * 100;
const degTOrad = (x) => x * Math.PI / 180;
const random = (l, u) => l + Math.floor(Math.random() * (u - l + 1));

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
    showConvexHulls: true,
    wireframes: false,
    // background: 'linear-gradient(#87ceeb 70%, white 80%)',
    background: 'url(./images/bg1.jpg) no-repeat',
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
        render: { fillStyle: '#192A56' },
      }, true
    );
  },

  pedestal: function (axleCup, wheel, base) {
    let r = wheel.axleRadius;
    let R = wheel.radius;
    let w = R / 2;
    let h = base.top - axleCup.position.y + (2 * r);

    // some adjustment voodoo!
    let posX = axleCup.position.x;
    let leftPosX = posX - (1.8 * r) - (w / 2);
    let rightPosX = posX + (1.8 * r) + (w / 2);
    let posY = (wheel.position.y + base.position.y) / 1.88;

    let color = '#192A56';

    return Body.create({
      parts: [
        Bodies.fromVertices(leftPosX, posY,
          Vertices.fromPath(`${w},0  0,${h}  ${w / 2},${h}  ${w},${h / 2}`),
          { render: { fillStyle: color }, }
        ),
        Bodies.fromVertices(rightPosX, posY,
          Vertices.fromPath(`0,0  ${w},${h}  ${w / 2},${h}  0,${h / 2}`),
          { render: { fillStyle: color } }
        ),
      ],
      collisionFilter: { group: -1, category: Categories.support, mask: Categories.axle },
      density: 0.01, mass: 1000, isStatic: true, restitution: 0,
    });
  }

};

// My custom composite bodies
const chooseRandom = (items) => items[random(0, items.length - 1)];

const CustomComposites = {

  // creates and returns a new gondola (the ferris wheel seating area)
  gondola: function (x, y) {

    let colors = [
      { cap: '#176baf', basket: '#045292' },
      { cap: '#40407a', basket: '#2c2c54' },
      { cap: '#97BC62FF', basket: '#2C5F2D' },
      { cap: '#F2AA4CFF', basket: '#990011FF' },
      // { cap: '', basket: '' },
      // { cap: '', basket: '' },
      // { cap: '', basket: '' },
    ];

    let color = chooseRandom(colors);
    console.log(color);

    // const color = Common.choose(['#d63031', '#00b894', '#0984e3', '#6c5ce7']); // todo: randomize

    // triangular cap
    let r = 4; // traingle radius
    let h = r + r / 2; // triangle height
    let cap = Bodies.polygon(x, y, 3, vminTOpx(r), {  // triangle
      render: { fillStyle: color.cap, lineWidth: vminTOpx(1), strokeStyle: color.cap },
      chamfer: { radius: [0, vminTOpx(4), 0] },
      angle: degTOrad(90),
      density: 0.005
    });

    // square basket
    let l = 4.5; // square length
    let b = r * Math.sqrt(3); // square bredth
    let basket = Bodies.rectangle(x, y + vminTOpx(h - r + l / 2), vminTOpx(b), vminTOpx(l), {
      render: { fillStyle: color.basket, lineWidth: 0 },
      chamfer: { radius: [0, 0, vminTOpx(2.5), vminTOpx(2.5)] },
      density: 0.005
    });

    // gondola gate
    let gatePosY = basket.position.y + vminTOpx(l / 8);
    let gate = Bodies.rectangle(basket.position.x, gatePosY, vminTOpx(b / 3.5), vminTOpx(3 * l / 4), {
      render: { fillStyle: '#c8d6e5be', lineWidth: 0 },
      chamfer: { radius: [vminTOpx(0.7), vminTOpx(0.7), 0, 0] },
      density: 0
    });

    // circular joint (attaches to wheel frame)
    let jointPosY = (cap.position.y + cap.vertices[1].y) / 2;
    let joint = Bodies.circle(x, jointPosY, vminTOpx(0.4), {
      render: { fillStyle: '#586776', lineWidth: vminTOpx(0.6), strokeStyle: '#DAE0E2' },
    });

    // gondola body: a compound object made up of cap, basket, gate and joint
    let body = Body.create({
      parts: [cap, basket, gate, joint],
      collisionFilter: { group: Groups.wheel },
      density: 0.01,
    });

    body.jointPos = joint.position;

    return body;
  }

};

// ferris wheel object
function FerrisWheel(x_vw, y_vh) {

  let x = vwTOpx(x_vw);
  let y = vhTOpx(y_vh);
  this.radius = vminTOpx(40);
  this.axleRadius = vminTOpx(2);
  const numSeats = 14; // number of seats

  // wheel frame
  this.frame = Body.create({
    parts: [
      Bodies.circle(x, y, this.radius - vminTOpx(9), {
        render: { fillStyle: '0', strokeStyle: '#576574', lineWidth: vminTOpx(0.5) },
      }),
      Bodies.circle(x, y, this.radius - vminTOpx(2), {
        render: { fillStyle: '0', strokeStyle: '#2475B0', lineWidth: vminTOpx(2.5) },
      }),
      Bodies.polygon(x, y, numSeats, this.radius, {
        render: { fillStyle: '0', strokeStyle: '#2475B0', lineWidth: vminTOpx(2) },
      }),
      Bodies.circle(x, y, vminTOpx(4.5), {
        render: { fillStyle: '0', strokeStyle: '#2F363F', lineWidth: vminTOpx(1) },
      }),
      Bodies.circle(x, y, vminTOpx(10), {
        render: { fillStyle: '0', strokeStyle: '#2475B0', lineWidth: vminTOpx(5) },
      })
    ],
    density: 0.0003, airFriction: 0,
    collisionFilter: { group: Groups.wheel }
  });

  this.position = this.frame.position;

  this.axle = Bodies.circle(this.position.x, this.position.y, this.axleRadius, {
    collisionFilter: {
      // group: -1,
      mask: Categories.support,
      category: Categories.axle
    },
    render: { fillStyle: '#7E212C' },
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
    this.gondolas.push(CustomComposites.gondola(vertex.x, vertex.y));
  }

  // constraints to attach the gondolas to the wheel frame
  this.joints = [];
  for (let gondola of this.gondolas) {
    this.joints.push(
      Constraint.create({
        bodyA: this.frame,
        bodyB: gondola,
        pointA: Vector.sub(gondola.jointPos, this.frame.position),
        pointB: Vector.sub(gondola.jointPos, gondola.position),
        length: 0,
        stiffness: 1,
        render: { visible: false },
      })
    );
  }

  this.show = function () {
    World.add(engine.world, [
      this.frame, ...this.spokes,
      this.axle, this.axis,
      ...this.gondolas, ...this.joints
    ]);
  }
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
