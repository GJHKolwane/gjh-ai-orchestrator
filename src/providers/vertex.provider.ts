import { VertexAI } from "@google-cloud/vertexai";

const PROJECT_ID = process.env.GCP_PROJECT_ID!;
const LOCATION = "us-central1";

export async function runGemini(prompt: string): Promise<string> {
  const vertex = new VertexAI({
    project: PROJECT_ID,
    location: LOCATION
  });

  const model = vertex.getGenerativeModel({
    model: "gemini-3-flash"
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}
