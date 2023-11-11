const keyboardEventProperties = ["key", "keyCode", "code"];
window.addEventListener("keypress", event => {
  const allBoxes = window.document
    .getElementById("insert")
    .children;

  Array.from(allBoxes).forEach((box, index) => {
    box.firstChild.textContent = event[keyboardEventProperties[index]];
  });
});