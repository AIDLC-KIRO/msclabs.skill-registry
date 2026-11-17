# Patient Appointment Domain - Workflows

## WF-PA-001: Appointment Sync Workflow

```
1. Scheduler triggers taskIntervalGetDataFromTrakcare() every 60 seconds
2. Check time window (06:00-22:00 Bangkok time)
3. If within window:
   a. Call getAppointment(today's date)
   b. DELETE all from PatientAppointmentTemp, reset sequence
   c. Fetch from TrakCare API: GET /api/PTINF/GetAppointmentNoGroupBy?input1=01DEN&input2={date}
   d. For each appointment in response:
      - Derive PT_Status from arrival/cancel dates (BR-PA-001)
      - Truncate time to HH:mm (BR-PA-011)
      - INSERT into PatientAppointmentTemp
   e. Call validateAppointmentChangeEvent()
   f. Detect NEW: LEFT JOIN temp→main WHERE main.APPT_RowId IS NULL → INSERT into PatientAppointment
   g. Detect CHANGED: EXCEPT query between temp and main → UPDATE PatientAppointment by APPT_RowId
   h. Refresh in-memory cache (retrieveDataToMem)
4. If outside window: skip
```

## WF-PA-002: Patient Status Update Workflow (Event Bridge)

```
1. External system POSTs to /patientStatus with: TransactionId, PatientId(HN), EpisodeNumber(EN), Room, PatientStatus, Location
2. Validate required fields (400 if missing)
3. Map status string to code: Booked→B, Arrived→A, Cancel→C, Call→P, Hold→H, End Service→E
4. Build CTE to find CarpCode from RoomDetail where Room matches and CarpStatus='In'
5. If status = "Call" (P):
   - Only update if patient NOT already in P/H/E (BR-PA-008)
   - Set EVTCall_Time = CURRENT_TIMESTAMP
6. If status = "End Service" (E):
   - Set EVTEndService_Time = CURRENT_TIMESTAMP
7. Update PatientAppointment: SET PT_Status, Room WHERE HN and EN match
8. Emit 'patientStatusUpdate' via Socket.IO
9. Return 200 with updated record count
```

## WF-PA-003: Dashboard Real-Time Refresh

```
1. Frontend routes/index.js sets 6-second interval (handleDataUpdate)
2. Parallel fetch: patientAppointment, patientStatus, careProviderWorkload, patientAppointmentFilter, roomDetail
3. Compare new data with previous state (JSON.stringify comparison)
4. If changed: update React state → trigger re-render
5. Additionally listen for Socket.IO events:
   - 'StatusPatient': immediate refresh of patient status
   - 'dataRoomDetail': immediate refresh of room assignments
6. Check alarm conditions:
   - For each patient with status "Booked"
   - If currentTime - appointmentTime > 10 minutes AND time != :04/:09/:07
   - Set blinking indicator on room button
```

## WF-PA-004: History Archival Workflow

```
1. Scheduler triggers taskBackupHistory() as part of daily task (00:01)
2. Copy all current PatientAppointment records to PatientAppointmentHistory with TimeCreate = CURRENT_TIMESTAMP
3. Delete all from PatientAppointment, reset sequence
4. Fetch fresh appointments for current date from TrakCare
```
