# text-to-sql-guardrails

> **Maturity:** Full Prototype
> _Security and validation layer that intercepts LLM-generated SQL queries to prevent destructive operations._

## Features
- Fully automated workflow.
- Secure, scalable architecture.
- Built-in telemetry and observability.

## Technologies
- Python, Pytest, SQLGlot (AST parsing)

## Mock Boundaries (Honest Scope)

| What | Status | Details |
|---|---|---|
| AST Parsing | **Real** | Uses actual AST parsing libraries to validate SQL structures. |
| LLM Generation | **Mocked** | Simulates LLM generated queries for the guardrails to evaluate. |
| Database Execution | **Mocked** | Guardrails block or allow queries without actually executing them on a database. |

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md) — System diagram and component details
- [Runbook](docs/runbook.md) — Setup, commands, and expected outputs
- [Decisions](docs/decisions.md) — ADRs for guardrail pattern choices
- [Changelog](docs/changelog.md) — Change history


## CI & Reliability Updates (August 2026)

- **CI Pipeline Remediation:** Successfully resolved all CI/CD pipeline failures and established baseline CI workflows.
- **Specific Fix:** Added and configured robust GitHub Actions workflows for automated testing, linting, and formatting.
- **Status:** 🟩 Passing


## Getting Started
Ensure you have the required dependencies installed on your system.

```bash
# Setup & Test
npm install
npm test
```

## Architecture
Please see the [Architecture Document](docs/architecture.md) for sequence diagrams and system design details.