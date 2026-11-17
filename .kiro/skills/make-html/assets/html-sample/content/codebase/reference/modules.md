# Modules

## Backend Module Organization

### Core Infrastructure

| Module | File | Responsibility |
|--------|------|---------------|
| Database Pool | `server/modules/db/index.js` | PostgreSQL connection pool creation, stats monitoring |
| Query Executor | `server/modules/pgpool.js` | SQL execution with retry logic, exponential backoff |
| Logger | `server/logger.js` | Rolling file logging, log purge (90-day retention) |
| Middleware | `server/middlewares/index.js` | CORS configuration, allowed headers |

### Business Logic Modules

| Module | File | Dependencies | In-Memory Cache |
|--------|------|-------------|----------------|
| Patient Appointment | `server/modules/patientAppointment.js` | accessToken, pgpool, date-fns, axios | dataInMem, dataFilterInMem, dataPatientStatusInMem, dataAppointmentHistoryInMem |
| Room Detail | `server/modules/roomDetail.js` | pgpool | dataInMem |
| Care Provider | `server/modules/careProvider.js` | accessToken, pgpool, axios | dataInMem |
| Care Provider Service | `server/modules/careProviderService.js` | accessToken, pgpool, axios | dataInMem |
| Doctor Schedule | `server/modules/doctorSchedule.js` | accessToken, pgpool, axios | dataInMem |
| Service | `server/modules/service.js` | accessToken, pgpool, axios | dataInMem |
| Assistance Dentist | `server/modules/assistanceDentist.js` | accessToken, pgpool, axios | dataInMem |
| Booking | `server/modules/booking.js` | pgpool | dataInMem |

### Integration Modules

| Module | File | External System |
|--------|------|----------------|
| Access Token | `server/modules/accessToken.js` | TrakCare OAuth |
| Signon TrakCare | `server/modules/signonTrakcare.js` | TrakCare Auth |
| Upload | `server/modules/upload.js` | File system |

### Orchestration

| Module | File | Responsibility |
|--------|------|---------------|
| Job Scheduler | `server/modules/jobsh.js` | Task coordination, retry logic, data refresh |
| Health Check | `server/modules/healthCheck.js` | Status flag management |

### Configuration

| Module | File | Responsibility |
|--------|------|---------------|
| Schedule Config | `server/configs/schedule-config.js` | Timing constants for scheduler |

## Frontend Module Organization

### Core

| Module | File | Responsibility |
|--------|------|---------------|
| Entry Point | `src/index.js` | React DOM render |
| App Shell | `src/App.js` | Navigation bar, layout |
| Router/State | `src/routes/index.js` | All state management, data fetching, Socket.IO |
| Proxy | `src/setupProxy.js` | Dev server proxy to backend |

### Page Components

| Module | File | Key Props |
|--------|------|-----------|
| Dashboard | `src/pages/Dashboard/index.js` | data, resource, roomDetail, statusPatients, alarmTime, showBlinkPatient |
| Schedule | `src/pages/Schedule/index.js` | resource, data, services, ResourceServices, DoctorSlot |
| Calendar | `src/pages/Calendar/index.js` | dentist, assistant, service, careProService |
| Login | `src/pages/Login/index.js` | - |
| Logout | `src/pages/Logout/index.js` | - |

### Sub-Components

| Component | File | Parent |
|-----------|------|--------|
| Table | `src/pages/Dashboard/table.js` | Dashboard |
| TableSearch | `src/pages/Dashboard/tableSearch.js` | Dashboard |
| SearchResource | `src/pages/Dashboard/searchResource.js` | Dashboard |
| ScheduleTable | `src/pages/Schedule/table.js` | Schedule |
| SearchResource | `src/pages/Schedule/searchResource.js` | Schedule |
| SearchService | `src/pages/Schedule/searchService.js` | Schedule |
| SelectTime | `src/pages/Schedule/selectTime.js` | Schedule |
| AlertDialogSlide | `src/pages/Calendar/AlertDialogSlide.js` | Calendar |
| FormDialog | `src/pages/Calendar/FormDialog.js` | Calendar |
| SimpleTable | `src/pages/Calendar/SimpleTable.js` | Calendar |
| LinearIndeterminate | `src/routes/LinearIndeterminate.js` | Routes |

## Module Dependency Graph

```
jobsh.js ─────────┬─── careProvider.js ──── accessToken.js + pgpool.js
                  ├─── service.js ───────── accessToken.js + pgpool.js
                  ├─── assistanceDentist.js ─ accessToken.js + pgpool.js
                  ├─── careProviderService.js ─ accessToken.js + pgpool.js
                  ├─── doctorSchedule.js ── accessToken.js + pgpool.js
                  ├─── roomDetail.js ────── pgpool.js
                  ├─── patientAppointment.js ─ accessToken.js + pgpool.js
                  └─── healthCheck.js

pgpool.js ──── db/index.js ──── pg (PostgreSQL driver)
accessToken.js ──── axios + pgpool.js (fetches token from TrakCare)
```

## Related Documentation

- [Program Structure](./program-structure.md)
- [Interfaces](./interfaces.md)
- [Components](../architecture/components.md)
- [Dependencies](../architecture/dependencies.md)
