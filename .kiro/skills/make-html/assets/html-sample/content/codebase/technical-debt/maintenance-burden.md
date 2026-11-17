# Maintenance Burden

## High-Maintenance Areas

### 1. Frontend State Management (`src/routes/index.js`)
**Burden Level**: High

- Single component manages ALL application state (14+ properties)
- Every new feature requires modifying this file
- Socket.IO subscriptions, polling logic, alarm calculations all co-located
- `shouldComponentUpdate` optimization is fragile — must be updated for new routes
- JSON.stringify comparison for change detection is expensive and brittle

**Maintenance tasks**:
- Adding new API endpoints requires editing componentDidMount and handleDataUpdate
- New Socket.IO events require adding listeners in componentDidMount
- Any state shape change cascades to all child components

### 2. TrakCare Integration (`server/modules/patientAppointment.js`)
**Burden Level**: High

- Tightly coupled to TrakCare API response structure
- Any change to TrakCare API fields requires updating INSERT/SELECT/UPDATE queries across multiple functions
- 23-column INSERT statements must be kept in sync with TrakCare response
- No abstraction layer between TrakCare data and internal model

**Maintenance tasks**:
- TrakCare API field additions/removals require multi-location updates
- Status mapping changes require updating multiple SQL CASE statements
- Temp table schema must mirror main table exactly

### 3. In-Memory Cache Coherency
**Burden Level**: Medium

- Each module independently manages its own cache variable
- No cache invalidation strategy beyond periodic refresh
- PM2 cluster mode means each worker has independent cache (potential inconsistency)
- Event-driven refresh only updates specific caches (may miss edge cases)

**Maintenance tasks**:
- Adding new cached data requires adding refresh calls to jobsh.js
- Ensuring all caches are refreshed after state changes
- Debugging stale data issues requires understanding which event triggers which refresh

### 4. Dead Code and Legacy Files
**Burden Level**: Medium

- `server/modules.old/` - 16 files that are complete copies of active modules
- `*.old` files scattered in source (index.css.old, dashboard.css.old, patientAppointment.js.old, index.js.old)
- Commented-out code blocks (50+ lines) in patientAppointment.js
- Creates confusion about which code is authoritative

### 5. SQL Query Maintenance
**Burden Level**: Medium

- SQL queries embedded as template literals in JavaScript
- No ORM or query builder — raw SQL strings
- Same CASE statement for status mapping repeated in 4+ locations
- Column additions to PatientAppointment require updating 5+ queries

### 6. Environment Configuration
**Burden Level**: Low

- 4 `.env` files with 33 variables each
- Manual synchronization required when adding new config
- Production credentials potentially committed (`.env.production`)
- No config validation at startup (typos fail silently)

## Maintenance Effort by Module

| Module | Change Frequency | Impact of Change | Effort |
|--------|-----------------|-----------------|--------|
| src/routes/index.js | High | High (all views affected) | High |
| patientAppointment.js | Medium | High (core data flow) | High |
| event-bridge.js | Low | High (real-time updates) | Medium |
| jobsh.js | Medium | Medium (scheduling) | Medium |
| Dashboard components | Medium | Low (UI only) | Low |
| Config files | Low | Low (constants) | Low |

## Related Documentation

- [Summary](./summary.md)
- [Outdated Components](./outdated-components.md)
- [Remediation Plan](./remediation-plan.md)
- [Complexity Analysis](../analysis/complexity-analysis.md)
