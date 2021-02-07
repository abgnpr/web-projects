const container = document.querySelector(".container");
const anchor = document.querySelector(".anchor");
const navbar = document.querySelector(".navbar");

const observer = new IntersectionObserver(
  entries => {
    if (entries[entries.length - 1].intersectionRatio > 0) {
      navbar.classList.remove("show"); // hide
      console.log("hide");
    } else {
      navbar.classList.add("show");
      console.log("show");
    }
  },
  {
    root: null,
    rootMargin: "0px",
    threshold: 1.0,
  }
);

observer.observe(anchor);
