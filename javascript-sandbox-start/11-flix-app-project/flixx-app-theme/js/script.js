const BRITISH_ENGLISH = "en-GB";

function initialise() {
  highlightActiveLink();

  switch (getCurrentLocalPage()) {
    case "":
    case "index.html":
      displayPopularMovies();
      break;
  }
}


async function displayPopularMovies() {
  const popularMoviesGrid = document.getElementById("popular-movies");
  const popularMovies = await getPopularMovies();

  popularMovies.forEach(movie => {
    const movieCard = document.createElement("div");
    movieCard.classList.add("card");

    const detailsLink = document.createElement("a");
    detailsLink.href = `movie-details.html?id=${movie.id}`;

    const image = document.createElement("img");
    image.src = new URL(`/t/p/w500${movie.poster_path}`, "https://image.tmdb.org").toString();
    image.classList.add("card-img-top");
    image.alt = movie.title;

    detailsLink.appendChild(image);
    movieCard.appendChild(detailsLink);

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = movie.title;

    const cardText = document.createElement("p");
    cardText.classList.add("card-text");
    const releaseDate = document.createElement("small");
    releaseDate.classList.add("text-muted");
    releaseDate.textContent = `Release: ${getDisplayDate(movie.release_date)}`;

    cardText.appendChild(releaseDate);
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
    movieCard.appendChild(cardBody);

    popularMoviesGrid.appendChild(movieCard);
  });

  function getDisplayDate(date) {
    return new Intl.DateTimeFormat(BRITISH_ENGLISH, {
      dateStyle: "long",
      timeZone: "UTC"
    }).format(Date.parse(date));
  }
}

async function getPopularMovies() {
  return await doGetPopularMovies(THEMOVIEDB_BEARER_TOKEN);
}

async function doGetPopularMovies(bearerToken) {
  const url = new URL("/3/movie/popular", "https://api.themoviedb.org");
  url.searchParams.append("language", BRITISH_ENGLISH);
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
  const currentPage = getCurrentLocalPage();
  const navigationLinks = document.querySelectorAll(".nav-link");
  navigationLinks.forEach(link => {
    if (currentPage === link.getAttribute("href")) {
      link.classList.add("active");
    }
  });
}

function getCurrentLocalPage() {
  return getLocalPage(window.location.pathname);
}

function getLocalPage(locationPathname) {
  return locationPathname.substring(locationPathname.lastIndexOf("/") + 1);
}

document.addEventListener("DOMContentLoaded", initialise);

module.exports = {
  getLocalPage,
  doGetPopularMovies,
}