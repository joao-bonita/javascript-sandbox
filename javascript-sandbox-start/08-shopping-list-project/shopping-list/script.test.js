/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import {screen, within} from "@testing-library/dom";
import {userEvent} from "@testing-library/user-event";
import {promises as fs} from "fs";

let user;

const sideEffects = {
  document: {
    addEventListener: {
      fn: document.addEventListener,
      refs: [],
    },
    keys: Object.keys(document),
  },
  window: {
    addEventListener: {
      fn: window.addEventListener,
      refs: [],
    },
    keys: Object.keys(window),
  },
};

// Lifecycle Hooks
// -----------------------------------------------------------------------------
beforeAll(async () => {
  // Spy addEventListener
  ['document', 'window'].forEach(obj => {
    const fn = sideEffects[obj].addEventListener.fn;
    const refs = sideEffects[obj].addEventListener.refs;

    function addEventListenerSpy(type, listener, options) {
      // Store listener reference so it can be removed during reset
      refs.push({ type, listener, options });
      // Call original window.addEventListener
      fn(type, listener, options);
    }

    // Add to default key array to prevent removal during reset
    sideEffects[obj].keys.push('addEventListener');

    // Replace addEventListener with mock
    global[obj].addEventListener = addEventListenerSpy;
  });
});

// Reset JSDOM. This attempts to remove side effects from tests, however it does
// not reset all changes made to globals like the window and document
// objects. Tests requiring a full JSDOM reset should be stored in separate
// files, which is the only way to do a complete JSDOM reset with Jest.
beforeEach(async () => {
// Remove global listeners and keys
  ['document', 'window'].forEach(obj => {
    const refs = sideEffects[obj].addEventListener.refs;

    // Listeners
    while (refs.length) {
      const { type, listener, options } = refs.pop();
      global[obj].removeEventListener(type, listener, options);
    }

    // Keys
    Object.keys(global[obj])
    .filter(key => !sideEffects[obj].keys.includes(key))
    .forEach(key => {
      const globalObject = global[obj];
      if (globalObject[key] instanceof Function) {
        globalObject[key] = null;
      } else {
        delete globalObject[key];
      }
    });
  });

  await loadHtmlAndScript(
    "./javascript-sandbox-start/08-shopping-list-project/shopping-list/index.html",
    "./javascript-sandbox-start/08-shopping-list-project/shopping-list/script.js");

  jest.restoreAllMocks();

  user = userEvent.setup();
});

test("Should add an item to the bottom of the list when using the 'Add Item' button", async () => {
  const itemInput = screen.getByRole("textbox", {name: "Enter Item"});
  await user.click(itemInput);
  await user.type(itemInput, "Eggs");
  const addItemButton = screen.getByRole("button", {name: "Add Item"});
  await user.click(addItemButton);

  await user.clear(itemInput);
  await user.type(itemInput, "Cheese");
  await user.click(addItemButton);

  const itemsList = screen.getByRole("list");
  expect(itemsList.children.item(4)).toHaveTextContent("Eggs");
  expect(itemsList.children.item(5)).toHaveTextContent("Cheese");
});

test("Should add a 'remove item' button to a new item", async () => {
  const itemInput = screen.getByRole("textbox", {name: "Enter Item"});
  await user.click(itemInput);
  await user.type(itemInput, "Eggs");
  const addItemButton = screen.getByRole("button", {name: "Add Item"});
  await user.click(addItemButton);

  const newListItem = screen.getByRole("list").firstElementChild;
  const deleteButton = within(newListItem).getByRole("button");
  expect(deleteButton).toHaveClass("remove-item btn-link text-red");
  const xMark = deleteButton.firstElementChild;
  expect(xMark).not.toBeNull();
  expect(xMark.tagName).toBe("I");
  expect(xMark.className).toBe("fa-solid fa-xmark");

});

test("Should alert user if no item is typed in when 'Add Item' button is clicked", async () => {
  jest.spyOn(window, "alert").mockImplementation(() => {});

  const itemsList = screen.getByRole("list");
  const addItemButton = screen.getByRole("button", {name: "Add Item"});
  await user.click(addItemButton);

  expect(window.alert).toHaveBeenCalledWith("Please add an item");
  expect(itemsList.children.length).toBe(4);
})

test("Should clear item input after user adds an item", async () => {
  const itemInput = screen.getByRole("textbox", {name: "Enter Item"});
  await user.click(itemInput);
  await user.type(itemInput, "Eggs");
  const addItemButton = screen.getByRole("button", {name: "Add Item"});
  await user.click(addItemButton);

  expect(itemInput.value).toBe("");
});

async function loadHtmlAndScript(htmlFilepath, scriptFilepath) {
  await readHtmlBodyIntoJsDom(htmlFilepath);
  await addScriptToBody(scriptFilepath);
}

async function readHtmlBodyIntoJsDom(htmlFilepath) {
  const htmlContents = await fs.readFile(htmlFilepath, "utf8");
  const html= document.createElement("html");
  html.innerHTML = htmlContents;
  const newBody = html.querySelector("body");
  document.body.innerHTML = newBody.innerHTML;
}

async function addScriptToBody(scriptFilepath) {
  const scriptContents = await fs.readFile(scriptFilepath, "utf8");
  const scriptEl = document.createElement("script");
  scriptEl.textContent = scriptContents;
  document.body.replaceChild(scriptEl, document.body.querySelector(("script")));
}