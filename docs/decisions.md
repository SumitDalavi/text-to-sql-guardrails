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

## ADR-002: Progressive Credential Loading (PCL) Architecture
- **Context:** Production hardening required live backends (PostgreSQL, Redis, OpenAI, Anthropic), but removing mocks would break CI pipelines and create high developer onboarding friction.
- **Decision:** Implement Progressive Credential Loading. Keep in-memory and local mock heuristics as the default safe baseline, while wrapping external integrations in auto-promoting factory adapters triggered by environment variables.
- **Consequences:** 
  - *Pros:* 100% CI pass rate without requiring external secrets; zero setup friction for new contributors; progressive upgrade to production clusters.
  - *Cons:* Adds lightweight factory abstraction layers and runtime credential detection logic.
