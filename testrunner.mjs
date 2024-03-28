import { execSync } from "child_process";
import * as fs from "fs";
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
const expectedType = fs.readFileSync("output.txt", "utf8");

// ask LLM to complete the sketch using the returned types

// instantiate connection and save conn object

const prompt =
  `Complete the following typescript program sketch with a hole in it.\n
  Here is the program sketch: \n ${sketchFileContent} \n
  Here are the relevant contexts: \n ${expectedType} \n`;

const response = null;
const completedSketch = "console.log('hello world!')";
const erroneousSketch = "console.log(hello world!)";
// write completion to sketch
fs.writeFileSync(`${sourceFolder}completed_sketch.ts`, completedSketch);
fs.writeFileSync(`${sourceFolder}erroneous_sketch.ts`, erroneousSketch);

// run the prelude - completed sketch - epilogue suite on specific tests
execSync(`node ${sourceFolder}completed_sketch.ts`, { stdio: "inherit" });
execSync(`tsc ${sourceFolder}erroneous_sketch.ts`, { stdio: "inherit" });
