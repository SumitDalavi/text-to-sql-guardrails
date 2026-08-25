# text-to-sql-guardrails Architecture

## System Diagram
The following Mermaid.js sequence diagram maps the core workflow and interactions within the system:

```mermaid
sequenceDiagram
    LLM->>Guardrail: Generated SQL
Guardrail->>Parser: Parse AST
Parser->>Validator: Check for DROP/DELETE/TRUNCATE
Validator-->>Guardrail: Safe/Unsafe
Guardrail->>DB: Execute (if Safe)
Guardrail-->>Client: Results or Error
```

## Component Breakdown
- **Core Technology**: Node.js, Jest
- **Design Paradigm**: Emphasizes high availability, fault tolerance, and security boundaries.

## Security & Scaling Considerations
- Strict input validations and sanitization.
- Horizontal scalability achieved via stateless workers and queues where applicable.
- Encrypted data at rest and in transit.
