# Doctor Schedule Domain - Features

## F-DS-001: Schedule Synchronization from TrakCare

Fetches doctor schedule data from TrakCare API per care provider, per date range (current month + next month). Uses temp table pattern for change detection.

**Source**: `server/modules/doctorSchedule.js` → `getDoctorSchedule(start, end)`

## F-DS-002: Schedule Change Detection

Detects new and removed schedule entries:
- New: entries in DoctorScheduleTemp not in DoctorSchedule (6-field composite key match)
- Removed: entries in DoctorSchedule (within date range) not in DoctorScheduleTemp

**Source**: `server/modules/doctorSchedule.js` → `validateDoctorScheduleChangeEvent()`

## F-DS-003: Workload Calculation

Computes provider workload as `SUM(service_minutes) / SUM(slot_minutes)`:
- Slot minutes: sum of (TimeEnd - TimeStart) from DoctorSchedule for providers with CarpStatus='In'
- Service minutes: sum of SvcTimeInMinute from Service for each patient's appointment
- Excludes appointments at special times (:04, :09, :07)

**Source**: `server/modules/doctorSchedule.js` → `retrieveDataToMem()`

## F-DS-004: Doctor Schedule On Date Query

Returns time slot strings (e.g., "08:00-12:00") for a specific doctor on a specific date, used by the frontend Calendar/Schedule pages.

**Source**: `server/modules/doctorSchedule.js` → `getDoctorScheduleOnDate()`

## F-DS-005: Multiple Daily Refreshes

Schedule data is refreshed 3 times daily (07:30, 11:30, 16:30) to capture mid-day changes in TrakCare.

**Source**: `server/scheduler.js` → `createDoctorScheduleTask`
