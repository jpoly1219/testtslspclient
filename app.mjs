import { JSONRPCEndpoint, LspClient } from "../ts-lsp-client/build/src/main.js"
import { Readable, Writable } from "stream"
import { spawn } from "child_process";
import * as fs from "fs"
import { type } from "os";

class WriteMemory extends Writable {
  _buffer = "";

  constructor() {
    super();
    this._buffer = '';
  }

  _write(chunk, _, next) {
    this._buffer += chunk;
    next();
  }

  reset() {
    this._buffer = '';
  }

  buffer() {
    return this._buffer;
  }
}
const mockReadStreamOK = (jsonRPC, eof) => {
  const readable = new Readable();
  const jsonRPCs = Array.isArray(jsonRPC) ? jsonRPC : [jsonRPC];
  jsonRPCs.forEach(j => {
    if ((typeof (j) !== 'string')) {
      const jsonRPCStr = JSON.stringify(j);
      readable.push(`Content-Length: ${jsonRPCStr.length}\r\n\r\n${jsonRPCStr}`);
    } else {
      console.log(`j is string: ${j}`)
      readable.push(j);
    }
  })
  if (eof) {
    readable.push(null);
  }

  return readable;
};
const r = mockReadStreamOK([], true)
const w = new WriteMemory()
const r2 = spawn('typescript-language-server', ['--stdio'])
const e = new JSONRPCEndpoint(r2.stdin, r2.stdout)
const c = new LspClient(e)

const capabilities = {
  'textDocument': {
    'codeAction': { 'dynamicRegistration': true },
    'codeLens': { 'dynamicRegistration': true },
    'colorProvider': { 'dynamicRegistration': true },
    'completion': {
      'completionItem': {
        'commitCharactersSupport': true,
        'documentationFormat': ['markdown', 'plaintext'],
        'snippetSupport': true
      },
      'completionItemKind': {
        'valueSet': [1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
          24,
          25]
      },
      'contextSupport': true,
      'dynamicRegistration': true
    },
    'definition': { 'dynamicRegistration': true },
    'documentHighlight': { 'dynamicRegistration': true },
    'documentLink': { 'dynamicRegistration': true },
    'documentSymbol': {
      'dynamicRegistration': true,
      'symbolKind': {
        'valueSet': [1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
          24,
          25,
          26]
      }
    },
    'formatting': { 'dynamicRegistration': true },
    'hover': {
      'contentFormat': ['markdown', 'plaintext'],
      'dynamicRegistration': true
    },
    'implementation': { 'dynamicRegistration': true },
    'inlayhint': { 'dynamicRegistration': true },
    'onTypeFormatting': { 'dynamicRegistration': true },
    'publishDiagnostics': { 'relatedInformation': true },
    'rangeFormatting': { 'dynamicRegistration': true },
    'references': { 'dynamicRegistration': true },
    'rename': { 'dynamicRegistration': true },
    'signatureHelp': {
      'dynamicRegistration': true,
      'signatureInformation': { 'documentationFormat': ['markdown', 'plaintext'] }
    },
    'synchronization': {
      'didSave': true,
      'dynamicRegistration': true,
      'willSave': true,
      'willSaveWaitUntil': true
    },
    'typeDefinition': { 'dynamicRegistration': true, 'linkSupport': true },
    'typeHierarchy': { 'dynamicRegistration': true }
  },
  'workspace': {
    'applyEdit': true,
    'configuration': true,
    'didChangeConfiguration': { 'dynamicRegistration': true },
    'didChangeWatchedFiles': { 'dynamicRegistration': true },
    'executeCommand': { 'dynamicRegistration': true },
    'symbol': {
      'dynamicRegistration': true,
      'symbolKind': {
        'valueSet': [1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
          24,
          25,
          26]
      }
    }, 'workspaceEdit': { 'documentChanges': true },
    'workspaceFolders': true
  },
  'general': {
    'positionEncodings': ['utf-8']
  },
}
const root_uri = 'file:///home/jacob/projects/testtslspclient/'
const workspaceFolders = [{ 'name': 'testtslspclient', 'uri': root_uri }]
const outputfile = fs.createWriteStream("log.txt")
r2.stdout.on('data', (d) => outputfile.write(d))

const resInit = await c.initialize({
  processId: process.pid,
  // rootPath: '.',
  // rootUri: null,
  capabilities: capabilities,
  trace: 'off',
  workspaceFolders: workspaceFolders,
  initializationOptions: {
    preferences: {
      includeInlayVariableTypeHints: true
    }
  }
});

const notifOpenTest1 = await c.didOpen({
  textDocument: {
    uri: 'file:///home/jacob/projects/testtslspclient/test.ts',
    languageId: 'ts',
    text: 'const x = 1;\nconsole.log(x)\nx. \nconst fun = () => {\n  return 1 + x;\n}',
    version: 1
  }
});

const resDef = await c.definition({
  textDocument: {
    uri: 'file:///home/jacob/projects/testtslspclient/test.ts'
  },
  position: {
    character: 12,
    line: 1
  }
});

const resComp = await c.completion({
  context: {
    triggerKind: 2,
    triggerCharacter: "."
  },
  textDocument: {
    uri: 'file:///home/jacob/projects/testtslspclient/test.ts'
  },
  position: {
    character: 2,
    line: 2
  }
});

const resInlayHint = await c.inlayHint({
  textDocument: {
    uri: 'file:///home/jacob/projects/testtslspclient/test.ts'
  },
  range: {
    start: {
      line: 3, character: 8
    },
    end: {
      line: 3, character: 9
    }
  }
});

const resInlayHint2 = await c.inlayHint({
  textDocument: {
    uri: 'file:///home/jacob/projects/testtslspclient/test.ts'
  },
  range: {
    start: {
      line: 0, character: 6
    },
    end: {
      line: 0, character: 7
    }
  }
});

const resHover = await c.hover({
  textDocument: {
    uri: 'file:///home/jacob/projects/testtslspclient/test.ts'
  },
  position: {
    character: 8,
    line: 1
  }
});
// const resTypeHierarchy = await c.prepareTypeHierarchy({
//   textDocument: {
//     uri: 'file:///home/jacob/projects/testtslspclient/test.ts'
//   },
//   position: {
//     character: 0,
//     line: 2
//   }
// });

const resSignatureHelp = await c.signatureHelp({
  textDocument: {
    uri: 'file:///home/jacob/projects/testtslspclient/test.ts'
  },
  position: {
    character: 2,
    line: 2
  },
  context: {
    triggerKind: 2,
    triggerCharacter: ".",
    isRetrigger: false,
  }
});
// console.log(resInit)
console.log("=== Completion ===")
console.log(resComp)
console.log("=== Inlay Hint ===")
console.log(resInlayHint)
console.log("=== Hover ===")
console.log(resHover)

// console.log(JSON.stringify(response))
// console.log(JSON.stringify(response2))
// const message = {
//   processId: process.pid,
//   // rootPath: '.',
//   // rootUri: null,
//   capabilities: capabilities,
//   trace: 'off',
//   workspaceFolders: []
// };
// e.send('initialize', message);

console.log("=========Test 2==========");

const corpus = 'type T2 = number;\n\ntype T1 = {\n  name: string;\n  t2: T2;\n}\n\ntype T3 = boolean;\n\nconst myFunc: (_: T1) => T3 =\n  __HOLE__;\n\n/* should return \n\ntype B = number;\ntype A = {\n  name: string;\n  b: B;\n}\ntype C = boolean;\n\n*/';

const notifOpenTest2 = await c.didOpen({
  textDocument: {
    uri: 'file:///home/jacob/projects/testtslspclient/test2.ts',
    languageId: 'ts',
    text: 'type T2 = number;\n\ntype T1 = {\n  name: string;\n  t2: T2;\n}\n\ntype T3 = boolean;\n\nconst myFunc: (_: T1) => T3 =\n  __HOLE__;\n\n/* should return \n\ntype B = number;\ntype A = {\n  name: string;\n  b: B;\n}\ntype C = boolean;\n\n*/',
    version: 1
  }
});

const resCompTest2 = await c.completion({
  context: {
    triggerKind: 1,
  },
  textDocument: {
    uri: 'file:///home/jacob/projects/testtslspclient/test2.ts'
  },
  position: {
    character: 19,
    line: 9
  }
});

const resInlayHintTest2 = await c.inlayHint({
  textDocument: {
    uri: 'file:///home/jacob/projects/testtslspclient/test2.ts'
  },
  range: {
    start: {
      line: 9, character: 6
    },
    end: {
      line: 9, character: 12
    }
  }
});

const resHoverTest2 = await c.hover({
  textDocument: {
    uri: 'file:///home/jacob/projects/testtslspclient/test2.ts'
  },
  position: {
    character: 8,
    line: 9
  }
});

console.log("=== Completion ===")
console.log(resCompTest2)
console.log("=== Inlay Hint ===")
console.log(resInlayHintTest2)
console.log("=== Hover ===")
console.log("\n=== Current File ===\n")
console.log(corpus)
console.log("\n=== Testing Hover Capabilities ===\n")
console.log(resHoverTest2)

// Getting context of the hole

// method 1: match for common patterns
// from corpus, find the first instance of __HOLE__
// loop backwards to see if we can regex match a pattern
const indexOfGroup = (match, n) => {
  let ix = match.index;
  for (let i = 1; i < n; i++)
    ix += match[i].length;
  return ix;
}


const firstHoleIndex = corpus.indexOf("__HOLE__");
// pattern 1: const myFunc: (_: T1) => T2 =\n  __HOLE__
// divided into groups: const .+: \(.+: .+\) => .+ =\n __HOLE__
//                      1^^^^^2^3^^^4^5^6^7^^^^^8^9^^^^^^^^^^^^
const pattern = /(const )(.+)(: \()(.+)(: )(.+)(\) => )(.+)( =\n  __HOLE__)/;

const firstPatternIndex = corpus.search(pattern);
const match = corpus.match(pattern);
const matchedFunctionName = match[2];
const matchedArgumentName = match[4];
const matchedArgumentTypeName = match[6];
const matchedReturnTypeName = match[8];

let fromBeginning = corpus.substring(0, firstPatternIndex);
let lineNumber = (fromBeginning.match(/\n/g)).length;


console.log("\n=== Programmatically Extracted Types Using Pattern << const myFunc: (_: T1) => T2 =\\n  __HOLE__ >> ===\n")

// type of function
const resHoverFunctionTypeMatch = await c.hover({
  textDocument: {
    uri: 'file:///home/jacob/projects/testtslspclient/test2.ts'
  },
  position: {
    character: indexOfGroup(match, 2) - firstPatternIndex,
    line: lineNumber
  }
});

const functionTypeSignature = resHoverFunctionTypeMatch.contents.value.split("\n").reduce((acc, curr) => {
  if (curr != "" && curr != "```typescript" && curr != "```") {
    return acc + curr;
  } else {
    return acc;
  }
}, "");

console.log(`function ${matchedFunctionName}'s type signature: ${functionTypeSignature}`);

// type of argument
const resHoverArgumentTypeMatch = await c.hover({
  textDocument: {
    uri: 'file:///home/jacob/projects/testtslspclient/test2.ts'
  },
  position: {
    character: indexOfGroup(match, 6) - firstPatternIndex,
    line: lineNumber
  }
});

const argumentTypeSignature = resHoverArgumentTypeMatch.contents.value.split("\n").reduce((acc, curr) => {
  if (curr != "" && curr != "```typescript" && curr != "```") {
    return acc + curr;
  } else {
    return acc;
  }
}, "");
console.log(`argument ${matchedArgumentName}'s type signature: ${argumentTypeSignature}`);

// type of return
const resHoverReturnTypeMatch = await c.hover({
  textDocument: {
    uri: 'file:///home/jacob/projects/testtslspclient/test2.ts'
  },
  position: {
    character: indexOfGroup(match, 8) - firstPatternIndex,
    line: lineNumber
  }
});

const returnTypeSignature = resHoverReturnTypeMatch.contents.value.split("\n").reduce((acc, curr) => {
  if (curr != "" && curr != "```typescript" && curr != "```") {
    return acc + curr;
  } else {
    return acc;
  }
}, "");
console.log(`return's type signature: ${returnTypeSignature}`);

// pattern matching
// attempts to match strings to corresponding types, then returns an object containing the name, type span, and an interesting index
// base case - type can no longer be stepped into
// boolean, number, string, enum, unknown, any, void, null, undefined, never
// ideally this should be checked for before we do the for loop
// return typeSpan;
const checkBasic = (typeDefinition) => {
  // type _ = boolean
  const pattern = /(type )(.+)( = )(.+)/;
  const match = typeDefinition.match(pattern);
  let interestingIndex = -1;
  if (match) {
    interestingIndex = indexOfGroup(match, 4);
  }

  if (interestingIndex != -1) {
    const typeName = match[2];
    const typeSpan = typeDefinition.slice(interestingIndex);
    // console.log("checkBasic: ", typeName, typeSpan, interestingIndex);
    return { typeName: typeName, typeSpan: typeSpan, interestingIndex: interestingIndex }
  }
  return null;
}

const checkObject = (typeDefinition) => {
  // type _ = {
  //   _: t1;
  //   _: t2;
  // }

  const pattern = /(type )(.+)( = )(\{)(.+)(\})/;
  const match = typeDefinition.match(pattern);
  let interestingIndex = -1;
  if (match) {
    interestingIndex = indexOfGroup(match, 4);
  }

  if (interestingIndex != -1) {
    const typeName = match[2];
    const typeSpan = typeDefinition.slice(interestingIndex);
    // console.log(`checkObject: typeName: ${typeName}, typeSpan: ${typeSpan}, interestingIndex: ${interestingIndex}`);
    return { typeName: typeName, typeSpan: typeSpan, interestingIndex: interestingIndex }
  }
  return null;
}

const checkFunction = (typeDefinition) => {
  // const _ : () => _ = {
  //   body
  // }
  const pattern1 = /(const )(.+)(: )(\()(.+)(: )(.+)(\))( => )(.+)/;
  const match1 = typeDefinition.match(pattern1);
  let interestingIndex1 = -1;
  if (match1) {
    interestingIndex1 = indexOfGroup(match1, 4);
  }

  // type _ = (_: t1) => t2
  const pattern2 = /(type )(.+)( = )(\()(.+)(: )(.+)(\))( => )(.+)/;
  const match2 = typeDefinition.match(pattern2);
  let interestingIndex2 = -1;
  if (match2) {
    interestingIndex2 = indexOfGroup(match2, 4);
  }

  if (interestingIndex1 != -1) {
    const typeName = match1[2];
    const typeSpan = typeDefinition.slice(interestingIndex1);
    console.log(`checkFunction: typeName: ${typeName}, typeSpan: ${typeSpan}, interestingIndex1: ${interestingIndex1}`);
    return { typeName: typeName, typeSpan: typeSpan, interestingIndex: interestingIndex1 }
  } else if (interestingIndex2 != -1) {
    const typeName = match2[2];
    const typeSpan = typeDefinition.slice(interestingIndex2);
    // console.log(`checkFunction: typeName: ${typeName}, typeSpan: ${typeSpan}, interestingIndex2: ${interestingIndex2}`);
    return { typeName: typeName, typeSpan: typeSpan, interestingIndex: interestingIndex2 }
  }

  return null;
}

const checkType = (typeDefinition) => {
  if (checkFunction(typeDefinition)) {
    return checkFunction(typeDefinition);
  } else if (checkObject(typeDefinition)) {
    return checkObject(typeDefinition);
  } else {
    return checkBasic(typeDefinition);
  }
}

// recursive type definitions
// given the span of a type annotation on a function, return a list of names and positions for all type aliases used in that annotation
// find the span of a type definition: specialize to the case where it is a single struct
// recurse through array, tuple, object

const recursiveDefine = async (c, typeDefinition, linePosition, characterPosition, foundSoFar, testFile) => {
  console.log("new iteration");
  const obj = checkType(typeDefinition);
  if (obj != {} || foundSoFar.get(obj.typeName) != undefined) {
    console.log("obj: ", obj)
    foundSoFar.set(obj.typeName, obj.typeSpan);

    for (let i = 0; i < obj.typeSpan.length; i++) {
      const typeDefinitionResult = await c.typeDefinition({
        textDocument: {
          uri: testFile
        },
        position: {
          character: obj.interestingIndex + i,
          line: linePosition
        }
      });
      // range: {
      //   start: {
      //     line: linePosition,
      //     character: characterPosition
      //   },
      //   end: {
      //     line: linePosition,
      //     character: characterPosition
      //   }
      // },
      // uri: 'file:///home/jacob/projects/testtslspclient/test2.ts'
      console.log(typeDefinitionResult)

      if (typeDefinitionResult.length != 0) {
        // try hover on the goto result
        const hoverResult = await c.hover({
          textDocument: {
            uri: testFile
          },
          position: {
            character: typeDefinitionResult[0].range.start.character,
            line: typeDefinitionResult[0].range.start.line
          }
        });

        if (hoverResult != null) {
          const someTypeDefinition = hoverResult.contents.value.split("\n").reduce((acc, curr) => {
            if (curr != "" && curr != "```typescript" && curr != "```") {
              return acc + curr;
            } else {
              return acc;
            }
          }, "");

          let targetFile = testFile;
          console.log(typeDefinitionResult)
          if ('targetUri' in typeDefinitionResult[0]) {
            targetFile = typeDefinitionResult[0].targetUri
          }
          await recursiveDefine(c, someTypeDefinition, typeDefinitionResult[0].range.start.line, typeDefinitionResult[0].range.start.character, foundSoFar, targetFile);
        }
      } else {
        // pass
        // maybe do something
        // console.log("else path reached");
      }
    }
  }
}

console.log("start with: ", functionTypeSignature, lineNumber, indexOfGroup(match, 3) + 2 - firstPatternIndex);
const foundSoFar = new Map();
await recursiveDefine(c, functionTypeSignature, lineNumber, indexOfGroup(match, 3) + 2 - firstPatternIndex, foundSoFar, 'file:///home/jacob/projects/testtslspclient/test2.ts');
console.log(foundSoFar);

console.log("\n=== Testing Scattered Type Definitions ===\n")

const notifOpenDefAC = await c.didOpen({
  textDocument: {
    uri: 'file:///home/jacob/projects/testtslspclient/def_ac.ts',
    languageId: 'ts',
    text: 'import { Bravo } from "./def_b";\n/* FILE 2: */\n/* code ... *./\ntype Alpha = {\n  name: string;\n  b: Bravo;\n}\n/* code ... */\ntype Charlie = boolean;\n/* code ... */\nexport { Alpha, Charlie };',
    version: 1
  }
});

const notifOpenDefB = await c.didOpen({
  textDocument: {
    uri: 'file:///home/jacob/projects/testtslspclient/def_b.ts',
    languageId: 'ts',
    text: '/* FILE 1: */\n/* code ... */\ntype Bravo = number;\n/* code ... */\nexport { Bravo };',
    version: 1
  }
});

const notifOpenTestTogether = await c.didOpen({
  textDocument: {
    uri: 'file:///home/jacob/projects/testtslspclient/test_together.ts',
    languageId: 'ts',
    text: 'import { Alpha, Charlie } from "./def_ac.ts";\n/* FILE 3: */\n/* code ... */\nconst myFunc: (_: Alpha) => Charlie =\n  __HOLE__;\n/* code ... */',
    version: 1
  }
});

const ttcorpus = 'import { Alpha, Charlie } from "./def_ac.ts";\n/* FILE 3: */\n/* code ... */\nconst myFunc: (_: Alpha) => Charlie =\n  __HOLE__;\n/* code ... */';
// pattern 1: const myFunc: (_: T1) => T2 =\n  __HOLE__
// divided into groups: const .+: \(.+: .+\) => .+ =\n __HOLE__
//                      1^^^^^2^3^^^4^5^6^7^^^^^8^9^^^^^^^^^^^^
const ttpattern = /(const )(.+)(: \()(.+)(: )(.+)(\) => )(.+)( =\n  __HOLE__)/;

const ttfirstPatternIndex = ttcorpus.search(ttpattern);
const ttmatch = ttcorpus.match(pattern);
const ttmatchedFunctionName = ttmatch[2];

let ttfromBeginning = ttcorpus.substring(0, ttfirstPatternIndex);
let ttlineNumber = (ttfromBeginning.match(/\n/g)).length;

// type of function
const ttresHoverFunctionTypeMatch = await c.hover({
  textDocument: {
    uri: 'file:///home/jacob/projects/testtslspclient/test_together.ts'
  },
  position: {
    character: indexOfGroup(ttmatch, 2) - ttfirstPatternIndex,
    line: ttlineNumber
  }
});

const ttfunctionTypeSignature = ttresHoverFunctionTypeMatch.contents.value.split("\n").reduce((acc, curr) => {
  if (curr != "" && curr != "```typescript" && curr != "```") {
    return acc + curr;
  } else {
    return acc;
  }
}, "");

console.log(`function ${ttmatchedFunctionName}'s type signature: ${ttfunctionTypeSignature}`);

console.log("start with: ", ttfunctionTypeSignature, ttlineNumber, indexOfGroup(ttmatch, 3) + 2 - ttfirstPatternIndex);
const ttfoundSoFar = new Map();
await recursiveDefine(c, ttfunctionTypeSignature, ttlineNumber, indexOfGroup(ttmatch, 3) + 2 - ttfirstPatternIndex, ttfoundSoFar, 'file:///home/jacob/projects/testtslspclient/test_together.ts');
console.log(ttfoundSoFar);

const ttresHoverArgumentTypeMatch = await c.hover({
  textDocument: {
    uri: 'file:///home/jacob/projects/testtslspclient/test_together.ts'
  },
  position: {
    character: indexOfGroup(ttmatch, 6) - ttfirstPatternIndex,
    line: ttlineNumber
  }
});

const ttargumentTypeSignature = ttresHoverArgumentTypeMatch.contents.value.split("\n").reduce((acc, curr) => {
  if (curr != "" && curr != "```typescript" && curr != "```") {
    return acc + curr;
  } else {
    return acc;
  }
}, "");
console.log(`argument's type signature: ${ttargumentTypeSignature}`);
