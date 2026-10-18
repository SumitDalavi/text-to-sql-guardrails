
# text-to-sql-guardrails

[![Release](https://img.shields.io/github/v/release/SumitDalavi/text-to-sql-guardrails?color=blue&logo=github)](https://github.com/SumitDalavi/text-to-sql-guardrails/releases)
[![SBOM](https://img.shields.io/badge/SBOM-SPDX%20JSON-blueviolet?logo=spdx)](https://github.com/SumitDalavi/text-to-sql-guardrails/releases)

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

## Release & Verification

The project includes an automated DevSecOps release pipeline (`.github/workflows/release.yml`) triggered on semantic version tags (`v*.*.*`).

Each release automatically:
1. Executes test suite gates.
2. Builds the container image.
3. Performs vulnerability scanning via Trivy.
4. Generates an SPDX SBOM (`sbom.spdx.json`) using Anchore Syft.
5. Publishes a GitHub Release with attached SBOM.

### Verifying the Release
```bash
# Verify release via GitHub CLI
gh release view v0.1.0 --repo SumitDalavi/text-to-sql-guardrails

# Download and inspect SBOM
gh release download v0.1.0 --repo SumitDalavi/text-to-sql-guardrails --pattern "sbom.spdx.json"
cat sbom.spdx.json | jq .
```
