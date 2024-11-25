# Ban "E" from ChatGPT

This is a very simple proof of concept looking at how we can use top_k to ban any derivation of the letter "E" from being produced by ChatGPT.

## Installation

1. Clone the repo
2. Install

```
npm i --save-dev
```

3. Build

```
npx tsc
```

4. Run

```
node ./dist/index.js <YOUR PROMPT>
```

## Challenges

This is not a completion model, it uses the chat interface.

Therefore, we only generate a limited number of tokens at a time.

With this generation, we return the top 20 logprobs.

If the first logprob of a token does not contain an "E", we add it to a "new text string" and continue to the next token.

If the first logprob of a token contains an "E", we iterate through the next twenty until we find the first token without an "E".

We append this to the "generated text" and return it.

We then loop back to the model and ask it again to answer the question while first repeating what has already been generated. This mimics a completion mechanism a la [Dynomite's chess strategies](https://dynomight.net/more-chess/)
