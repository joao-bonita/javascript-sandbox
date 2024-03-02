function runMyJavaScript() {
  const todoList = document.getElementById("todo-list");

  const apiUrl = new URL("todos", "https://jsonplaceholder.typicode.com");
  apiUrl.searchParams.append("_limit", "5");
  fetch(apiUrl.toString())
    .then(response => response.json())
    .then(todoData => {
      todoData.forEach(todo => {
          const todoElement = document.createElement("div");
          todoElement.textContent = todo.title;
          if (todo.completed) {
            todoElement.className = "done";
          }
          todoList.appendChild(todoElement);
      })
    });
}

runMyJavaScript();