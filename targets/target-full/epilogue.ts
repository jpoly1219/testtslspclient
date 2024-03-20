/*
let eq = Model.eq in
let num_todos = fun m:Model -> List.length(snd(m)) in

test  # Add adds #
  num_todos(update(("Breath", []), AddTodo))
  > num_todos(("Breath", [])) end;

test  # Add uses name, initial status set #
  eq(
  update(("Breath", []), AddTodo),
  ("", [("Breath", false)])) end;

test  # Add nonempty (too impl spec? test add + remove eqs)#
  eq(
  update(("Chop wood", [("Carry water", false)]), AddTodo),
    ("", [("Chop wood", false), ("Carry water", false)])) end;
      
test  # add then remove doesn't change todos #
  let todos = [("Breath", false)] in
  eq(
    update(update(("Remove this", todos), AddTodo), RemoveTodo(0)),
    ("", todos)) end;
      
test  # Toggle preserves length #
  let model = ("", [("1", false), ("2", false)]) in
  num_todos(update(model, ToggleTodo(1)))
    == num_todos(model) end;
    
test  # Toggle toggles right index #
  eq(
    update(("", [("Chop", false), ("Carry", true)]), ToggleTodo(1)),
    ("", [("Chop", false), ("Carry", false)])) end;
  
test  # Toggle out of bounds #
  let model = ("", [("Chop", false), ("Carry", false)]) in
  eq(
    update(model, ToggleTodo(2)),
    model) end;
  
test  # Remove removes #
  let model = ("", [("1", false)]) in
  num_todos(update(model, RemoveTodo(0)))
  < num_todos(model) end;

test  # Remove removes right index #
  eq(
    update(("", [("1", false), ("2", false)]), RemoveTodo(1)),
    ("", [("1", false)])) end;
  
test  # Remove out of bounds #
  let model = ("", [("1", false)]) in
  eq(
    update(model, RemoveTodo(2)),
    model) end;

test  # Update Input #
eq(
  update(("", []), UpdateBuffer("Breath")),
  ("Breath", [])) end;
      
test  # Don't add blank description #
  let model = ("", [("1", false)]) in
  eq(
    update(model, AddTodo),
    model) end
*/

import { Todo, Model, AddTodo, RemoveTodo, ToggleTodo, UpdateBuffer, model_eq } from "./prelude.ts"
import { update } from "./sketch.ts"

// tests
const num_todos: (m: Model) => number = (m) => {
  return m[1].length;
}

const test1 = () => {
  return num_todos(update(["Breath", []], "AddTodo" as AddTodo)) > num_todos(["Breath", []]);
};

const test2 = () => {
  return model_eq(
    update(["Breath", []], "AddTodo" as AddTodo),
    ["", [["Breath", false]]]
  );
};

const test3 = () => {
  return model_eq(
    update(["Chop wood", [["Carry water", false]]], "AddTodo" as AddTodo),
    ["", [["Chop wood", false], ["Carry water", false]]]
  );
};

const test4 = () => {
  let todos: Todo[] = [["Breath", false]];
  return model_eq(
    update(update(["Remove this", todos], "AddTodo" as AddTodo), 0 as RemoveTodo),
    ["", todos]
  );
};

const test5 = () => {
  let model: Model = ["", [["1", false], ["2", false]]];
  return num_todos(update(model, 1 as ToggleTodo)) === num_todos(model);
}

const test6 = () => {
  return model_eq(
    update(["", [["Chop", false], ["Carry", true]]], 1 as ToggleTodo),
    ["", [["Chop", false], ["Carry", false]]]
  );
}

const test7 = () => {
  let model: Model = ["", [["Chop", false], ["Carry", false]]];
  return model_eq(
    update(model, 2 as ToggleTodo),
    model
  );
}

const test8 = () => {
  let model: Model = ["", [["1", false]]];
  return num_todos(update(model, 0 as RemoveTodo)) < num_todos(model);
}

const test9 = () => {
  return model_eq(
    update(["", [["1", false], ["2", false]]], 1 as RemoveTodo),
    ["", [["1", false]]]
  );
}

const test10 = () => {
  let model: Model = ["", [["1", false]]];
  return model_eq(
    update(model, 2 as RemoveTodo),
    model
  );
}

const test11 = () => {
  return model_eq(
    update(["", []], "Breath" as UpdateBuffer),
    ["Breath", []]
  );
}

const test12 = () => {
  let model: Model = ["", [["1", false]]];
  return model_eq(
    update(model, "AddTodo" as AddTodo),
    model
  );
}
