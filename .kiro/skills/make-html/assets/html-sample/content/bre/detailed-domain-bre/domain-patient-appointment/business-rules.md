# Patient Appointment Domain - Business Rules

## BR-PA-001: Status Derivation from TrakCare Data

When syncing from TrakCare API, the initial `PT_Status` is derived:
- If `APPT_ArrivalDate` is NULL AND `APPT_CancelDate` is NULL → status = 'B' (Booked)
- If `APPT_ArrivalDate` is NOT NULL → status = 'A' (Arrived)
- If `APPT_CancelDate` is NOT NULL → status = 'C' (Canceled)

**Source**: `server/modules/patientAppointment.js` → `getAppointment()` line mapping logic

## BR-PA-002: Status Display Mapping

For dashboard/schedule display, status is computed via SQL CASE:
- `PT_Status = 'P'` → "Processing"
- `PT_Status = 'H'` → "Hold"
- `PT_Status = 'E'` → "End Service"
- `PAADM_VisitStatus = 'C'` → "Canceled"
- `APPT_ArrivalDate IS NULL AND APPT_CancelDate IS NULL` → "Booked"
- `APPT_ArrivalDate IS NOT NULL` → "Arrived"
- `APPT_CancelDate IS NOT NULL` → "Canceled"

**Source**: `server/modules/patientAppointment.js` → `retrieveDataToMem()` SQL query

## BR-PA-003: Provider Inclusion Rule (shouldInclude)

A care provider appears in the filtered dashboard if:
- They have a doctor schedule slot for the current day, OR
- They have at least one non-canceled appointment

**Source**: `server/modules/patientAppointment.js` → filtering logic

## BR-PA-004: Provider Validity Rule (isValid)

A care provider appears in the full dashboard if they have at least 1 appointment record for the current day.

**Source**: `server/modules/patientAppointment.js` → `retrieveDataToMem()`

## BR-PA-005: Waiting Alert Trigger

A patient triggers a blinking visual alert when:
- Status is "Booked" (not yet arrived/called)
- Current time exceeds appointment time (`AS_SessStartTime`) by more than 10 minutes
- Appointment time does NOT end in minutes :04, :09, or :07

**Source**: `src/routes/index.js` → blinking patient logic

## BR-PA-006: Time-Bounded Sync Window

Appointment data fetching from TrakCare only occurs between 06:00 and 22:00 (Bangkok timezone). Outside this window, the system does not poll for new appointments.

**Source**: `server/modules/jobsh.js` → `taskIntervalGetDataFromTrakcare()`

## BR-PA-007: Change Detection via EXCEPT

New appointments are detected by LEFT JOIN where main table has NULL ID. Modified appointments are detected via SQL EXCEPT comparing all fields between temp and main tables.

**Source**: `server/modules/patientAppointment.js` → `validateAppointmentChangeEvent()`

## BR-PA-008: Status Transition Guard (Call)

When processing a "Call" event, the system only updates `EVTCall_Time` if the patient is NOT already in status P (Processing), H (Hold), or E (End Service). This prevents overwriting the initial call timestamp.

**Source**: `server/event-bridge.js` → `POST /patientStatus` handler

## BR-PA-009: Room-Provider Cross-Reference

When a patient status update arrives, the system finds the associated care provider by:
1. Looking up `RoomDetail` where `Room` matches and `CarpStatus = 'In'`
2. Using the found `CarpCode` to update the appointment record

**Source**: `server/event-bridge.js` → CTE in patient status SQL

## BR-PA-010: History Archival

Appointments are duplicated to `PatientAppointmentHistory` with `TimeCreate = CURRENT_TIMESTAMP` as part of the daily backup task.

**Source**: `server/modules/patientAppointment.js` → `duplicateAppointmentToHistory()`

## BR-PA-011: Appointment Time Truncation

The `AS_SessStartTime` from TrakCare is truncated to `HH:mm` format (first 5 characters) for storage and display.

**Source**: `server/modules/patientAppointment.js` → time parsing logic
