import './App.css';

import { useEffect, useState } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function fetchTasks() {
    try {
      setError("");
      setIsLoading(true);
      const response = await fetch("http://localhost:8080/tasks");

      if (!response.ok) {
        throw new Error("Failed to load tasks");
      }

      const data = await response.json();
      setTasks(data);
    } catch (fetchError) {
      setError("Failed to load tasks.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function addTask(event) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);

      const requestUrl = editingTaskId
        ? `http://localhost:8080/tasks/${editingTaskId}`
        : "http://localhost:8080/tasks";

      const requestMethod = editingTaskId ? "PUT" : "POST";

      const response = await fetch(requestUrl, {
        method: requestMethod,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDescription
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      setTitle("");
      setDescription("");
      setEditingTaskId(null);
      await fetchTasks();
    } catch (submitError) {
      setError(editingTaskId ? "Failed to update task." : "Failed to add task.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function editTask(task) {
    setTitle(task.title);
    setDescription(task.description);
    setEditingTaskId(task.id);
  }

  function cancelEdit() {
    setEditingTaskId(null);
    setTitle("");
    setDescription("");
    setError("");
  }

  async function deleteTask(id) {
    try {
      setError("");

      const response = await fetch(`http://localhost:8080/tasks/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      if (editingTaskId === id) {
        cancelEdit();
      }

      await fetchTasks();
    } catch (deleteError) {
      setError("Failed to delete task.");
    }
  }

  return (
    <main className="App todo-app">
      <h1>To-Do List</h1>
      <p className="app-subtitle">Manage tasks from the rest service in the todo-app interface.</p>

      <form className="task-form" onSubmit={addTask}>
        <input
          id="task-title"
          value={title}
          placeholder="Task title"
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <textarea
          id="task-description"
          value={description}
          placeholder="Task description"
          onChange={(event) => setDescription(event.target.value)}
          rows="3"
          required
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : editingTaskId ? "Save" : "Add"}
        </button>
        {editingTaskId ? (
          <button type="button" className="secondary-button" onClick={cancelEdit}>
            Cancel
          </button>
        ) : null}
      </form>

      <div className="filters" aria-label="task summary">
        <button type="button" className="filter active">
          Total: {tasks.length}
        </button>
      </div>

      {error ? <p className="status-message error">{error}</p> : null}
      {isLoading ? <p className="status-message">Loading tasks...</p> : null}

      <div className="task-list-container">
        <ul id="task-list">
          {!isLoading && tasks.length === 0 ? (
            <li className="empty-state">No tasks yet.</li>
          ) : null}

          {tasks.map((task) => (
            <li key={task.id} className="task">
              <div className="task-content">
                <span className="task-title">{task.title}</span>
                <p className="task-description">{task.description}</p>
              </div>
              <div className="task-actions">
                <button type="button" className="icon-button" onClick={() => editTask(task)}>
                  ✏️
                </button>
                <button type="button" className="icon-button" onClick={() => deleteTask(task.id)}>
                  ❌
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default App;