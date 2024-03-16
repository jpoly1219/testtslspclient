import { c } from "../app.mjs"
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
