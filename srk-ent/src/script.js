// let vwInPx = width => (width * window.innerWidth) / 100;
let vhInPx = height => (height * window.innerHeight) / 100;

const container = document.querySelector(".container");
const anchor = document.querySelector(".anchor");
const navbar = document.querySelector(".navbar");
const logo = document.querySelector(".logo");
const logo_container = document.querySelector(".logo-container");

let navbar_orig_height;
let checkpoint;

window.onload = window.onresize = () => {
  checkpoint = logo_container.scrollHeight - navbar.scrollHeight - 1;
  navbar_orig_height = navbar.clientHeight;
};

container.addEventListener("scroll", () => {
  let current_pos = container.scrollTop;
  let ratio = current_pos / checkpoint;
  if (current_pos < checkpoint) {
    navbar.style.top = `${(1 - ratio) * -navbar_orig_height}px`;
    logo.style.opacity = Math.pow(1 - ratio, 4);
  } else {
    navbar.style.top = 0;
    logo.style.opacity = 0;
  }
});
