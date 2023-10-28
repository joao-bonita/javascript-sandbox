
function insertAfter(newElement, existingElement) {
  const parentElement = existingElement.parentElement;
  if (parentElement == null) {
    throw new Error(existingElement + " does not have a parent DOM element");
  }
  parentElement.insertBefore(newElement, existingElement.nextElementSibling);
}