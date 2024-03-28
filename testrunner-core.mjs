const generatePrompt = (sketchFileContent, targetTypes) => {
  const holeType = targetTypes.split("\n")[1];

  const prompt = [{
    role: "System",
    content:
      "CODE COMPLETION INSTRUCTIONS:\
      - Reply with a functional, idiomatic replacement for the program hole marked '??' in the provided program sketch\
      - Reply only with a single replacement term for the unqiue distinguished hole marked '??'\
      - Reply only with code\n\
      - DO NOT suggest more replacements for other holes in the sketch(marked '?'), or implicit holes\
      - DO NOT include the program sketch in your reply\
      - DO NOT include a period at the end of your response and DO NOT use markdown"
  },
  {
    role: "User",
    content:
    {
      sketch: sketchFileContent,
      expected_ty:
        `Hole _() can be filled by an expression with a type consistent with ${holeType} \
        which references the following definitions: ${targetTypes}`
    }
  }];

  return prompt;
};

const mockLLM = (errorRound) => {
  switch (errorRound) {
    case 0:
      return "console.log(hello world)";
    case 1:
      return "console.log(helloworld)";
    case 2:
      return "console.log('hello world')";
  }
}

export { generatePrompt, mockLLM };
