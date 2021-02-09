"use strict";

var container = document.querySelector(".container");
var navbar = document.querySelector(".navbar");
var small_logo = document.querySelector(".small-logo");
var logo = document.querySelector(".logo");
var logo_container = document.querySelector(".logo-container");
var navbar_orig_height;
var checkpoint;

window.onload = window.onresize = function () {
  checkpoint = logo_container.scrollHeight - navbar.scrollHeight - 1;
  navbar_orig_height = navbar.clientHeight;
};

container.addEventListener("scroll", function () {
  var current_pos = container.scrollTop;
  var ratio = current_pos / checkpoint;

  if (current_pos < checkpoint) {
    navbar.style.top = "".concat((1 - ratio) * -navbar_orig_height, "px");
    logo.style.opacity = Math.pow(1 - ratio, 4);
    small_logo.style.opacity = ratio;
    navbar.classList.remove('shadow');
  } else {
    navbar.style.top = 0;
    navbar.classList.add('shadow');
    small_logo.style.opacity = 1;
    logo.style.opacity = 0;
  }
});