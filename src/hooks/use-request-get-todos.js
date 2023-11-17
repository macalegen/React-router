import { useState, useEffect } from "react";

export const useRequestGetTodos = (refreshTodos) => {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    fetch("http://localhost:3001/todos")
      .then((loadedData) => loadedData.json())
      .then((loadedTodos) => {
        setTodos(loadedTodos);
      })
      .finally(() => setIsLoading(false));
  }, [refreshTodos]);

  return { todos, isLoading };
};
