import * as dotenv from "dotenv";

dotenv.config();

export const ENVIRONMENT_VARIABLES = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};