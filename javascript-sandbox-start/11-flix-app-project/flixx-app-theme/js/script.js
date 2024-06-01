const BRITISH_ENGLISH = "en-GB";

function initialise() {
  highlightActiveLink();

  switch (getCurrentLocalPage()) {
    case "":
    case "index.html":
      spinWhile(displayPopularMovies);
      break;
    case "shows.html":
      spinWhile(displayPopularTvShows);
      break;
  }
}

async function displayPopularMovies() {
  const popularMoviesGrid = document.getElementById("popular-movies");
  const popularMovies = await fetchPopularMovies();

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
}

async function displayPopularTvShows() {
  const popularShowsGrid = document.getElementById("popular-shows");
  const popularTvShows = await fetchPopularTvShows();

  popularTvShows.forEach(show => {
    const showCard = document.createElement("div");
    showCard.classList.add("card");

    const detailsLink = document.createElement("a");
    detailsLink.href = `tv-details.html?id=${show.id}`;

    const image = document.createElement("img");
    image.src = new URL(`/t/p/w500${show.poster_path}`, "https://image.tmdb.org").toString();
    image.classList.add("card-img-top");
    image.alt = show.name;

    detailsLink.appendChild(image);
    showCard.appendChild(detailsLink);

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = show.name;

    const cardText = document.createElement("p");
    cardText.classList.add("card-text");
    const airDate = document.createElement("small");
    airDate.classList.add("text-muted");
    airDate.textContent = `Release: ${getDisplayDate(show.first_air_date)}`;

    cardText.appendChild(airDate);
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
    showCard.appendChild(cardBody);

    popularShowsGrid.appendChild(showCard);
  });
}

function getDisplayDate(date) {
  return new Intl.DateTimeFormat(BRITISH_ENGLISH, {
    dateStyle: "long",
    timeZone: "UTC"
  }).format(Date.parse(date));
}

async function fetchPopularMovies() {
  return await doFetchPopularMovies(THEMOVIEDB_BEARER_TOKEN);
}

async function doFetchPopularMovies(bearerToken) {
  return await doFetchResults(bearerToken, "/3/movie/popular", {
    language: BRITISH_ENGLISH,
    page: "1",
    region: "GB"
  });
}

async function fetchPopularTvShows() {
  return await doFetchPopularTvShows(THEMOVIEDB_BEARER_TOKEN);
}

async function doFetchPopularTvShows(bearerToken) {
  return await doFetchResults(bearerToken, "/3/tv/popular", {
    language: BRITISH_ENGLISH,
    page: "1"
  });
}

async function doFetchResults(bearerToken, relativeUrl, parameters) {
  const url = new URL(relativeUrl, "https://api.themoviedb.org");
  for (const parameter in parameters) {
    url.searchParams.append(parameter, parameters[parameter]);
  }
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

async function spinWhile(task) {
  showSpinner();
  try {
    await task();
  } finally {
    hideSpinner();
  }
}

function showSpinner() {
  toggleSpinner(true);
}

function hideSpinner() {
  toggleSpinner(false);
}

function toggleSpinner(show) {
  const showClass = "show";
  const spinnerClasses = document.querySelector(".spinner").classList;
  if (show) {
    spinnerClasses.add(showClass);
  } else {
    spinnerClasses.remove(showClass);
  }
}

document.addEventListener("DOMContentLoaded", initialise);

module.exports = {
  getLocalPage,
  doFetchPopularMovies,
  doFetchPopularTvShows,
}