"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationSchema = exports.SqlGenerationSchema = void 0;
const zod_1 = require("zod");
exports.SqlGenerationSchema = zod_1.z.object({
    sql: zod_1.z.string().describe("The generated SQL query to answer the user's question"),
    explanation: zod_1.z.string().describe("A plain English explanation of what the query does"),
    tablesAccessed: zod_1.z.array(zod_1.z.string()).describe("List of table names accessed by the query")
});
exports.ValidationSchema = zod_1.z.object({
    backTranslation: zod_1.z.string().describe("What question does this SQL answer?"),
    alignmentScore: zod_1.z.number().min(1).max(5).describe("How well does the back-translation align with the original question (1-5)?")
});
