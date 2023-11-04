function clearAllListItems() {
  const itemList = window.document.querySelector("#item-list");
  const items = Array.from(itemList.children);
  items.forEach(element => element.remove());
}

window.document.querySelector("#clear").addEventListener("click", clearAllListItems);