// TODO MVU

// A todo has a description and a status
type Todo = [string, boolean];

// A description input buffer and a todo list
type Model = [string, Todo[]];

type AddTodo = {};

type RemoveTodo = { id: number };

type ToggleTodo = { id: number };

type UpdateBuffer = { name: string };

type Action = AddTodo | RemoveTodo | ToggleTodo | UpdateBuffer;

type Update = (m: Model, a: Action) => Model;

type MyProductType = [m1: Model, m2: Model, a1: Action];

type MySumType = Action | Model;

type MySumProductType = Action | [m1: Model, a1: Action];

type MySumFunctionType = Action | ((m1: Model) => Model);

type MyUnrelatedType = (i: number) => string;

const todo_eq: (t1: Todo, t2: Todo) => Boolean = ([d1, s1], [d2, s2]) => {
  return d1 === d2 && s1 === s2;
}

const todo_array_eq: (ta1: Todo[], ta2: Todo[]) => Boolean = (ta1, ta2) => {
  return ta1.length === ta2.length && ta1.every((el, i) => { return todo_eq(el, ta2[i]); });
}

const model_eq: (m1: Model, m2: Model) => Boolean = ([b1, ts1], [b2, ts2]) => {
  return b1 === b2 && todo_array_eq(ts1, ts2);
}

export { Todo, Model, AddTodo, RemoveTodo, ToggleTodo, UpdateBuffer, Action, Update, model_eq };
