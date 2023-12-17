
function runMyJavascript() {
  const itemForm = document.getElementById("item-form");
  const itemsList = document.getElementById("item-list");
  const clearAllButton = document.getElementById("clear");

  function addItemToList(event) {
    event.preventDefault();
    const itemInput = document.getElementById("item-input");
    const newItem = itemInput.value;
    if (newItem.length === 0) {
      alert("Please add an item");
      return;
    }
    const itemElement = document.createElement("li");
    itemElement.appendChild(document.createTextNode(newItem));
    const removeItemButton = newRemoveItemButton();
    itemElement.appendChild(removeItemButton);
    itemsList.appendChild(itemElement);
    itemInput.value = "";
  }

  function removeItemFromList(event) {
    const elementClicked = event.target;
    let elementToRemove;

    if (elementClicked.tagName === "I") {
      elementToRemove = elementClicked.parentElement.parentElement;
    } else if (elementClicked.tagName === "BUTTON") {
      elementToRemove = elementClicked.parentElement;
    }

    if (elementToRemove !== undefined) {
      elementToRemove.remove();
    }
  }

  function removeAllItemsFromList() {
    let listItem;
    while ((listItem = itemsList.firstElementChild) != null) {
      listItem.remove();
    }
  }

  function newRemoveItemButton() {
    const button = document.createElement("button");
    button.className = "remove-item btn-link text-red";

    const xMark = document.createElement("i");
    xMark.className = "fa-solid fa-xmark";

    button.appendChild(xMark);
    return button;
  }

  itemForm.addEventListener("submit", addItemToList);
  itemsList.addEventListener("click", removeItemFromList);
  clearAllButton.addEventListener("click", removeAllItemsFromList);
}

runMyJavascript();