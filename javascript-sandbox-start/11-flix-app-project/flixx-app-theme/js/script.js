const {THEMOVIEDB_BEARER_TOKEN} = require("./secrets");

function initialise() {
  highlightActiveLink();
}

async function getPopularMovies() {
  return await doGetPopularMovies(THEMOVIEDB_BEARER_TOKEN);
}

async function doGetPopularMovies(bearerToken) {
  const url = new URL("/3/movie/popular", "https://api.themoviedb.org");
  url.searchParams.append("language", "en-GB");
  url.searchParams.append("page", "1");
  url.searchParams.append("region", "GB");

  const response = await fetch(url.toString(), {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${bearerToken}`
    }
  });
  const data = await response.json();
  return data.results;
}

function highlightActiveLink() {
  const currentPage = getCurrentLocalPage(window.location.pathname);
  const navigationLinks = document.querySelectorAll(".nav-link");
  navigationLinks.forEach(link => {
    if (currentPage === link.getAttribute("href")) {
      link.classList.add("active");
    }
  });
}

function getCurrentLocalPage(locationPathname) {
  return locationPathname.substring(locationPathname.lastIndexOf("/") + 1);
}

document.addEventListener("DOMContentLoaded", initialise);

module.exports = {
  getCurrentLocalPage,
  doGetPopularMovies,
}