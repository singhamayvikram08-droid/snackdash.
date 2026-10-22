import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.EXPLABS_API_KEY;

if (!apiKey) {
  console.error("ERROR: EXPLABS_API_KEY environment variable is not set.");
  console.error("Please create an API key under Settings -> API Keys and export it:");
  console.error("  export EXPLABS_API_KEY=\"your_api_key_here\"");
  process.exit(1);
}

const client = new OpenAI({
  baseURL: "https://api.experientiallabs.ai/v1",
  apiKey: apiKey
});

async function runTestCall() {
  try {
    const response = await client.chat.completions.create({
      model: "gemini-3.7-flash",
      messages: [{ role: "user", content: "Hello! Confirm that this call is routed through Experiential gateway." }]
    });

    console.log("=== Response Reply ===");
    console.log(response.choices[0]?.message?.content);
    console.log("\n=== Token Usage ===");
    console.log(JSON.stringify(response.usage, null, 2));
  } catch (error) {
    console.error("API Call Error:", error);
  }
}

runTestCall();
