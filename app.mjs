import { JSONRPCEndpoint, LspClient } from "../ts-lsp-client/build/src/main.js"
import { Readable, Writable } from "stream"
import { spawn } from "child_process";
import * as fs from "fs"

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
    'typeDefinition': { 'dynamicRegistration': true },
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
  capabilities: {},
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
console.log(resHoverTest2)

// Getting context of the hole

// method 1: match for common patterns
// from corpus, find the first instance of __HOLE__
// loop backwards to see if we can regex match a pattern
const holeNumOfChars = 8;
const firstHoleIndex = corpus.indexOf("__HOLE__");
const pattern = /const (.+): \((.+): (.+)\) => (.+) =\n  __HOLE__/;
const firstPatternIndex = corpus.search(pattern);
const match = corpus.match(pattern);
const matchedFunctionName = match[1];
const matchedArgName = match[2];
const matchedArgTypeName = match[3];
const matchedReturnTypeName = match[4];
console.log(match);
console.log(matchedFunctionName, matchedArgName, matchedArgTypeName, matchedReturnTypeName);
console.log(firstHoleIndex, firstPatternIndex)
// const corpus = 'type T2 = number;\n\ntype T1 = {\n  name: string;\n  t2: T2;\n}\n\ntype T3 = boolean;\n\nconst myFunc: (_: T1) => T3 =\n  __HOLE__;\n\n/* should return \n\ntype B = number;\ntype A = {\n  name: string;\n  b: B;\n}\ntype C = boolean;\n\n*/';
let fromBeginning = corpus.substring(0, firstPatternIndex);
let lineNumber = (fromBeginning.match(/\n/g)).length;

const resHoverFunctionTypeMatch = await c.hover({
  textDocument: {
    uri: 'file:///home/jacob/projects/testtslspclient/test2.ts'
  },
  position: {
    character: 6,
    line: lineNumber
  }
});

console.log(resHoverFunctionTypeMatch.contents.value);
const patternTypeSignature = resHoverFunctionTypeMatch.contents.value.split("\n")[2];
