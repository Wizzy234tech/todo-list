const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");

addButton.addEventListener("click", addTask);

function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task");
        return;
    }

    const li = document.createElement("li");

    const task = document.createElement("span");
    task.textContent = taskText;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-btn");

    // Mark task as completed
    task.addEventListener("click", function () {
        task.classList.toggle("completed");
    });

    // Delete task
    deleteButton.addEventListener("click", function () {
        li.remove();
    });

    li.appendChild(task);
    li.appendChild(deleteButton);

    taskList.appendChild(li);

    // Clear input
    taskInput.value = "";
}