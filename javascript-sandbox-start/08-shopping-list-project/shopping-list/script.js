
function runMyJavascript() {
  const itemForm = document.getElementById("item-form");

  function addItemToList(event) {
    event.preventDefault();
    const newItem = document.getElementById("item-input").value;
    const itemElement = document.createElement("li");
    itemElement.textContent = newItem;
    const itemsList = document.getElementById("item-list");
    itemsList.prepend(itemElement);
  }

  itemForm.addEventListener("submit", addItemToList);
}

runMyJavascript();