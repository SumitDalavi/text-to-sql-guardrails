import { ChatOpenAI } from "@langchain/openai";
import { extractSchemaContext } from "../db/schemaExtractor";
import { SqlGenerationSchema } from "../models/schema";

export async function generateSql(question: string) {
  const schema = extractSchemaContext();
  
  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.1,
  }).withStructuredOutput(SqlGenerationSchema);

  const prompt = `You are an expert SQL generator.
Your goal is to translate the user's natural language question into a valid SQLite query.

Here is the database schema:
${schema}

Rules:
1. Return ONLY valid SQLite syntax.
2. DO NOT include any destructive operations (no INSERT, UPDATE, DELETE).
3. If the question cannot be answered with the given schema, generate a query that returns an empty result set (e.g., SELECT 1 WHERE 1=0) and explain why in the explanation field.`;

  const response = await model.invoke([
    ["system", prompt],
    ["user", question]
  ]);

  return response;
}
