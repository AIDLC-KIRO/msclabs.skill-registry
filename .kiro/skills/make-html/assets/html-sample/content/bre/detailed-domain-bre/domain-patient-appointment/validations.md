# Patient Appointment Domain - Validations

## VAL-PA-001: Patient Status POST Required Fields

The `/patientStatus` endpoint validates that all required fields are present:
- TransactionId (string)
- PatientId (string, maps to HN)
- EpisodeNumber (string, maps to EN)
- Room (string)
- PatientStatus (string: one of Booked, Arrived, Cancel, Call, Hold, End Service)
- Location (string, e.g., "01DEN")

Returns HTTP 400 with field-specific error message if any field is missing.

**Source**: `server/event-bridge.js` → POST /patientStatus validation block

## VAL-PA-002: Appointment Time Format

Appointment start time (`AS_SessStartTime`) is truncated to 5 characters (HH:mm format) during sync. Invalid or empty times from the API are stored as-is.

**Source**: `server/modules/patientAppointment.js`

## VAL-PA-003: Date Filter Validation

The `patientAppointmentHistory/:date` endpoint expects a date parameter in the URL path. No explicit format validation is performed; the date is passed directly to SQL queries using `to_date()`.

**Source**: `server/modules/patientAppointment.js` → `loadDataAppointmentHistoryInMem()`

## VAL-PA-004: Duplicate Prevention (APPT_RowId)

During change detection, new appointments are only inserted if no matching `APPT_RowId` exists in the main table (LEFT JOIN ... WHERE main.APPT_RowId IS NULL).

**Source**: `server/modules/patientAppointment.js` → `validateAppointmentChangeEvent()`

## VAL-PA-005: Status Transition Guard

The "Call" status event only applies `EVTCall_Time` if the current `PT_Status` is NOT already 'P', 'H', or 'E'. This prevents double-calling a patient.

**Source**: `server/event-bridge.js` → Call status SQL condition
