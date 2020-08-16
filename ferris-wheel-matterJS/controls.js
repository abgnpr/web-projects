const lock = document.querySelector('.lock');
const lockedIcon = './images/locked.png';
const unockedIcon = './images/unlocked.png';
const spinToggle = document.querySelector('.spin-toggle');
const speedControl = document.querySelector('.speed-slider');

// axle lock (default: locked)
let axleLocked = ferrisWheel.axle.isStatic;
lock.setAttribute('src', axleLocked ? lockedIcon : unockedIcon);

lock.addEventListener('click', function (e) {
  if (axleLocked) {
    // ferrisWheel.axle.isStatic = false;
    Body.setStatic(ferrisWheel.axle, false);
    lock.setAttribute('src', unockedIcon);
    axleLocked = false;

  } else {
    // ferrisWheel.axle.isStatic = true;
    Body.setStatic(ferrisWheel.axle, true);
    lock.setAttribute('src', lockedIcon);
    axleLocked = true;
  }
});


// spin controls
let spin = {

  on: true, // default: spinning

  toggleOff: function () {
    this.on = false;
    spinToggle.classList.remove('spinning');
  },

  toggleOn: function () {
    this.on = true;
    spinToggle.classList.add('spinning');
  }

};

// turns spin on or off when the toggle icon is clicked
spinToggle.addEventListener('click', function (e) {
  (spin.on) ? spin.toggleOff() : spin.toggleOn();
});


let mouseInUse = false; // true when mouse events are active
Events.on(mouseConstraint, "mousedown", () => { mouseInUse = true; });
Events.on(mouseConstraint, "mouseup", () => { mouseInUse = false });

// range (0.000 - 0.100)
let angularVelocity = speedControl.value / 1000;

speedControl.addEventListener('input', function (e) {
  angularVelocity = speedControl.value / 1000;
});

// Angular Velocity settings
Events.on(engine, 'beforeUpdate', function (e) {
  if (!mouseInUse && spin.on && ferrisWheel.frame.angularVelocity <= angularVelocity) {
    Body.setAngularVelocity(ferrisWheel.frame, angularVelocity);
  }
});
