"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforceGuardrails = exports.GuardrailError = void 0;
class GuardrailError extends Error {
    constructor(message) {
        super(message);
        this.name = "GuardrailError";
    }
}
exports.GuardrailError = GuardrailError;
/**
 * Parses and intercepts dangerous SQL queries.
 */
function enforceGuardrails(sql) {
    let safeSql = sql.trim().replace(/;$/, '');
    // 1. Block destructive operations (regex heuristic for safety since full AST parsing for SQL in JS is heavy)
    const destructiveRegex = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|REPLACE|GRANT|REVOKE)\b/i;
    if (destructiveRegex.test(safeSql)) {
        throw new GuardrailError("Destructive operations (DDL/DML) are blocked by guardrails. Only SELECT is allowed.");
    }
    // 2. Enforce LIMIT
    const limitRegex = /\bLIMIT\s+\d+\b/i;
    if (!limitRegex.test(safeSql)) {
        safeSql += " LIMIT 100";
    }
    return safeSql;
}
exports.enforceGuardrails = enforceGuardrails;
