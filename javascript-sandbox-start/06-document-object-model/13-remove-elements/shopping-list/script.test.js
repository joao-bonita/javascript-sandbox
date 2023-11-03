const {loadJsDomFromFile} = require("../../../testing/Testing");

describe("removeItem", () => {
  let window;

  beforeEach(async () => {
    window = (await loadJsDomFromFile(
      "./javascript-sandbox-start/06-document-object-model/13-remove-elements/shopping-list/index.html"
    )).window;
  });

  test.each([1, 2, 3, 4])("should remove item %p from list", (itemToRemove) => {
    const shouldBeRemoved = window.document.querySelectorAll("li").item(itemToRemove - 1);
    window.removeItem(itemToRemove);
    expect(window.document.querySelectorAll("li")).not.toContain(shouldBeRemoved);
  });
});