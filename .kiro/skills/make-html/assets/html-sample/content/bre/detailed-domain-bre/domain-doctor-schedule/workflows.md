# Doctor Schedule Domain - Workflows

## WF-DS-001: Schedule Sync Workflow

```
1. Triggered by scheduler (3x daily: 07:30, 11:30, 16:30) or daily task
2. Calculate date range: startOfMonth(today) through endOfMonth(addMonths(today, 1))
3. Clear DoctorScheduleTemp, reset sequence
4. For each CareProvider:
   a. Call TrakCare API: getDoctorSchedule?Input1={CarpCode}&Input2={start}&Input3={end}&Input4=01DEN
   b. Parse response and INSERT each schedule entry into DoctorScheduleTemp
   c. If API fails: retry up to 3 times (10s timeout per call)
5. Call validateDoctorScheduleChangeEvent(start, end):
   a. INSERT new entries (in temp, not in main by composite key)
   b. EXCEPT query to find entries in main not in temp (within date range) → DELETE removed
6. Refresh in-memory workload cache
```

## WF-DS-002: Workload Calculation Flow

```
1. Triggered by retrieveDataToMem() during memory refresh cycle
2. Build CTE "DoctorSchTemp":
   - SUM of (TimeEnd::time - TimeStart::time) in minutes per DoctorCode
   - Only for doctors with CarpStatus='In' in RoomDetail
   - Filtered by current date between StartDate and EndDate, matching Day
3. Main query:
   - JOIN RoomDetail → PatientAppointment → Service
   - SUM Service.SvcTimeInMinute for appointments (excluding :04/:09/:07 times)
   - Compute Workload = SUMSERVICE / SUMSLOT
4. Return workload data per room for dashboard color coding
```
