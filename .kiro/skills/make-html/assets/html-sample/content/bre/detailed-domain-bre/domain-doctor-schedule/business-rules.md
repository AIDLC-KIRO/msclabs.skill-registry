# Doctor Schedule Domain - Business Rules

## BR-DS-001: Composite Key for Schedule Matching

Schedule records are matched using a 6-field composite key:
- FieldRow + DoctorCode + Day + StartDate + EndDate + TimeStart + TimeEnd

This determines whether a schedule entry is "the same" between temp and main tables.

**Source**: `server/modules/doctorSchedule.js` → `validateDoctorScheduleChangeEvent()` JOIN condition

## BR-DS-002: Workload Only for Active Rooms

Workload calculation only considers doctors who are currently checked into a room (`RoomDetail.CarpStatus = 'In'`). Doctors not currently in a room are excluded from workload metrics.

**Source**: `server/modules/doctorSchedule.js` → workload SQL query INNER JOIN RoomDetail

## BR-DS-003: Special Time Exclusion from Workload

Appointments with `AS_SessStartTime` ending in minutes :04, :09, or :07 are excluded from workload sum. These represent non-standard appointment types (walk-ins, phone calls, etc.) that should not count toward capacity utilization.

**Source**: `server/modules/doctorSchedule.js` → WHERE clause filtering `RIGHT(...)` != '04','09','07'

## BR-DS-004: Date Range Scope

Schedule sync covers current month start through next month end. This ensures upcoming schedules are always available for booking and display.

**Source**: `server/modules/jobsh.js` → date range calculation using `startOfMonth`, `endOfMonth`, `addMonths`

## BR-DS-005: Retry on Per-Provider Failure

If a TrakCare API call fails for a specific provider during schedule fetch, the system retries up to 3 times for that provider. Other providers are not affected.

**Source**: `server/modules/doctorSchedule.js` → retry logic per provider

## BR-DS-006: Schedule Slot Duration as Text

TimeStart and TimeEnd are stored as text (e.g., "08:00", "12:00"). Duration is calculated at query time using PostgreSQL `::time` cast and `EXTRACT(EPOCH FROM ...)`.

**Source**: SQL query in `retrieveDataToMem()`
