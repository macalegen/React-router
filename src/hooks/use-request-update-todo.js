import { useState } from "react";

export const useRequestUpdateTodo = (refreshTodos) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const requestUpdateTodo = (id, updatedTitle) => {
    setIsUpdating(true);

    fetch(`http://localhost:3001/todos/${id}`, {
      method: "PUT",
      headers: { "Content-type": "application/json;charset=utf-8" },
      body: JSON.stringify({
        title: updatedTitle,
      }),
    })
      .then((rawResponce) => rawResponce.json())
      .then((response) => {
        console.log("Todo updated, server pesponse:", response);
        refreshTodos();
      })
      .finally(() => setIsUpdating(false));
  };
  return {
    isUpdating,
    requestUpdateTodo,
  };
};
