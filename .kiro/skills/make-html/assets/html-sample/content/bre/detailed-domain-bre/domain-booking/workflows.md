# Booking Domain - Workflows

## WF-BK-001: Manual Booking Creation

```
1. User navigates to Calendar page (admin role only)
2. Selects date on calendar → fetches existing bookings for that date
3. Clicks room button to open FormDialog
4. System checks permission:
   a. If Username in denied list → show AlertDialogSlide (permission denied)
   b. Otherwise → show booking form
5. User fills form: time range, workcase, dentist, assistants, remark
6. Frontend validates: times valid, workcase selected, dentist selected
7. User clicks Save → confirmation dialog shown
8. On confirm: POST /booking with all fields + date/day derived from calendar
9. Server inserts into BookingRoom with CreateDate=CURRENT_TIMESTAMP
10. Frontend refreshes booking data for the selected date
```

## WF-BK-002: Excel Bulk Import

```
1. User sends POST /upload with Excel file in request body
2. Server reads file from req.files.test.data
3. Opens workbook and gets "Physician Slot Worksheet" sheet
4. DELETE all from BookingRoom, reset sequence
5. For each row (after header):
   - Parse: PhysicianCode, PhysicianName, Day, StartTime, EndTime, StartDate, EndDate, AssistantCode, AssistantName, Room
   - Extract time from datetime format (substring 11:16 for HH:mm)
   - INSERT into BookingRoom with Workcase='N'
6. Return success response
```

## WF-BK-003: Calendar View Load

```
1. Calendar page mounts → set today's date
2. useEffect on date change:
   a. GET /booking?date={selectedDate}
   b. GET /careProviderServiceOnDate?date={selectedDate}
3. SimpleTable renders:
   - 24 time slots (30-min from 08:00-20:00) × 29 rooms
   - Apply filters (dentist/assistant/service) if selected
   - Merge adjacent cells with same provider/workcase
   - Color-code by workcase type
```
