import { indexOfRegexGroup } from "./utils.mjs";

// get context of the hole
// currently only matching ES6 arrow functions
const getAnnotatedFunctionHoleContext = (sketchFileContent) => {
  const es6AnnotatedArrowFunctionPattern = /(const )(.+)(: )(\(.+\) => .+)( =[\s\S]*_())/;
  const firstPatternIndex = sketchFileContent.search(es6AnnotatedArrowFunctionPattern);
  const match = sketchFileContent.match(es6AnnotatedArrowFunctionPattern);
  const functionName = match[2];
  const functionTypeSpan = match[4];
  const linePosition = (sketchFileContent.substring(0, firstPatternIndex).match(/\n/g)).length;
  const characterPosition = indexOfRegexGroup(match, 4) - firstPatternIndex;

  return { functionName: functionName, functionTypeSpan: functionTypeSpan, linePosition: linePosition, characterPosition: characterPosition }
}

const getHoleContext = (sketchFileContent) => {
  // function _<(a: Apple, c: Cherry, b: Banana) => Cherry > (): (a: Apple, c: Cherry, b: Banana) => Cherry
  const holePattern = /_\(\)/;
  const firstPatternIndex = sketchFileContent.search(holePattern);
  console.log("firstPatternIndex: ", firstPatternIndex)
  const match = sketchFileContent.match(holePattern);
  console.log("match: ", match)
  const linePosition = (sketchFileContent.substring(0, firstPatternIndex).match(/\n/g)).length;
  console.log("linePosition: ", linePosition)
}

// pattern matching
// attempts to match strings to corresponding types, then returns an object containing the name, type span, and an interesting index
// base case - type can no longer be stepped into
// boolean, number, string, enum, unknown, any, void, null, undefined, never
// ideally this should be checked for before we do the for loop
// return typeSpan;
const checkBasic = (typeDefinition) => {
  // type _ = boolean
  const basicPattern = /(type )(.+)( = )(.+)/;
  const basicMatch = typeDefinition.match(basicPattern);
  let basicInterestingIndex = -1;
  if (basicMatch) {
    basicInterestingIndex = indexOfRegexGroup(basicMatch, 4);
  }

  if (basicInterestingIndex != -1) {
    const typeName = basicMatch[2];
    const typeSpan = basicMatch[4];
    return { typeName: typeName, typeSpan: typeSpan, interestingIndex: basicInterestingIndex }
  }
  return null;
}

const checkImports = (typeDefinition) => {
  // import { _, _ };
  const importPattern = /(import )(\{.+\})/;
  const importMatch = typeDefinition.match(importPattern);
  let importInterestingIndex = -1;
  if (importMatch) {
    importInterestingIndex = indexOfRegexGroup(importMatch, 2);
  }

  // import _;
  const defaultImportPattern = /(import )(.+)/;
  const defaultImportMatch = typeDefinition.match(defaultImportPattern);
  let defaultImportInterestingIndex = -1;
  if (defaultImportMatch) {
    defaultImportInterestingIndex = indexOfRegexGroup(defaultImportMatch, 2);
  }

  if (importInterestingIndex != -1) {
    const typeName = importMatch[2];
    const typeSpan = importMatch[2];
    return { typeName: typeName, typeSpan: typeSpan, interestingIndex: importInterestingIndex }
  } else if (defaultImportInterestingIndex != -1) {
    const typeName = defaultImportMatch[2];
    const typeSpan = defaultImportMatch[2];
    return { typeName: typeName, typeSpan: typeSpan, interestingIndex: defaultImportInterestingIndex }
  }

  return null;
}

const checkObject = (typeDefinition) => {
  // type _ = {
  //   _: t1;
  //   _: t2;
  // }
  const objectTypeDefPattern = /(type )(.+)( = )(\{.+\})/;
  const objectTypeDefMatch = typeDefinition.match(objectTypeDefPattern);
  let objectTypeDefInterestingIndex = -1;
  if (objectTypeDefMatch) {
    objectTypeDefInterestingIndex = indexOfRegexGroup(objectTypeDefMatch, 4);
  }

  if (objectTypeDefInterestingIndex != -1) {
    const typeName = objectTypeDefMatch[2];
    const typeSpan = objectTypeDefMatch[4];
    return { typeName: typeName, typeSpan: typeSpan, interestingIndex: objectTypeDefInterestingIndex }
  }
  return null;
}

const checkFunction = (typeDefinition) => {
  // const myFunc : (arg1: typ1, ...) => _
  const es6AnnotatedFunctionPattern = /(const )(.+)(: )(\(.+\) => .+)/;
  const es6AnnotatedFunctionMatch = typeDefinition.match(es6AnnotatedFunctionPattern);
  let es6AnnotatedFunctionInterestingIndex = -1;
  if (es6AnnotatedFunctionMatch) {
    es6AnnotatedFunctionInterestingIndex = indexOfRegexGroup(es6AnnotatedFunctionMatch, 4);
  }

  // type _ = (_: t1) => t2
  const es6FunctionTypeDefPattern = /(type )(.+)( = )(\(.+\) => .+)/;
  const es6FunctionTypeDefPatternMatch = typeDefinition.match(es6FunctionTypeDefPattern);
  let es6FunctionTypeDefInterestingIndex = -1;
  if (es6FunctionTypeDefPatternMatch) {
    es6FunctionTypeDefInterestingIndex = indexOfRegexGroup(es6FunctionTypeDefPatternMatch, 4);
  }

  if (es6AnnotatedFunctionInterestingIndex != -1) {
    const typeName = es6AnnotatedFunctionMatch[2];
    const typeSpan = es6AnnotatedFunctionMatch[4];
    return { typeName: typeName, typeSpan: typeSpan, interestingIndex: es6AnnotatedFunctionInterestingIndex }
  } else if (es6FunctionTypeDefInterestingIndex != -1) {
    const typeName = es6FunctionTypeDefPatternMatch[2];
    const typeSpan = es6FunctionTypeDefPatternMatch[4];
    return { typeName: typeName, typeSpan: typeSpan, interestingIndex: es6FunctionTypeDefInterestingIndex }
  }

  return null;
}

const getTypeContext = (typeDefinition) => {
  if (checkFunction(typeDefinition)) {
    return checkFunction(typeDefinition);
  } else if (checkObject(typeDefinition)) {
    return checkObject(typeDefinition);
  } else if (checkImports(typeDefinition)) {
    return checkImports(typeDefinition);
  } else {
    return checkBasic(typeDefinition);
  }
}

// recursive type definitions
// given the span of a type annotation on a function, return a list of names and positions for all type aliases used in that annotation
// find the span of a type definition: specialize to the case where it is a single struct
// recurse through array, tuple, object

const extractRelevantTypes = async (c, typeName, typeSpan, linePosition, characterPosition, foundSoFar, testFile, outputFile) => {
  // console.log("new iteration");
  // console.log("args: ", typeDefinition, linePosition, characterPosition, foundSoFar, testFile);
  // const obj = checkType(typeSpan);
  // console.log("obj", obj)
  // console.log("set, ", foundSoFar.get(obj.typeName))
  if (foundSoFar.get(typeName) === undefined && typeName !== typeSpan) {
    // console.log("obj: ", obj)
    foundSoFar.set(typeName, typeSpan);
    outputFile.write(`${typeName}: ${typeSpan}\n`);

    for (let i = 0; i < typeSpan.length; i++) {
      // console.log(obj.typeSpan[i]);
      const typeDefinitionResult = await c.typeDefinition({
        textDocument: {
          uri: testFile
        },
        position: {
          character: characterPosition + i,
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
      console.log("typeDefinitionResult:", JSON.stringify(typeDefinitionResult, "", 4))

      if (typeDefinitionResult.length != 0) {
        // try hover on the goto result
        const hoverResult = await c.hover({
          textDocument: {
            uri: typeDefinitionResult[0].uri
          },
          position: {
            character: typeDefinitionResult[0].range.start.character,
            line: typeDefinitionResult[0].range.start.line
          }
        });
        console.log("hoverResult: ", hoverResult)

        if (hoverResult != null) {
          const formattedHoverResult = hoverResult.contents.value.split("\n").reduce((acc, curr) => {
            if (curr != "" && curr != "```typescript" && curr != "```") {
              return acc + curr;
            } else {
              return acc;
            }
          }, "");

          const typeContext = getTypeContext(formattedHoverResult);
          console.log(typeContext);

          await extractRelevantTypes(c, typeContext.typeName, typeContext.typeSpan, typeDefinitionResult[0].range.start.line, typeDefinitionResult[0].range.start.character, foundSoFar, typeDefinitionResult[0].uri, outputFile);
        }
      } else {
        // pass
        // console.log("else path reached");
        // console.log(obj.typeSpan, linePosition, obj.interestingIndex + i, testFile)
      }
    }
  }
}

export { getAnnotatedFunctionHoleContext, getHoleContext, extractRelevantTypes };
