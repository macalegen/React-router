import { useState } from "react";

export const useRequestAddTodo = (refreshTodos) => {
  const [isCreating, setIsCreating] = useState(false);

  const requestAddTodo = (title) => {
    setIsCreating(true);

    fetch("http://localhost:3001/todos", {
      method: "POST",
      headers: { "Content-type": "application/json;charset=utf-8" },
      body: JSON.stringify({
        title: title,
      }),
    })
      .then((rawResponce) => rawResponce.json())
      .then((response) => {
        console.log("Todo added, server pesponse:", response);
        refreshTodos();
      })
      .finally(() => setIsCreating(false));
  };
  return {
    isCreating,
    requestAddTodo,
  };
};
