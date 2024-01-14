/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import {fireEvent, screen, within} from "@testing-library/dom";
import {userEvent} from "@testing-library/user-event";
import {promises as fs} from "fs";

let user;
let itemsList;

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
  itemsList = screen.getByRole("list");
});

describe("Adding items", () => {
  test("Should add an item to the bottom of the list when using the 'Add Item' button", async () => {
    await userAddAnItem("Eggs");
    await userAddAnItem("Cheese");

    expect(itemsList.children.item(0)).toHaveTextContent("Eggs");
    expect(itemsList.children.item(1)).toHaveTextContent("Cheese");
  });

  test("Should add a 'remove item' button to a new item", async () => {
    await userAddAnItem("Eggs");

    const newListItem = itemsList.firstElementChild;
    const removeItemButton = within(newListItem).getByRole("button");
    expect(removeItemButton).toHaveClass("remove-item btn-link text-red");
    const xMark = removeItemButton.firstElementChild;
    expect(xMark).not.toBeNull();
    expect(xMark.tagName).toBe("I");
    expect(xMark.className).toBe("fa-solid fa-xmark");
  });

  test("Should alert user if no item is typed in when 'Add Item' button is clicked", async () => {
    jest.spyOn(window, "alert").mockImplementation(() => {});

    const addItemButton = screen.getByRole("button", {name: "Add Item"});
    await user.click(addItemButton);

    expect(window.alert).toHaveBeenCalledWith("Please add an item");
    expect(itemsList.children.length).toBe(0);
  })

  test("Should clear item input after user adds an item", async () => {
    await userAddAnItem("Eggs");

    const itemInput = screen.getByRole("textbox", {name: "Enter Item"});
    expect(itemInput.value).toBe("");
  });

});

describe("Removing items", () => {

  test("should ask for removal confirmation when clicking on the 'remove item' button", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);
    await userAddAnItem("Eggs");

    const eggsItem = itemsList.firstElementChild;
    const removeEggsButton = within(eggsItem).getByRole("button");
    await user.click(removeEggsButton);

    expect(window.confirm).toHaveBeenCalledWith("Are you sure?");
  });

  test("Should remove item when clicking on the 'remove item' button and confirming", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);

    // Given we have 'Eggs' & 'Cheese' on the list
    await userAddAnItem("Eggs");
    await userAddAnItem("Cheese");

    // When we delete 'Eggs'
    const eggsItem = itemsList.firstElementChild;
    const removeEggsButton = within(eggsItem).getByRole("button");
    await user.click(removeEggsButton);

    // Then we end up with only 'Cheese'
    expect(itemsList.children.length).toBe(1);
    expect(itemsList.firstElementChild).toHaveTextContent("Cheese");
  });

  test("Should not remove item when clicking on the 'remove item' button and cancelling", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(false);

    // Given we have 'Eggs' & 'Cheese' on the list
    await userAddAnItem("Eggs");
    await userAddAnItem("Cheese");

    // When we try to delete 'Eggs' but cancel (see mock above)
    const eggsItem = itemsList.firstElementChild;
    const removeEggsButton = within(eggsItem).getByRole("button");
    await user.click(removeEggsButton);

    // Then we retain both items
    expect(itemsList.children.length).toBe(2);
  });

  test("Should remove item when clicking on the 'remove item' icon and confirming", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);

    // Given we have 'Eggs' & 'Cheese' on the list
    await userAddAnItem("Eggs");
    await userAddAnItem("Cheese");

    // When we delete 'Eggs'
    const eggsItem = itemsList.firstElementChild;
    const removeEggsButton = within(eggsItem).getByRole("button");
    const removeEggsIcon = removeEggsButton.firstElementChild;
    await user.click(removeEggsIcon);

    // Then we end up with only 'Cheese'
    expect(itemsList.children.length).toBe(1);
    expect(itemsList.firstElementChild).toHaveTextContent("Cheese");
  });

  test("Should not remove item when clicking on the item itself", async () => {
    // Given we have 'Eggs' & 'Cheese' on the list
    await userAddAnItem("Eggs");
    await userAddAnItem("Cheese");

    // When we delete 'Eggs'
    const eggsItem = itemsList.firstElementChild;
    fireEvent.click(eggsItem);

    // Then we end up with only 'Cheese'
    expect(itemsList.children.length).toBe(2);
    expect(itemsList.children.item(0)).toHaveTextContent("Eggs");
    expect(itemsList.children.item(1)).toHaveTextContent("Cheese");
  })

  test("Should remove all items when clicking on the 'Clear All' button", async () => {
    await userAddAnItem("Eggs");
    await userAddAnItem("Cheese");
    await userAddAnItem("Noodles");

    const clearAllButton = screen.getByRole("button", {name: "Clear All"});
    await user.click(clearAllButton);

    expect(itemsList.children.length).toBe(0);
  });
});

describe("Clear UI state (Show/hide Clear and Filter)", () => {
  describe.each([
    {name: "Clear All", role: "button"},
    {name: "Filter Items", role: "textbox"},
  ])("'$name' $role", ({name, role}) => {

    test(`Should not show '${name}' ${role} when page loads without any items`, () => {
      expect(itemsList.children.length).toBe(0);
      const widget = screen.queryByRole(role, {name: name});
      expect(widget).toBeNull();
    });

    test(`Should not show '${name}' ${role} when the last item is removed`, async () => {
      jest.spyOn(window, "confirm").mockReturnValue(true);
      await userAddAnItem("Eggs");

      const item = itemsList.firstElementChild;
      const removeEggsButton = within(item).getByRole("button");
      await user.click(removeEggsButton);

      const widget = screen.queryByRole(role, {name: name});
      expect(widget).toBeNull();
    });

    test(`Should not show ''${name}' ${role} when all items are cleared`, async () => {
      await userAddAnItem("Eggs");
      await userAddAnItem("Cheese");

      let clearAllButton = screen.getByRole("button", {name: "Clear All"});
      await user.click(clearAllButton);

      const widget = screen.queryByRole(role, {name: name});
      expect(widget).toBeNull();
    });

    test(`Should show ''${name}' ${role} at least one item is added to the list`, async () => {
      await userAddAnItem("Eggs");

      const widget = screen.queryByRole(role, {name: name});
      expect(widget).toBeInTheDocument();
    });
  });
});

describe("Filtering", () => {
  test.each([
    {filterText: "Z", visibleItems: []},
    {filterText: "Egg", visibleItems: ["Eggs", "Eggnog"]},
    {filterText: "egg", visibleItems: ["Eggs", "Eggnog"]},
    {filterText: "Eggs", visibleItems: ["Eggs"]},
    {filterText: "eggn", visibleItems: ["Eggnog"]},
    {filterText: "eggnogy", visibleItems: []},
    {filterText: "gg", visibleItems: ["Eggs", "Eggnog"]},
    {filterText: "e", visibleItems: ["Eggs", "Eggnog", "Cheese"]},
  ])("Should filter Eggs, Eggnog and Cheese down to $visibleItems when typing in '$filterText'", async ({filterText, visibleItems}) => {
    const allItems = ["Cheese", "Eggnog", "Eggs"];
    for (const item of allItems) {
      await userAddAnItem(item);
    }

    const filterItemsInput = screen.getByRole("textbox", {name: "Filter Items"});
    await user.type(filterItemsInput, filterText);

    const invisibleItems = allItems.filter(item => !visibleItems.includes(item));
    visibleItems.forEach(visibleItem => expect(within(itemsList).queryByText(visibleItem)).toBeVisible());
    invisibleItems.forEach(invisibleItem => expect(within(itemsList).queryByText(invisibleItem)).not.toBeVisible());
  });

  test("Should display filtered item again when filter is changed", async () => {
    await userAddAnItem("Eggs");
    await userAddAnItem("Eggnog");

    const filterItemsInput = screen.getByRole("textbox", {name: "Filter Items"});
    await user.type(filterItemsInput, "Eggs{Backspace}");

    expect(within(itemsList).queryByText("Eggs")).toBeVisible();
    expect(within(itemsList).queryByText("Eggnog")).toBeVisible();
  });
});

async function userAddAnItem(item) {
  const itemInput = screen.getByRole("textbox", {name: "Enter Item"});
  const addItemButton = screen.getByRole("button", {name: "Add Item"});

  await user.click(itemInput);
  await user.clear(itemInput);
  await user.type(itemInput, item);
  await user.click(addItemButton);
}

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