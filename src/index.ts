import "dotenv/config";
import { inference } from "./call";
import { encodingForModel } from "js-tiktoken";

const enc = encodingForModel("gpt-4o-mini");

const getResponse = async (
  messages: { role: string; content: string }[],
  model: string,
  max_tokens: number
) => {
  const res = await inference(messages, model, max_tokens);

  const { message, logprobs } = res?.choices?.[0];

  if (!message || !logprobs) {
    throw new Error("Failed to generate response");
  }

  return { message, logprobs };
};

const countTokens = (text: string) => {
  return enc.encode(text).length;
};

const filterLogprobs = (logprobs: any, characterToBan: RegExp) => {
  let output = "";
  for (const lp of logprobs.content) {
    const { top_logprobs } = lp;

    const firstToken = top_logprobs[0].token;

    if (!characterToBan.test(firstToken)) {
      output += firstToken;
      continue;
    }

    for (const { token } of top_logprobs) {
      if (!characterToBan.test(token)) {
        output += token;
        return output;
      }
    }

    return null;
  }

  return output;
};

const inferenceLoop = async (
  startingMessage: string,
  model: string,
  characterToBan: RegExp,
  generatedText: string
) => {
  const userMessage = generatedText
    ? `You have three jobs.
    
1) Begin by repeating the following: ${generatedText}

2) Continue the sentence to answer this question: ${startingMessage}. Your answer needs to directly continue the generated text.

3) Never use the letter "E" in your response.`
    : startingMessage;

  console.log(countTokens(generatedText));

  const { logprobs } = await getResponse(
    [{ role: "user", content: userMessage }],
    model,
    20 + countTokens(generatedText)
  );

  const newText = filterLogprobs(logprobs, characterToBan);

  if (newText === null) {
    return generatedText;
  } else if (
    (countTokens(newText) === logprobs.content.length &&
      countTokens(newText) !== countTokens(generatedText) + 20) ||
    countTokens(newText) === countTokens(generatedText)
  ) {
    return newText;
  }

  console.log(newText);

  return await inferenceLoop(startingMessage, model, characterToBan, newText);
};

const main = async (startingMessage: string) => {
  const response = await inferenceLoop(
    startingMessage,
    "gpt-4o-mini",
    /[eEèéêëÈÉÊË]/,
    ""
  );

  console.log(response);
};

const startingMessage = process.argv[2];

if (!startingMessage) {
  console.error(
    "Please provide a starting message as a command line argument."
  );
  process.exit(1);
}

main(startingMessage);
