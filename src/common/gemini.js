import * as dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { ENVIRONMENT_VARIABLES } from "./constants/envs.js";

// The client gets the API key from the environment variable GEMINI_API_KEY
const ai = new GoogleGenAI({apiKey: ENVIRONMENT_VARIABLES.GEMINI_API_KEY});

// Call on Gemini
async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Greet the NewHacks audience in a few words",
  });
  
  console.log(response.text);
}

main();