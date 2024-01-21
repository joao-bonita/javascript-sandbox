
function runMyJavascript() {
  const STORAGE_KEY = "items";
  const itemForm = document.getElementById("item-form");
  const itemsList = document.getElementById("item-list");
  const clearAllButton = document.getElementById("clear");
  const filterItemsInput = document.getElementById("filter");

  function addItemToList(event) {
    event.preventDefault();
    const itemInput = document.getElementById("item-input");
    const newItem = itemInput.value;
    if (newItem.length === 0) {
      alert("Please add an item");
      return;
    }
    addItemToPage(newItem);
    itemInput.value = "";
    toggleClearAndFilter();
    addItemToStorage(newItem);
  }

  function addItemToPage(itemToAdd) {
    const itemElement = document.createElement("li");
    itemElement.appendChild(document.createTextNode(itemToAdd));
    const removeItemButton = newRemoveItemButton();
    itemElement.appendChild(removeItemButton);
    itemsList.appendChild(itemElement);
  }

  function newRemoveItemButton() {
    const button = document.createElement("button");
    button.className = "remove-item btn-link text-red";

    const xMark = document.createElement("i");
    xMark.className = "fa-solid fa-xmark";

    button.appendChild(xMark);
    return button;
  }

  function addItemToStorage(itemToAdd) {
    const itemsInStorage = getItemsFromLocalStorage();
    itemsInStorage.push(itemToAdd);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsInStorage));
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
      if (confirm("Are you sure?")) {
        elementToRemove.remove();
      }
    }

    toggleClearAndFilter();
  }

  function removeAllItemsFromList() {
    let listItem;
    while ((listItem = itemsList.firstElementChild) != null) {
      listItem.remove();
    }
    toggleClearAndFilter();
  }

  function displayItemsFromLocalStorage() {
    getItemsFromLocalStorage().forEach(item => addItemToPage(item));
  }

  function getItemsFromLocalStorage() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  }

  function toggleClearAndFilter() {
    if (itemsList.children.length === 0) {
      clearAllButton.style.display = "none";
      filterItemsInput.style.display = "none";
    } else {
      clearAllButton.style.display = "";
      filterItemsInput.style.display = "";
    }
  }

  function filterItems(inputEvent) {
    const filterText = inputEvent.target.value.toLowerCase();
    for (const item of itemsList.children) {
      if (!item.textContent.toLowerCase().includes(filterText)) {
        item.style.display = "none";
      } else {
        item.style.display = "";
      }
    }
  }

  function initialise() {
    itemForm.addEventListener("submit", addItemToList);
    itemsList.addEventListener("click", removeItemFromList);
    clearAllButton.addEventListener("click", removeAllItemsFromList);
    filterItemsInput.addEventListener("input", filterItems);
    displayItemsFromLocalStorage();
    toggleClearAndFilter();
  }

  initialise();
}

runMyJavascript();