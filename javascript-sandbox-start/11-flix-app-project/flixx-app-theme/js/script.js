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
    case "movie-details.html":
      spinWhile(displayMovieDetails());
      break;
  }
}

async function displayPopularMovies() {
  await displayPopularProductions({
    fetchPopularProductions: fetchPopularMovies,
    gridId: "popular-movies",
    detailsPath: "movie-details.html",
    nameKey: "title",
    releaseDateKey: "release_date"
  });
}

async function displayPopularTvShows() {
  await displayPopularProductions({
    fetchPopularProductions: fetchPopularTvShows,
    gridId: "popular-shows",
    detailsPath: "tv-details.html",
    nameKey: "name",
    releaseDateKey: "first_air_date"
  });
}

async function displayPopularProductions(parameters) {
  const popularGrid = document.getElementById(parameters.gridId);
  const popularProductions = await parameters.fetchPopularProductions();

  popularProductions.forEach(production => {
    const titleCard = document.createElement("div");
    titleCard.classList.add("card");

    const detailsLink = document.createElement("a");
    detailsLink.href = `${parameters.detailsPath}?id=${production.id}`;
    detailsLink.appendChild(createPosterImage(production.poster_path, production[parameters.nameKey]));
    titleCard.appendChild(detailsLink);

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = production.title;

    const cardText = document.createElement("p");
    cardText.classList.add("card-text");
    const releaseDate = document.createElement("small");
    releaseDate.classList.add("text-muted");
    releaseDate.textContent = `Release: ${getDisplayDate(production[parameters.releaseDateKey])}`;

    cardText.appendChild(releaseDate);
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
    titleCard.appendChild(cardBody);

    popularGrid.appendChild(titleCard);
  });
}

async function displayMovieDetails() {
  const movieDetails = await doFetchMovieDetails(THEMOVIEDB_BEARER_TOKEN, getCurrentMovieId());

  const overlayDiv = document.createElement("div");
  overlayDiv.style.backgroundImage = `url(${imageUrlFor(movieDetails.backdrop_path, "original")})`;
  overlayDiv.style.backgroundSize = "cover";
  overlayDiv.style.backgroundPosition = "center";
  overlayDiv.style.backgroundRepeat = "no-repeat";
  overlayDiv.style.height = "100vh";
  overlayDiv.style.width = "100vw";
  overlayDiv.style.position = "absolute";
  overlayDiv.style.top = "0";
  overlayDiv.style.left = "0";
  overlayDiv.style.zIndex = "-1";
  overlayDiv.style.opacity = "0.1";

  const detailsTop = document.createElement("div");
  detailsTop.className = "details-top";

  const imageDiv = document.createElement("div");
  imageDiv.appendChild(createPosterImage(movieDetails.poster_path, movieDetails.title));

  const mainDetailsDiv = document.createElement("div");
  const titleHeading = document.createElement("h2");
  titleHeading.textContent = movieDetails.title;

  const starsParagraph = document.createElement("p");
  const starsIcon = document.createElement("i");
  starsIcon.classList.add("fas", "fa-star", "text-primary");
  const starsText= `${movieDetails.vote_average.toFixed(1)} / 10`;
  starsParagraph.appendChild(starsIcon);
  starsParagraph.appendChild(document.createTextNode(starsText));

  const releaseDateParagraph = document.createElement("p");
  releaseDateParagraph.className = "text-muted";
  releaseDateParagraph.textContent = `Release Date: ${getDisplayDate(movieDetails.release_date)}`;

  const overviewParagraph = document.createElement("p");
  overviewParagraph.textContent = movieDetails.overview;

  const genresHeading = document.createElement("h5");
  genresHeading.textContent = "Genres";
  const genresList = document.createElement("ul");
  genresList.className = "list-group";
  movieDetails.genres.forEach((genre) => {
    const genreListItem = document.createElement("li");
    genreListItem.textContent = genre.name;
    genresList.appendChild(genreListItem);
  });

  const homepageLink = document.createElement("a");
  homepageLink.href = movieDetails.homepage;
  homepageLink.target = "_blank";
  homepageLink.className = "btn";
  homepageLink.textContent = "Visit Movie Homepage";

  mainDetailsDiv.appendChild(titleHeading);
  mainDetailsDiv.appendChild(starsParagraph);
  mainDetailsDiv.appendChild(releaseDateParagraph);
  mainDetailsDiv.appendChild(overviewParagraph);
  mainDetailsDiv.appendChild(genresHeading);
  mainDetailsDiv.appendChild(genresList);
  mainDetailsDiv.appendChild(homepageLink);

  detailsTop.appendChild(imageDiv);
  detailsTop.appendChild(mainDetailsDiv);

  const detailsBottom = document.createElement("div");
  detailsBottom.className = "details-bottom";

  const infoHeading = document.createElement("h2");
  infoHeading.textContent = "Movie Info";

  const infoList = document.createElement("ul");
  infoList.appendChild(createMovieInfoItemElement("Budget", getDisplayUsDollars(movieDetails.budget)));
  infoList.appendChild(createMovieInfoItemElement("Revenue", getDisplayUsDollars(movieDetails.revenue)));
  infoList.appendChild(createMovieInfoItemElement("Runtime", `${movieDetails.runtime} minutes`));
  infoList.appendChild(createMovieInfoItemElement("Status", movieDetails.status));

  const companiesHeading = document.createElement("h4");
  companiesHeading.textContent = "Production Companies";
  const companiesDiv = document.createElement("div");
  companiesDiv.className = "list-group";
  companiesDiv.textContent = movieDetails.production_companies
      .map(details => details.name)
      .join(", ");

  detailsBottom.appendChild(infoHeading);
  detailsBottom.appendChild(infoList);
  detailsBottom.appendChild(companiesHeading);
  detailsBottom.appendChild(companiesDiv);

  const movieDetailsDiv = document.getElementById("movie-details");
  movieDetailsDiv.appendChild(overlayDiv);
  movieDetailsDiv.appendChild(detailsTop);
  movieDetailsDiv.appendChild(detailsBottom);

  function createMovieInfoItemElement(name, value) {
    const listItem = document.createElement("li");
    const span = document.createElement("span");
    span.className = "text-secondary";
    span.textContent = name + ':';
    listItem.appendChild(span);
    listItem.appendChild(document.createTextNode(" " + value));
    return listItem;
  }
}

function createPosterImage(posterPath, altText) {
  const image = document.createElement("img");
  image.src = imageUrlFor(posterPath, "w500").toString();
  image.classList.add("card-img-top");
  image.alt = altText;
  return image;
}

function imageUrlFor(pathToImage, size) {
  return new URL(`/t/p/${size}${pathToImage}`, "https://image.tmdb.org");
}

function getDisplayDate(date) {
  return new Intl.DateTimeFormat(BRITISH_ENGLISH, {
    dateStyle: "long",
    timeZone: "UTC"
  }).format(Date.parse(date));
}

function getDisplayUsDollars(usDollarAmount) {
  return new Intl.NumberFormat(BRITISH_ENGLISH, {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0
  }).format(usDollarAmount);
}

async function fetchPopularMovies() {
  return await doFetchPopularMovies(THEMOVIEDB_BEARER_TOKEN);
}

async function doFetchPopularMovies(bearerToken) {
  const data = await doFetchApiData(bearerToken, "/3/movie/popular", {
    language: BRITISH_ENGLISH,
    page: "1",
    region: "GB"
  });
  return data.results;
}

async function fetchPopularTvShows() {
  return await doFetchPopularTvShows(THEMOVIEDB_BEARER_TOKEN);
}

async function doFetchPopularTvShows(bearerToken) {
  const data = await doFetchApiData(bearerToken, "/3/tv/popular", {
    language: BRITISH_ENGLISH,
    page: "1"
  });
  return data.results;
}

async function doFetchMovieDetails(bearerToken, movieId) {
  return await doFetchApiData(bearerToken, `/3/movie/${movieId}`, {
    language: BRITISH_ENGLISH
  });
}

function getCurrentMovieId() {
  return getMovieIdFromLocation(window.location);
}

function getMovieIdFromLocation(location) {
  return Number(new URL(location).searchParams.get("id"));
}

async function doFetchApiData(bearerToken, relativeUrl, parameters) {
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
  return await response.json();
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
  doFetchMovieDetails,
  getMovieIdFromLocation,
  getDisplayUsDollars,
}