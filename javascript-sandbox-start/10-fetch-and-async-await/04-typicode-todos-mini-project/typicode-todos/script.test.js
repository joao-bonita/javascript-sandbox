/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import {screen, waitFor} from "@testing-library/dom";
import {loadHtmlAndScript} from "../../../testing/MoreTesting";
import "whatwg-fetch";
import {userEvent} from "@testing-library/user-event";

let fetchSpy;

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

  jest.restoreAllMocks();
  fetchSpy = jest.spyOn(global, "fetch");
});

describe("Initial page load", () => {
  test("Should display 5 of the existing todos returned by the Web API", async () => {
    mockSuccessfulGetResponse(jsonDataFor5Todos);

    await loadPage();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("https://jsonplaceholder.typicode.com/todos?_limit=5");

    const todoList = screen.getByTestId("todo-list");
    await waitFor(() => expect(
      todoList.querySelectorAll("div").length).toBe(5)
    );
    expect(todoList).toHaveTextContent("delectus aut autem");
    expect(todoList).toHaveTextContent("quis ut nam facilis et officia qui");
    expect(todoList).toHaveTextContent("fugiat veniam minus");
    expect(todoList).toHaveTextContent("et porro tempora");
    expect(todoList).toHaveTextContent("laboriosam mollitia et enim quasi adipisci quia provident illum");
  });

  test("Should style completed todos as 'done'", async () => {
    mockSuccessfulGetResponse(
      [
        {
          "userId": 1,
          "id": 1,
          "title": "delectus aut autem",
          "completed": false
        },
        {
          "userId": 1,
          "id": 4,
          "title": "et porro tempora",
          "completed": true
        }
      ]
    );

    await loadPage();

    const notCompletedTodo = await screen.findByText("delectus aut autem");
    const completedTodo = await screen.findByText("et porro tempora");
    expect(notCompletedTodo).not.toHaveClass("done");
    expect(completedTodo).toHaveClass("done");
  });

  test("Should add an ID attribute to each loaded todo", async () => {
    mockSuccessfulGetResponse(
      [
        {
          "userId": 1,
          "id": 1,
          "title": "delectus aut autem",
          "completed": false
        }
      ]
    );

    await loadPage();

    const todo = await screen.findByText("delectus aut autem");
    expect(todo).toHaveAttribute("data-id", "1");
  });
});

describe("Page already loaded", () => {
  let user;

  beforeEach(async () => {
    user = userEvent.setup();
    mockSuccessfulGetResponse(
      [
        {
          "userId": 1,
          "id": 1,
          "title": "delectus aut autem",
          "completed": false
        }
      ]
    );
    await loadPage();
  });

  describe("Creating a new todo", () => {
    beforeEach(() => {
      fetchSpy.mockResolvedValue(new Response(JSON.stringify(
        {
          id: 101,
          userId: 1,
          title: "New Todo!",
          completed: false,
        })
      ));
    });

    test("Should create a todo on the server when clicking on the Add button", async () => {
      await user.type(screen.getByRole("textbox"), "New Todo!");
      await user.click(screen.getByRole("button"));

      expect(fetchSpy).toHaveBeenNthCalledWith(2,
        "https://jsonplaceholder.typicode.com/todos",
        {
          method: "POST",
          body: JSON.stringify({
            userId: 1,
            title: "New Todo!",
            completed: false
          }),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          }
        }
      )
    });

    test("Should add a todo to the page when clicking on the Add button", async () => {
      await user.type(screen.getByRole("textbox"), "New Todo!");
      await user.click(screen.getByRole("button"));

      const newTodo = await screen.findByText("New Todo!");
      expect(newTodo).toHaveAttribute("data-id", "101");
    });
  });

  describe("Toggling the completed status of an existing todo", () => {
    test("Should update the completed status on the server when clicking on a todo", async () => {
      const todo = await screen.findByText("delectus aut autem");

      await user.click(todo);

      expect(fetchSpy).toHaveBeenNthCalledWith(2,
        "https://jsonplaceholder.typicode.com/todos/1",
        {
          method: "PATCH",
          body: JSON.stringify({
            completed: true
          }),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          }
        }
      );
    });
  });
});

async function loadPage() {
  await loadHtmlAndScript(
    "./javascript-sandbox-start/10-fetch-and-async-await/04-typicode-todos-mini-project/typicode-todos/index.html",
    "./javascript-sandbox-start/10-fetch-and-async-await/04-typicode-todos-mini-project/typicode-todos/script.js"
  );
}

function mockSuccessfulGetResponse(jsonDataObject) {
  fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify(jsonDataObject)));
}

const jsonDataFor5Todos = [
  {
    "userId": 1,
    "id": 1,
    "title": "delectus aut autem",
    "completed": false
  },
  {
    "userId": 1,
    "id": 2,
    "title": "quis ut nam facilis et officia qui",
    "completed": false
  },
  {
    "userId": 1,
    "id": 3,
    "title": "fugiat veniam minus",
    "completed": false
  },
  {
    "userId": 1,
    "id": 4,
    "title": "et porro tempora",
    "completed": true
  },
  {
    "userId": 1,
    "id": 5,
    "title": "laboriosam mollitia et enim quasi adipisci quia provident illum",
    "completed": false
  }
];