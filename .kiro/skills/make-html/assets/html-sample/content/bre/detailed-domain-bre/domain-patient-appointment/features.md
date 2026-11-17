# Patient Appointment Domain - Features

## F-PA-001: Appointment Synchronization from TrakCare

Periodically fetches appointment data from the TrakCare HIS API (`GetAppointmentNoGroupBy`) for the dental department (location code `01DEN`). Data is staged in `PatientAppointmentTemp` before being validated and merged into `PatientAppointment`.

**Source**: `server/modules/patientAppointment.js` → `getAppointment()`

## F-PA-002: Appointment Change Detection

Uses SQL EXCEPT queries between `PatientAppointmentTemp` and `PatientAppointment` to detect:
- New appointments (in temp but not in main)
- Modified appointments (field differences between temp and main)
- Updates existing records by matching on `APPT_RowId`

**Source**: `server/modules/patientAppointment.js` → `validateAppointmentChangeEvent()`

## F-PA-003: Patient Status Tracking

Tracks patient journey through statuses: Booked (B) → Arrived (A) → Processing (P) → Hold (H) → End Service (E), with Canceled (C) as terminal state. Status transitions trigger real-time UI updates via Socket.IO.

**Source**: `server/event-bridge.js` → `POST /patientStatus`

## F-PA-004: Real-Time Dashboard Display

Displays current day's appointments grouped by care provider with:
- Workload-based color coding per room
- Blinking alert for patients waiting >10 minutes past appointment time
- Auto-refresh every 6 seconds via polling + Socket.IO push

**Source**: `src/pages/Dashboard/index.js`, `src/routes/index.js`

## F-PA-005: Schedule View (Time Grid)

Displays all dentists' appointments in a 15-minute time grid (08:00-20:00) with filtering by:
- Individual dentist
- Service type
- Time period (morning/afternoon/evening)

**Source**: `src/pages/Schedule/index.js`, `src/pages/Schedule/table.js`

## F-PA-006: Appointment History

Archives daily appointments to `PatientAppointmentHistory` table and provides historical viewing by date for the Schedule page.

**Source**: `server/modules/patientAppointment.js` → `duplicateAppointmentToHistory()`, `loadDataAppointmentHistoryInMem()`

## F-PA-007: Patient Status Event Processing

Receives real-time status updates from external systems (via Event Bridge HTTP POST):
- "Call" → sets `EVTCall_Time`, transitions to Processing (P)
- "Hold" → transitions to Hold (H)
- "End Service" → sets `EVTEndService_Time`, transitions to End Service (E)
- Cross-references `RoomDetail` to find associated care provider by room

**Source**: `server/event-bridge.js` → `POST /patientStatus`

## F-PA-008: Appointment Filtering

Provides two in-memory views:
- `dataInMem`: All valid providers (those with at least 1 appointment)
- `dataFilterInMem`: Providers that have a doctor slot OR have non-canceled appointments

**Source**: `server/modules/patientAppointment.js` → `retrieveDataToMem()`

## F-PA-009: Special Time Code Handling

Filters out appointment times ending in minutes :04, :09, :07 from normal display:
- :04 = Walk-in/clock marker (shown with clock icon)
- :09 = Phone appointment (shown with phone icon)
- :07 = Special appointment type

**Source**: `src/pages/Dashboard/tableSearch.js`, `src/pages/Schedule/table.js`

## F-PA-010: Workload Calculation Integration

Calculates workload percentage per provider: `SUM(service_minutes) / SUM(slot_minutes)`. Only considers providers currently "In" a room and excludes special time codes.

**Source**: `server/modules/doctorSchedule.js` → `retrieveDataToMem()`
