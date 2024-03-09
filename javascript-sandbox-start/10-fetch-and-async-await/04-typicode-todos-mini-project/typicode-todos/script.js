function runMyJavaScript() {
  const CLASS_DONE = "done";
  const todoList = document.getElementById("todo-list");
  const form = document.getElementById("todo-form");
  const baseUrl = new URL("todos", "https://jsonplaceholder.typicode.com").toString();
  initialise();

  function initialise() {
    form.addEventListener("submit", onSubmit);
    todoList.addEventListener("click", onClickTodo);
    getTodos(5).then(todoData => todoData.forEach(todo => addTodoToPage(todo)));
  }

  function onSubmit(event) {
    event.preventDefault();
    const newTodo = {
      userId: 1,
      title: document.getElementById("title").value,
      completed: false,
    };
    createTodo(newTodo).then(todo => addTodoToPage(todo));
  }

  function addTodoToPage(todo) {
    const todoElement = document.createElement("div");
    todoElement.setAttribute("data-id", todo.id);
    todoElement.textContent = todo.title;
    if (todo.completed) {
      todoElement.classList.add(CLASS_DONE);
    }
    todoList.appendChild(todoElement);
  }

  function onClickTodo(event) {
    const todoElement = event.target;
    updateTodo(
      todoElement.getAttribute("data-id"),
      {
        completed: !todoElement.classList.contains(CLASS_DONE),
      }).then(todo => {
        if (todo.completed) {
          todoElement.classList.add(CLASS_DONE);
        } else {
          todoElement.classList.remove(CLASS_DONE);
        }
    });
  }

  function getTodos(limit) {
    const url = new URL(baseUrl);
    url.searchParams.append("_limit", limit);
    return fetch(url.toString()).then(response => response.json())
  }

  function createTodo(newTodo) {
    return fetch(new URL(baseUrl).toString(),
      {
        method: "POST",
        body: JSON.stringify(newTodo),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        }
      })
    .then(response => response.json());
  }

  function updateTodo(id, patch) {
    return fetch(new URL(`${baseUrl}/${id}`).toString(),
      {
        method: "PATCH",
        body: JSON.stringify(patch),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        }
      })
      .then(response => response.json());
  }
}

runMyJavaScript();