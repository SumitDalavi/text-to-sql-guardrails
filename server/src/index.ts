import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb, executeQuery } from './db';
import { extractSchemaContext } from './db/schemaExtractor';
import { generateSql } from './sql/generator';
import { enforceGuardrails, GuardrailError } from './sql/guardrails';
import { checkHallucination } from './validation/validator';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/v1/schema', (req, res) => {
  try {
    const schema = extractSchemaContext();
    res.json({ schema });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/v1/query', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Missing question" });

    // 1. Generate SQL
    const generationResult = await generateSql(question);
    
    // 2. Guardrails
    let safeSql: string;
    try {
      safeSql = enforceGuardrails(generationResult.sql);
    } catch (e: any) {
      if (e instanceof GuardrailError) {
        return res.status(403).json({
          error: "Query Blocked by Guardrail",
          details: e.message,
          rawSql: generationResult.sql
        });
      }
      throw e;
    }

    // 3. Execution
    const start = Date.now();
    const results = executeQuery(safeSql);
    const executionTime = Date.now() - start;

    // 4. Hallucination Detection & Validation
    const validation = await checkHallucination(question, safeSql, results);

    res.json({
      originalQuestion: question,
      generatedSql: generationResult.sql,
      safeSql: safeSql,
      explanation: generationResult.explanation,
      tablesAccessed: generationResult.tablesAccessed,
      results,
      executionTimeMs: executionTime,
      validation
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4001; // Port 4001 to avoid conflicting with previous projects
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Text-to-SQL API running on port ${PORT}`);
  });
});
