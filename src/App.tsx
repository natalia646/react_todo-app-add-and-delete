/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';

import { UserWarning } from './UserWarning';
import { createTodos, deleteTodo, getTodos, USER_ID } from './api/todos';

import { ErrorMessage } from './types/ErrorMessage';
import { Todo } from './types/Todo';

import { TodoFooter } from './components/TodoFooter';
import { TodoItem } from './components/TodoItem';
import { ErrorNotification } from './components/ErrorNotification';
import { TodoHeader } from './components/TodoHeader';
import { Status } from './types/Status';
import { getFilteredTodos } from './utils/getFilteredTodos';

export const App: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<ErrorMessage>(
    ErrorMessage.Default,
  );
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeStatus, setActiveStatus] = useState(Status.All);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [isLoadingTodos, setIsLoadingTodos] = useState<number[]>([]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const filteredTodos = getFilteredTodos(todos, activeStatus);
  const notCompletedTodos = todos.filter(todo => !todo.completed).length;
  const completedTodos = todos.filter(todo => todo.completed);

  const onAddTodo = async (title: string) => {
    setTempTodo({
      id: 0,
      title,
      userId: USER_ID,
      completed: false,
    });

    const newTodo: Omit<Todo, 'id'> = {
      title,
      userId: USER_ID,
      completed: false,
    };

    try {
      const todo = await createTodos(newTodo);

      setTodos(currentTodos => [...currentTodos, todo]);
    } catch (error) {
      setErrorMessage(ErrorMessage.UnableToAdd);
      throw error;
    } finally {
      setTempTodo(null);
    }
  };

  const onDeleteTodo = (todoId: number) => {
    setIsLoadingTodos(prevTodos => [...prevTodos, todoId]);

    deleteTodo(todoId)
      .then(() =>
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        ),
      )
      .catch(error => {
        setErrorMessage(ErrorMessage.UnableToDelete);
        throw error;
      })
      .finally(() =>
        setIsLoadingTodos(prevTodos => prevTodos.filter(id => todoId !== id)),
      );
  };

  const onDeleteAllCompleted = () => {
    completedTodos.forEach(todo => onDeleteTodo(todo.id));
  };

  useEffect(() => {
    getTodos()
      .then(data => setTodos(data))
      .catch(error => {
        setErrorMessage(ErrorMessage.UnableToLoad);
        throw error;
      });
  }, []);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <TodoHeader
          inputRef={inputRef}
          onAddTodo={onAddTodo}
          error={errorMessage}
          setErrorMessage={setErrorMessage}
          isInputDisablet={!!tempTodo}
          isDeletedTodos={isLoadingTodos}
        />

        <section className="todoapp__main" data-cy="TodoList">
          {filteredTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onDeleteTodo={onDeleteTodo}
              // isCompleted={completedTodosId.includes(todo.id)}
              // setCompletedTodosId={setCompletedTodosId}
              isLoading={isLoadingTodos.includes(todo.id)}
            />
          ))}
          {tempTodo && (
            <TodoItem
              todo={tempTodo}
              onDeleteTodo={() => {}}
              // isCompleted={completedTodosId.includes(tempTodo.id)}
              // setCompletedTodosId={setCompletedTodosId}
              isLoading={isLoadingTodos.includes(tempTodo.id)}
            />
          )}

          {/* This todo is an active todo */}
          {/* <div data-cy="Todo" className="todo">
            <label className="todo__status-label">
              <input
                data-cy="TodoStatus"
                type="checkbox"
                className="todo__status"
              />
            </label>

            <span data-cy="TodoTitle" className="todo__title">
              Not Completed Todo
            </span>
            <button type="button" className="todo__remove" data-cy="TodoDelete">
              ×
            </button>

            <div data-cy="TodoLoader" className="modal overlay">
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          </div> */}

          {/* This todo is being edited */}
          {/* <div data-cy="Todo" className="todo">
            <label className="todo__status-label">
              <input
                data-cy="TodoStatus"
                type="checkbox"
                className="todo__status"
              />
            </label> */}

          {/* This form is shown instead of the title and remove button */}
          {/* <form>
              <input
                data-cy="TodoTitleField"
                type="text"
                className="todo__title-field"
                placeholder="Empty todo will be deleted"
                value="Todo is being edited now"
              />
            </form>

            <div data-cy="TodoLoader" className="modal overlay">
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          </div> */}

          {/* This todo is in loadind state */}
          {/* <div data-cy="Todo" className="todo">
            <label className="todo__status-label">
              <input
                data-cy="TodoStatus"
                type="checkbox"
                className="todo__status"
              />
            </label>

            <span data-cy="TodoTitle" className="todo__title">
              Todo is being saved now
            </span>

            <button type="button" className="todo__remove" data-cy="TodoDelete">
              ×
            </button> */}

          {/* 'is-active' class puts this modal on top of the todo */}
          {/* <div data-cy="TodoLoader" className="modal overlay is-active">
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          </div> */}
        </section>

        {!!todos.length && (
          <TodoFooter
            notCompletedTodos={notCompletedTodos}
            activeStatus={activeStatus}
            setActiveStatus={setActiveStatus}
            completedTodos={completedTodos.length}
            onDeleteAllCompleted={onDeleteAllCompleted}
          />
        )}
      </div>

      <ErrorNotification
        error={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
};
