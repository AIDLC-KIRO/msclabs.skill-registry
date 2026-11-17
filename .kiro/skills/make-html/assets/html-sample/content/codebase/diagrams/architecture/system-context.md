# Architecture Diagrams

## System Context Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SYSTEMS                               │
│                                                                         │
│  ┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐ │
│  │  TrakCare HIS   │     │  OPD Queue      │     │  Web Browser     │ │
│  │  (Hospital IS)  │     │  (Room/Patient   │     │  (Clinic Staff)  │ │
│  │                 │     │   Events)        │     │                  │ │
│  └────────┬────────┘     └────────┬────────┘     └────────┬─────────┘ │
│           │                       │                        │           │
└───────────┼───────────────────────┼────────────────────────┼───────────┘
            │                       │                        │
            │ REST API              │ HTTP POST              │ HTTP/WS
            │ (OAuth2)              │                        │
            ▼                       ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        DENTAL DASHBOARD SYSTEM                           │
│                                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  ┌────────────────┐│
│  │  Scheduler  │  │  App Service │  │  Event    │  │  React         ││
│  │  Service    │  │  (API)       │  │  Bridge   │  │  Frontend      ││
│  └──────┬──────┘  └──────┬───────┘  └─────┬─────┘  └───────┬────────┘│
│         │                │                 │                 │         │
│         └────────────────┴─────────────────┘                 │         │
│                          │                                   │         │
│                   ┌──────▼──────┐                           │         │
│                   │ PostgreSQL  │                            │         │
│                   │ dental_db   │                            │         │
│                   └─────────────┘                            │         │
│                                                              │         │
└──────────────────────────────────────────────────────────────┘         │
```

## Integration Pattern Diagram

```
┌───────────────────────────────────────────────────────────┐
│                    DATA FLOW PATTERNS                       │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  PULL Pattern (Scheduler → TrakCare):                    │
│  ┌──────────┐  interval  ┌──────────┐  REST   ┌───────┐ │
│  │Scheduler │───────────►│ Module   │────────►│TrakCar│ │
│  └──────────┘            └────┬─────┘         └───────┘ │
│                               │                          │
│                          stage in temp                    │
│                               │                          │
│                          ┌────▼─────┐                    │
│                          │PostgreSQL│                    │
│                          └──────────┘                    │
│                                                           │
│  PUSH Pattern (OPD Queue → Event Bridge → Clients):      │
│  ┌─────────┐  POST  ┌───────────┐  emit  ┌──────────┐  │
│  │OPD Queue│────────►│Evt Bridge │───────►│ Clients  │  │
│  └─────────┘        └─────┬─────┘        └──────────┘  │
│                            │                             │
│                       write to DB                        │
│                            │                             │
│                       ┌────▼─────┐                       │
│                       │PostgreSQL│                       │
│                       └──────────┘                       │
│                                                           │
│  CACHE Pattern (DB → Memory → API Response):             │
│  ┌──────────┐ periodic ┌────────┐ instant ┌──────────┐  │
│  │PostgreSQL│─────────►│ Memory │────────►│API Resp. │  │
│  └──────────┘  refresh └────────┘         └──────────┘  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## Network Boundary Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    INTERNAL NETWORK                       │
│                    (internal-subnet)                          │
│                                                         │
│  ┌─────────────────┐          ┌──────────────────────┐ │
│  │ App Server      │          │ Database Server      │ │
│  │ app-host-dev     │          │ db-host (prod)  │ │
│  │                 │          │ PostgreSQL :5432      │ │
│  │ App :8081       │◄────────►│                      │ │
│  │ Event Br :8080  │          │                      │ │
│  │ Scheduler       │          └──────────────────────┘ │
│  │ React :3001     │                                    │
│  └────────┬────────┘                                    │
│           │                                             │
│           │ (Production: HTTPS/WSS via reverse proxy)   │
│           │ app-host.CUSTOMER_DOMAIN:8000 (HTTPS)      │
│           │ app-host.CUSTOMER_DOMAIN:8443 (WSS)        │
│           │                                             │
└───────────┼─────────────────────────────────────────────┘
            │
            │ TrakCare API (HTTPS)
            ▼
    ┌──────────────────┐
    │  TrakCare Server │
    │  (Hospital LAN)  │
    └──────────────────┘
```

## Related Documentation

- [Structural Diagrams](../structural/component-diagrams.md)
- [Behavioral Diagrams](../behavioral/sequence-diagrams.md)
- [System Overview](../../architecture/system-overview.md)
- [Security Patterns](../../analysis/security-patterns.md)
