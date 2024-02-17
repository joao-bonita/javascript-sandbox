function runMyJavascript() {
  const button = document.getElementById("joke-btn");
  const jokeDiv = document.getElementById("joke");
  button.addEventListener("click", loadRandomJoke);
  loadRandomJoke();

  function loadRandomJoke() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.chucknorris.io/jokes/random");
    xhr.onreadystatechange = function() {
      if (this.readyState === 4) {
        let textToShow;
        if (this.status === 200) {
          textToShow = JSON.parse(this.responseText).value;
        } else {
          textToShow = "Sorry, we couldn't get a joke";
        }
        jokeDiv.textContent = textToShow;
      }
    }
    xhr.send();
  }
}

runMyJavascript();