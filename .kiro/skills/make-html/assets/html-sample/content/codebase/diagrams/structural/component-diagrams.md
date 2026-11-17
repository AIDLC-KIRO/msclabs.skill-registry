# Structural Diagrams

## System Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DENTAL DASHBOARD SYSTEM                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────────┐    ┌────────────────────────┐   │
│  │   FRONTEND   │    │   APP SERVICE    │    │    EVENT BRIDGE        │   │
│  │  (React 16)  │    │   (Express)      │    │    (Socket.IO Server)  │   │
│  │              │    │                  │    │                        │   │
│  │  Dashboard   │    │  REST API        │    │  POST /roomDetail     │   │
│  │  Schedule    │◄──►│  /careProvider   │◄──►│  POST /patientStatus  │   │
│  │  Calendar    │    │  /patientAppt    │    │                        │   │
│  │  Login       │    │  /roomDetail     │    │  Socket.IO Hub         │   │
│  │              │    │  /service        │    │  Event Deduplication   │   │
│  └──────────────┘    │  /doctorSchedule │    └────────────────────────┘   │
│                      │  /booking        │              │                    │
│                      └──────────────────┘              │                    │
│                               │                        │                    │
│  ┌──────────────────┐         │                        │                    │
│  │   SCHEDULER      │         │                        │                    │
│  │  (node-schedule) │         │                        │                    │
│  │                  │         ▼                        ▼                    │
│  │  Daily Sync      │    ┌─────────────────────────────────┐              │
│  │  Interval Sync   │───►│      PostgreSQL 14.2            │              │
│  │  Doctor Schedule  │    │      dental_db                  │              │
│  │  Backup/Purge    │    │                                 │              │
│  └──────────────────┘    │  PatientAppointment  RoomDetail │              │
│                          │  CareProvider        Service    │              │
│                          │  DoctorSchedule      Booking    │              │
│                          └─────────────────────────────────┘              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP REST API
                                      ▼
                          ┌───────────────────────┐
                          │   TrakCare HIS        │
                          │   (External System)   │
                          │                       │
                          │   /api/PTINF/...      │
                          │   OAuth2 Auth         │
                          └───────────────────────┘
```

## Module Dependency Diagram

```
                    ┌─────────────┐
                    │  scheduler  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   jobsh     │
                    └──────┬──────┘
          ┌────────┬───────┼───────┬────────┬──────────┐
          ▼        ▼       ▼       ▼        ▼          ▼
   ┌──────────┐ ┌──────┐ ┌────┐ ┌──────┐ ┌─────┐ ┌────────┐
   │careProvdr│ │doctor│ │svc │ │assist│ │room │ │patient │
   │          │ │Sched │ │    │ │Dntst │ │Detl │ │Appoint │
   └────┬─────┘ └──┬───┘ └─┬──┘ └──┬───┘ └──┬──┘ └───┬────┘
        │          │       │       │        │        │
        └──────────┴───────┴───────┴────────┼────────┘
                           │                 │
                    ┌──────▼──────┐   ┌──────▼──────┐
                    │ accessToken │   │   pgpool    │
                    └──────┬──────┘   └──────┬──────┘
                           │                 │
                           └────────┬────────┘
                                    ▼
                             ┌──────────────┐
                             │   db/index   │
                             │   (pg Pool)  │
                             └──────────────┘
```

## Frontend Component Hierarchy

```
index.js
└── App.js (Navbar)
    └── routes/index.js (State Hub)
        ├── Dashboard/index.js
        │   ├── table.js
        │   ├── tableSearch.js
        │   ├── searchResource.js
        │   └── styles.js
        ├── Schedule/index.js
        │   ├── table.js
        │   ├── searchResource.js
        │   ├── searchService.js
        │   └── selectTime.js
        ├── Calendar/index.js
        │   ├── FormDialog.js
        │   ├── AlertDialogSlide.js
        │   └── SimpleTable.js
        ├── Login/index.js
        └── Logout/index.js
```

## Related Documentation

- [Components](../../architecture/components.md)
- [Modules](../../reference/modules.md)
- [Behavioral Diagrams](../behavioral/)
- [Architecture Diagrams](../architecture/)
