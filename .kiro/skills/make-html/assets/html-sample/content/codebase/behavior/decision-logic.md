> ⚠️ **Early Access**: Behavior documentation is in early access. Please review critically.

# Decision Logic

## Patient Status Determination (SQL CASE)

**Location**: `server/modules/patientAppointment.js` (multiple query locations)

```
IF PT_Status = 'P' THEN 'Processing'
ELSE IF PT_Status = 'H' THEN 'Hold'
ELSE IF PT_Status = 'E' THEN 'End Service'
ELSE IF PAADM_VisitStatus = 'C' THEN 'Canceled'
ELSE IF APPT_ArrivalDate IS NULL AND APPT_CancelDate IS NULL THEN 'Booked'
ELSE IF APPT_ArrivalDate IS NOT NULL THEN 'Arrived'
ELSE IF APPT_CancelDate IS NOT NULL THEN 'Canceled'
```

**Priority**: Event-driven status (P/H/E) takes precedence over arrival/booking status.

## Care Provider Display Filter

**Location**: `server/modules/patientAppointment.js`, `retrieveDataToMem` function

A care provider is shown on the dashboard if ALL these conditions are met:
```
shouldInclude = (SUMSLOT != null) OR (!hasCanceled) OR (hasCanceled AND hasNonCanceled)
isValid = appointments.length >= 1
```

Translation:
- **Include if**: Doctor has a schedule slot for today, OR has no canceled appointments, OR has both canceled and non-canceled appointments
- **Exclude if**: Doctor has ONLY canceled appointments AND no schedule slot for today
- **Always exclude if**: Doctor has zero appointments for today

## Patient Initial Status Mapping (TrakCare Import)

**Location**: `server/modules/patientAppointment.js`, `getAppointment` function

```
IF PAADM_VisitStatus == "C" THEN params = "C" (Canceled)
ELSE IF APPT_ArrivalDate != "" THEN params = "A" (Arrived) -- note: empty string check, not null
ELSE IF APPT_CancelDate != "" THEN params = "C" (Canceled)
ELSE params = "B" (Booked)
```

## Patient Status Event Mapping

**Location**: `server/event-bridge.js`, `/patientStatus` route

```
statusMap = {
  "Booked" → "B"
  "Arrived" → "A"
  "Cancel" → "C"
  "Call" → "P" (Processing)
  "Hold" → "H"
  "End Service" → "E"
}
```

## Patient Call Guard Condition

**Location**: `server/event-bridge.js`, patientStatus handler for "P" status

A patient can only be "Called" (set to Processing) if:
```
PT_Status NOT IN ('P', 'H', 'E')
AND APPT_CancelDate IS NULL
AND (PAADM_VisitStatus != 'C' OR PAADM_VisitStatus IS NULL)
AND CarpCode matches doctor currently in the room
```

This prevents re-calling a patient already being served.

## Room Assignment Logic

**Location**: `server/event-bridge.js`, `/roomDetail` route

```
IF Room == "Out":
  → Logout: set current doctor record to Out
ELSE:
  → Kick existing occupant of target room (set to Out)
  → Kick same doctor from any other room (set to Out)
  → Insert new login record
```

**Business Rule**: One doctor per room, one room per doctor (enforced by double-update).

## Frontend Blink/Alarm Decision

**Location**: `src/routes/index.js`, `returnBlinkPatient` function

```
FOR EACH patient in statusPatients:
  IF status == "Arrived"
  AND appointment minute NOT IN ("04", "09", "07")  -- walk-in filter
  THEN:
    alarmTime = appointmentTime + 10 minutes
    IF currentTime >= alarmTime:
      Find resource (doctor) from appointment data
      Scan subsequent appointments for same doctor
      IF no "Processing" appointment found after this patient:
        SET blink CSS class for that room
```

## Frontend Render Decision

**Location**: `src/routes/index.js`, `shouldComponentUpdate`

```
IF externalData == null → re-render (loading state)
ELSE IF hash == "#/" → re-render
ELSE IF hash == "#/dashboard" or "#/dashboard/*" → re-render
ELSE IF hash == "#/schedule" → DO NOT re-render
ELSE IF hash == "#/calendar" → DO NOT re-render
ELSE → re-render
```

This optimization prevents unnecessary re-renders when on Schedule/Calendar views.

## Time Window Guard

**Location**: `server/modules/jobsh.js`, `taskIntervalGetDataFromTrakcare`

```
IF currentHour >= 6 AND currentHour <= 22:
  → Execute appointment sync
ELSE:
  → Skip (clinic closed hours)
```

## Event Deduplication

**Location**: `server/event-bridge.js`, Socket.IO event handlers

```
currentHash = hash(incomingObject)
IF currentHash != previousHash:
  → Process and broadcast event
  → Update previousHash
ELSE:
  → Silently ignore (duplicate event)
```

## Related Documentation

- [Business Logic](./business-logic.md)
- [Workflows](./workflows.md)
- [Error Handling](./error-handling.md)
- [API Reference](../reference/api-reference.md)
