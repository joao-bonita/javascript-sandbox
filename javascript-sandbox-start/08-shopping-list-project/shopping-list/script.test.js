/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import {fireEvent, screen, within} from "@testing-library/dom";
import {userEvent} from "@testing-library/user-event";
import {loadHtmlAndScript} from "../../testing/MoreTesting";

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

  localStorage.clear();
  jest.restoreAllMocks();

  await loadShoppingListPage();

  user = userEvent.setup();
  itemsList = screen.getByRole("list");
});

describe("Initial page load", () => {
  test("Should display items stored in local storage",done => {
    localStorage.setItem("items", '["Eggs","Cheese"]');

    expect.assertions(2);
    const onLoaded = async () => {
      const itemsList = screen.getByRole("list"); // Must query new list in DOM
      expect(within(itemsList).getByText("Eggs")).toBeInTheDocument();
      expect(within(itemsList).getByText("Cheese")).toBeInTheDocument();
      done();
    };

    loadShoppingListPage(onLoaded); // Must reload page to see items in local storage
  });
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

  test("Should add items to local storage", async () => {
    await userAddAnItem("Eggs");
    await userAddAnItem("Cheese");

    expect(localStorage.getItem("items")).toBe('["Eggs","Cheese"]');
  });

  test("Should not allow a duplicate item to be added", async () => {
    jest.spyOn(window, "alert").mockImplementation(() => {});
    await userAddAnItem("Eggs");

    await userAddAnItem("Eggs");

    expect(window.alert).toHaveBeenCalledWith("That item already exists!");
    expect(itemsList.children.length).toBe(1);
  });
});

describe("Removing items", () => {

  test("Should ask for removal confirmation when clicking on the 'remove item' button", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);
    await userAddAnItem("Eggs");

    await userRemoveAnItemViaRemoveButton("Eggs");

    expect(window.confirm).toHaveBeenCalledWith("Are you sure?");
  });

  test("Should remove item from page when clicking on the 'remove item' button and confirming", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);

    // Given we have 'Eggs' & 'Cheese' on the list
    await userAddAnItem("Eggs");
    await userAddAnItem("Cheese");

    // When we delete 'Eggs'
    await userRemoveAnItemViaRemoveButton("Eggs");

    // Then we end up with only 'Cheese'
    expect(itemsList.children.length).toBe(1);
    expect(itemsList.firstElementChild).toHaveTextContent("Cheese");
  });

  test("Should remove item from local storage when clicking on the 'remove item' button and confirming", async() => {
    jest.spyOn(window, "confirm").mockReturnValue(true);

    // Given we have 'Eggs' & 'Cheese' on the list
    await userAddAnItem("Eggs");
    await userAddAnItem("Cheese");

    // When we delete 'Eggs'
    await userRemoveAnItemViaRemoveButton("Eggs");

    // Then we end up with only 'Cheese'
    expect(localStorage.getItem("items")).toBe('["Cheese"]');
  });

  test("Should not remove item when clicking on the 'remove item' button and cancelling", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(false);

    // Given we have 'Eggs' & 'Cheese' on the list
    await userAddAnItem("Eggs");
    await userAddAnItem("Cheese");

    // When we try to delete 'Eggs' but cancel (see mock above)
    await userRemoveAnItemViaRemoveButton("Eggs");

    // Then we retain both items
    expect(itemsList.children.length).toBe(2);
  });

  test("Should remove item from page when clicking on the 'remove item' icon and confirming", async () => {
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

  test("Should remove all items from page when clicking on the 'Clear All' button", async () => {
    await userAddAnItem("Eggs");
    await userAddAnItem("Cheese");
    await userAddAnItem("Noodles");

    const clearAllButton = screen.getByRole("button", {name: "Clear All"});
    await user.click(clearAllButton);

    expect(itemsList.children.length).toBe(0);
  });

  test("Should remove all items from local storage when clicking on the 'Clear All' Button", async () => {
    await userAddAnItem("Eggs");
    await userAddAnItem("Cheese");
    await userAddAnItem("Noodles");

    const clearAllButton = screen.getByRole("button", {name: "Clear All"});
    await user.click(clearAllButton);

    expect(localStorage.getItem("items")).toBe(null);
  });

  test("Should leave local storage unchanged if item was not previously in storage", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);

    // Given we have 'Eggs' & 'Cheese' on the list, but we deliberately corrupt local storage
    await userAddAnItem("Eggs");
    await userAddAnItem("Cheese");
    localStorage.setItem("items", '["Cheese"]');

    // When we delete 'Eggs'
    await userRemoveAnItemViaRemoveButton("Eggs");

    // Then we end up with only 'Cheese'
    expect(localStorage.getItem("items")).toBe('["Cheese"]');
  });
});

describe("Editing items", () => {
  describe("Clicking on a single item to edit", () => {
    let itemElementClicked;

    beforeEach(async () => {
      await userAddAnItem("Eggs");
      itemElementClicked = itemsList.firstElementChild;
      fireEvent.click(itemElementClicked);
    });

    test("Should style item in edit mode when clicking on the item", async () => {
      expect(itemElementClicked.classList).toContain("edit-mode");
    });

    test("Should change form button to an edit button when clicking on the item", async () => {
      const formButton = await screen.findByRole("button", {name: "Update Item"});
      expect(formButton.firstElementChild.classList).toContain("fa-pen");
      expect(formButton.style.backgroundColor).toBe("rgb(34, 139, 34)");
    });

    test("Should change the item input to show the selected item", async () => {
      const itemInput = screen.getAllByRole("textbox")[0];
      expect(itemInput.value).toBe("Eggs");
    });
  });

  describe("Clicking on multiple items to edit", () => {
    test("Should reset the colour of the other items", async () => {
      await userAddAnItem("Eggs");
      await userAddAnItem("Cheese");

      const items = await screen.findAllByRole("listitem");
      const cheese = items[0];
      const eggs = items[1];

      fireEvent.click(cheese);
      fireEvent.click(eggs);

      expect(cheese.classList).not.toContain("edit-mode");
      expect(eggs.classList).toContain("edit-mode");
    });
  });

  describe("Editing an item", () => {
    let theItem;

    beforeEach(async () => {
      await userAddAnItem("Noodles");

      theItem = await screen.findByRole("listitem");
      await userEditAnItem(theItem, "Rice noodles");
    });

    test("Should update the item on the page", async () => {
      const list = screen.getByRole("list");

      expect(list.children.length).toBe(1);
      expect(theItem.textContent).toBe("Rice noodles");
    });

    test("Should keep the remove button in the item", async () => {
      const removeItemButton = within(theItem).queryByRole("button");
      expect(removeItemButton).not.toBeNull();

      const xMark = removeItemButton.firstElementChild;
      expect(xMark).not.toBeNull();
    });

    test("Should update the item in local storage", () => {
      expect(localStorage.getItem("items")).toBe('["Rice noodles"]');
    });

    test("Should revert style of the item", () => {
      expect(theItem.classList).not.toContain("edit-mode");
    })

    test("Should revert style of the form button", async () => {
      const formButton = await screen.findByRole("button", {name: "Add Item"});
      expect(formButton.firstElementChild.classList).not.toContain("fa-pen");
      expect(formButton.style.backgroundColor).toBe("rgb(51, 51, 51)");
    });

    test("Should clear item input after user edits an item", () => {
      const itemInput = screen.getByRole("textbox", {name: "Enter Item"});
      expect(itemInput.value).toBe("");
    });
  });

  test("Should add item to local storage even if it was corrupted", async () => {
    await userAddAnItem("Noodles");
    localStorage.setItem("items", '["Eggs"]'); // Simulate corruption of local storage

    await userEditAnItem(await screen.findByRole("listitem"), "Rice noodles");

    expect(localStorage.getItem("items")).toBe('["Eggs","Rice noodles"]');
  });

  describe("Duplicate item", () => {
    test("Should not allow a duplicate item to be added via editing", async () => {
      jest.spyOn(window, "alert").mockImplementation(() => {});
      await userAddAnItem("Eggs");
      await userAddAnItem("Noodles")

      const eggs = within(itemsList).getByText("Eggs");
      await userEditAnItem(eggs, "Noodles");

      expect(window.alert).toHaveBeenCalledWith("That item already exists!");
      expect(itemsList.children.item(0)).toHaveTextContent("Eggs");
    });

    test("Should allow an item to be edited to the same current value (no-op)", async () => {
      jest.spyOn(window, "alert").mockImplementation(() => {});
      await userAddAnItem("Eggs");

      const eggs = within(itemsList).getByText("Eggs");
      await userEditAnItem(eggs, "Eggs");

      expect(window.alert).not.toHaveBeenCalled();
      expect(itemsList.children.item(0)).toHaveTextContent("Eggs");
    });
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

async function userEditAnItem(itemElement, newItem) {
  fireEvent.click(itemElement);

  const itemInput = screen.getByRole("textbox", {name: "Enter Item"});
  await user.clear(itemInput);
  await user.type(itemInput, newItem);

  const formButton = await screen.findByRole("button", {name: "Update Item"});
  await user.click(formButton);
}

async function userRemoveAnItemViaRemoveButton(item) {
  const listItem = within(itemsList).getByText(item);
  const removeButton = within(listItem).getByRole("button");
  await user.click(removeButton);
}

async function loadShoppingListPage(onLoaded = () => {}) {
  await loadHtmlAndScript(
    "./javascript-sandbox-start/08-shopping-list-project/shopping-list/index.html",
    "./javascript-sandbox-start/08-shopping-list-project/shopping-list/script.js");
  onLoaded();
}
