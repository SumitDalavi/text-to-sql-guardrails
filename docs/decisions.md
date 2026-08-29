# Decisions

## ADR-001: AST Parsing vs Regex for SQL Validation
**Date:** 2026-08-29  
**Status:** Accepted

**Context:**  
We need to ensure LLM-generated SQL queries do not contain destructive operations (DROP, DELETE, UPDATE) or try to access forbidden tables.

**Decision:**  
We will use an Abstract Syntax Tree (AST) parser (like SQLGlot) rather than Regular Expressions.

**Consequences:**  
- ✅ Impossible to bypass via SQL injection tricks (e.g., `SELECT * FROM x; DROP TABLE y;`).
- ✅ Aware of dialect-specific nuances.
- ⚠️ Higher overhead than a simple regex, but necessary for security.
