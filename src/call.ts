const apiKey = process.env.OPENAI_API_KEY;

export const inference = async (
  messages: { role: string; content: string }[],
  model: string,
  max_tokens: number
) => {
  const body = JSON.stringify({
    max_tokens,
    messages,
    model,
    temperature: 0,
    logprobs: true,
    stream: false,
    top_logprobs: 20,
  });

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body,
  });
  try {
    const json = await res.json();

    return json;
  } catch (error) {
    console.error(error);

    throw new Error("Failed to generate response");
  }
};
