# Dental Dashboard Application - Documentation

## Overview

Comprehensive documentation for the **dental-dashboard-app** (v1.1.0), a real-time dental clinic operations dashboard built with React 16 and Express.js (Node.js). The system manages patient appointments, room assignments, and doctor schedules with real-time updates via Socket.IO, integrating with the TrakCare hospital information system.

## Documentation Structure

| Section | Description |
|---------|-------------|
| [Project Overview](./project-overview.md) | High-level project summary, tech stack, and deployment |
| [Technical Debt Report](./technical-debt-report.md) | Executive summary of technical debt and AWS recommendations |

### Architecture
- [System Overview](./architecture/system-overview.md) - System architecture, deployment model
- [Components](./architecture/components.md) - Major system components and responsibilities
- [Dependencies](./architecture/dependencies.md) - Internal and external dependency mapping
- [Patterns](./architecture/patterns.md) - Architectural and design patterns

### Behavior
- [Business Logic](./behavior/business-logic.md) - Business rules and processes
- [Workflows](./behavior/workflows.md) - Application-level process flows
- [Decision Logic](./behavior/decision-logic.md) - Decision trees and conditional logic
- [Error Handling](./behavior/error-handling.md) - Exception patterns and recovery

### Reference
- [Program Structure](./reference/program-structure.md) - Complete structural hierarchy
- [Interfaces](./reference/interfaces.md) - Interface definitions and contracts
- [Data Models](./reference/data-models.md) - Database schemas and type definitions
- [API Reference](./reference/api-reference.md) - All API endpoints documented
- [Modules](./reference/modules.md) - Module organization and dependencies

### Analysis
- [Code Metrics](./analysis/code-metrics.md) - Complexity measurements and quality indicators
- [Complexity Analysis](./analysis/complexity-analysis.md) - Code complexity hotspots
- [Dependency Analysis](./analysis/dependency-analysis.md) - Dependency mapping and risks
- [Security Patterns](./analysis/security-patterns.md) - Security implementations
- [Tech Debt](./analysis/tech-debt.md) - Technical debt assessment

### Diagrams
- [Structural](./diagrams/structural/) - Component and class diagrams
- [Behavioral](./diagrams/behavioral/) - Sequence and activity diagrams
- [Architecture](./diagrams/architecture/) - System context and integration diagrams

### Technical Debt
- [Summary](./technical-debt/summary.md) - Overview of all findings
- [Outdated Components](./technical-debt/outdated-components.md) - Obsolete component analysis
- [Maintenance Burden](./technical-debt/maintenance-burden.md) - High-maintenance areas
- [Remediation Plan](./technical-debt/remediation-plan.md) - Prioritized action items

### Migration
- [Component Order](./migration/component-order.md) - Migration sequence planning
- [Test Specifications](./migration/test-specifications.md) - Validation test cases
- [Validation Criteria](./migration/validation-criteria.md) - Success criteria

### Specialized
- [Database Patterns](./specialized/database-patterns.md) - Database schemas and query patterns
- [Real-time Events](./specialized/realtime-events.md) - Socket.IO event documentation
- [External Integration](./specialized/external-integration.md) - TrakCare integration details

## Quick Reference

- **Language**: JavaScript (ES6+)
- **Frontend**: React 16.13, React Router 5, Material UI 4, Bulma CSS, Ant Design
- **Backend**: Express 4.21, Socket.IO 4.8, PostgreSQL (pg 8.7)
- **Build**: Webpack 4.42, Babel 7, PM2 (process management)
- **Database**: PostgreSQL 14.2
- **External System**: TrakCare (hospital information system)
