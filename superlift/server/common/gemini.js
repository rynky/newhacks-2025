import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config()

// The client gets the API key from the environment variable GEMINI_API_KEY
const ai = new GoogleGenAI({});

// Call on Gemini
async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Greet the NewHacks audience in one sentence",
  });
  
  console.log(response.text);
}

main();