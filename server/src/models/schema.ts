import { z } from 'zod';

export const SqlGenerationSchema = z.object({
  sql: z.string().describe("The generated SQL query to answer the user's question"),
  explanation: z.string().describe("A plain English explanation of what the query does"),
  tablesAccessed: z.array(z.string()).describe("List of table names accessed by the query")
});

export const ValidationSchema = z.object({
  backTranslation: z.string().describe("What question does this SQL answer?"),
  alignmentScore: z.number().min(1).max(5).describe("How well does the back-translation align with the original question (1-5)?")
});
