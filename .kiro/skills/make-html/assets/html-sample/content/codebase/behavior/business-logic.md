> ⚠️ **Early Access**: Behavior documentation is in early access. Please review critically.

# Business Logic

## Patient Appointment Status Management

### Status Lifecycle (`server/modules/patientAppointment.js`, lines 55-66)

Patient appointments progress through a defined lifecycle with specific status codes:

| Status Code | Display Status | Trigger |
|-------------|---------------|---------|
| B | Booked | Initial state from TrakCare (no arrival, no cancel) |
| A | Arrived | `APPT_ArrivalDate IS NOT NULL` |
| P | Processing | Event from OPD Queue (`Call` action) |
| H | Hold | Event from OPD Queue (`Hold` action) |
| E | End Service | Event from OPD Queue (`End Service` action) |
| C | Canceled | `PAADM_VisitStatus = 'C'` OR `APPT_CancelDate IS NOT NULL` |

### Status Priority Logic (SQL CASE ordering)
The status is determined by CASE statement priority:
1. `PT_Status = 'P'` → Processing (highest priority - actively set by event)
2. `PT_Status = 'H'` → Hold
3. `PT_Status = 'E'` → End Service
4. `PAADM_VisitStatus = 'C'` → Canceled
5. `APPT_ArrivalDate IS NULL AND APPT_CancelDate IS NULL` → Booked
6. `APPT_ArrivalDate IS NOT NULL` → Arrived
7. `APPT_CancelDate IS NOT NULL` → Canceled

## Room Detail Management

### Room Login/Logout (`server/event-bridge.js`, lines 175-220)

**Login (Room != "Out")**:
1. Set all existing records for same Room OR same CarpCode to status "Out" with LogoutTime
2. Insert new RoomDetail with CarpStatus="In", LoginTime=CURRENT_TIMESTAMP
3. Emit `roomDetailUpdate` event with status "In"

**Logout (Room == "Out")**:
1. Update RoomDetail record for ResourceId → CarpStatus="Out", LogoutTime=CURRENT_TIMESTAMP
2. Emit `roomDetailUpdate` event with status "Out"

**Business Rule**: Only one doctor can be "In" a room at a time. A doctor can only be "In" one room at a time.

## Patient Status Update Logic

### Event Bridge Patient Status (`server/event-bridge.js`, lines 225-310)

**Call (P - Processing)**:
- Updates `EVTCall_Time` to CURRENT_TIMESTAMP
- Only updates if patient's current status is NOT already in ('P', 'H', 'E')
- Validates patient against RoomDetail (doctor must be logged into the specified room)

**End Service (E)**:
- Updates `EVTEndService_Time` to CURRENT_TIMESTAMP
- No restriction on previous status

**All Status Updates**:
- Updates `Room` and `PT_Status` fields
- Validates: HN matches, EN matches, not canceled, doctor is in the room
- Emits `patientStatusUpdate` Socket.IO event

## Appointment Data Sync

### Change Detection (`server/modules/patientAppointment.js`, `validateAppointmentChangeEvent`)

1. **New Records**: INSERT from temp table where `APPT_RowId` not in main table
2. **Changed Records**: SQL EXCEPT between temp and main tables (comparing all 23 fields)
3. **Update**: Individual UPDATE for each changed record by `APPT_RowId`
4. Returns `ch_evt` flag (true if any changes detected)

### Doctor Schedule Inclusion Filter (`server/modules/patientAppointment.js`, lines 80-95)

A care provider is included in the dashboard display if:
- `SUMSLOT != null` (doctor has schedule for the day), OR
- There are no canceled appointments, OR
- There are both canceled AND non-canceled appointments

This prevents showing doctors who only have canceled appointments without a schedule.

## Alarm/Blink Logic

### Patient Wait Alert (`src/routes/index.js`, `returnBlinkPatient`)

For each patient with status "Arrived":
1. Parse appointment time
2. Add 10 minutes to get alarm threshold
3. If current time >= alarm threshold:
   - Find the resource (doctor) in appointment data
   - Check if any subsequent appointment for same doctor is "Processing"
   - If NO processing found after this patient → trigger blink CSS class
4. Exclude appointments with minutes ending in "04", "09", "07" (walk-in markers)

## Booking Room Logic

### Room Booking (`server/modules/booking.js`)
- Creates booking entries with doctor, assistant(s), room, time slot, date range, and workcase
- Supports 2 assistants per booking (AssistCode1, AssistCode2)
- Bookings have day-of-week, start/end date, start/end time constraints

## Related Documentation

- [Workflows](./workflows.md)
- [Decision Logic](./decision-logic.md)
- [Data Models](../reference/data-models.md)
- [API Reference](../reference/api-reference.md)
