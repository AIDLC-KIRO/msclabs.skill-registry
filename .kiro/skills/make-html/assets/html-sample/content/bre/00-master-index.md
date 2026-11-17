# Business Rules Extraction - Master Index

## Project Summary

| Metric | Value |
|--------|-------|
| Project | Dental Dashboard App v1.1.0 |
| Language | JavaScript (Node.js + React) |
| Database | PostgreSQL 14.2 |
| Source Files | 49 |
| Total LOC | ~13,030 |
| Domains | 5 |
| Features | 36 |
| Business Rules | 39 |
| Database Tables | 13 |
| Shared Entities | 3 |
| External Integration | TrakCare HIS (8 API endpoints) |

## Domain Overview

| Domain | Complexity | Features | Rules | Tables | LOC |
|--------|-----------|----------|-------|--------|-----|
| Patient Appointment | Large | 10 | 11 | 4 | 3,816 |
| Care Provider | Medium | 7 | 8 | 4 | 1,266 |
| Doctor Schedule | Medium | 5 | 6 | 2 | 339 |
| Room Management | Small | 7 | 6 | 1 | 530 |
| Booking | Medium | 7 | 8 | 2 | 1,976 |

## Navigation

### Core Documentation
- [Usage Guide](00-guide.md)
- [Interactive Dashboard](analysis-dashboard.html) (open in browser)

### Database
- [Global Schema](database-documentation/00-global-schema.sql)
- [Seed Data](database-documentation/00-seed-data.json)

### Domain Business Rules
- [README](detailed-domain-bre/README.md)
- [Patient Appointment](detailed-domain-bre/domain-patient-appointment/overview.md)
- [Care Provider](detailed-domain-bre/domain-care-provider/overview.md)
- [Doctor Schedule](detailed-domain-bre/domain-doctor-schedule/overview.md)
- [Room Management](detailed-domain-bre/domain-room-management/overview.md)
- [Booking](detailed-domain-bre/domain-booking/overview.md)
- [Cross-Domain Features](detailed-domain-bre/cross-domain-features.md)
- [Traceability Matrix](detailed-domain-bre/traceability-matrix.md)

### Domain Decomposition
- [Overview](domain-decomposition-overview/README.md)
- [Domain Manifest (JSON)](domain-decomposition-overview/domain-manifest.json)
- [Bounded Contexts](domain-decomposition-overview/bounded-contexts.md)
- [Data Ownership](domain-decomposition-overview/data-ownership.md)
- [Shared Kernel](domain-decomposition-overview/shared-kernel.md)
- [Anti-Corruption Layers](domain-decomposition-overview/anti-corruption-layers.md)
- [Execution Order](domain-decomposition-overview/execution-order.md)

### Cross-Cutting Documentation
- [Authentication & Authorization](cross-cutting-documentation/authentication-authorization.md)
- [Error Handling](cross-cutting-documentation/error-handling-patterns.md)
- [Event Publishing](cross-cutting-documentation/event-publishing-patterns.md)
- [Caching Patterns](cross-cutting-documentation/caching-patterns.md)
- [Shared Entities](cross-cutting-documentation/shared-entities.md)
- [Common Error Codes](cross-cutting-documentation/common-error-codes.md)
- [Common Permissions](cross-cutting-documentation/common-permissions.md)
- [Common Events](cross-cutting-documentation/common-events.md)

### Reference Documentation
- [API Endpoint Catalog](reference-documentation/api-endpoint-catalog.md)
- [Cron/Daemon Inventory](reference-documentation/cron-daemon-inventory.md)
- [External Integrations Map](reference-documentation/external-integrations-map.md)
- [Feature Flag Inventory](reference-documentation/feature-flag-inventory.md)
- [Service/Component Inventory](reference-documentation/service-component-inventory.md)
- [Coupling Hotspots](reference-documentation/coupling-hotspots.md)
- [Dead Code Notes](reference-documentation/dead-code-decomposition-notes.md)

### Diagrams
- [Architecture Diagrams](diagrams/architecture-diagrams.md)
- [Sequence Diagrams](diagrams/sequence-diagrams.md)
- [Class/ER Diagrams](diagrams/class-er-diagrams.md)
