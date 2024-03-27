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

  return { functionName: functionName, functionTypeSpan: functionTypeSpan, linePosition: linePosition, characterPosition: characterPosition };
}

// get context of the hole using hole function
const getHoleContext = async (c, injectedSketchFilePath, injectedSketchFileContent) => {
  const holePattern = /_\(\)/;
  const firstPatternIndex = injectedSketchFileContent.search(holePattern);
  const linePosition = (injectedSketchFileContent.substring(0, firstPatternIndex).match(/\n/g)).length;
  const characterPosition = firstPatternIndex - injectedSketchFileContent.split("\n", linePosition).join("\n").length - 1;

  const holeHoverResult = await c.hover({
    textDocument: {
      uri: injectedSketchFilePath
    },
    position: {
      character: characterPosition,
      line: linePosition
    }
  });

  const formattedHoverResult = holeHoverResult.contents.value.split("\n").reduce((acc, curr) => {
    if (curr != "" && curr != "```typescript" && curr != "```") {
      return acc + curr;
    } else {
      return acc;
    }
  }, "");

  // function _<(a: Apple, c: Cherry, b: Banana) => Cherry > (): (a: Apple, c: Cherry, b: Banana) => Cherry
  const holeFunctionPattern = /(function _)(\<.+\>)(\(\): )(.+)/;
  const match = formattedHoverResult.match(holeFunctionPattern);
  const functionName = "hole";
  const functionTypeSpan = match[4];

  const map1 = new Map();
  map1.set("Model", "[string, Todo[]]")
  getTargetTypes("(m: Model, a: Action) => Model", map1)

  return { functionName: functionName, functionTypeSpan: functionTypeSpan, linePosition: linePosition, characterPosition: characterPosition };
}

// get target types given a type span
const getTargetTypes = (typeSpan, aliasContext) => {
  // (Model, Action) => Model
  // if the expected type is an arrow type, the return type is a target type.
  // if the return type is a product type, its elements are target types.

  const targetTypes = [];
  targetTypes.push(typeSpan);

  const arrowPattern = /(\(.+\))( => )(.+)/;
  const arrowMatch = typeSpan.match(arrowPattern);
  if (arrowMatch) {
    const returnType = arrowMatch[3];
    targetTypes.push(returnType);

    const tuplePattern = /(\[.+\])/;
    if (aliasContext.has(returnType)) {
      const alias = aliasContext.get(returnType);
      console.log(alias)
      const tupleMatch = alias.match(tuplePattern);

      if (tupleMatch) {
        alias.slice(1, alias.length - 1).split(",").map((typ) => targetTypes.push(typ));
      }
    }
  }
  console.log("targetTypes: ", targetTypes);
  return targetTypes;
}


// pattern matching
// attempts to match strings to corresponding types, then returns an object containing the name, type span, and an interesting index
// base case - type can no longer be stepped into
// boolean, number, string, enum, unknown, any, void, null, undefined, never
// ideally this should be checked for before we do the for loop
// return typeSpan;

// check if hover result is from a primitive type
const checkPrimitive = (typeDefinition) => {
  // type _ = boolean
  const primitivePattern = /(type )(.+)( = )(.+)/;
  const primitiveMatch = typeDefinition.match(primitivePattern);
  let primitiveInterestingIndex = -1;
  if (primitiveMatch) {
    primitiveInterestingIndex = indexOfRegexGroup(primitiveMatch, 4);
  }

  if (primitiveInterestingIndex != -1) {
    const typeName = primitiveMatch[2];
    const typeSpan = primitiveMatch[4];
    return { typeName: typeName, typeSpan: typeSpan, interestingIndex: primitiveInterestingIndex }
  }
  return null;
}

// check if hover result is from an import
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

// check if hover result is from a module
const checkModule = (typeDefinition) => {
  // module "path/to/module"
  const modulePattern = /(module )(.+)/;
  const moduleMatch = typeDefinition.match(modulePattern);
  let moduleInterestingIndex = -1;
  if (moduleMatch) {
    moduleInterestingIndex = indexOfRegexGroup(moduleMatch, 2);
  }

  if (moduleInterestingIndex != -1) {
    const typeName = moduleMatch[2];
    const typeSpan = moduleMatch[2];
    return { typeName: typeName, typeSpan: typeSpan, interestingIndex: moduleInterestingIndex }
  }

  return null;
}

// check if hover result is from an object
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

// check if hover result is from a union
const checkUnion = (typeDefinition) => {
  // type _ = A | B | C
  const unionPattern = /(type )(.+)( = )((.+ | )+.+)/;
  const unionMatch = typeDefinition.match(unionPattern);
  let unionInterestingIndex = -1;
  if (unionMatch) {
    unionInterestingIndex = indexOfRegexGroup(unionMatch, 4);
  }

  if (unionInterestingIndex != -1) {
    const typeName = unionMatch[2];
    const typeSpan = unionMatch[4];
    return { typeName: typeName, typeSpan: typeSpan, interestingIndex: unionInterestingIndex }
  }
  return null;
}

// check if hover result is from a parameter
const checkParameter = (typeDefinition) => {
  // (parameter) name: type
  // const parameterPattern = /(\(parameter\) )(.+)(: )(.+))/;
  // const parameterMatch = typeDefinition.match(parameterPattern);
  // let parameterInterestingIndex = -1;
  // if (parameterMatch) {
  //   parameterInterestingIndex = indexOfRegexGroup(parameterMatch, 4);
  // }
  //
  // if (parameterInterestingIndex != -1) {
  //   const typeName = parameterMatch[2];
  //   const typeSpan = parameterMatch[4];
  //   return { typeName: typeName, typeSpan: typeSpan, interestingIndex: parameterInterestingIndex }
  // }
  return null;
}

// check if hover result is from a function
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

  // function myFunc<T>(args: types, genarg: T): returntype
  const genericFunctionTypePattern = /(function )(.+)(\<.+\>\(.*\))(: )(.+)/;
  const genericFunctionTypeMatch = typeDefinition.match(genericFunctionTypePattern);
  let genericFunctionTypeInterestingIndex = -1;
  if (genericFunctionTypeMatch) {
    genericFunctionTypeInterestingIndex = indexOfRegexGroup(genericFunctionTypeMatch, 3);
  }

  // function myFunc(args: types): returntype
  const functionTypePattern = /(function )(.+)(\(.*\))(: )(.+)/;
  const functionTypeMatch = typeDefinition.match(functionTypePattern);
  let functionTypeInterestingIndex = -1;
  if (functionTypeMatch) {
    functionTypeInterestingIndex = indexOfRegexGroup(functionTypeMatch, 3);
  }

  if (es6AnnotatedFunctionInterestingIndex != -1) {
    const typeName = es6AnnotatedFunctionMatch[2];
    const typeSpan = es6AnnotatedFunctionMatch[4];
    return { typeName: typeName, typeSpan: typeSpan, interestingIndex: es6AnnotatedFunctionInterestingIndex }
  } else if (es6FunctionTypeDefInterestingIndex != -1) {
    const typeName = es6FunctionTypeDefPatternMatch[2];
    const typeSpan = es6FunctionTypeDefPatternMatch[4];
    return { typeName: typeName, typeSpan: typeSpan, interestingIndex: es6FunctionTypeDefInterestingIndex }
  } else if (genericFunctionTypeInterestingIndex != -1) {
    const typeName = genericFunctionTypeMatch[2];
    const typeSpan = genericFunctionTypeMatch[3] + genericFunctionTypeMatch[4] + genericFunctionTypeMatch[5];
    return { typeName: typeName, typeSpan: typeSpan, interestingIndex: genericFunctionTypeInterestingIndex }
  } else if (functionTypeInterestingIndex != -1) {
    const typeName = functionTypeMatch[2];
    const typeSpan = functionTypeMatch[3] + functionTypeMatch[4] + functionTypeMatch[5];
    return { typeName: typeName, typeSpan: typeSpan, interestingIndex: functionTypeInterestingIndex }
  }

  return null;
}

// check if hover result is from a hole
const checkHole = (typeDefinition) => {
  // (type parameter) T in _<T>(): T
  const holePattern = /(\(type parameter\) T in _\<T\>\(\): T)/;
  const match = typeDefinition.match(holePattern);
  if (match) {
    const typeName = "hole function";
    const typeSpan = match[1];
    return { typeName: typeName, typeSpan: typeSpan }
  }

  return null;
}

// get type context from hover result
const getTypeContext = (typeDefinition) => {
  if (checkHole(typeDefinition)) {
    return checkHole(typeDefinition);
  } else if (checkParameter(typeDefinition)) {
    return checkParameter(typeDefinition);
  } else if (checkFunction(typeDefinition)) {
    return checkFunction(typeDefinition);
  } else if (checkUnion(typeDefinition)) {
    return checkUnion(typeDefinition);
  } else if (checkObject(typeDefinition)) {
    return checkObject(typeDefinition);
  } else if (checkImports(typeDefinition)) {
    return checkImports(typeDefinition);
  } else if (checkModule(typeDefinition)) {
    return checkModule(typeDefinition);
  } else {
    return checkPrimitive(typeDefinition);
  }
}

// recursively extract type definitions
// given the span of a type annotation on a function, return a list of names and positions for all type aliases used in that annotation
// find the span of a type definition: specialize to the case where it is a single struct
// recurse through array, tuple, object
const extractRelevantTypes = async (c, typeName, typeSpan, linePosition, characterPosition, foundSoFar, currentFile, outputFile) => {
  if (foundSoFar.get(typeName) === undefined && typeName !== typeSpan) {
    foundSoFar.set(typeName, typeSpan);
    outputFile.write(`${typeName}: ${typeSpan}\n`);

    // approach 1: exact match

    // for (let i = 0; i < typeSpan.length; i++) {
    //   console.log("whereami: ", linePosition, characterPosition, i, typeSpan, currentFile)
    //   const typeDefinitionResult = await c.typeDefinition({
    //     textDocument: {
    //       uri: currentFile
    //     },
    //     position: {
    //       character: characterPosition + i,
    //       line: linePosition
    //     }
    //   });
    //   console.log("typeDefinitionResult:", JSON.stringify(typeDefinitionResult, "", 4))
    //
    //   if (typeDefinitionResult.length != 0) {
    //     // try hover on the goto result
    //     const hoverResult = await c.hover({
    //       textDocument: {
    //         uri: typeDefinitionResult[0].uri
    //       },
    //       position: {
    //         character: typeDefinitionResult[0].range.start.character,
    //         line: typeDefinitionResult[0].range.start.line
    //       }
    //     });
    //     console.log("hoverResult: ", hoverResult)
    //
    //     if (hoverResult != null) {
    //       const formattedHoverResult = hoverResult.contents.value.split("\n").reduce((acc, curr) => {
    //         if (curr != "" && curr != "```typescript" && curr != "```") {
    //           return acc + curr;
    //         } else {
    //           return acc;
    //         }
    //       }, "");
    //
    //       const typeContext = getTypeContext(formattedHoverResult);
    //       console.log(typeContext);
    //
    //       await extractRelevantTypes(c, typeContext.typeName, typeContext.typeSpan, typeDefinitionResult[0].range.start.line, typeDefinitionResult[0].range.start.character, foundSoFar, typeDefinitionResult[0].uri, outputFile);
    //     }
    //   } else {
    //     // pass
    //   }
    // }

    // approach 2: relevant type match
    for (let i = 0; i < typeSpan.length; i++) {
      console.log("whereami: ", linePosition, characterPosition, i, typeSpan, currentFile)
      const typeDefinitionResult = await c.typeDefinition({
        textDocument: {
          uri: currentFile
        },
        position: {
          character: characterPosition + i,
          line: linePosition
        }
      });
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
          const formattedHoverResult = hoverResult.contents.value.split("\n").reduce((acc, curr) => {
            if (curr != "" && curr != "```typescript" && curr != "```") {
              return acc + curr;
            } else {
              return acc;
            }
          }, "");

          const typeContext = getTypeContext(formattedHoverResult);
          // console.log(typeContext);

          const referenceResult = await c.references({
            textDocument: {
              uri: typeDefinitionResult[0].uri
            },
            position: {
              character: typeDefinitionResult[0].range.start.character,
              line: typeDefinitionResult[0].range.start.line
            },
            context: {
              includeDeclaration: false
            }
          })

          // console.log(`referenceResult: ${JSON.stringify(referenceResult, "", 4)}`);

          if (referenceResult != null) {
            for (let j = 0; j < referenceResult.length; j++) {
              const completionResult = await c.completion({
                textDocument: {
                  uri: referenceResult[j].uri
                },
                position: {
                  character: referenceResult[j].range.start.character,
                  line: referenceResult[j].range.start.line
                },
                completionKind: 1
              })

              // if (completionResult != null) {
              //   console.log(`completionResult: ${JSON.stringify(completionResult.items.filter((item) => item.kind === 7 && item.sortText === "11"), "", 4)} `)
              // }

              await extractRelevantTypes(c, typeContext.typeName, typeContext.typeSpan, typeDefinitionResult[0].range.start.line, typeDefinitionResult[0].range.start.character, foundSoFar, typeDefinitionResult[0].uri, outputFile);
            }
          }

          // await extractRelevantTypes(c, typeContext.typeName, typeContext.typeSpan, typeDefinitionResult[0].range.start.line, typeDefinitionResult[0].range.start.character, foundSoFar, typeDefinitionResult[0].uri, outputFile);
        }

        // // try hover on the goto result
        // const hoverResult = await c.hover({
        //   textDocument: {
        //     uri: typeDefinitionResult[0].uri
        //   },
        //   position: {
        //     character: typeDefinitionResult[0].range.start.character,
        //     line: typeDefinitionResult[0].range.start.line
        //   }
        // });
        // console.log("hoverResult: ", hoverResult)
        //
        // if (hoverResult != null) {
        //   const formattedHoverResult = hoverResult.contents.value.split("\n").reduce((acc, curr) => {
        //     if (curr != "" && curr != "```typescript" && curr != "```") {
        //       return acc + curr;
        //     } else {
        //       return acc;
        //     }
        //   }, "");
        //
        //   const typeContext = getTypeContext(formattedHoverResult);
        //   console.log(typeContext);
        //
        //   await extractRelevantTypes(c, typeContext.typeName, typeContext.typeSpan, typeDefinitionResult[0].range.start.line, typeDefinitionResult[0].range.start.character, foundSoFar, typeDefinitionResult[0].uri, outputFile);
        // }
      } else {
        // pass
      }
    }
  }
}

export { getAnnotatedFunctionHoleContext, getHoleContext, extractRelevantTypes };
