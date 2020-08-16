const lock = document.querySelector('.lock');
const lockedIcon = '/images/locked.png';
const unockedIcon = '/images/unlocked.png';
const spinToggle = document.querySelector('.spin-toggle');


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


// true when mouse events are active
let mouseInUse = false;

Events.on(mouseConstraint, "mousedown", function (e) {
  mouseInUse = true;
});

Events.on(mouseConstraint, "mouseup", function (e) {
  mouseInUse = false;
});


// Angular Velocity settings
Events.on(engine, 'beforeUpdate', function (e) {
  if (!mouseInUse && spin.on && ferrisWheel.frame.angularVelocity <= 0.002) {
    Body.setAngularVelocity(ferrisWheel.frame, 0.002);
  }
});
