# Architectural Patterns

## Patterns Identified

### 1. In-Memory Cache Pattern
**Location**: All `server/modules/*.js` files

Each module maintains module-level variables (`let dataInMem = []`) that hold the latest database query results. API endpoints serve directly from these cached variables rather than querying the database on every request.

```
[Database] ---(periodic refresh)---> [Module Memory] ---(instant)---> [API Response]
```

**Implications**: Fast reads (~0ms), but data can be stale between refresh cycles (up to 60 seconds). Single-process constraint for cache coherency (addressed by PM2 cluster mode only partially).

### 2. Event-Driven Architecture (Pub/Sub via Socket.IO)
**Location**: `server/event-bridge.js`, `server/app.js`, `src/routes/index.js`

The Event Bridge acts as a message broker:
- External systems POST events to Event Bridge
- Event Bridge writes to DB and emits Socket.IO events
- App Service and Frontend subscribe to these events
- Frontend triggers data refresh on event receipt

### 3. Temp Table Staging Pattern
**Location**: `server/modules/patientAppointment.js`, `server/modules/doctorSchedule.js`

External data goes through a staging process:
1. Data fetched from TrakCare API
2. Written to temp table (e.g., `PatientAppointmentTemp`)
3. Compared with main table using SQL `EXCEPT`
4. New records inserted, changed records updated
5. Change flag returned for downstream notifications

### 4. Repository Pattern (Implicit)
**Location**: `server/modules/`

Each module acts as a data repository for a specific domain entity, encapsulating:
- Database queries (retrieval, insert, update, delete)
- In-memory cache management
- External API integration (TrakCare)
- Route handler functions

### 5. Observer Pattern (Frontend)
**Location**: `src/routes/index.js`

The Routes component acts as a central observer:
- Subscribes to Socket.IO events (`dataRoomDetail`, `StatusPatient`, `Trakcare`)
- Polls API on interval (6 seconds)
- Propagates state changes to child components via props

### 6. Scheduled Task Pattern
**Location**: `server/scheduler.js`, `server/configs/schedule-config.js`

Cron-based scheduling with:
- Time-window restrictions (6am-10pm for appointment sync)
- Retry logic (3 attempts for schedule fetches)
- Sequential execution within each task

## Anti-Patterns Identified

### 1. God Component
`src/routes/index.js` manages all application state, data fetching, WebSocket connections, alarm logic, and routing in a single 300+ line class component.

### 2. Module-Level Mutable State
`let dataInMem = []` at module level creates hidden coupling between request handlers and background tasks that mutate the same reference.

### 3. Mixed Concerns
`server/modules/patientAppointment.js` combines:
- Route handlers (HTTP request/response)
- Business logic (status mapping, filtering)
- Data access (SQL queries)
- External API integration (TrakCare calls)

### 4. Dead Code Retention
`server/modules.old/` directory and `.old` file copies are kept in the repository, creating confusion about which code is active.

### 5. Polling + Push Redundancy
The frontend both polls every 6 seconds AND listens for Socket.IO events, creating redundant data fetching.

## Related Documentation

- [System Overview](./system-overview.md)
- [Components](./components.md)
- [Complexity Analysis](../analysis/complexity-analysis.md)
- [Maintenance Burden](../technical-debt/maintenance-burden.md)
