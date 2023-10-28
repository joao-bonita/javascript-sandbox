function createListItem(item) {
  const newItem = document.createElement("li");
  newItem.appendChild(document.createTextNode(item));

  const deleteButton = createDeleteButton();
  newItem.appendChild(deleteButton);

  document.querySelector("#item-list").prepend(newItem);
}

function createDeleteButton() {
  const deleteButton = document.createElement("button");
  deleteButton.className = "remove-item btn-link text-red";

  const icon = createDeleteIcon();
  deleteButton.appendChild(icon);

  return deleteButton;
}
function createDeleteIcon() {
  const deleteButtonIcon = document.createElement("i");
  deleteButtonIcon.className = "fa-solid fa-xmark";
  return deleteButtonIcon;
}

createListItem("Noddles");
createListItem("Battery");
