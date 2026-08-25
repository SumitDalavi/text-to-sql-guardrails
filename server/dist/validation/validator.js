"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkHallucination = void 0;
const openai_1 = require("@langchain/openai");
const schema_1 = require("../models/schema");
async function checkHallucination(originalQuestion, generatedSql, executedResults) {
    const warnings = [];
    let confidence = 100;
    // 1. Sanity Check on Results
    if (executedResults.length === 0) {
        warnings.push("Query returned no results. This might be correct, or the SQL might have hallucinated a non-existent condition.");
        confidence -= 10;
    }
    if (executedResults.length > 0) {
        // If it hits the exact LIMIT, it might be truncated
        if (executedResults.length === 100) {
            warnings.push("Query hit the 100-row limit. Results are truncated.");
        }
    }
    // 2. Back-Translation (LLM-as-judge)
    const model = new openai_1.ChatOpenAI({
        modelName: "gpt-4o-mini",
        temperature: 0.1,
    }).withStructuredOutput(schema_1.ValidationSchema);
    const prompt = `You are a SQL auditor. 
Analyze the provided SQL query and tell me what business question it answers in plain English.
Then, compare your back-translated question to the user's ORIGINAL question. 
Score the alignment from 1 (completely unrelated or hallucinated) to 5 (perfect match).`;
    const validation = await model.invoke([
        ["system", prompt],
        ["user", `Original Question: ${originalQuestion}\nGenerated SQL: ${generatedSql}`]
    ]);
    if (validation.alignmentScore < 4) {
        warnings.push(`Hallucination Warning: The generated SQL seems to answer "${validation.backTranslation}" instead of your question.`);
        confidence -= (5 - validation.alignmentScore) * 15; // penalize hard for misalignment
    }
    return {
        confidence: Math.max(0, confidence),
        warnings,
        backTranslation: validation.backTranslation,
        alignmentScore: validation.alignmentScore
    };
}
exports.checkHallucination = checkHallucination;
