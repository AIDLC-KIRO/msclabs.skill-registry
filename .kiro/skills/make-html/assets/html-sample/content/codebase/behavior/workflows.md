> ⚠️ **Early Access**: Behavior documentation is in early access. Please review critically.

# Workflows

## 1. Application Startup Workflow

**Entry Point**: `server/scheduler.js` (triggered by PM2)

```
START
  → Load environment variables (.env based on NODE_ENV)
  → Initialize node-schedule
  → Execute taskGetMasterDataFromTrakcare()
    → Fetch care providers from TrakCare API
    → Fetch services from TrakCare API
    → Fetch dental assistants from TrakCare API
    → Fetch doctor schedules (current + next month, 3 retries each)
    → Load all data into in-memory cache (taskRetrieveDataToMemory)
  → Execute taskGetAppointment()
    → For each day in current month: fetch + stage + validate appointments
    → For each day in next month: fetch + stage + validate appointments
  → Execute taskGetCareProviderService()
    → For each day in current + next month: fetch care provider services
  → Register scheduled tasks (daily, interval, doctor schedule refresh)
  → Set initFlag = false, getMasterFlag = false
END
```

## 2. Real-time Patient Status Update Workflow

**Entry Point**: `POST /patientStatus` on Event Bridge (port 8080)

```
START
  → Receive POST from OPD Queue system
  → Validate required fields (TransactionId, PatientId, EpisodeNumber, Room, PatientStatus, Location)
  → Map status string to code: Call→P, Hold→H, End Service→E, Booked→B, Arrived→A, Cancel→C
  → Acquire PostgreSQL connection from pool
  → IF status == "P" (Call):
    → Update EVTCall_Time WHERE HN/EN match AND doctor in room AND status NOT IN (P,H,E)
  → IF status == "E" (End Service):
    → Update EVTEndService_Time WHERE HN/EN match AND doctor in room
  → Update PatientAppointment SET Room, PT_Status WHERE HN/EN match AND doctor in room
  → Release DB connection
  → Emit "patientStatusUpdate" Socket.IO event to all clients
  → App Service receives event → refreshes in-memory appointment data
  → Frontend receives event → fetches updated data → re-renders dashboard
END
```

## 3. Room Login/Logout Workflow

**Entry Point**: `POST /roomDetail` on Event Bridge (port 8080)

```
START
  → Receive POST from OPD Queue system
  → Validate fields (ResourceId, Resource, Room, AssistantId, Assistant, Location)
  → IF Room == "Out":
    → UPDATE RoomDetail SET CarpStatus='Out', LogoutTime WHERE CarpCode = ResourceId
    → Emit roomDetailUpdate with status "Out"
  → ELSE (Login):
    → UPDATE existing 'In' records to 'Out' for same Room OR same CarpCode
    → INSERT new RoomDetail (CarpCode, AssistCode, ScheduleTime, Location, 'In', Room, LoginTime)
    → Emit roomDetailUpdate with status "In"
  → Respond 201 OK
  → App Service receives event → refreshes room detail + patient status in memory
  → Frontend receives event → fetches updated data → re-renders room grid
END
```

## 4. Periodic Appointment Sync Workflow

**Entry Point**: `taskIntervalGetDataFromTrakcare` (every 60 seconds via setInterval)

```
START
  → Check time window: IF hour < 6 OR hour > 22 → SKIP
  → IF environment != TEST:
    → Get OAuth token from TrakCare
    → Fetch appointments for today from TrakCare API
    → DELETE all rows from PatientAppointmentTemp, reset sequence
    → INSERT each appointment record into PatientAppointmentTemp
  → Validate change events:
    → INSERT new records (in temp but not in main) into PatientAppointment
    → EXCEPT query to find changed records → UPDATE each changed record
  → IF changes detected (ch_evt = true):
    → Refresh in-memory appointment data
  → Update health check status based on API success/failure
END
```

## 5. Frontend Dashboard Real-time Update Workflow

**Entry Point**: `src/routes/index.js` componentDidMount + Socket.IO events + 6s interval

```
START
  → On mount: Fetch all 11 API endpoints in parallel
  → Parse responses, set state
  → Subscribe to Socket.IO events: dataRoomDetail, StatusPatient, Trakcare
  → Start 6-second polling interval
  → ON EVENT (dataRoomDetail or StatusPatient):
    → Fetch 5 key endpoints (appointments, patient status, workload, filter, rooms)
    → Compare with current state via JSON.stringify
    → IF changed → update state → trigger re-render
    → Recalculate alarm times and blink indicators
  → ON INTERVAL (every 6s):
    → Same fetch + compare + update cycle
END
```

## 6. Daily Maintenance Workflow

**Entry Point**: Scheduler at 00:01 daily

```
START
  → Backup current appointments to PatientAppointmentHistory
  → Delete all current PatientAppointment records
  → Fetch fresh master data from TrakCare (care providers, services, assistants)
  → Fetch and validate doctor schedules (current + next month)
  → Reload all data into memory cache
  → Purge log files older than 90 days
END
```

## Related Documentation

- [Business Logic](./business-logic.md)
- [Decision Logic](./decision-logic.md)
- [Components](../architecture/components.md)
- [API Reference](../reference/api-reference.md)
