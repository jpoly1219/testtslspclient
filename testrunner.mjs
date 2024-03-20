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

// call node app.mjs <dir> sketch.ts
execSync(`node app.mjs ${sourceFolder} sketch.ts`)

// get the returned types
const expectedType = fs.readFileSync("output.txt", "utf8");

// ask LLM to complete the sketch using the returned types

// instantiate connection and save conn object

const sketchFilePath = `${sourceFolder}sketch.ts`;
const sketchFileContent = fs.readFileSync(sketchFilePath, "utf8");
const prompt =
  `Complete the following typescript program sketch with a hole in it.\n
  Here is the program sketch: \n ${sketchFileContent} \n
  Here are the relevant contexts: \n ${expectedType} \n`;

const response = None;
const completedSketch = None;
// write completion to sketch
const outputFile = fs.createWriteStream(`${sourceFolder}/completed_sketch.ts`);
outputFile.write(completedSketch);

// run the prelude - completed sketch - epilogue suite on specific tests
execSync(`node ${sourceFolder}/completed_sketch.ts`);
