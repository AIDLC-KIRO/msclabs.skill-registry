# System Overview

## Architecture Style

Multi-service monolithic application with real-time event-driven communication layer. The system uses a **hub-and-spoke pattern** where the Event Bridge acts as the central message hub between external systems (OPD Queue) and internal consumers (API service, frontend clients).

## Deployment Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                        PM2 Process Manager                       │
├──────────────────┬───────────────────┬──────────────────────────┤
│  app-service     │  event-bridge     │  scheduler-service       │
│  (cluster mode)  │  (fork mode)      │  (fork mode)             │
│  Port: 8081      │  Port: 8080       │  No port (cron-based)    │
├──────────────────┴───────────────────┴──────────────────────────┤
│                     PostgreSQL 14.2                               │
│                     Database: dental_db                           │
└─────────────────────────────────────────────────────────────────┘
         │                                        │
         │ HTTP REST                              │ HTTP REST
         ▼                                        ▼
┌─────────────────┐                    ┌─────────────────────┐
│  React Frontend │                    │  TrakCare HIS       │
│  Port: 3001     │                    │  (External System)  │
└─────────────────┘                    └─────────────────────┘
```

## Key Architectural Decisions

1. **In-Memory Caching**: All frequently accessed data (appointments, care providers, room details) is loaded from PostgreSQL into Node.js process memory and served directly from RAM, reducing database load.

2. **Event-Driven Updates**: Socket.IO provides real-time push notifications to connected frontend clients when room assignments or patient statuses change.

3. **Temp Table Pattern**: External data from TrakCare is written to temporary tables first, then validated/diffed against the main tables before being promoted, allowing change detection.

4. **Scheduled Sync**: A dedicated scheduler service runs cron jobs to periodically fetch data from TrakCare, with time-window restrictions (6am-10pm) to align with clinic operating hours.

5. **Separate Build Outputs**: Webpack bundles three separate server-side entry points into `dist/`, enabling independent deployment of each microservice.

## Technology Decisions

| Decision | Rationale |
|----------|-----------|
| PostgreSQL | Relational data model fits appointment/schedule domain |
| Socket.IO | Bi-directional real-time updates for dashboard refresh |
| In-memory cache | Sub-millisecond response times for dashboard queries |
| PM2 cluster mode | Horizontal scaling of API service across CPU cores |
| Express.js | Lightweight HTTP framework for REST API |

## Related Documentation

- [Components](./components.md)
- [Dependencies](./dependencies.md)
- [Patterns](./patterns.md)
- [Project Overview](../project-overview.md)
