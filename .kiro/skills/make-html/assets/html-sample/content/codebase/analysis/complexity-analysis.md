# Complexity Analysis

## High Complexity Hotspots

### 1. `src/routes/index.js` - God Component
**Complexity**: High

This single class component (350+ lines) handles:
- Application state for all views (14+ state properties)
- API data fetching (11 endpoints on mount)
- Socket.IO event subscription and handling
- Polling timer management (6-second interval)
- Alarm calculation logic (nested loops with time arithmetic)
- Blink/visual indicator logic (complex nested conditions)
- Route rendering decisions
- `shouldComponentUpdate` optimization

**Risk**: Any change to state management, data fetching, or real-time logic requires modifying this single file, increasing merge conflict risk and testing difficulty.

### 2. `server/modules/patientAppointment.js` - Mixed Concerns
**Complexity**: High

Combines in a single 450-line file:
- 4 separate in-memory cache variables
- Complex SQL CTEs with JOINs and CASE statements
- TrakCare API integration (HTTP calls)
- Temp table staging and validation logic (multi-step transaction)
- Route handler functions (HTTP req/res)
- Data transformation and filtering

**Risk**: Changes to any one concern (e.g., status mapping) require understanding the entire file. SQL queries are embedded as template literals making them hard to test independently.

### 3. `server/event-bridge.js` - Monolithic Event Handler
**Complexity**: Medium

Single file managing:
- Express server setup with middleware
- Socket.IO server configuration
- PostgreSQL connection pool
- Room detail business logic (login/logout)
- Patient status update logic (Call/Hold/End Service)
- Event deduplication with hashing
- Multi-step database transactions

### 4. `returnBlinkPatient()` in `src/routes/index.js`
**Complexity**: High (cyclomatic)

Deeply nested logic:
```
FOR EACH patient:
  IF status == "Arrived":
    IF time != walk-in:
      Calculate alarm time
      IF current >= alarm:
        Find resource in data
        IF resource exists:
          IF has appointments:
            Find patient index
            IF found:
              FOR subsequent appointments:
                IF processing AND not walk-in:
                  SET flag
              IF flag == 0:
                SET blink
```

**Nesting depth**: 8 levels

## SQL Query Complexity

| Query Location | JOINs | CTEs | CASE Branches | Parameters |
|---------------|-------|------|--------------|-----------|
| retrieveDataToMem (appointment) | 1 INNER | 1 (DoctorSlot) | 7 | 2 |
| retrieveDataPatientStatusToMem | 1 LEFT + CTE JOIN | 1 (APPTM) | 7 | 1 |
| event-bridge patientStatus (Call) | CTE + correlation | 1 (RoomDetailTemp) | 0 | 3 |
| validateAppointmentChangeEvent | EXCEPT + LEFT JOIN | 0 | 0 | 0-23 |

## Cyclomatic Complexity Estimates

| Component | Estimated CC | Rating |
|-----------|-------------|--------|
| returnBlinkPatient | 15+ | Very High |
| validateAppointmentChangeEvent | 8 | High |
| retrieveDataToMem | 7 | Medium-High |
| handleDataUpdate | 5 | Medium |
| taskGetMasterDataFromTrakcare | 4 | Medium |

## Related Documentation

- [Code Metrics](./code-metrics.md)
- [Patterns](../architecture/patterns.md)
- [Maintenance Burden](../technical-debt/maintenance-burden.md)
