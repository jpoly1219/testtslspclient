/*
# Basics #

type Option = None + Some(?) in

let fst: (?, ?) -> ? = fun a, b -> a in
let snd: (?, ?) -> ? = fun a, b -> b in

let not: Bool -> Bool = fun b -> !b in

let bool_eq: (Bool, Bool) -> Bool =
  fun a, b -> a && b \/ !a && !b in


# Lists #

# Add an element to the front of a list. #
let List.cons: (?, [?]) -> [?] =
  fun x, xs -> x::xs in

# Determine the length of a list. #
let List.length: [?] -> Int =
  fun xs ->
    case xs
    | [] => 0
    | _::xs => 1 + List.length(xs) end in

# Extract the head of the list. #
let List.hd: [?] -> ? =
  fun l -> 
    case l  
    | [] => ?
    | x::xs => x end in

# Extract the rest of the list. #
let List.tl: [?] -> [?] =
  fun l ->
    case l 
    | [] => ?
    | x::xs => xs end in

# Determine if a list is empty. #
let List.is_empty: [?] -> Bool =
  fun xs ->
    case xs
    | [] => true
    | _::_ => false end in

let List.nth: ([?], Int) -> ? =
  fun xs, n ->
    case xs, n
    | x::_, 0 => x
    | _::xs, n => List.nth(xs, n - 1)
    | [], _ => ? end in

# Reverse a List. #
let List.rev: [?] -> [?] =
  fun l -> 
    let go: ([?], [?]) -> [?] =
      fun xs, acc -> 
        case xs 
        | [] => acc 
        | x::xs => go(xs, x::acc) end in
   go(l, []) in

# Initialize a list with a given length using an initializer function #
let List.init: (Int, Int -> ?) -> [?] =
  fun len, f ->
    let go: (Int, [?]) -> [?] =
      fun idx, xs ->
        if idx < len 
        then go(idx+ 1, xs @ [f(idx)])   
        else xs in
    go(0, []) in

# Check if two lists are equal #
let List.equal: (? -> Bool, [?], [?]) -> Bool =
  fun p, xs, ys ->
    case xs, ys
    | [], [] => true
    | x::xs, y::ys => p(x, y) && List.equal(p, xs, ys)
    | _ => false end in

let List.eq = List.equal in

# Reduce a list from the left. #
let List.fold_left: ((?, ?)-> ?, ?, [?])-> ?   =
  fun f, acc, xs ->
    case xs 
    | [] => acc
    | hd::tl => List.fold_left(f, f(acc, hd), tl) end in

# Reduce a list from the right. #
let List.fold_right: ((?, ?)-> ?, [?], ?)-> ? =
  fun f, xs, acc ->
    case xs
    | [] => acc
    | hd::tl => f(hd, List.fold_right(f, tl, acc)) end in

let List.fold_left2: ((?, ?, ?) -> ?, ?, [?], [?]) -> [?] = 
  fun f, acc, xs, ys ->
    case xs, ys
    | [], [] => acc
    | x::xs, y::ys =>
      List.fold_left2(f, f(acc, x, y), xs, ys)
    | _ => ? end in

let List.fold_right2: ((?, ?, ?) -> ?, [?], [?], ?) -> [?] =
  fun f, acc, xs, ys ->
    case xs, ys
    | [], [] => acc
    | x::xs, y::ys =>
       f(x, y, List.fold_right2(f, xs, ys, acc))
    | _ => ? end in

let List.map: (? -> ?, [?]) -> ? =
  fun f, xs ->
    List.fold_right(fun x, acc -> f(x)::acc, xs, []) in

let List.map2: ((?,?) -> ?, [?], [?]) -> [?] =
  fun f, xs, ys ->
    List.fold_left2(
      fun x, y, acc -> f(x, y)::acc, xs, ys, []) in

# Keep elements that satisfy the test. #
let List.filter: (? -> Bool, [?]) -> [?] =
  fun p, xs ->
    case xs
    | [] => []
    | x::xs =>
      let xs = List.filter(p, xs) in 
      if p(x) then x :: xs else xs end in

let List.append: (([?], [?]) -> [?]) =
  fun xs, ys -> List.fold_right(List.cons, xs, ys) in

let List.concat: [[?]] -> [?] =
  fun xss -> List.fold_right(List.append, xss, [])  in

let List.flatten = List.concat in

let List.mapi: ((Int, ?) -> ?, [?]) -> [?] =
  fun f, xs ->
    let go: ? -> ? = fun idx, xs ->
      case xs
      | [] => []
      | hd::tl => f(idx, hd)::go(idx + 1, tl) end in
    go(0, xs) in

let List.filteri: ((Int, ?) -> Bool, [?]) -> [?] =
  fun f, xs ->
    List.concat(List.mapi(
      fun i, x -> if f(i, x) then [x] else [], xs)) in

let List.exists: (? -> Bool, [?]) -> Bool =
  fun p, xs -> List.exists(p, xs) in

let List.for_all: (? -> Bool, [?]) -> Bool =
  fun p, xs -> not(List.exists(fun x -> not(p(x)), xs)) in

let List.mem = fun eq, xs, y ->
  List.exists(fun x -> eq(x, y), xs) in

# Strings #

let String.starts_with: (String, String) -> Bool =
  fun string, prefix ->
    if string_length(string) >= string_length(prefix)
    then
      let string_prefix = string_sub(string, 0, string_length(prefix)) in
      string_prefix $== prefix
    else
      false in

let String.reverse: String -> String =
  fun string ->
    if string_length(string) <= 1
    then string
    else
      string_sub(string, string_length(string) - 1, 1)
      ++ String.reverse(string_sub(string, 0, string_length(string) - 1)) in

type StringTransform =
  + Reverse
  + Trim in

let String.transform: (String, [StringTransform]) -> String =
  fun string, transforms ->
    case transforms
    | [] => string
    | transform::rest =>
      let result =
        case transform
        | Reverse => String.reverse(string)
        | Trim =>
          let starts_with_space = String.starts_with(string, " ") in
          let ends_with_space = String.starts_with(String.reverse(string), " ") in
          if starts_with_space && ends_with_space then
            string_sub(string, 1, string_length(string) - 2)
          else if starts_with_space then
            string_sub(string, 1, string_length(string) - 1)
          else if ends_with_space then
            string_sub(string, 0, string_length(string) - 2)  
          else
            string
        end in
      String.transform(result, rest) end in


# Terms #

type Term =
  + Var(String)
  + Abs(String, Term)
  + App(Term, Term)
in

let term_to_string: Term -> String =
  fun term ->
    case term
    | Var(x) => x
    | Abs(x, body) => "(lambda " ++ x ++ ". " ++ term_to_string(body) ++ ")"
    | App(func, arg) => "(" ++ term_to_string(func) ++ " " ++ term_to_string(arg) ++ ")"
  end
in

let parse_term: String -> (Term, String) =
  fun string ->
    if String.starts_with(string, "(lambda ") then
      let keyword_length = string_length("(lambda ") in
      let var = string_sub(string, keyword_length, 1) in
      let body, rest_string = parse_term(string_sub(string, keyword_length + 3, string_length(string) - keyword_length - 3)) in
      # Skip the closing ) #
      let rest_string = string_sub(rest_string, 1, string_length(rest_string) - 1) in
      (Abs(var, body), rest_string)
    else
      if String.starts_with(string, "(")
      then
        let func, rest_string = parse_term(string_sub(string, 1, string_length(string) - 1)) in
        # Skip the space between func and arg #
        let rest_string = string_sub(rest_string, 1, string_length(rest_string) - 1) in
        let arg, rest_string = parse_term(rest_string) in
        # Skip the closing ) after arg #
        let rest_string = string_sub(rest_string, 1, string_length(rest_string) - 1) in
        (App(func, arg), rest_string)
      else
        (Var(string_sub(string, 0, 1)), string_sub(string, 1, string_length(string) - 1))
in


# TODO MVU #
# A todo has a description and a status #
type Todo = (String, Bool) in

# A description input buffer and a todo list #
type Model = (String, [Todo]) in

type Action =
  + AddTodo
  + RemoveTodo(Int)
  + ToggleTodo(Int)
  + UpdateBuffer(String) in

type Update = (Model, Action) -> Model in

let Todo.eq: (Todo, Todo) -> Bool =
  fun (d1, s1), (d2, s2) ->
  d1 $== d2 && bool_eq(s1, s2) in

let Model.eq: (Model, Model) -> Bool =
  fun (b1, ts1), (b2, ts2) ->
    b1 $== b2 && List.equal(Todo.eq, ts1, ts2) in

let Model.init: Model = ("", []) in
*/

// TODO MVU
type Todo = [string, boolean];

type Model = [string, Todo[]];

type AddTodo = string;

type RemoveTodo = number;

type ToggleTodo = number;

type UpdateBuffer = string;

type Action = AddTodo | RemoveTodo | ToggleTodo | UpdateBuffer;

type Update = (m: Model, a: Action) => Model;

const todo_eq: (t1: Todo, t2: Todo) => Boolean = ([d1, s1], [d2, s2]) => {
  return d1 === d2 && s1 === s2;
}

const todo_array_eq: (ta1: Todo[], ta2: Todo[]) => Boolean = (ta1, ta2) => {
  return ta1.length === ta2.length && ta1.every((el, i) => { return todo_eq(el, ta2[i]); });
}

const model_eq: (m1: Model, m2: Model) => Boolean = ([b1, ts1], [b2, ts2]) => {
  return b1 === b2 && todo_array_eq(ts1, ts2);
}

export { Model, AddTodo, RemoveTodo, Action, Update, model_eq };
