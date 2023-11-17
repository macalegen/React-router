import styles from "./app.module.css";
import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useParams,
  NavLink,
  useNavigate,
  Link,
} from "react-router-dom";
import debounce from "lodash/debounce";
import {
  useRequestGetTodos,
  useRequestAddTodo,
  useRequestUpdateTodo,
  useRequestDeleteTodo,
} from "./hooks";

export const App = () => {
  const refreshTodos = () => setRefreshTodosFlag(!refreshTodosFlag);
  const [refreshTodosFlag, setRefreshTodosFlag] = useState(false);

  const { todos } = useRequestGetTodos(refreshTodosFlag);
  const { isCreating, requestAddTodo } = useRequestAddTodo(refreshTodos);
  const { isUpdating, requestUpdateTodo } = useRequestUpdateTodo(refreshTodos);
  const { isDeleting, requestDeleteTodo } = useRequestDeleteTodo(refreshTodos);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [sorted, setSorted] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState("");

  const debouncedSearch = debounce((searchText) => {
    setSearchPhrase(searchText);
  }, 300);

  const handleSearchChange = (e) => {
    const searchText = e.target.value;
    debouncedSearch(searchText);
  };

  const handleSortToggle = () => {
    setSorted(!sorted);
  };

  const handleAddTodo = () => {
    if (newTodoTitle) {
      requestAddTodo(newTodoTitle);
      setNewTodoTitle("");
    }
  };

  let sortedTodos = [...todos];

  if (sorted) {
    sortedTodos = sortedTodos.sort((a, b) => a.title.localeCompare(b.title));
  }

  const filteredTodos = sortedTodos.filter((todo) =>
    todo.title.toLowerCase().includes(searchPhrase.toLowerCase())
  );

  const dataBase = {
    todosFull: {
      1: { id: 1, title: "todo-1", completed: "true", userID: 1 },
      2: { id: 2, title: "todo-2", completed: "true", userID: 2 },
      3: { id: 3, title: "todo-3", completed: "false", userID: 3 },
      4: { id: 3, title: "todo-4", completed: "false", userID: 4 },
      5: { id: 3, title: "todo-5", completed: "true", userID: 5 },
      6: { id: 3, title: "todo-6", completed: "false", userID: 6 },
      7: { id: 3, title: "todo-7", completed: "true", userID: 7 },
    },
  };

  const LOADING_TIMEOUT = 3000;

  const fetchTodo = (id, title) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: id,
          title: dataBase.todosFull[id].title,
          completed: dataBase.todosFull[id].completed,
          userID: dataBase.todosFull[id].userID,
        });
      }, 2500);
    });

  const MainPage = () => (
    <div>
      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search in todos"
          value={searchPhrase}
          onChange={handleSearchChange}
        />
        <button onClick={handleSortToggle}>
          {sorted ? "Sorting off" : "A - Z Sorting"}
        </button>
      </div>
      <div className={styles.addTodoSection}>
        <input
          type="text"
          placeholder="Add a new todo"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
        />
        <button disabled={isCreating} onClick={handleAddTodo}>
          Add Todo
        </button>
      </div>
      <ul>
        {filteredTodos.map(({ id, title }) => (
          <li key={id}>
            <NavLink to={`todo/${id}`}>
              {title.length > 20 ? `${title.slice(0, 20)}...` : title}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );

  const Todo = () => {
    const [todo, setTodo] = useState(null);
    const [editedTodoTitle, setEditedTodoTitle] = useState("");
    const [editingTodoId, setEditingTodoId] = useState(null);
    const [dataLoaded, setDataLoaded] = useState(false);

    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
      let isLoadingTimeout = false;
      let isTodoLoaded = false;

      setTimeout(() => {
        isLoadingTimeout = true;

        if (!isTodoLoaded) {
          navigate("/todo-load-error", { replace: true });
        }
      }, LOADING_TIMEOUT);

      fetchTodo(params.id).then((loadedTodo) => {
        isTodoLoaded = true;

        if (!isLoadingTimeout) {
          if (!loadedTodo) {
            navigate("/product-not-exist");
            return;
          }

          setTodo(loadedTodo);
          setEditedTodoTitle(loadedTodo.title);
          setDataLoaded(true);
        }
      });
    }, [params.id, navigate]);

    const handleEditTodo = (id) => {
      setEditingTodoId(id);
    };

    const handleUpdateTodo = () => {
      if (editedTodoTitle) {
        requestUpdateTodo(params.id, editedTodoTitle);
        setEditingTodoId(null);
      }
    };

    const handleDeleteTodo = (id) => {
      requestDeleteTodo(id);
    };

    if (!dataLoaded) {
      return <div>Loading...</div>;
    }

    return (
      <div className={styles.todos}>
        {editingTodoId === params.id ? (
          <div>
            <input
              type="text"
              value={editedTodoTitle}
              onChange={(e) => setEditedTodoTitle(e.target.value)}
            />
            <button
              disabled={isUpdating}
              onClick={() => handleUpdateTodo(editedTodoTitle)}
            >
              Save
            </button>
          </div>
        ) : (
          <div>
            <h3>Задача - {todo.title}</h3>
            <div>Завершено: {todo.completed}</div>
            <div>ID пользователя: {todo.userID}</div>
            <button onClick={() => handleEditTodo(params.id)}>
              Редактировать
            </button>
            <button
              disabled={isDeleting}
              onClick={() => handleDeleteTodo(params.id)}
            >
              Удалить
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.app}>
      <Link to="/">Main</Link>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="todo/:id" element={<Todo />} />
      </Routes>
    </div>
  );
};
