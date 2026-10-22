import { OpenRouter } from "@openrouter/sdk";
import dotenv from "dotenv";
dotenv.config();

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || ""
});

async function run() {
  try {
    const stream = await openrouter.chat.send({
      chatGenerationParams: {
        model: "google/gemma-4-31b-it:free",
        messages: [{ role: "user", content: "How many r's are in the word 'strawberry'?" }],
        stream: true
      }
    });

    let response = "";
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        response += content;
        process.stdout.write(content);
      }

      if (chunk.usage) {
        console.log("\nReasoning tokens:", chunk.usage.completionTokensDetails?.reasoningTokens ?? chunk.usage.completion_tokens_details?.reasoning_tokens);
      }
    }
  } catch (e) {
    console.error("OpenRouter Error:", e?.message || e);
  }
}

run();
