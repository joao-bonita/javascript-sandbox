const {loadJsDomFromFile} = require("../../../testing/Testing");

let window;

beforeEach(async () => {
  window = (await loadJsDomFromFile(
    "./javascript-sandbox-start/07-events/01-event-listeners/shopping-list/index.html"
  )).window;
});

afterEach(() => {
  window.close();
});

test("Clicking on the 'Clear All' button should clear all items from the list", async() => {
  expect.assertions(1);

  const clearButton = window.document.querySelector("#clear");
  clearButton.addEventListener("click", () => {
    const itemList = window.document.querySelector("#item-list");
    expect(itemList.childElementCount).toBe(0);
  });

  clearButton.click();
});
