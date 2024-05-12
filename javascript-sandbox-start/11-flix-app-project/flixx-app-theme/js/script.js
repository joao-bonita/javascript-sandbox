function initialise() {
  highlightActiveLink();
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
  getCurrentLocalPage
}