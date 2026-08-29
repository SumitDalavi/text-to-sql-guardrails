# Runbook — text-to-sql-guardrails
> Last updated: 2026-08-29

## Prerequisites
| Tool | Required Version | How to check |
|---|---|---|
| Python | >= 3.10 | `python --version` |

## Quick Start
```bash
# Install dependencies
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Run Tests
```bash
# Unit tests
pytest

# E2E Adversarial Test
bash tests/e2e/test_adversarial_ddl.sh
```

Expected output:
```
================ test session starts =================
collected 10 items
tests/test_validator.py ..........              [100%]
```

## Common Failure Modes
| Symptom | Cause | Fix |
|---|---|---|
| Invalid syntax error | SQL parser failed | Check if query uses unsupported dialect features |
