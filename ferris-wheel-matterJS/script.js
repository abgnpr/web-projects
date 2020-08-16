const html = document.querySelector('html');
window.onresize = () => document.location.reload();


// utility
const vwTOpx = (w) => (w / 100) * html.clientWidth;
const vhTOpx = (h) => (h / 100) * html.clientHeight;
const vminTOpx = (x) => html.clientHeight < html.clientWidth ? (x / 100) * html.clientHeight : (x / 100) * html.clientWidth;
const pxTOvh = (x) => x / html.clientHeight * 100;
const pxTOvw = (x) => x / html.clientWeight * 100;
const degTOrad = (x) => x * Math.PI / 180;
const random = (l, u) => l + Math.floor(Math.random() * (u - l + 1));
const chooseRandom = (items) => items[random(0, items.length - 1)];


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
  Events = Matter.Events;


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
    background: '0',
    pixelRatio: 'auto'
  }
});

// add mouse control
let mouseConstraint = MouseConstraint.create(engine, {
  mouse: Mouse.create(render.canvas),
  constraint: { stiffness: 0.2, render: { visible: false } }
});
World.add(engine.world, mouseConstraint);

// __________________________________________________________________


// Groups and categories for collision filter.
let Groups = { nonColliding: -1 }
// Parts of the ferris wheel (eg frame, gondola etc..)
// will have this group so that they do not collide.
let Categories = {
  axle: Body.nextCategory(true),
  support: Body.nextCategory(true)
}


// My custom bodies
const CustomBodies = {

  frame: function (x, y, r) {
    const numSeats = 14; // number of seats
    return Body.create({
      parts: [
        Bodies.circle(x, y, r - vminTOpx(9), {
          render: { fillStyle: '0', strokeStyle: '#576574', lineWidth: vminTOpx(0.5) },
        }),
        Bodies.circle(x, y, r - vminTOpx(2), {
          render: { fillStyle: '0', strokeStyle: '#2475B0', lineWidth: vminTOpx(2.5) },
        }),
        Bodies.polygon(x, y, numSeats, r, {
          render: { fillStyle: '0', strokeStyle: '#2475B0', lineWidth: vminTOpx(2) },
        }),
        Bodies.circle(x, y, vminTOpx(4.5), {
          render: { fillStyle: '0', strokeStyle: '#2F363F', lineWidth: vminTOpx(1) },
        }),
        Bodies.circle(x, y, vminTOpx(10), {
          render: { fillStyle: '0', strokeStyle: '#2475B0', lineWidth: vminTOpx(5) },
        })
      ],
      airFriction: 0, restitution: 1, density: 1,
      collisionFilter: { group: Groups.nonColliding }
    });
  },

  gondola: function (x, y) {

    let color = chooseRandom([
      { cap: '#176baf', basket: '#045292' },
      { cap: '#40407a', basket: '#2c2c54' },
      { cap: '#97BC62FF', basket: '#2C5F2D' },
      { cap: '#F2AA4CFF', basket: '#990011FF' },
    ]);

    // triangular cap
    let r = 4; // traingle radius
    let h = r + r / 2; // triangle height
    let cap = Bodies.polygon(x, y, 3, vminTOpx(r), {  // triangle
      render: { fillStyle: color.cap, lineWidth: vminTOpx(1), strokeStyle: color.cap },
      chamfer: { radius: [0, vminTOpx(4), 0], quality: 12 },
      angle: degTOrad(90),
    });

    // square basket
    let l = 4.5; // square length
    let b = r * Math.sqrt(3); // square bredth
    let basket = Bodies.rectangle(x, y + vminTOpx(h - r + l / 2), vminTOpx(b), vminTOpx(l), {
      render: { fillStyle: color.basket, lineWidth: 0 },
      chamfer: { radius: [0, 0, vminTOpx(2.5), vminTOpx(2.5)] }
    });

    // gondola gate
    let gatePosY = basket.position.y + vminTOpx(l / 8);
    let gate = Bodies.rectangle(basket.position.x, gatePosY, vminTOpx(b / 3.5), vminTOpx(3 * l / 4), {
      render: { fillStyle: '#c8d6e5be', lineWidth: 0 },
      chamfer: { radius: [vminTOpx(0.7), vminTOpx(0.7), 0, 0] }
    });

    // circular joint (attaches to wheel frame)
    let jointPosY = (cap.position.y + cap.vertices[1].y) / 2;
    let joint = Bodies.circle(x, jointPosY, vminTOpx(0.4), {
      render: { fillStyle: '#586776', lineWidth: vminTOpx(0.6), strokeStyle: '#DAE0E2' }
    });

    // gondola body: a compound object made up of cap, basket, gate and joint
    let body = Body.create({
      parts: [cap, basket, gate, joint],
      collisionFilter: { group: Groups.nonColliding },
    });

    body.jointPos = joint.position; // monkey patch

    return body;
  },

  axle: function (x, y, r) {
    return Bodies.circle(x, y, r, {
      collisionFilter: { category: Categories.axle, mask: Categories.support },
      friction: 0, density: 5, restitution: 0,
      render: { fillStyle: '#7E212C' },
      // isStatic: true
    });
  },

  axleCup: function (axle) {
    let r = axle.circleRadius;
    let x = axle.position.x;
    let y = axle.position.y + r + vminTOpx(0.2);
    return Bodies.fromVertices(x, y,
      Vertices.fromPath(`  
        0, 0
        0, ${4 * r}
        ${6 * r}, ${4 * r}
        ${6 * r}, 0
        ${4 * r}, 0
        ${3.9 * r}, ${2 * r}
        ${1.9 * r}, ${2 * r}
        ${2 * r}, 0`
      ),
      {
        collisionFilter: {
          group: Groups.nonColliding, category: Categories.support, mask: Categories.axle
        },
        density: 5, isStatic: true, restitution: 0,
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
    let leftPosX = posX - (1.9 * r) - (w / 2);
    let rightPosX = posX + (1.9 * r) + (w / 2);
    // let posY = (wheel.position.y + base.position.y) / 1.9;
    let a = 6 * r;
    let b = a + 2 * w;
    let centroidY = (b + 2 * a) / (3 * (a + b)) * h;

    // let posY = centroidY + wheel.position.y;
    let posY = base.top - centroidY;

    let color = '#192A56';

    return Body.create({
      parts: [
        Bodies.fromVertices(leftPosX, posY,
          Vertices.fromPath(`${w},0  0,${h}  ${w / 2},${h}  ${w},${h / 2}`),
          { render: { fillStyle: color, strokeStyle: color, lineWidth: vminTOpx(1) }, }
        ),
        Bodies.fromVertices(rightPosX, posY,
          Vertices.fromPath(`0,0  ${w},${h}  ${w / 2},${h}  0,${h / 2}`),
          { render: { fillStyle: color, strokeStyle: color, lineWidth: vminTOpx(1) }, }
        ),
      ],
      density: 5, mass: 1000, isStatic: true, restitution: 0,
      collisionFilter: {
        group: Groups.nonColliding, category: Categories.support, mask: Categories.axle
      }
    });
  }

};


function FerrisWheel(x_vw, y_vh) {
  let x = vwTOpx(x_vw);
  let y = vhTOpx(y_vh);
  this.radius = vminTOpx(40);
  this.axleRadius = vminTOpx(2);


  // wheel frame
  this.frame = CustomBodies.frame(x, y, this.radius);
  this.position = this.frame.position;

  // axle
  this.axle = CustomBodies.axle(x, y, this.axleRadius);

  // gondolas
  this.gondolas = [];
  for (let vertex of this.frame.vertices) {
    this.gondolas.push(CustomBodies.gondola(vertex.x, vertex.y));
  }

  // attachment point of axle and frame
  this.axis = Constraint.create({
    bodyA: this.frame,
    bodyB: this.axle,
    length: 0,
    stiffness: 1
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

function Ground(x_vw, y_vh, span_vw, thickness_vh) {
  let x = vwTOpx(x_vw);
  let y = vhTOpx(y_vh);
  this.span = vwTOpx(span_vw);
  this.thickness = vhTOpx(thickness_vh);
  this.body = Bodies.rectangle(x, y, this.span, this.thickness, { isStatic: true });
  this.position = this.body.position;
  this.top = y - (this.thickness / 2); // y of the top surface

  this.show = function () { World.add(engine.world, this.body); }
}

function Support(body, base) {
  // holder for wheel axle
  this.axleCup = CustomBodies.axleCup(body.axle);
  // dummy pedestal
  this.pedestal = CustomBodies.pedestal(this.axleCup, body, base);

  this.show = function () { World.add(engine.world, [this.pedestal, this.axleCup]); }
}


const ferrisWheel = new FerrisWheel(50, 50);
const ground = new Ground(50, 59.5 + pxTOvh(ferrisWheel.radius), 60, 1);
const support = new Support(ferrisWheel, ground);

// display them
ferrisWheel.show();
ground.show();
support.show();


// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);
