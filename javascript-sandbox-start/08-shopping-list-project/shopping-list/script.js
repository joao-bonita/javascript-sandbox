
function runMyJavascript() {
  const STORAGE_KEY = "items";
  const EDIT_MODE_CLASS = "edit-mode";

  const itemForm = document.getElementById("item-form");
  const itemInput = document.getElementById("item-input");
  const formButton = itemForm.querySelector("button");
  const itemsList = document.getElementById("item-list");
  const clearAllButton = document.getElementById("clear");
  const filterItemsInput = document.getElementById("filter");

  function onFormSubmit(event) {
    event.preventDefault();
    const newItem = itemInput.value;
    if (newItem.length === 0) {
      alert("Please add an item");
      return;
    }

    const itemToEdit = itemsList.querySelector(`.${EDIT_MODE_CLASS}`);
    if (itemToEdit !== null) {
      editItem(itemToEdit, newItem);
    } else {
      addNewItem(newItem);
    }
  }

  function addNewItem(newItem) {
    if (checkForDuplicateItem(newItem)) {
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

  function editItem(itemToEdit, newItem) {
    const oldItem = itemToEdit.firstChild.textContent;
    if (newItem !== oldItem && checkForDuplicateItem(newItem)) {
      return;
    }
    itemToEdit.firstChild.textContent = newItem;
    itemToEdit.classList.remove(EDIT_MODE_CLASS);
    itemInput.value = "";

    const itemsInStorage = getItemsFromLocalStorage();
    let indexToReplace = itemsInStorage.indexOf(oldItem);
    if (indexToReplace === -1) {
      indexToReplace = itemsInStorage.length;
    }
    itemsInStorage.splice(indexToReplace, 1, newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsInStorage));

    styleFormButton(["fa-solid", "fa-plus"], "Add Item", "rgb(51, 51, 51)");
  }

  function checkForDuplicateItem(newItem) {
    if (getItemsFromLocalStorage().includes(newItem)) {
      alert("That item already exists!");
      return true;
    }
    return false;
  }

  function onClickItem(event) {
    const elementClicked = event.target;
    let itemToRemove;

    if (elementClicked.tagName === "I") {
      itemToRemove = elementClicked.parentElement.parentElement;
    } else if (elementClicked.tagName === "BUTTON") {
      itemToRemove = elementClicked.parentElement;
    }

    if (itemToRemove !== undefined) {
      removeItemFromList(itemToRemove);
    } else {
      setItemToEditMode(elementClicked);
    }
  }

  function removeItemFromList(itemElement) {
    if (itemElement !== undefined) {
      if (confirm("Are you sure?")) {
        itemElement.remove();
        removeItemFromStorage(itemElement.textContent);
      }
    }
    toggleClearAndFilter();
  }

  function setItemToEditMode(elementClicked) {
    for (const item of itemsList.children) {
      if (item === elementClicked) {
        item.classList.add(EDIT_MODE_CLASS);
      } else {
        item.classList.remove(EDIT_MODE_CLASS);
      }
    }
    styleFormButton(["fa-solid", "fa-pen"], "Update Item", "rgb(34, 139, 34)");
    itemInput.value = elementClicked.textContent;
  }

  function styleFormButton(classList, text, color) {
    const newButtonI = document.createElement("I");
    classList.forEach(clazz => newButtonI.classList.add(clazz));
    const newButtonText = document.createTextNode(text);
    formButton.replaceChildren(newButtonI, newButtonText);
    formButton.style.backgroundColor = color;
  }

  function removeItemFromStorage(elementToRemove) {
    const itemsInStorage = getItemsFromLocalStorage();
    const indexToRemove = itemsInStorage.indexOf(elementToRemove);
    if (indexToRemove !== -1) {
      itemsInStorage.splice(indexToRemove, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsInStorage));
    }
  }

  function removeAllItemsFromList() {
    let listItem;
    while ((listItem = itemsList.firstElementChild) != null) {
      listItem.remove();
    }
    localStorage.removeItem(STORAGE_KEY);
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
    itemForm.addEventListener("submit", onFormSubmit);
    itemsList.addEventListener("click", onClickItem);
    clearAllButton.addEventListener("click", removeAllItemsFromList);
    filterItemsInput.addEventListener("input", filterItems);
    displayItemsFromLocalStorage();
    toggleClearAndFilter();
  }

  initialise();
}

runMyJavascript();