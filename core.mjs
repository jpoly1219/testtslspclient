import { indexOfRegexGroup } from "./utils.mjs";

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
    interestingIndex = indexOfRegexGroup(match, 4);
  }

  if (interestingIndex != -1) {
    const typeName = match[2];
    const typeSpan = typeDefinition.slice(interestingIndex);
    // console.log("checkBasic: ", typeName, typeSpan, interestingIndex);
    return { typeName: typeName, typeSpan: typeSpan, interestingIndex: interestingIndex }
  }
  return null;
}

const checkImports = (typeDefinition) => {
  // import { _, _ };
  const pattern1 = /(import )(\{ )(.+)(, )(.+)( \})/;
  const match1 = typeDefinition.match(pattern1);
  let interestingIndex1 = -1;
  if (match1) {
    interestingIndex1 = indexOfRegexGroup(match1, 2);
  }

  // import _;
  const pattern2 = /(import )(.+)/;
  const match2 = typeDefinition.match(pattern2);
  let interestingIndex2 = -1;
  if (match2) {
    interestingIndex2 = indexOfRegexGroup(match2, 2);
  }

  if (interestingIndex1 != -1) {
    const typeName = match1[1];
    const typeSpan = typeDefinition.slice(interestingIndex1);
    // console.log(`checkImports: typeName: ${typeName}, typeSpan: ${typeSpan}, interestinIndex1: ${interestingIndex1}`);
    return { typeName: typeName, typeSpan: typeSpan, interestingIndex: interestingIndex1 }
  } else if (interestingIndex2 != -1) {
    const typeName = match2[2];
    const typeSpan = typeDefinition.slice(interestingIndex2);
    // console.log(`checkFunction: typeName: ${typeName}, typeSpan: ${typeSpan}, interestingIndex2: ${interestingIndex2}`);
    return { typeName: typeName, typeSpan: typeSpan, interestingIndex: interestingIndex2 }
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
    interestingIndex = indexOfRegexGroup(match, 4);
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
    interestingIndex1 = indexOfRegexGroup(match1, 4);
  }

  // type _ = (_: t1) => t2
  const pattern2 = /(type )(.+)( = )(\()(.+)(: )(.+)(\))( => )(.+)/;
  const match2 = typeDefinition.match(pattern2);
  let interestingIndex2 = -1;
  if (match2) {
    interestingIndex2 = indexOfRegexGroup(match2, 4);
  }

  if (interestingIndex1 != -1) {
    const typeName = match1[2];
    const typeSpan = typeDefinition.slice(interestingIndex1);
    // console.log(`checkFunction: typeName: ${typeName}, typeSpan: ${typeSpan}, interestingIndex1: ${interestingIndex1}`);
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

const recursiveDefine = async (c, typeDefinition, linePosition, characterPosition, foundSoFar, testFile) => {
  // console.log("new iteration");
  // console.log("args: ", typeDefinition, linePosition, characterPosition, foundSoFar, testFile);
  const obj = checkType(typeDefinition);
  // console.log("obj", obj)
  if (obj != null) {
    // console.log("set, ", foundSoFar.get(obj.typeName))
    if (foundSoFar.get(obj.typeName) == undefined && obj.typeName != obj.typeSpan) {
      // console.log("obj: ", obj)
      foundSoFar.set(obj.typeName, obj.typeSpan);

      for (let i = 0; i < obj.typeSpan.length; i++) {
        // console.log(obj.typeSpan[i]);
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
        // console.log("typeDefinitionResult:", JSON.stringify(typeDefinitionResult, "", 4))

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
          // console.log("hoverResult: ", hoverResult)

          if (hoverResult != null) {
            const someTypeDefinition = hoverResult.contents.value.split("\n").reduce((acc, curr) => {
              if (curr != "" && curr != "```typescript" && curr != "```") {
                return acc + curr;
              } else {
                return acc;
              }
            }, "");

            await recursiveDefine(c, someTypeDefinition, typeDefinitionResult[0].range.start.line, typeDefinitionResult[0].range.start.character, foundSoFar, typeDefinitionResult[0].uri);
            // await recursiveDefine(c, someTypeDefinition, hoverResult.range.start.line, hoverResult.range.start.character, foundSoFar, typeDefinitionResult[0].uri);
          }
        } else {
          // pass
          // console.log("else path reached");
          // console.log(obj.typeSpan, linePosition, obj.interestingIndex + i, testFile)
        }
      }
    }
  }
}

export { checkType, recursiveDefine };
