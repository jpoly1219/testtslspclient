# testtslspclient

A project that aims to run `typescript-language-server` outside the scope of an editor.

## Installation

Install the following dependencies:

```
npm install -g typescript-language-server typescript
```

Clone the `ts-lsp-client` repo:

```
https://github.com/jpoly1219/ts-lsp-client
```

... and run these commands:
```
cd ts-lsp-client
npm install
git checkout -b completion
git pull origin completion
```

Clone this `testtslspclient` repo:
```
https://github.com/jpoly1219/testtslspclient
```

... and run these commands:
```
cd testtslspclient
npm install
```

## Running the code

Run the following command to start the program:
```
node app.mjs <target directory with the code sketch> <code sketch file name>
```
Note that the target directory must be the full path. For example, if the target directory is in `~/target/` and the code sketch file is `sketch.ts`, you would call the following:
```
node app.mjs /home/<your username>/target/ sketch.ts
```

## Diagram

This is a top-level view of how data flows throughout the program.
```mermaid
flowchart TD
  n1[Input: A directory containing a code sketch with a hole, and the sketch itself]
  n1 --> n2
  n2[getFunctionHoleContext]
  n2 --> n3
  n3[extractRelevantTypes]
  n3 --> n4
  n4[Output: A map and file of types relevant to the hole]
```

We first try to see where the hole is located at. Then we detect the type of the hole.
Once we find the type of the hole, we use that to extract relevant types by recursively walking the type definitions in the given directory.
