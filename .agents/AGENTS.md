# Project Rules & Customizations

## Microservice Development Principles

All development MUST follow a **Microservice-First Architecture** and the principle of **"Reuse before Build"**:

1. **Thorough Analysis**: Analyze the existing codebase thoroughly before creating any new service, module, API, database table, or business logic.
2. **Identify Existing Capabilities**: Check if the required functionality already exists in whole or in part.
3. **Maximal Reuse**: Reuse existing microservices, APIs, database entities, shared libraries, utilities, event handlers, and UI components wherever possible.
4. **Appropriate Service Extension**: Extend existing services only if the change directly aligns with the bounded context and responsibility of that microservice.
5. **Bounded Context Requirement for New Services**: Create a new microservice **only when the functionality represents a new bounded context or business capability** that cannot cleanly fit into an existing service.
6. **Zero Duplication**: Avoid duplicate business logic, duplicate APIs, duplicate database tables, duplicate configuration, and duplicate workflows.
7. **DDD & SOLID Principles**: Enforce Domain-Driven Design (DDD), SOLID principles, and Single Responsibility across all microservices and components.
8. **Production-Ready Standards**: Every new microservice must expose well-defined APIs, have clear ownership, independent deployment capability, independent scalability, health checks, logging, monitoring, versioning, and documentation.
9. **Mandatory Reuse Analysis Report**: Before starting implementation of any feature or system, produce a **Reuse Analysis Report** detailing:
   - Existing microservices to be reused.
   - Existing APIs to be reused.
   - Existing database tables/entities to be reused.
   - Existing UI components to be reused.
   - New microservices (if any) needing creation with explicit justification.
   - Rationale for extending vs creating services.
