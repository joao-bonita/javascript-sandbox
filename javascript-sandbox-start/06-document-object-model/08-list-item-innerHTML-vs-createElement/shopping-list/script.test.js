const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let dom;

beforeEach(async () => {
  dom = await JSDOM.fromFile(
    "./javascript-sandbox-start/06-document-object-model/08-list-item-innerHTML-vs-createElement/shopping-list/index.html",
    {
      resources: "usable",
      runScripts: "dangerously"
    });
  await new Promise(resolve =>
    dom.window.addEventListener("load", resolve)
  );
});

test("createListItem should add new item to the beginning of the list", async () => {
  dom.window.createListItem("Noodles");

  const itemList = dom.window.document.querySelector("#item-list");
  expect(itemList.firstElementChild.textContent).toContain("Noodles");
});

test("createListItem should add a delete button to the new item", async () => {
  dom.window.createListItem("Cheese");

  const newItem = dom.window.document.querySelector("li");
  const deleteButton = newItem.firstElementChild;
  expect(deleteButton.tagName).toBe("BUTTON");
  expect(deleteButton.className).toBe("remove-item btn-link text-red");
  expect(deleteButton.firstElementChild.tagName).toBe("I");
  expect(deleteButton.firstElementChild.className).toBe("fa-solid fa-xmark");
});