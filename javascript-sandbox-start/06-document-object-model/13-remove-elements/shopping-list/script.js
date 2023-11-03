function removeItem(itemNumber) {
  document.querySelectorAll("li").item(itemNumber - 1).remove();
}