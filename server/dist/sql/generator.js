"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSql = void 0;
const openai_1 = require("@langchain/openai");
const schemaExtractor_1 = require("../db/schemaExtractor");
const schema_1 = require("../models/schema");
async function generateSql(question) {
    const schema = (0, schemaExtractor_1.extractSchemaContext)();
    const model = new openai_1.ChatOpenAI({
        modelName: "gpt-4o-mini",
        temperature: 0.1,
    }).withStructuredOutput(schema_1.SqlGenerationSchema);
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
exports.generateSql = generateSql;
