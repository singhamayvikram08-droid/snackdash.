import { OpenRouter } from "@openrouter/sdk";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY || "";

const openrouter = new OpenRouter({
  apiKey: apiKey
});

async function runStream(model) {
  console.log(`Streaming response from OpenRouter (model: ${model})...\n`);

  // Note: In @openrouter/sdk, the parameter key is `chatGenerationParams`
  const stream = await openrouter.chat.send({
    chatGenerationParams: {
      model: model,
      messages: [
        {
          role: "user",
          content: "How many r's are in the word 'strawberry'?"
        }
      ],
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

    // Usage information comes in the final chunk
    if (chunk.usage) {
      const reasoning = chunk.usage.completionTokensDetails?.reasoningTokens 
        ?? chunk.usage.completion_tokens_details?.reasoning_tokens;
      console.log("\n\n=== Token Usage ===");
      console.log("Total Tokens:", chunk.usage.totalTokens ?? chunk.usage.total_tokens);
      console.log("Prompt Tokens:", chunk.usage.promptTokens ?? chunk.usage.prompt_tokens);
      console.log("Completion Tokens:", chunk.usage.completionTokens ?? chunk.usage.completion_tokens);
      console.log("Reasoning Tokens:", reasoning ?? "N/A (model did not output reasoning tokens)");
    }
  }
}

async function main() {
  const primaryModel = "google/gemma-4-31b-it:free";
  const fallbackModel = "nvidia/nemotron-3.5-lightning:free";

  try {
    await runStream(primaryModel);
  } catch (error) {
    console.warn(`\n[Notice] Model ${primaryModel} encountered an issue (${error?.message || error}).`);
    if (error?.body?.includes("rate-limited") || error?.statusCode === 429) {
      console.log(`Upstream shared pool is busy. Retrying with backup free model: ${fallbackModel}...\n`);
      try {
        await runStream(fallbackModel);
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError?.message || fallbackError);
      }
    } else {
      console.error(error);
    }
  }
}

main();
