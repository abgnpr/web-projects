"use strict";

var container = document.querySelector(".container");
var anchor = document.querySelector(".anchor");
var navbar = document.querySelector(".navbar");
var observer = new IntersectionObserver(function (entries) {
  if (entries[entries.length - 1].intersectionRatio > 0) {
    navbar.classList.remove("show"); // hide

    console.log("hide");
  } else {
    navbar.classList.add("show");
    console.log("show");
  }
}, {
  root: null,
  rootMargin: "0px",
  threshold: 1.0
});
observer.observe(anchor);