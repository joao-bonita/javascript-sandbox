function runMyJavaScript() {
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
      todoElement.className = "done";
    }
    todoList.appendChild(todoElement);
  }

  function onClickTodo(event) {
    updateTodo(
      event.target.getAttribute("data-id"),
      {
        completed: !event.target.classList.contains("done"),
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
    fetch(new URL(`${baseUrl}/${id}`).toString(),
      {
        method: "PATCH",
        body: JSON.stringify(patch),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        }
      });
  }
}

runMyJavaScript();