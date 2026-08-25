# Architecture: Text-to-SQL with Guardrails

## System Diagram
The following Mermaid.js sequence diagram maps the core workflow and interactions:

```mermaid
sequenceDiagram
User->>API: Question
API->>LLM: Generate SQL
LLM-->>API: Raw SQL
API->>Guardrail: Block DML/DDL
Guardrail->>SanityCheck: Validate syntax
API->>DB: Execute Read-Only
API-->>User: Results
```

## Component Breakdown
- **Core Technology**: Python, SQLAlchemy, PostgreSQL
- **Design Paradigm**: Emphasizes high availability, fault tolerance, and security.
