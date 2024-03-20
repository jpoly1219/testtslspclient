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
