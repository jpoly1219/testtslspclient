import { execSync } from "child_process";
import * as fs from "fs";
import { generatePrompt, mockLLM } from "./testrunner-core.mjs";

// testrunner
// cli args:
// runName
// errorRoundsMax
// sourceFolder (with trailing slash)
// apiKey
// (expectedType) will be supplied by running app.mjs
const runName = process.argv[2];
const errorRoundsMax = process.argv[3];
const sourceFolder = process.argv[4];
const apiKey = process.argv[5];

console.log(runName, errorRoundsMax, sourceFolder, apiKey)

// inject hole function into sketch.ts
const sketchFilePath = `${sourceFolder}sketch.ts`;
const sketchFileContent = fs.readFileSync(sketchFilePath, "utf8");
const fd = fs.openSync(sketchFilePath, "w+");
const buffer = Buffer.from("declare function _<T>(): T\n");

fs.writeSync(fd, buffer, 0, buffer.length, 0);
fs.writeSync(fd, sketchFileContent, 0, sketchFileContent.length, buffer.length);
fs.close(fd);

// call node app.mjs <dir> sketch.ts
execSync(`node app.mjs ${sourceFolder} sketch.ts`)

// get the returned types
const targetTypes = fs.readFileSync("output.txt", "utf8");

// ask LLM to complete the sketch using the returned types

// instantiate connection and save conn object

const prompt = generatePrompt(sketchFileContent, targetTypes);
console.log("prompt: \n", prompt);

const erroneousSketch1 = mockLLM(0);
const erroneousSketch2 = mockLLM(1);
const completedSketch = mockLLM(2);

// write completion to sketch
fs.writeFileSync(`${sourceFolder}erroneous_sketch_1.ts`, erroneousSketch1);
fs.writeFileSync(`${sourceFolder}erroneous_sketch_2.ts`, erroneousSketch2);
fs.writeFileSync(`${sourceFolder}completed_sketch.ts`, completedSketch);

// run tsc to check for syntax errors
for (let i = 0; i < errorRoundsMax; i++) {
  let res = "";
  try {
    switch (i) {
      case 0:
        res = execSync(`tsc ${sourceFolder}erroneous_sketch_1.ts`, { stdio: "inherit" });
      case 1:
        res = execSync(`tsc ${sourceFolder}erroneous_sketch_2.ts`, { stdio: "inherit" });
      case 2:
        res = execSync(`tsc ${sourceFolder}completed_sketch.ts`, { stdio: "inherit" });
    }
    console.log(res)
  } catch (err) {
    // res = err.toString();
    // console.log(res);
  }
}

// run the prelude - completed sketch - epilogue suite on specific tests
execSync(`node ${sourceFolder}epilogue.ts`)
