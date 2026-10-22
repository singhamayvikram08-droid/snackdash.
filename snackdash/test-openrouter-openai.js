import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey || apiKey === "<OPENROUTER_API_KEY>") {
  console.error("Please set your OPENROUTER_API_KEY in snackdash/.env or as an environment variable.");
  process.exit(1);
}

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: apiKey,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "SnackDash / Digital Twin"
  }
});

async function main() {
  console.log("Streaming response from OpenRouter via OpenAI SDK (model: google/gemma-4-31b-it:free)...\n");

  try {
    const stream = await client.chat.completions.create({
      model: "google/gemma-4-31b-it:free",
      messages: [
        {
          role: "user",
          content: "How many r's are in the word 'strawberry'?"
        }
      ],
      stream: true,
      stream_options: { include_usage: true } // Required to stream usage & reasoning tokens in final chunk
    });

    let response = "";
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        response += content;
        process.stdout.write(content);
      }

      if (chunk.usage) {
        const reasoning = chunk.usage.completion_tokens_details?.reasoning_tokens;
        console.log("\n\n=== Token Usage ===");
        console.log("Total Tokens:", chunk.usage.total_tokens);
        console.log("Prompt Tokens:", chunk.usage.prompt_tokens);
        console.log("Completion Tokens:", chunk.usage.completion_tokens);
        console.log("Reasoning Tokens:", reasoning ?? "N/A");
      }
    }
  } catch (error) {
    console.error("\nError streaming from OpenRouter:", error);
  }
}

main();
