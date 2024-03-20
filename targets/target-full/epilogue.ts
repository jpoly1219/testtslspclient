import { Todo, Model, AddTodo, RemoveTodo, ToggleTodo, UpdateBuffer, model_eq } from "./prelude.ts"
import { update } from "./sketch.ts"

// utility
const num_todos: (m: Model) => number = (m) => {
  return m[1].length;
}

// tests

// Add adds
const test1 = () => {
  return num_todos(update(["Breath", []], "AddTodo" as AddTodo)) > num_todos(["Breath", []]);
};

// Add uses name, initial status set
const test2 = () => {
  return model_eq(
    update(["Breath", []], "AddTodo" as AddTodo),
    ["", [["Breath", false]]]
  );
};

// Add nonempty (too impl spec? test add + remove eqs)
const test3 = () => {
  return model_eq(
    update(["Chop wood", [["Carry water", false]]], "AddTodo" as AddTodo),
    ["", [["Chop wood", false], ["Carry water", false]]]
  );
};

// add then remove doesn't change todos
const test4 = () => {
  let todos: Todo[] = [["Breath", false]];
  return model_eq(
    update(update(["Remove this", todos], "AddTodo" as AddTodo), 0 as RemoveTodo),
    ["", todos]
  );
};

// Toggle preserves length
const test5 = () => {
  let model: Model = ["", [["1", false], ["2", false]]];
  return num_todos(update(model, 1 as ToggleTodo)) === num_todos(model);
}

// Toggle toggles right index
const test6 = () => {
  return model_eq(
    update(["", [["Chop", false], ["Carry", true]]], 1 as ToggleTodo),
    ["", [["Chop", false], ["Carry", false]]]
  );
}

// Toggle out of bounds
const test7 = () => {
  let model: Model = ["", [["Chop", false], ["Carry", false]]];
  return model_eq(
    update(model, 2 as ToggleTodo),
    model
  );
}

// Remove removes
const test8 = () => {
  let model: Model = ["", [["1", false]]];
  return num_todos(update(model, 0 as RemoveTodo)) < num_todos(model);
}

// Remove removes right index
const test9 = () => {
  return model_eq(
    update(["", [["1", false], ["2", false]]], 1 as RemoveTodo),
    ["", [["1", false]]]
  );
}

// Remove out of bounds
const test10 = () => {
  let model: Model = ["", [["1", false]]];
  return model_eq(
    update(model, 2 as RemoveTodo),
    model
  );
}

// Update Input
const test11 = () => {
  return model_eq(
    update(["", []], "Breath" as UpdateBuffer),
    ["Breath", []]
  );
}

// Don't add blank description
const test12 = () => {
  let model: Model = ["", [["1", false]]];
  return model_eq(
    update(model, "AddTodo" as AddTodo),
    model
  );
}
