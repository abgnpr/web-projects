const display = document.querySelector(".digital-display");
const leftBtn = document.getElementById("left");
const rightBtn = document.getElementById("right");
const lapsCont = document.querySelector(".laps");
const lapsList = document.querySelector(".laps .list");

class Stopwatch {
  constructor() {
    this.startTime, this.pauseTime, this.interval;
    this.isPaused = false;
    this.pauseDuration = 0;
    this.lapNo = 1;
    
    display.textContent = "00 : 00 : 00 : 0";
    while (lapsList.childElementCount > 0) {
      lapsList.lastChild.remove();
    }
    lapsCont.classList.add('hidden');
  }

  timeElapsed() {
    // total time elapsed in deciseconds
    let elapsed = Math.floor(
      (Date.now() - this.startTime - this.pauseDuration) * 0.01 // ms * 0.01 -> ds
    );

    // conversion
    let h = Math.floor(elapsed / 36000); // 1 hr = 36000 ds
    let m = Math.floor((elapsed - h * 36000) / 600); // 1 min = 600 ds
    let s = Math.floor((elapsed - (h * 36000 + m * 600)) / 10); // 1 sec = 10 ds
    let ds = elapsed % 10; // remaining

    // fill 0
    if (h.toString().length === 1) h = "0" + h;
    if (m.toString().length === 1) m = "0" + m;
    if (s.toString().length === 1) s = "0" + s;

    return `${h} : ${m} : ${s} : ${ds}`;
  }

  start_resume() {
    if (this.isPaused) {
      this.pauseDuration += Date.now() - this.pauseTime;
    } else {
      this.startTime = Date.now();
    }

    this.interval = setInterval(
      () => (display.textContent = this.timeElapsed()),
      100
    );
  }

  pause() {
    clearInterval(this.interval);
    this.pauseTime = Date.now();
    this.isPaused = true;
  }

  lap() {
    let lap = document.createElement("div");
    lap.className = "lap";
    lap.innerHTML = `<span>${this.lapNo++}</span>. ${this.timeElapsed()}`;
    lapsList.appendChild(lap);
    lap.scrollIntoView({ behavior: "smooth" });
  }
}

let stopwatch = new Stopwatch();

leftBtn.onclick = () => {
  if (leftBtn.textContent === "play_arrow") {
    stopwatch.start_resume();
    leftBtn.textContent = "pause";
    rightBtn.textContent = "timelapse";
  } else if (leftBtn.textContent === "pause") {
    stopwatch.pause();
    leftBtn.textContent = "play_arrow";
    rightBtn.textContent = "replay";
  }
};

rightBtn.onclick = () => {
  if (rightBtn.textContent === "replay") {
    stopwatch = new Stopwatch();
  } else if (rightBtn.textContent === "timelapse") {
    lapsCont.classList.remove('hidden')
    stopwatch.lap();
  }
};
