import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import fs from "fs";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const defaultPrompt = process.env.DEFAULT_PROMPT;
const model = process.env.AI_MODEL || "gemini-2.5-pro-preview-03-25";

export async function transcribe(filePath, mimeType, prompt = defaultPrompt) {
  const myfile = await ai.files.upload({
    file: filePath,
    config: { mimeType },
  });

  const response = await ai.models.generateContent({
    model,
    contents: createUserContent([
      createPartFromUri(myfile.uri, myfile.mimeType),
      prompt,
    ]),
  });

  return response.text;
}
