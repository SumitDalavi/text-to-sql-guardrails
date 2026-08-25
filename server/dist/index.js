"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const schemaExtractor_1 = require("./db/schemaExtractor");
const generator_1 = require("./sql/generator");
const guardrails_1 = require("./sql/guardrails");
const validator_1 = require("./validation/validator");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/v1/schema', (req, res) => {
    try {
        const schema = (0, schemaExtractor_1.extractSchemaContext)();
        res.json({ schema });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post('/api/v1/query', async (req, res) => {
    try {
        const { question } = req.body;
        if (!question)
            return res.status(400).json({ error: "Missing question" });
        // 1. Generate SQL
        const generationResult = await (0, generator_1.generateSql)(question);
        // 2. Guardrails
        let safeSql;
        try {
            safeSql = (0, guardrails_1.enforceGuardrails)(generationResult.sql);
        }
        catch (e) {
            if (e instanceof guardrails_1.GuardrailError) {
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
        const results = (0, db_1.executeQuery)(safeSql);
        const executionTime = Date.now() - start;
        // 4. Hallucination Detection & Validation
        const validation = await (0, validator_1.checkHallucination)(question, safeSql, results);
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
const PORT = process.env.PORT || 4001; // Port 4001 to avoid conflicting with previous projects
(0, db_1.initDb)().then(() => {
    app.listen(PORT, () => {
        console.log(`Text-to-SQL API running on port ${PORT}`);
    });
});
