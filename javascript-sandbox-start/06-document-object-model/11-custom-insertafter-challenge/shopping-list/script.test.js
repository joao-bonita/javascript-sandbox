const jsdom = require("jsdom");
const { JSDOM } = jsdom;

describe("insertAfter", () => {
  let window;

  beforeEach(async () => {
    dom = await JSDOM.fromFile(
      "./javascript-sandbox-start/06-document-object-model/11-custom-insertafter-challenge/shopping-list/index.html",
      {
        resources: "usable",
        runScripts: "dangerously"
      });
    await new Promise(resolve =>
      dom.window.addEventListener("load", resolve)
    );
    window = dom.window;
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