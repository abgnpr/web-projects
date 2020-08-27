const castlesContiner = document.querySelector(".castles-container");

fetch("data.json")
  .then(res => {
    if (res.ok) return res.json();
    else throw new Error("Failed to fetch data.json");
  })
  .then(displayCastles)
  .catch(e => console.log(e.message));

function displayCastles(castles) {
  castles.forEach(castle => {
    let name = document.createElement("h2");
    name.textContent = castle.name;

    let img = document.createElement("img");
    fetchAndSetImg(castle.imgSrc, img);

    let desc = document.createElement("p");
    desc.textContent = castle.desc;

    let castleDiv = document.createElement("div");
    castleDiv.className = "castle";
    castleDiv.append(name, img, desc);

    castlesContiner.appendChild(castleDiv);
  });
}

function fetchAndSetImg(url, imgElement) {
  return fetch(url)
    .then(res => {
      if (res.ok) return res.blob();
      else throw new Error(`Couldn't fetch ${url}\nstatus: ${res.status}`);
    })
    .then(imgBlob => {
      imgElement.src = URL.createObjectURL(imgBlob);
    })
    .catch(e => console.log(e.message));
}

document.getElementById("scroll-down").addEventListener("click", function () {
  castlesContiner.scrollIntoView({ behavior: "smooth" });
});
