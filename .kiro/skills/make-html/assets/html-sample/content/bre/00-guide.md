# Business Rules Extraction - Usage Guide

## Purpose

This directory contains the complete business rules extraction and domain decomposition analysis for the **Dental Dashboard** application. It provides a machine-readable and human-readable knowledge base for understanding, maintaining, or rewriting the system.

## Directory Structure

```
business-rules-extraction/
├── 00-master-index.md          ← Start here: summary and navigation
├── 00-guide.md                 ← This file: usage instructions
├── analysis-dashboard.html     ← Interactive visual dashboard (open in browser)
├── database-documentation/     ← Complete database schema and seed data
├── detailed-domain-bre/        ← Per-domain business rules, features, workflows
├── domain-decomposition-overview/ ← Microservice boundaries, manifest, execution order
├── cross-cutting-documentation/  ← Auth, caching, events, shared concerns
├── reference-documentation/      ← API catalog, integrations, inventories
└── diagrams/                     ← Architecture, sequence, ER diagrams (Mermaid)
```

## How to Use

### For Developers (Understanding the System)
1. Open `analysis-dashboard.html` in a browser for a visual overview
2. Read `00-master-index.md` for a structured table of contents
3. Dive into `detailed-domain-bre/domain-{name}/overview.md` for domain-specific details

### For Architects (Planning Modernization)
1. Review `domain-decomposition-overview/domain-manifest.json` for the machine-readable decomposition
2. Check `domain-decomposition-overview/execution-order.md` for extraction ordering
3. Read `reference-documentation/coupling-hotspots.md` for boundary-breaking dependencies
4. Review `cross-cutting-documentation/` for shared concerns that must be addressed

### For AI/Automation (Mode B Detailed Specs)
1. Read `domain-decomposition-overview/domain-manifest.json` as the structured input
2. Each domain's `slug` maps to its `detailed-domain-bre/domain-{slug}/` directory
3. Use `execution_order` to sequence domain extraction/rewrite tasks

## Key Concepts

### Domains Identified

| Domain | Slug | Role |
|--------|------|------|
| Patient Appointment | `patient-appointment` | Core transactional domain |
| Care Provider | `care-provider` | Master data foundation |
| Doctor Schedule | `doctor-schedule` | Scheduling and workload |
| Room Management | `room-management` | Real-time room state |
| Booking | `booking` | Advance planning |

### Extraction Order

1. **care-provider** (no dependencies)
2. **doctor-schedule** (depends on care-provider)
3. **room-management** (depends on care-provider)
4. **patient-appointment** (depends on care-provider, doctor-schedule, room-management)
5. **booking** (depends on care-provider; parallelizable with steps 2-3)
