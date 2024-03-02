function runMyJavaScript() {
  const todoList = document.getElementById("todo-list");
  const form = document.getElementById("todo-form");
  initialise();

  function initialise() {
    form.addEventListener("submit", onSubmit);

    const apiUrl = new URL("todos", "https://jsonplaceholder.typicode.com");
    apiUrl.searchParams.append("_limit", "5");
    fetch(apiUrl.toString())
      .then(response => response.json())
      .then(todoData => todoData.forEach(todo => addTodoToPage(todo)));
  }

  function onSubmit(event) {
    event.preventDefault();

    const newTodo = {
      id: -1,
      title: document.getElementById("title").value,
      completed: false,
    };

    addTodoToPage(newTodo);
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