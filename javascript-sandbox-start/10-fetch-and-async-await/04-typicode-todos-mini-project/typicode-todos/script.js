function runMyJavaScript() {
  const todoList = document.getElementById("todo-list");
  const form = document.getElementById("todo-form");
  const apiUrl = new URL("todos", "https://jsonplaceholder.typicode.com");
  initialise();

  function initialise() {
    form.addEventListener("submit", onSubmit);

    const url = new URL(apiUrl);
    url.searchParams.append("_limit", "5");
    fetch(url.toString())
      .then(response => response.json())
      .then(todoData => todoData.forEach(todo => addTodoToPage(todo)));
  }

  function onSubmit(event) {
    event.preventDefault();

    const newTodo = {
      userId: 1,
      title: document.getElementById("title").value,
      completed: false,
    };

    fetch(apiUrl.toString(),
      {
        method: "POST",
        body: JSON.stringify(newTodo),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        }
      })
      .then(response => response.json())
      .then(todo => addTodoToPage(todo));
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
}

runMyJavaScript();