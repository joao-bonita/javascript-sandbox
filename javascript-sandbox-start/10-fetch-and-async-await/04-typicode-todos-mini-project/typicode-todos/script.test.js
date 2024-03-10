/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import {screen, waitFor} from "@testing-library/dom";
import {loadHtmlAndScript, newSideEffectsHolder, resetJsDom, spyAddEventListener} from "../../../testing/MoreTesting";
import "whatwg-fetch";
import {userEvent} from "@testing-library/user-event";

let fetchSpy;

const sideEffects = newSideEffectsHolder(document, window);

beforeAll(async () => {
  spyAddEventListener(sideEffects);
});

beforeEach(async () => {
  resetJsDom(sideEffects);
  jest.restoreAllMocks();
  fetchSpy = jest.spyOn(global, "fetch").mockImplementation(() => {});
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
        },
        {
          "userId": 1,
          "id": 2,
          "title": "quis ut nam facilis et officia qui",
          "completed": true
        },
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
    test("Should toggle the status on the server when toggling an incomplete todo", async () => {
      fetchSpy.mockResolvedValue(new Response(JSON.stringify({})));

      const incompleteTodo = await screen.findByText("delectus aut autem");
      await user.click(incompleteTodo);

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

    test("Should toggle the status on the server when toggling a complete todo", async () => {
      fetchSpy.mockResolvedValue(new Response(JSON.stringify({})));

      const completeTodo = await screen.findByText("quis ut nam facilis et officia qui");
      await user.click(completeTodo);

      expect(fetchSpy).toHaveBeenNthCalledWith(2,
        "https://jsonplaceholder.typicode.com/todos/2",
        {
          method: "PATCH",
          body: JSON.stringify({
            completed: false
          }),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          }
        }
      );
    });

    test("Should display as completed on the page when toggling an incomplete todo and the server response is successful", async () => {
      fetchSpy.mockResolvedValue(new Response(JSON.stringify(
        {
          id: 1,
          userId: 1,
          title: "delectus aut autem",
          completed: true,
        })
      ));

      const todo = await screen.findByText("delectus aut autem");
      await user.click(todo);

      expect(todo).toHaveClass("done");
    });

    test("Should display as incomplete on the page when toggling a complete todo and the server response is successful", async () => {
      fetchSpy.mockResolvedValue(new Response(JSON.stringify(
        {
          id: 1,
          userId: 1,
          title: "quis ut nam facilis et officia qui",
          completed: false,
        })
      ));

      const todo = await screen.findByText("quis ut nam facilis et officia qui");
      await user.click(todo);

      expect(todo).not.toHaveClass("done");
    });

    test("Should not toggle the completed status on the page when toggling a todo but the server response is unsuccessful", async () => {
      fetchSpy.mockResolvedValue(new Response("Internal Server Error", {status: 500}));

      const incompleteTodo = await screen.findByText("delectus aut autem");
      await user.click(incompleteTodo);

      expect(incompleteTodo).not.toHaveClass("done");
    });

    test("Should not toggle the whole todo list if the list is clicked on", async () => {
      fetchSpy.mockResolvedValue(new Response(JSON.stringify(
        {
          completed: true,
        })
      ));

      const todoList = screen.getByTestId("todo-list");

      await user.click(todoList);

      expect(todoList).not.toHaveClass("done");
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("Deleting a todo", () => {
    test("Should delete a todo on the server when double-clicking on it", async () => {
      fetchSpy.mockImplementation(() => Promise.resolve(new Response(JSON.stringify({}))));

      const todo = await screen.findByText("delectus aut autem");
      await user.dblClick(todo);

      expect(fetchSpy).toHaveBeenNthCalledWith(4,
        "https://jsonplaceholder.typicode.com/todos/1",
        {
          method: "DELETE"
        }
      );
    });

    test("Should delete a todo from the page when double-clicking on it and the server response is successful", async () => {
      fetchSpy.mockImplementation(() => Promise.resolve(new Response(JSON.stringify({}))));

      await user.dblClick(await screen.findByText("delectus aut autem"));

      expect(screen.queryByText("delectus aut autem")).toBeNull();
    });

    test("Should not delete a todo from the page when double-clicking on it but the server response is unsuccessful", async () => {
      fetchSpy.mockImplementation(() => Promise.resolve(new Response("Internal Server Error", {status: 500})));

      await user.dblClick(await screen.findByText("delectus aut autem"));

      expect(screen.queryByText("delectus aut autem")).not.toBeNull();
    });

    test("Should not delete the whole todo list if it is double-clicked on", async () => {
      fetchSpy.mockImplementation(() => Promise.resolve(new Response(JSON.stringify({}))));

      const todoList = screen.getByTestId("todo-list");
      await user.dblClick(todoList);

      expect(todoList).toBeInTheDocument();
      expect(fetchSpy).toHaveBeenCalledTimes(1);
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