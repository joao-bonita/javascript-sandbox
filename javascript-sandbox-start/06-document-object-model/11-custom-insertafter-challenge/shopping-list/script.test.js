const {loadJsDomFromFile} = require("../../../testing/Testing");

describe("insertAfter", () => {
  let window;

  beforeEach(async () => {
    window = (await loadJsDomFromFile(
      "./javascript-sandbox-start/06-document-object-model/11-custom-insertafter-challenge/shopping-list/index.html",
    )).window;
  });

  test("first element of parent", () => {
    const itemList = window.document.querySelector("#item-list");

    let newItem = window.document.createElement("li");
    newItem.textContent = "Cheese";
    window.insertAfter(newItem, itemList.firstElementChild);

    expect(itemList.querySelector("li:nth-child(2)").textContent).toContain("Cheese");
  });

  test("middle element of parent", () => {
    const itemList = window.document.querySelector("#item-list");

    let newItem = window.document.createElement("li");
    newItem.textContent = "Cheese";
    window.insertAfter(newItem, itemList.querySelector("li:nth-child(2)"));

    expect(itemList.querySelector("li:nth-child(3)").textContent).toContain("Cheese");
  });

  test("last element of parent", () => {
    const itemList = window.document.querySelector("#item-list");

    let newItem = window.document.createElement("li");
    newItem.textContent = "Cheese";
    window.insertAfter(newItem, itemList.lastElementChild);

    expect(itemList.lastElementChild.textContent).toContain("Cheese");
  });

  test("element without a parent", () => {
    let newElement = window.document.createElement("li");
    newElement.textContent = "Cheese";
    expect(() => window.insertAfter(newElement, window.document.createElement("br")))
      .toThrow("does not have a parent DOM element");
  })
});