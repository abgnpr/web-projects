const container = document.querySelector(".container");
const navbar = document.querySelector(".navbar");
const small_logo = document.querySelector(".small-logo");
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
    small_logo.style.opacity = ratio;
    navbar.classList.remove('shadow')
  } else {
    navbar.style.top = 0;
    navbar.classList.add('shadow')
    small_logo.style.opacity = 1;
    logo.style.opacity = 0;
  }
});
