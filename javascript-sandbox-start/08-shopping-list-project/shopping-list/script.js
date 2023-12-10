
function runMyJavascript() {
  const itemForm = document.getElementById("item-form");


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
    const deleteButton = newDeleteButton();
    itemElement.appendChild(deleteButton);
    const itemsList = document.getElementById("item-list");
    itemsList.appendChild(itemElement);
    itemInput.value = "";
  }

  function newDeleteButton() {
    const button = document.createElement("button");
    button.className = "remove-item btn-link text-red";

    const xMark = document.createElement("i");
    xMark.className = "fa-solid fa-xmark";

    button.appendChild(xMark);
    return button;
  }

  itemForm.addEventListener("submit", addItemToList);
}

runMyJavascript();